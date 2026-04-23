import { timeStamp } from "console";

var mongoose = require('mongoose');

const Schema = mongoose.Schema;


const MpesaLogsSchema = new Schema({

    log: {

        type: String

    },
    MerchantRequestID: {

        type: String

    },
    type: {
        type: String
    },

    CheckoutRequestID: {
        type: String
    },

    phone_number: {
        type: String
    },
    ResponseCode: {
        type: Number
    },
    MpesaReceiptNumber: {
        type: String
    },
    status: {
        type: String,
        enum: ["pending", "canceled", "complete",],
        default: "pending"
    },
    amount: {
        type: Number
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    vendor: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    ResultDesc: {
        type: String
    },


}, { timestamps: true });

let MpesaLogs = mongoose.model('mpesalog_tb', MpesaLogsSchema)
export default MpesaLogs