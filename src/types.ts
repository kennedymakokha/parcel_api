import { Document } from "mongoose";
import { Types } from "mongoose";

export interface ChatMessage {
    userId: string;
    socketId: string
    username: string;
    from?: string;
    toId?: string
    message: string;
}

export interface IMessage extends Document {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    message: string;
    socketId: string;
    timestamp: Date;
    type: "user" | "system";
}

export interface ISms extends Document {

    receiver: Types.ObjectId;
    message: string;
    status_code: string;
    status_desc: string;
    message_id: string;
    ref: "account-activation" | "password-reset"
    timestamp: Date;

}

//  business_name: {  type: String, required: true },
//   postal_address: {type: String},
//   phone_number: {type: String},
//   kra_pin: {type: String},
//   expiryDate: { type: Date },
//   active: { type: Boolean, default: false },
//   created_at: { type: Date, default: Date.now },
//   updatedAt: {  type: Date, default: Date.now },
//   api_key: { type: String, },
//   master_ke: { type: String,default: "k3f9Jq8sT1vQmZ0uLx7Y2pV+5A1bF4Hq0r9N2wT+6GQ=" },
export type Business = {
    business_name: string;
    phone_number: string;
    postal_address?: string;
    kra_pin?: string;
    api_key?: string;
    contact_number?: string;
    master_ke?: string;
    expirtyDate?: string;
    description: string;
    state: "active" | "inactive";
    deletedAt?: string;
    createdBy: Types.ObjectId;
};
export type Category = {
    category_name: string;
    description: string;
    state: "active" | "inactive";
    deletedAt?: string;
    createdBy: Types.ObjectId;
};
export type Product = {
    product_name: string;
    price: number | any;
    description?: string;
    deletedAt?: string;
};
export type Inventory = {
    product: string;
    quantity: number | any;
    deletedAt?: string;
};