
import { Request, Response } from "express";
import { CustomError } from "../utils/custom_error.util";
import { validateBusinessInput, validatePickupInput } from "../validations/business.validations";
import { BusinessModel } from "../models/business.model";
import { Format_phone_number } from "../utils/simplefunctions.util";
import { MakeActivationCode } from "../utils/generate_activation.util";
import { User } from "../models/user.model";
import bcrypt from "bcryptjs";
import { emitToDevice, getSocketIo } from "../config/socket";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import moment from "moment-timezone";
import mongoose from "mongoose";
import { PickuUpModel } from "../models/pickups.model";
import { Parcels } from "../models/parcel.model";
import { sendTopicNotification } from "../utils/notification";

export const Create = async (
    req: Request | any,
    res: Response
): Promise<void> => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        // ✅ Validation
        await CustomError(validateBusinessInput, req.body, res);

        // ✅ Format phone number
        let phone = await Format_phone_number(req.body.contact_number);
        req.body.contact_number = phone;

        // ======================================================
        // 🔍 CHECK DUPLICATE BUSINESS NAME
        // ======================================================

        const businessExists = await BusinessModel.findOne({
            business_name: req.body.business_name,
        }).session(session);

        if (businessExists) {
            await session.abortTransaction();

            res.status(400).json({
                ok: false,
                message: "Business already exists",
            });
            return
        }

        // ======================================================
        // 🔍 CHECK DUPLICATE PHONE NUMBER
        // ======================================================

        const phoneExists = await User.findOne({
            phone_number: req.body.contact_number,
        }).session(session);

        if (phoneExists) {
            await session.abortTransaction();

            res.status(400).json({
                ok: false,
                message: "Phone number already in use",
            });
            return
        }

        // ======================================================
        // 🔍 CHECK DUPLICATE EMAIL (OPTIONAL)
        // ======================================================

        if (req.body.email) {

            const emailExists = await User.findOne({
                email: req.body.email,
            }).session(session);

            if (emailExists) {
                await session.abortTransaction();

                res.status(400).json({
                    ok: false,
                    message: "Email already in use",
                });
                return
            }
        }

        // ======================================================
        // ✅ CREATE BUSINESS
        // ======================================================

        req.body.createdBy = req.user.userId;

        const newbusiness = new BusinessModel(req.body);

        const business = await newbusiness.save({ session });

        // ======================================================
        // ✅ CREATE ADMIN USER
        // ======================================================

        const salt = await bcrypt.genSalt(10);

        const adminPassword = await bcrypt.hash(
            req.body.contact_number,
            salt
        );

        const adminData = {
            ...req.body,
            password: adminPassword,
            phone_number: req.body.contact_number,
            role: "superadmin",
            name: `Admini`,
            business: business._id,
            activated: true,
        };

        const user = new User(adminData);

        await user.save({ session });

        // ======================================================
        // ✅ CREATE HQ PICKUP
        // ======================================================

        const pickupData = {
            pickup_name: `${req.body.business_name} HQ`,
            phone_number: req.body.contact_number,
            contact_number: req.body.contact_number,
            business: business._id,
            short_code: "HQ",
            createdBy: user._id,
            state: "active",
            isHQ: true,
        };

        const pickup = new PickuUpModel(pickupData);

        await pickup.save({ session });

        // ======================================================
        // ✅ SEND NOTIFICATION
        // ======================================================

        await sendTopicNotification({
            topic: `superuser`,
            socket_topic_id: `superuser`,
            event_name: "New Business",
            audience: `superusers`,
            title: "New Business",
            body: `Hello, ${req.user.name} has registered a new business ${req.body.business_name}`,
        });

        // ======================================================
        // ✅ COMMIT TRANSACTION
        // ======================================================

        await session.commitTransaction();

        res.status(201).json({
            ok: true,
            message: "Business and Admin added successfully",
            newbusiness: business,
        });
        return
    } catch (error: any) {

        await session.abortTransaction();

        console.log(error);

        res.status(500).json({
            ok: false,
            message: "Server error",
            error: error.message,
        });
        return
    } finally {

        session.endSession();

    }
};
export const CreatePickup = async (req: Request | any, res: Response): Promise<void> => {
    // Start the session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        await CustomError(validatePickupInput, req.body, res);

        let phone = await Format_phone_number(req.body.phone_number);
        let contactPhone = await Format_phone_number(req.body.contact_number);
        req.body.phone_number = phone;
        req.body.contact_number = contactPhone;
        req.body.business = req.user.business;
        const PhoneExists = await User.findOne({ phone_number: contactPhone, business: req.user.business }).session(session);
        if (PhoneExists) {
            throw new Error("Phone number already exists");
        }
        // Check for existing pickup
        const Exists = await PickuUpModel.findOne({ pickup_name: req.body.pickup_name, business: req.user.business }).session(session);
        if (Exists) {
            throw new Error("Pickup already exists");
        }

        req.body.createdBy = req.user.userId;

        // 1. Create Pickup
        const newPickup = new PickuUpModel(req.body);
        const pickup = await newPickup.save({ session });
        await BusinessModel.findByIdAndUpdate(
            req.user.business,
            { $push: { pickUps: pickup._id } },
            { session }
        );
        // Prepare Admin User Data
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash(contactPhone, salt);

        const adminData = {
            ...req.body,
            password: adminPassword,
            phone_number: req.body.contact_number,
            role: "admin",
            name: `${req.body.short_code}'s Admin`,
            business: req.user.business,
            pickup: pickup._id,
            activated: true
        };

        // 2. Create User
        const user = new User(adminData);
        await user.save({ session });
        const socketIo = getSocketIo();
        if (socketIo) {
            socketIo.emit("pickup_created", {
                pickup
            });
        }
        // If we reach here, everything is successful
        await session.commitTransaction();
        res.status(201).json({ ok: true, message: "Pickup and Admin added successfully", newpickup: pickup });

    } catch (error: any) {
        // ROLLBACK the database changes
        await session.abortTransaction();
        console.log("Transaction Error:", error);
        if (error.message === "PICKUP_EXISTS") {
            res.status(400).json("Pickup already exists");
        } else {
            res.status(500).json({ ok: false, message: "Server error", error: error.message });
        }
    } finally {
        // End the session
        session.endSession();
    }
};


