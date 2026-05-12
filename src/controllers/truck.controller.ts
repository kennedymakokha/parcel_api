
import { Request, Response } from "express";
import { getSocketIo } from "../config/socket";
import { Trucks } from "../models/trucks.model";


import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
import { User } from '../models/user.model';
import { truckDriverModel } from "../models/truckDriverModel";



export const Create = async (req: Request | any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    let createdDriver: any = null;

    try {
        const { plate, driverId, driver, model, capacity } = req.body;

        // 🔍 1. Check duplicate truck plate
        const existingTruck = await Trucks.findOne({ plate }).session(session);

        if (existingTruck) {
            await session.abortTransaction();
            res.status(400).json({ message: 'Truck already exists' });
            return
        }

        let finalDriverId = driverId;

        // 👇 2. CREATE DRIVER (if not provided)
        if (!driverId && driver) {
            // 🔍 check duplicates in users table
            // 🔍 check duplicate phone number
            const phoneExists = await User.findOne({
                phone_number: driver.phone_number,
            }).session(session);

            if (phoneExists) {
                await session.abortTransaction();
                res.status(400).json({
                    message: 'Driver phone number already exists',
                });
                return
            }

            // 🔍 check duplicate ID number
            const idExists = await User.findOne({
                identification_No: driver.identification_No,
            }).session(session);

            if (idExists) {
                await session.abortTransaction();
                res.status(400).json({
                    message: 'Driver ID number already exists',
                });
                return
            }
            // 🔐 hash password (use phone as base for now)
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(driver.phone_number, salt);

            const newDriver = new User({
                name: driver.name,
                phone_number: driver.phone_number,
                identification_No: driver.identification_No,
                role: 'driver',
                password,
                createdBy: req.user.userId,
                business: req.user.business,
                // pickup: req.user.pickup,
            });

            createdDriver = await newDriver.save({ session });
            finalDriverId = createdDriver._id;
        }

        // 🔒 3. Ensure driver is not already assigned
        if (finalDriverId) {
            const driverAssigned = await Trucks.findOne({
                driverId: finalDriverId,
            }).session(session);

            if (driverAssigned) {
                await session.abortTransaction();
                res.status(400).json({
                    message: 'Driver is already assigned to another truck',
                });
                return
            }
        }

        // 🚛 4. Create truck
        const truck = new Trucks({
            plate: plate.trim().toUpperCase(),
            model: model?.trim(),
            capacity: capacity?.trim(),
            driverId: finalDriverId,
            createdBy: req.user.userId,
            business: req.user.business,
        });

        const newTruck = await truck.save({ session });

        // 🔗 5. Create mapping relation
        const truckDriver = new truckDriverModel({
            driverId: finalDriverId,
            truckId: newTruck._id,
        });

        await truckDriver.save({ session });

        // ✅ commit everything
        await session.commitTransaction();

        res.status(201).json({
            ok: true,
            message: 'Truck registered successfully',
            truck: newTruck,
        });
        return
    } catch (error) {
        await session.abortTransaction();

        console.log(error);

        res.status(500).json({
            message: 'Server error',
            error,
        });
        return
    } finally {
        session.endSession();
    }
};

