"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clocks = void 0;
var mongoose_1 = require("mongoose");
var ClocksSchema = new mongoose_1.default.Schema({
    clock_id: {
        type: String,
        required: true,
    },
    check_in_time: String,
    check_out_time: String,
    user_id: {
        type: String, // 👈 CHANGE THIS TOO
        required: true,
    },
    business: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'business_tb'
    },
    deletedAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null },
});
exports.Clocks = mongoose_1.default.model("clocks_tb", ClocksSchema);
