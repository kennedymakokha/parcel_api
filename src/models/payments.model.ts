import mongoose, { Schema } from "mongoose";

const PaymentSchema = new mongoose.Schema({
 
  parcel_id: {
    type: Schema.Types.ObjectId,
    ref: 'parcels_tb'
  },
  method: String,
  amount: Number,
  created_at: Date,
  customer_phone: String,
  customer_name: String,
  mpesa_receipt: String,
  receipt_no: String,
  updatedAt: { type: Date, default: new Date().toISOString() },

  pickup: {
    type: Schema.Types.ObjectId,
    ref: 'pickup_tb'
  },
  createdBy: String
});


export const PaymentModel = mongoose.model("Payment_tb", PaymentSchema);
