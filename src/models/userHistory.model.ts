import mongoose, { Schema } from "mongoose";

const UserhistoryScema = new mongoose.Schema({

  started_at: Date,
  ended_at: Date,
  duration: Date,
  phone_number: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user_tb'
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: 'business_tb'
  },

});


export const UserhistoryModel = mongoose.model("userhistory_tb", UserhistoryScema);

