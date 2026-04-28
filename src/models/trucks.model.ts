import mongoose, { Schema } from "mongoose";

const truckSchema = new mongoose.Schema(
    {
        plate: { type: String, unique: true },
        model: { type: String },
        capacity: { type: Number },
        pickups: [{
            type: Schema.Types.ObjectId,
            ref: 'pickup_tb'
        }],
        driverId: {
            type: Schema.Types.ObjectId,
            ref: 'user_tb'
        },
        isfaulty: { type: Boolean, default: false },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'user_tb'
        },
        business: {
            type: Schema.Types.ObjectId,
            ref: 'business_tb'
        },
        deletedAt: { type: Date, default: null }
    },

);

export const Trucks = mongoose.model("trucks_tb", truckSchema);