export const Get = async (req: Request | any, res: Response | any) => {

    try {
        let options: any = { deletedAt: null, }

        if (req.user.role === "superadmin") {
            options = { deletedAt: null, createdBy: req.user.userId }
        }
        if (req.user.role === "supersales") {
            options = { deletedAt: null, createdBy: req.user.userId }
        }
        console.log(options);
        const { page = 1, limit = 10, } = req.query;
        const businesses: any = await BusinessModel.find(options).skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
        const total = await BusinessModel.countDocuments();
        const active = await BusinessModel.countDocuments({ state: "active" });
        const inactive = await BusinessModel.countDocuments({ state: "inactive" });
        res.status(201).json(
            {
                businesses, page: parseInt(page),
                totalPages: Math.ceil(total / limit),
                active, inactive
            }
        );
        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, message: "Server error", error });
        return;

    }
};
export const Subscribe = async (req: Request | any, res: Response | any) => {
    try {
        const pickup: any = await PickuUpModel.findById(req.body.pickup)
        pickup.paid = true;
        await pickup.save();
        const pickupId = pickup._id.toString();

        await sendTopicNotification({
            topic: `pickup_${pickupId}_attendants`,
            socket_topic_id: `pickup_${pickupId}`,
            event_name: "pickup_open",
            audience: `${pickup.pickup_name}`,
            title: "System Reactivated",
            body: `Hello ${pickup.pickup_name},\nLets Try Again Today\nHave a fruitful service Day.`,
        });
        res.status(201).json(
            { message: "The pickup is  openned now " }
        );
        return;

    } catch (error) {

    }
};
export const GetPickups = async (req: Request | any, res: Response | any) => {

    try {
        const { page = 1, limit = 10, } = req.query;
        const pickups: any = await PickuUpModel.find({ deletedAt: null, business: req.user.business }).skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
        const total = await PickuUpModel.countDocuments();
        res.status(201).json(
            {
                pickups, page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            }
        );
        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, message: "Server error", error });
        return;

    }
};

