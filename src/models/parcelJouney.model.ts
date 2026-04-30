import mongoose, { Schema } from "mongoose";

const parcelJourneySchema = new mongoose.Schema(
    {
        parcel_id: {
            type: Schema.Types.ObjectId,
            ref: 'parcels_tb'
        },
        DroppedAt: { type: Date, default: null },
        recievedBy: {
            type: Schema.Types.ObjectId,
            ref: 'user_tb'
        },
        DispatchedAt: { type: Date, default: null },
        DispatchedBy: {
            type: Schema.Types.ObjectId,
            ref: 'user_tb'
        },
        DispatchedTo: {
            type: Schema.Types.ObjectId,
            ref: 'user_tb'
        },
        ArrivedAt: { type: Date, default: null },
        deliveredTo: {
            type: Schema.Types.ObjectId,
            ref: 'user_tb'
        },
        CollectedAt: { type: Date, default: null },
        handedOverBy: {
            type: Schema.Types.ObjectId,
            ref: 'user_tb'
        },
        deletedAt: { type: Date, default: null },
        updatedAt: { type: Date, default: null },

    }, { timestamps: true }

);

export const ParcelJourneys = mongoose.model("parcel_journeys_tb", parcelJourneySchema);