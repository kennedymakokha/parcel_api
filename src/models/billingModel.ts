import mongoose, { Schema } from "mongoose";

const BillingSchema = new Schema({
  business: { type: Schema.Types.ObjectId, ref: "business_tb" },

  month: String, // e.g. "2026-03"

  storage_mb: Number,
  users: Number,

  amount: Number,

  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  },

  paid_at: Date,

}, { timestamps: true });

export const BillingModel = mongoose.model("billing_tb", BillingSchema);