import mongoose, { Schema } from "mongoose";

const parcelSchema = new Schema({
  parcel: { type: Schema.Types.ObjectId, ref: "parcel_tb" },
  truck: { type: Schema.Types.ObjectId, ref: "truck_tb" },
}, { timestamps: true });

export const parcelDriverModel = mongoose.model("parceldriver_tb", parcelSchema);