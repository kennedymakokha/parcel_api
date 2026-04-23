
import { Request, Response } from "express";
import { Clocks } from "../models/clocks.model";


export const Bulk = async (req: Request | any, res: Response | any) => {
    try {
        const { clocks } = req.body;
        const savedRegistration: any[] = [];

        for (const item of clocks) {
         
            // CREATE
            const newPay = new Clocks({
                ...item,
                business: req.user.business,
               

            });
            const saved = await newPay.save();
            savedRegistration.push(saved);
            continue;
        }

        res.status(200).json({
            success: true,
            clocks: savedRegistration
        });

    } catch (err: any) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
export const UpdatedSince = async (req: Request | any, res: Response | any) => {
    try {

        const since = new Date(req.query.since);
        const clocks = await Clocks.find({ updatedAt: { $gt: since }, business: req.user.business });

        res.status(200).json({ clocks: clocks });
    } catch (err: any) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
};


