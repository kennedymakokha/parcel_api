"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingModel = void 0;
var mongoose_1 = require("mongoose");
var BillingSchema = new mongoose_1.Schema({
    business: { type: mongoose_1.Schema.Types.ObjectId, ref: "business_tb" },
    month: String, // e.g. "2026-03"
    storage_mb: Number,
    users: Number,
    amount: Number,
    status: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    },
    paid_at: Date,
}, { timestamps: true });
exports.BillingModel = mongoose_1.default.model("billing_tb", BillingSchema);