export const GetPickupsForClient = async (req: Request | any, res: Response | any) => {

    try {
        const { page = 1, limit = 10, pickup } = req.query;
        const pickupObj: any = await PickuUpModel.findById(pickup).select('business')
        const pickups: any = await PickuUpModel.find({ deletedAt: null, business: pickupObj.business }).skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
        const total = await PickuUpModel.countDocuments();
        res.status(201).json(
            {
                pickups, page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            }
        );
        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, message: "Server error", error });
        return;

    }
};
export const Get_one = async (req: Request | any, res: Response | any) => {
    try {
        const business_obj: any = await BusinessModel.findById(req.user.business)
        res.status(201).json(business_obj);
        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error", error });
        return;

    }
};
export const Update = async (req: Request | any, res: Response | any) => {
    try {
        const { id } = req.params;

        const existing = await BusinessModel.findById(id);

        if (!existing) {
            res.status(404).json({ message: "Business not found" });
            return
        }


        const updates = await BusinessModel.findOneAndUpdate(
            { _id: id },
            req.body,
            { new: true }
        );
        const io = getSocketIo();
        io?.emit("business:update", updates);

        res.status(200).json(updates);

    } catch (error) {
        console.error(error);
        res.status(400).json(error);
    }
};

export const UpdatePickup = async (req: Request | any, res: Response | any) => {
    try {
        const { id } = req.params;

        const existing = await PickuUpModel.findById(id);

        if (!existing) {
            res.status(404).json({ message: "pickup not found" });
            return
        }


        const updates: any = await PickuUpModel.findOneAndUpdate(
            { _id: id },
            req.body,
            { new: true }
        );
        const io = getSocketIo();
        const pickupId = updates._id.toString();
        await sendTopicNotification({
            topic: `pickup_${pickupId}_attendants`,
            socket_topic_id: `pickup_${pickupId}`,
            event_name: "pickup:update",
            audience: `${updates.pickup_name}`,
            title: 'Pickup:update',
            body: `Hello, New Updates  on our Station Details.`
        });
        res.status(200).json(updates);

    } catch (error) {
        console.error(error);
        res.status(400).json(error);
    }
};

export const Trash = async (req: Request | any, res: Response | any) => {
    try {
        let deleted: any = await BusinessModel.findOneAndUpdate({ _id: req.params.id }, { deletedAt: Date.now() }, { new: true, useFindAndModify: false })
        res.status(200).json(`${deleted.business_name} deleted successfully`)
        return
    } catch (error) {
        res.status(404).json(error);

        return
        throw new Error("deletion Failed ")
    }
};

export const TrashPickup = async (req: Request | any, res: Response | any) => {
    try {
        let deleted: any = await PickuUpModel.findOneAndUpdate({ _id: req.params.id }, { deletedAt: Date.now() }, { new: true, useFindAndModify: false })
        res.status(200).json(`${deleted.pickup_name} deleted successfully`)
        return
    } catch (error) {
        res.status(404).json(error);

        return
        throw new Error("deletion Failed ")
    }
};


export const getBusinessPickups = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {

        const businessId = req.params.id;

        // ✅ Kenya timezone
        const timezone = "Africa/Nairobi";

        const start = moment
            .tz(timezone)
            .startOf("day")
            .toDate();

        const end = moment
            .tz(timezone)
            .endOf("day")
            .toDate();

        let pickupFilter: any = {
            state: "active"
        };

        if (mongoose.Types.ObjectId.isValid(businessId)) {
            pickupFilter.business = businessId;
        }

        // ✅ Get pickups
        const pickups: any = await PickuUpModel.find(pickupFilter)
            .select("_id pickup_name")
            .populate("business", "business_name");

        const pickupIds = pickups.map((p: any) => p._id);

        // ✅ Aggregate today's parcels
        const parcelCounts = await Parcels.aggregate([
            {
                $match: {
                    sentFrom: { $in: pickupIds },
                    createdAt: {
                        $gte: start,
                        $lte: end
                    }
                }
            },
            {
                $group: {
                    _id: "$sentFrom",
                    count: { $sum: 1 }
                }
            }
        ]);

        // ✅ Convert aggregate to map
        const countMap = new Map(
            parcelCounts.map((p: any) => [
                p._id.toString(),
                p.count
            ])
        );

        // ✅ Merge counts with pickups
        const results = pickups.map((pickup: any) => ({
            pickupId: pickup._id,
            pickupName: pickup.pickup_name,
            business: pickup.business?.business_name || null,
            parcelsToday:
                countMap.get(pickup._id.toString()) || 0
        }));

        res.json({
            businessId,
            timezone,
            start,
            end,
            pickups: results
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to fetch business pickups"
        });

    }
};

