"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
var mongoose_1 = require("mongoose");
var notificationSchema = new mongoose_1.default.Schema({
    topic: { type: String },
    body: { type: String },
    title: { type: String },
    audience: { type: String },
    token: { type: String },
    deletedAt: { type: Date, default: null }
});
exports.NotificationModel = mongoose_1.default.model("notification_tb", notificationSchema);
