import mongoose, { Schema } from "mongoose";

const pickUpScema = new mongoose.Schema({
  pickup_name: { type: String, required: true },
  phone_number: { type: String },
  working_hrs: { type: String, default: "8-17" },
  contact_number: { type: String },
  short_code: { type: String },
  state: { type: String, enum: ["active", "inactive"], default: "active" },
  created_at: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  api_key: { type: String, },
  consumerKey:{type:String,default:"5rwMTDdZH2eloHWi:w7ML5QvOJizN07A1WFpXAw==:AfXEkOPnb/V3wNGKDNQ5v7smIQFO3Iz/aH/kc8B0T4I="},
  consumerSecret:{type:String,default:"Ta8BMF7er8qZfYGA:POA8zkqSqMRDreCohBa7SQ==:LugLCe2DsyQQedjG8QDn4g=="},
  passKey:{type:String,default:"0xUDu8Vj9lGZTXmN:eomlBXC6DMc1rsbBVlO2cQ==:nzMA1yLIkpsK/qnaE4lItoO2SYbLNWKxr4QbXIcrbXH+87vc2IxoSv7VbBHg/ZvuyxWB+LmPG5wuZApjqwaWjQ=="},
  shortCode:{type:String,default:"4115395"},
  primary_color: String,
  strictMpesa: { type: Boolean, default: false },
  isHQ: { type: Boolean, default: false },
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

