"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parcels = void 0;
var mongoose_1 = require("mongoose");
// const [formData, setFormData] = useState<ParcelFormState>({
//     sender: { name: "", phone: "", address: "" },
//     receiver: { name: "", phone: "", address: "" },
//     parcel: { weight: "", instructions: "", destination: "pickup", pickup: "", price: "" },
//   });
var ParcelSchema = new mongoose_1.default.Schema({
    sender_name: {
        type: String,
        required: true,
    },
    sender_phone: {
        type: String,
        required: true,
    },
    sender_address: {
        type: String,
    },
    charges: {
        type: Number,
        default: 500
    },
    paid: {
        type: Boolean,
        default: false
    },
    receiver_signature: {
        type: String,
    },
    receiver_ID: {
        type: String,
    },
    receiver_name: {
        type: String,
        required: true,
    },
    receiver_phone: {
        type: String,
        required: true,
    },
    receiver_address: {
        type: String,
    },
    code: {
        type: String,
        unique: true
    },
    weight: String,
    instructions: String,
    fragile: { type: Boolean, default: false },
    destination: { type: String, enum: ["pickup", "dropoff"], default: "pickup" },
    status: { type: String, enum: ["Pending Dispatch", "In Transit", "Pending Collection", "Collected", "Returned", "Cancelled"], default: "Pending Dispatch" },
    pickup: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'pickup_tb'
    },
    rerouted: { type: Boolean, default: false },
    sentFrom: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'pickup_tb'
    },
    price: String,
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user_tb'
    },
    currentTruck: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "trucks_tb"
    },
    currentDriver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "user_tb"
    },
    business: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'business_tb'
    },
    deletedAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null },
}, { timestamps: true });
exports.Parcels = mongoose_1.default.model("parcels_tb", ParcelSchema);
