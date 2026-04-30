
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
import mongoose from "mongoose";
import { PickuUpModel } from "../models/pickups.model";

export const Create = async (req: Request | any, res: Response): Promise<void> => {
    // Start the session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    const file = req.file;
    if (!file) {
        res.status(400).json({ message: "Kindly upload the logo" });
        return;
    }

    try {
        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
        req.body.logo = imageUrl;

        // Validation
        await CustomError(validateBusinessInput, req.body, res);

        let phone = await Format_phone_number(req.body.contact_number);
        req.body.contact_number = phone;

        // Check for existing business
        const Exists = await BusinessModel.findOne({ business_name: req.body.business_name }).session(session);
        if (Exists) {
            throw new Error("BUSINESS_EXISTS");
        }

        req.body.createdBy = req.user.userId;

        // 1. Create Business
        const newbusiness = new BusinessModel(req.body);
        const business = await newbusiness.save({ session });

        // Prepare Admin User Data
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash(req.body.contact_number, salt);

        const adminData = {
            ...req.body,
            password: adminPassword,
            phone_number: req.body.contact_number,
            role: "superadmin",
            name: `${req.body.business_name}'s Admin`,
            business: business._id,
            activated: true
        };

        // 2. Create User
        const user = new User(adminData);
        await user.save({ session });

        // 3. Create HQ Pickup
        const pickupData = {
            pickup_name: `${req.body.business_name} HQ`,
            phone_number: req.body.contact_number,
            contact_number: req.body.contact_number,
            business: business._id,
            createdBy: user._id,
            state: "active",
            isHQ: true,
            logo: imageUrl
        };

        const pickup = new PickuUpModel(pickupData);
        const savedPickup = await pickup.save({ session });
        // 4. Create Socket Room for Pickup
        const roomName = `pickup_${savedPickup._id}`;

        // optional: emit creation event (if needed elsewhere)
        const socketIo = getSocketIo();
        if (socketIo) {
            socketIo.emit("room_created", {
                room: roomName,
                pickupId: savedPickup._id,
            });
        }

        // If we reach here, everything is successful
        await session.commitTransaction();
        res.status(201).json({ ok: true, message: "Business and Admin added successfully", newbusiness: business });

    } catch (error: any) {
        // ROLLBACK the database changes
        await session.abortTransaction();

        // CLEANUP: Delete the uploaded file since the DB record failed
        if (file?.filename) {
            const filePath = path.join(__dirname, "../../public/uploads", file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        if (error.message === "BUSINESS_EXISTS") {
            res.status(400).json("Business already exists");
        } else {
            res.status(500).json({ ok: false, message: "Server error", error: error.message });
        }
    } finally {
        // End the session
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
            name: `${req.body.pickup_name}'s Admin`,
            business: req.user.business,
            pickup: pickup._id,
            activated: true
        };

        // 2. Create User
        const user = new User(adminData);
        await user.save({ session });

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
        const { page = 1, limit = 10, } = req.query;
        const products: any = await BusinessModel.find({ deletedAt: null, }).skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
        const total = await BusinessModel.countDocuments();
        res.status(201).json(
            {
                products, page: parseInt(page),
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
            return res.status(404).json({ message: "Business not found" });
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

export const Lock = async (req: Request | any, res: Response | any) => {
    const { deviceId, event, payload } = req.body;
    try {
        emitToDevice("69b2e33b7df417e9466180e1", "business:update", {
            primary_color: "#ff0000",
            secondary_color: "#00ff00",
            grayscale: true,
        });
        return
    } catch (error) {
        res.status(404).json(error);

        return
        throw new Error("deletion Failed ")
    }
};



