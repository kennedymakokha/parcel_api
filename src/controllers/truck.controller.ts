
import { Request, Response } from "express";
import { getSocketIo } from "../config/socket";
import { Trucks } from "../models/trucks.model";

export const Create = async (req: Request | any, res: Response) => {
    try {
        // 🔍 Check duplicate plate
        const trackExist: any = await Trucks.findOne({
            plate: req.body.plate
        });

        if (trackExist) {
             res.status(400).json({
                message: "Truck already exists"
            });
            return
        }

        // 🔒 Check driver already assigned

        const driverAssigned = await Trucks.findOne({
            driverId: req.body.driverId
        });

        if (driverAssigned) {
             res.status(400).json({
                message: "Driver is already assigned to another truck"
            });
            return
        }


        // ✅ Attach metadata
        req.body.createdBy = req.user.userId;
        req.body.business = req.user.business;

        const truck: any = new Trucks(req.body);
        const newTruck = await truck.save();

         res.status(201).json({
            ok: true,
            message: "Truck registered successfully",
            truck: newTruck
        });
        return;

    } catch (error) {
        console.log(error);
         res.status(500).json({
            message: "Server error",
            error
        });
        return
    }
};

export const Get = async (req: Request | any, res: Response | any) => {

    try {
    
        const { page = 1, limit = 10, } = req.query;
        const trucks: any = await Trucks.find({ business: req.user.business, deletedAt: null }).skip((page - 1) * limit)
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
export const Update = async (req: Request | any, res: Response | any) => {
    try {
        const { id } = req.params;

        // const existing = await Trucks.findById(id);
        const existing = await Trucks.findOne({
            driverId: req.body.driverId,
            _id: { $ne: req.params.id } // exclude current truck
        });

        if (!existing) {
            return res.status(404).json({ message: "Truck not found" });
        }


        const updates = await Trucks.findOneAndUpdate(
            { _id: id },
            req.body,
            { new: true }
        );
        const io = getSocketIo();
        io?.emit("trucks:update", updates);

        res.status(200).json(updates);

    } catch (error) {
        console.error(error);
        res.status(400).json(error);
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



