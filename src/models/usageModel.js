"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageModel = void 0;
var mongoose_1 = require("mongoose");
var UsageSchema = new mongoose_1.Schema({
    business: { type: mongoose_1.Schema.Types.ObjectId, ref: "business_tb" },
    storage_bytes: { type: Number, default: 0 },
    users_count: { type: Number, default: 0 },
    last_calculated: Date,
}, { timestamps: true });
exports.UsageModel = mongoose_1.default.model("usage_tb", UsageSchema);
