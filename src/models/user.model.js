"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var mongoose_1 = require("mongoose");
var UserSchema = new mongoose_1.default.Schema({
    phone_number: { type: String, required: true, unique: true },
    name: { type: String, },
    email: { type: String, },
    identification_No: { type: String, },
    activationCode: { type: String, },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user_tb'
    },
    business: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'business_tb'
    },
    pickup: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'pickup_tb'
    },
    role: {
        type: String,
        enum: ["superuser", "superadmin", "admin", "attendant", "supersales", "driver"],
        default: "attendant"
    },
    FCM_token: { type: String },
    activated: { type: Boolean, default: true },
    password: { type: String, required: true },
    updatedAt: { type: Date, default: new Date().toISOString() },
    deleted_at: { type: Date, default: null },
});
exports.User = mongoose_1.default.model("user_tb", UserSchema);
