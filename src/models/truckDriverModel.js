"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truckDriverModel = void 0;
var mongoose_1 = require("mongoose");
var parcelSchema = new mongoose_1.Schema({
    driverId: { type: mongoose_1.Schema.Types.ObjectId, ref: "parcel_tb" },
    truckId: { type: mongoose_1.Schema.Types.ObjectId, ref: "truck_tb" },
}, { timestamps: true });
exports.truckDriverModel = mongoose_1.default.model("truckdriver_tb", parcelSchema);
