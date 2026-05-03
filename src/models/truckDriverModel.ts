import mongoose, { Schema } from "mongoose";

const parcelSchema = new Schema({
  driverId: { type: Schema.Types.ObjectId, ref: "parcel_tb" },
  truckId: { type: Schema.Types.ObjectId, ref: "truck_tb" },
}, { timestamps: true });

export const truckDriverModel = mongoose.model("truckdriver_tb", parcelSchema);