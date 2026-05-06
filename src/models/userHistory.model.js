"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserhistoryModel = void 0;
var mongoose_1 = require("mongoose");
var UserhistoryScema = new mongoose_1.default.Schema({
    started_at: Date,
    ended_at: Date,
    duration: Date,
    phone_number: String,
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user_tb'
    },
    business: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'business_tb'
    },
});
exports.UserhistoryModel = mongoose_1.default.model("userhistory_tb", UserhistoryScema);
