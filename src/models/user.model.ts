import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
const UserSchema = new mongoose.Schema({

  phone_number: { type: String, required: true, unique: true },
  name: { type: String, },
  email: { type: String, },
  identification_No: { type: String, },
  activationCode: { type: String, },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'user_tb'
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: 'business_tb'
  },
  pickup: {
    type: Schema.Types.ObjectId,
    ref: 'pickup_tb'
  },

  role: {
    type: String,
    enum: ["superUser", "superadmin", "admin", "storemanager", "dispatcher", "sales", "driver"],
    default: "storemanager"
  },
  FCM_token: { type: String },
  activated: { type: Boolean, default: true },
  password: { type: String, required: true },
  updatedAt: { type: Date, default: new Date().toISOString() },
  deleted_at: { type: Date, default: null },
},);


export const User = mongoose.model("user_tb", UserSchema);
