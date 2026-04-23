import fetch, { Headers } from "node-fetch";
import axios from "axios";
import moment from "moment";
import  MpesaLogs from "../models/mpesaLogs.model";
import { Request, Response } from "express";


const validatePhone = (phone: string): string => {
    let raw_phone_number = phone.trim();
    let valid_phone_number = "";

    if (raw_phone_number.startsWith("+254")) {
        valid_phone_number = raw_phone_number.replace("+254", "254");
    } else if (raw_phone_number.startsWith("0")) {
        valid_phone_number = raw_phone_number.replace("0", "254");
    } else {
        valid_phone_number = raw_phone_number;
    }

    return valid_phone_number.replace(/\s+/g, ""); // Remove any spaces
};

interface MpesaStkResponse {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    phone_number: string;
    amount: number;
    ResponseCode: string;
    user: string | any;
    log: string;
}

export const Mpesa_stk = async (
    No: string,
    amount: number,
    user?: string
): Promise<MpesaStkResponse> => {
    const consumer_key = process.env.MPESA_CONSUMER_KEY as string;
    const consumer_secret = process.env.MPESA_CONSUMER_SECRETE as string;
    const passkey = process.env.MPESA_CONSUMER_PASSKEY as string;
    const short_code = parseInt(process.env.MPESA_SHORT_CODE as string, 10);
    const timestamp = moment().format("YYYYMMDDHHmmss");
    const phone = validatePhone(No);
    const new_amount = parseInt(amount.toString(), 10);

    const Authorization = `Bearer ${Buffer.from(
        `${consumer_key}:${consumer_secret}`
    ).toString("base64")}`;

    const response = await axios.get<{ access_token: string }>(
        `${process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
        {
            headers: {
                Authorization: `Basic ${Buffer.from(
                    `${consumer_key}:${consumer_secret}`
                ).toString("base64")}`,
            },
        }
    );

    const token = response.data.access_token;


    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    const fetch_response = await fetch(
        `${process.env.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
        {
            method: "POST",
            headers,
            body: JSON.stringify({
                BusinessShortCode: short_code,
                Password: Buffer.from(
                    `${short_code}${passkey}${timestamp}`
                ).toString("base64"),
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: new_amount,
                PartyA: phone,
                PartyB: process.env.MPESA_SHORT_CODE,
                PhoneNumber: phone,
                CallBackURL: process.env.MPESA_CALLbACK,
                AccountReference: "Mtadao Pack Ltd",
                TransactionDesc: "Payment delivery of *",

            }),
        }
    );

    const data: any = await fetch_response.json();
    
    await new MpesaLogs({
        MerchantRequestID: data.MerchantRequestID,
        CheckoutRequestID: data.CheckoutRequestID,
        phone_number: phone,
        amount: new_amount,
        ResponseCode: data.ResponseCode,
        user: user,
        log: "",
    }).save()
    return {
        MerchantRequestID: data.MerchantRequestID,
        CheckoutRequestID: data.CheckoutRequestID,
        phone_number: phone,
        amount: new_amount,
        ResponseCode: data.ResponseCode,
        user: user,
        log: "",
    };
};

export default Mpesa_stk;

const getAccessToken = async (): Promise<string> => {
    const auth = Buffer.from(
        `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const response = await axios.get(
        `${process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
        {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        }
    );

    return response.data.access_token;
};
export const sendB2C = async (req: Request | any, res: Response | any) => {
    try {
        const token = await getAccessToken();

        const payload = {
            InitiatorName: process.env.MPESA_INITIATOR_NAME,
            SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
            CommandID: "BusinessPayment", // can also be "SalaryPayment", "PromotionPayment"
            Amount: req.body.amount,
            PartyA: process.env.MPESA_SHORTCODE,
            PartyB: req.body.phone, // 2547XXXXXXXX
            Remarks: "Payment from Mtadao",
            QueueTimeOutURL: process.env.MPESA_B2C_CALLBACK,
            ResultURL: process.env.MPESA_B2C_CALLBACK,
            Occasion: "Payout",
        };

        const response = await axios.post(
            `${process.env.MPESA_BASE_URL}/mpesa/b2c/v1/paymentrequest`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("B2C Response:", response.data);
        res.json(response.data);
    } catch (error: any) {
        console.error("B2C Error:", error?.response?.data || error.message);
        res.status(500).json({ error: "B2C payment failed" });
    }
};
// import fetch, { Headers } from "node-fetch";
// import axios from "axios";
// import moment from "moment";


// const validatePhone = (phone: string): string => {
//     let raw_phone_number = phone.trim();
//     let valid_phone_number = "";

//     if (raw_phone_number.startsWith("+254")) {
//         valid_phone_number = raw_phone_number.replace("+254", "254");
//     } else if (raw_phone_number.startsWith("0")) {
//         valid_phone_number = raw_phone_number.replace("0", "254");
//     } else {
//         valid_phone_number = raw_phone_number;
//     }

//     return valid_phone_number.replace(/\s+/g, ""); // Remove any spaces
// };

// interface MpesaStkResponse {
//     MerchantRequestID: string;
//     CheckoutRequestID: string;
//     phone_number: string;
//     amount: number;
//     ResponseCode: string;
//     user: string;
//     log: string;
// }

// export const Mpesa_stk = async (
//     No: string,
//     amount: number,
//     user: string
// ): Promise<MpesaStkResponse> => {
//     const consumer_key = process.env.MPESA_CONSUMER_KEY as string;
//     const consumer_secret = process.env.MPESA_CONSUMER_SECRETE as string;
//     const passkey = process.env.MPESA_CONSUMER_PASSKEY as string;
//     const short_code = parseInt(process.env.MPESA_SHORT_CODE as string, 10);
//     const timestamp = moment().format("YYYYMMDDHHmmss");

//     const phone = validatePhone(No);
//     const new_amount = parseInt(amount.toString(), 10);

//     const Authorization = `Bearer ${Buffer.from(
//         `${consumer_key}:${consumer_secret}`
//     ).toString("base64")}`;

//     const response = await axios.get<{ access_token: string }>(
//         `${process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
//         {
//             headers: {
//                 Authorization: `Basic ${Buffer.from(
//                     `${consumer_key}:${consumer_secret}`
//                 ).toString("base64")}`,
//             },
//         }
//     );

//     const token = response.data.access_token;
//     console.log(`token: ${token}`);

//     const headers = new Headers();
//     headers.append("Content-Type", "application/json");
//     headers.append("Authorization", `Bearer ${token}`);

//     const fetch_response = await fetch(
//         `${process.env.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
//         {
//             method: "POST",
//             headers,
//             body: JSON.stringify({
//                 BusinessShortCode: short_code,
//                 Password: Buffer.from(
//                     `${short_code}${passkey}${timestamp}`
//                 ).toString("base64"),
//                 Timestamp: timestamp,
//                 TransactionType: "CustomerPayBillOnline",
//                 Amount: new_amount,
//                 PartyA: phone,
//                 PartyB: 4115395,
//                 PhoneNumber: phone,
//                 CallBackURL: process.env.MPESA_CALLbACK,
//                 AccountReference: "Mtadao Pack Ltd",
//                 TransactionDesc: "Payment delivery of *",
//             }),
//         }
//     );

//     const data: any = await fetch_response.json();

//     return {
//         MerchantRequestID: data.MerchantRequestID,
//         CheckoutRequestID: data.CheckoutRequestID,
//         phone_number: phone,
//         amount: new_amount,
//         ResponseCode: data.ResponseCode,
//         user: user,
//         log: "",
//     };
// };

// export default Mpesa_stk;

