import mongoose, { Schema } from "mongoose";

const pickUpScema = new mongoose.Schema({
  pickup_name: { type: String, required: true },
  phone_number: { type: String },
  working_hrs: { type: String, default: "8-17" },
  contact_number: { type: String },
 
  latitude: Number,
  longitude: Number,
  state: { type: String, enum: ["active", "inactive"], default: "inactive" },
  created_at: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  api_key: { type: String, },
  primary_color: String,
  strictMpesa: { type: Boolean, default: false },
  secondary_color: String,
  logo: String,
  master_ke: { type: String, default: "k3f9Jq8sT1vQmZ0uLx7Y2pV+5A1bF4Hq0r9N2wT+6GQ=" },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'user_tb'
  },
   business: {
    type: Schema.Types.ObjectId,
    ref: 'business_tb'
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });


export const PickuUpModel = mongoose.model("pickup_tb", pickUpScema);

