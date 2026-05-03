import mongoose, { Schema } from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        topic: { type: String },
        body: { type: String },
        title: { type: String },
        audience: { type: String },
        token: { type: String },
        deletedAt: { type: Date, default: null }
    },

);

export const NotificationModel = mongoose.model("notification_tb", notificationSchema);