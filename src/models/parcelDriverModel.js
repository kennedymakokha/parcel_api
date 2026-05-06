"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parcelDriverModel = void 0;
var mongoose_1 = require("mongoose");
var parcelSchema = new mongoose_1.Schema({
    parcel: { type: mongoose_1.Schema.Types.ObjectId, ref: "parcel_tb" },
    truck: { type: mongoose_1.Schema.Types.ObjectId, ref: "truck_tb" },
}, { timestamps: true });
exports.parcelDriverModel = mongoose_1.default.model("parceldriver_tb", parcelSchema);
