// ==============================
// models/parcelCounter.model.ts
// ==============================

import mongoose, { Schema } from "mongoose";

const parcelCounterSchema = new Schema(
  {
    pickup: {
      type: Schema.Types.ObjectId,
      ref: "pickup_tb",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

parcelCounterSchema.index(
  { pickup: 1, date: 1 },
  { unique: true }
);

export const ParcelCounterModel = mongoose.model(
  "parcel_counter_tb",
  parcelCounterSchema
);