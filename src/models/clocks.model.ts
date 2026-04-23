import mongoose, { Schema } from "mongoose";

const ClocksSchema = new mongoose.Schema(
  {
    clock_id: {
      type: String,
      required: true,

    },
    check_in_time: String,
    check_out_time: String,
    user_id: {
      type: String, // 👈 CHANGE THIS TOO
      required: true,
    },
  
    business: {
      type: Schema.Types.ObjectId,
      ref: 'business_tb'
    },
    deletedAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null },

  },

);

export const Clocks = mongoose.model("clocks_tb", ClocksSchema);