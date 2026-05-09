import mongoose from "mongoose";
import dotenv from "dotenv";
import { startPickupPaidResetCron } from "../crons/pickupPaidReset";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");
         startPickupPaidResetCron();
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
