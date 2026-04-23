import mongoose, { Schema } from "mongoose";

const UsageSchema = new Schema({
  business: { type: Schema.Types.ObjectId, ref: "business_tb" },

  storage_bytes: { type: Number, default: 0 },
  users_count: { type: Number, default: 0 },

  last_calculated: Date,
}, { timestamps: true });

export const UsageModel = mongoose.model("usage_tb", UsageSchema);