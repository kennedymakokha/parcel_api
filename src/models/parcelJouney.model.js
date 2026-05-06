"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelJourneys = void 0;
var mongoose_1 = require("mongoose");
var parcelJourneySchema = new mongoose_1.default.Schema({
    parcel_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'parcels_tb'
    },
    DroppedAt: { type: Date, default: null },
    recievedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user_tb'
    },
    DispatchedAt: { type: Date, default: null },
    DispatchedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user_tb'
    },
    DispatchedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user_tb'
    },
    ArrivedAt: { type: Date, default: null },
    deliveredTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user_tb'
    },
    CollectedAt: { type: Date, default: null },
    handedOverBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user_tb'
    },
    deletedAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null },
}, { timestamps: true });
exports.ParcelJourneys = mongoose_1.default.model("parcel_journeys_tb", parcelJourneySchema);
