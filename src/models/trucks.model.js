"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trucks = void 0;
var mongoose_1 = require("mongoose");
var truckSchema = new mongoose_1.default.Schema({
    plate: { type: String, unique: true },
    model: { type: String },
    capacity: { type: Number },
    pickups: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'pickup_tb'
        }],
    driverId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user_tb'
    },
    isfaulty: { type: Boolean, default: false },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user_tb'
    },
    business: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'business_tb'
    },
    deletedAt: { type: Date, default: null }
});
exports.Trucks = mongoose_1.default.model("trucks_tb", truckSchema);
