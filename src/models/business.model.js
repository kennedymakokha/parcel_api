"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessModel = void 0;
var mongoose_1 = require("mongoose");
var businessScema = new mongoose_1.default.Schema({
    business_name: { type: String, required: true },
    postal_address: { type: String },
    phone_number: { type: String },
    working_hrs: { type: String, default: "8-17" },
    contact_number: { type: String },
    printQr: { type: Boolean, default: false },
    kra_pin: { type: String },
    latitude: Number,
    longitude: Number,
    state: { type: String, enum: ["active", "inactive"], default: "active" },
    created_at: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    api_key: { type: String, },
    primary_color: String,
    strictMpesa: { type: Boolean, default: false },
    secondary_color: String,
    logo: String,
    master_ke: { type: String, default: "k3f9Jq8sT1vQmZ0uLx7Y2pV+5A1bF4Hq0r9N2wT+6GQ=" },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user_tb'
    },
    pickUps: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'pickup_tb'
        }
    ],
    deletedAt: { type: Date, default: null }
}, { timestamps: true });
exports.BusinessModel = mongoose_1.default.model("business_tb", businessScema);
