"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var SmsSchema = new mongoose_1.Schema({
    receiver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user'
    },
    message: { type: String, required: true },
    status_code: { type: String, required: true },
    message_id: { type: String },
    status_desc: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    ref: { type: String, enum: ["account-activation", "password-reset", "parcel Delivery", "fallback notification"], default: "account-activation" },
});
SmsSchema.index({ sender: 1, receiver: 1, timestamp: 1 });
var Sms = mongoose_1.default.model("sms_logs_tb", SmsSchema);
exports.default = Sms;