export const Get = async (req: Request | any, res: Response | any) => {

    try {
        const io = getSocketIo();
        const { page = 1, limit = 10, } = req.query;
        const trucks: any = await Trucks.find({ business: req.user.business, deletedAt: null }).skip((page - 1) * limit).populate("driverId", "name phone_number identification_No")
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })

        const total = await Trucks.countDocuments();
        res.status(201).json(
            {
                trucks, page: parseInt(page),
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
        const truck_obj: any = await Trucks.findById(req.params.id).populate("business")
        res.status(201).json(truck_obj);
        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error", error });
        return;

    }
};
export const Update = async (
    req: Request | any,
    res: Response | any
) => {
    const session = await mongoose.startSession();

    session.startTransaction();

    let createdDriver: any = null;

    try {
        const { id } = req.params;

        const {
            plate,
            model,
            capacity,
            driverId,
            driver,
        } = req.body;

        // 🔍 FIND CURRENT TRUCK
        const existingTruck = await Trucks.findById(id).session(session);

        if (!existingTruck) {
            await session.abortTransaction();

            return res.status(404).json({
                message: 'Truck not found',
            });
        }

        // 🔍 CHECK DUPLICATE PLATE
        if (plate) {
            const plateExists = await Trucks.findOne({
                plate: plate.trim().toUpperCase(),
                _id: { $ne: id },
            }).session(session);

            if (plateExists) {
                await session.abortTransaction();

                return res.status(400).json({
                    message: 'Truck plate already exists',
                });
            }
        }

        let finalDriverId = driverId || existingTruck.driverId;

        // 👇 CREATE NEW DRIVER IF PROVIDED
        if (!driverId && driver) {
            // CHECK PHONE
            const phoneExists = await User.findOne({
                phone_number: driver.phone_number,
            }).session(session);

            if (phoneExists) {
                await session.abortTransaction();

                return res.status(400).json({
                    message:
                        'Driver phone number already exists',
                });
            }

            // CHECK ID NUMBER
            const idExists = await User.findOne({
                identification_No:
                    driver.identification_No,
            }).session(session);

            if (idExists) {
                await session.abortTransaction();

                return res.status(400).json({
                    message:
                        'Driver ID number already exists',
                });
            }

            // HASH PASSWORD
            const salt = await bcrypt.genSalt(10);

            const password = await bcrypt.hash(
                driver.phone_number,
                salt,
            );

            const newDriver = new User({
                name: driver.name,
                phone_number: driver.phone_number,
                identification_No:
                    driver.identification_No,
                role: 'driver',
                password,
                createdBy: req.user.userId,
                business: req.user.business,
            });

            createdDriver = await newDriver.save({
                session,
            });

            finalDriverId = createdDriver._id;
        }

        // 🔒 CHECK DRIVER ASSIGNMENT
        if (finalDriverId) {
            const assignedTruck = await Trucks.findOne({
                driverId: finalDriverId,
                _id: { $ne: id },
            }).session(session);

            if (assignedTruck) {
                await session.abortTransaction();

                return res.status(400).json({
                    message:
                        'Driver is already assigned to another truck',
                });
            }
        }

        // 🚛 UPDATE TRUCK
        const updatedTruck = await Trucks.findByIdAndUpdate(
            id,
            {
                plate: plate?.trim().toUpperCase(),
                model: model?.trim(),
                capacity: capacity,
                driverId: finalDriverId,
            },
            {
                new: true,
                session,
            },
        ).populate('driverId');

        // 🔗 UPDATE DRIVER MAPPING
        await truckDriverModel.findOneAndUpdate(
            {
                truckId: id,
            },
            {
                driverId: finalDriverId,
            },
            {
                new: true,
                upsert: true,
                session,
            },
        );

        // ✅ COMMIT
        await session.commitTransaction();

        // 🔌 SOCKET
        const io = getSocketIo();

        io?.emit('trucks:update', updatedTruck);

        return res.status(200).json({
            ok: true,
            message: 'Truck updated successfully',
            truck: updatedTruck,
        });
    } catch (error) {
        await session.abortTransaction();

        console.log(error);

        return res.status(500).json({
            message: 'Server error',
            error,
        });
    } finally {
        session.endSession();
    }
};


export const Trash = async (req: Request | any, res: Response | any) => {
    try {
        let deleted: any = await Trucks.findOneAndUpdate({ _id: req.params.id }, { deletedAt: Date.now() }, { new: true, useFindAndModify: false })
        res.status(200).json(`${deleted.plate} deleted successfully`)
        return
    } catch (error) {
        res.status(404).json(error);

        return
        throw new Error("deletion Failed ")
    }
};



