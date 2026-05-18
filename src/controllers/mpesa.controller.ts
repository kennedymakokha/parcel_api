import { User } from "../models/user.model";
import { Request, Response } from "express";
import Mpesa_stk from "../utils/stk.util";
import { getSocketIo } from "../config/socket";
import MpesaLogs from "../models/mpesaLogs.model";
import { sendTopicNotification } from "../utils/notification";
import { PickuUpModel } from "../models/pickups.model";




export const mpesa_callback = async (req: Request, res: Response | any) => {
    try {
        // console.log(
        //     "M-PESA CALLBACK:",
        //     JSON.stringify(req.body, null, 2)
        // );

        const io = await getSocketIo();

        const stkCallback = req.body?.Body?.stkCallback;

        if (!stkCallback) {
            return res.status(400).json({
                success: false,
                message: "Invalid callback body"
            });
        }

        const merchantRequestID = stkCallback.MerchantRequestID;

        const callbackItems = stkCallback?.CallbackMetadata?.Item || [];

        const receipt =
            callbackItems.find(
                (item: any) => item.Name === "MpesaReceiptNumber"
            )?.Value || "";

        const amount =
            callbackItems.find(
                (item: any) => item.Name === "Amount"
            )?.Value || 0;

        const phone =
            callbackItems.find(
                (item: any) => item.Name === "PhoneNumber"
            )?.Value || "";

        const updated = await MpesaLogs.findOneAndUpdate(
            {
                MerchantRequestID: merchantRequestID
            },
            {
                log: JSON.stringify(req.body),
                ResultDesc: stkCallback.ResultDesc,
                ResponseCode: Number(stkCallback.ResultCode),
                MpesaReceiptNumber: receipt,
                amount,
                phone_number: phone,
                status:
                    Number(stkCallback.ResultCode) === 0
                        ? "complete"
                        : "canceled"
            },
            {
                new: true
            }
        );

        // console.log("UPDATED LOG:", updated);

        // socket updates
        if (updated) {
            io?.to(`${updated.pickup}`).emit(
                "payment-callback",
                updated
            );

            io?.to(`${updated.pickup}`).emit(
                "payment-end",
                Number(stkCallback.ResultCode) === 0
            );
        }

        // IMPORTANT:
        // Always respond to Safaricom
        return res.status(200).json({
            ResultCode: 0,
            ResultDesc: "Accepted"
        });

    } catch (error) {
        console.log("CALLBACK ERROR:", error);

        // IMPORTANT:
        // Always return 200 to Safaricom
        return res.status(200).json({
            ResultCode: 0,
            ResultDesc: "Accepted"
        });
    }
};


export const makePayment = async (
    req: Request | any,
    res: Response | any
) => {
    try {
        const io = await getSocketIo();

        const { amount, phone_number, pickup_id } = req.body;

        // console.log("PAYMENT REQUEST:", req.body);

        const pickup: any = await PickuUpModel.findById(
            pickup_id
        );

        if (!pickup) {
            return res.status(404).json({
                success: false,
                message: "Pickup not found"
            });
        }

        const pickupId = pickup_id.toString();

        // Send STK Push
        const response = await Mpesa_stk(
            phone_number,
            Number(amount),
            req.user._id,
            pickup
        );

        const merchantRequestId =
            response?.MerchantRequestID;

        if (!merchantRequestId) {
            return res.status(400).json({
                success: false,
                message: "Failed to initiate payment"
            });
        }

        // IMPORTANT:
        // create/update pending log immediately
        await MpesaLogs.findOneAndUpdate(
            {
                MerchantRequestID: merchantRequestId
            },
            {
                MerchantRequestID: merchantRequestId,
                CheckoutRequestID:
                    response.CheckoutRequestID,
                phone_number,
                amount,
                pickup: pickup._id,
                user: req.user._id,
                log: "",
                status: "pending",
                ResponseCode: null
            },
            {
                upsert: true,
                new: true,
                runValidators: true
            }
        );

        io?.to(`${pickup._id}`).emit(
            "payment-start",
            true
        );

        // polling for callback
        const maxRetries = 20;
        const retryInterval = 5000;

        let retryCount = 0;

        let logs: any = null;

        while (retryCount < maxRetries) {

            logs = await MpesaLogs.findOne({
                MerchantRequestID: merchantRequestId
            });

            // console.log(
            //     `Retry ${retryCount + 1}`,
            //     logs
            // );

            // callback updated successfully
            if (
                logs &&
                logs.log &&
                logs.status !== "pending"
            ) {
                break;
            }

            retryCount++;

            await new Promise((resolve) =>
                setTimeout(resolve, retryInterval)
            );
        }

        // timeout
        if (
            !logs ||
            !logs.log ||
            logs.status === "pending"
        ) {

            io?.to(`${pickup._id}`).emit(
                "payment-end",
                false
            );

            await sendTopicNotification({
                topic: `pickup_${pickupId}_attendants`,
                socket_topic_id: `pickup_${pickupId}`,
                event_name: "Payment Failure",
                audience: `${pickup.pickup_name}`,
                title: "Payment Failure",
                body:
                    `Hello ${pickup.pickup_name}\n` +
                    `The payment made by ${phone_number} ` +
                    `was not successful or callback timed out.\n` +
                    `Kindly confirm the transaction manually.`
            });

            return res.status(408).json({
                success: false,
                message:
                    "Payment verification timed out. Please confirm transaction."
            });
        }

        // failed payment
        if (Number(logs.ResponseCode) !== 0) {

            io?.to(`${pickup._id}`).emit(
                "payment-end",
                false
            );

            await sendTopicNotification({
                topic: `pickup_${pickupId}_attendants`,
                socket_topic_id: `pickup_${pickupId}`,
                event_name: "Payment Failure",
                audience: `${pickup.pickup_name}`,
                title: "Payment Failure",
                body:
                    `Hello ${pickup.pickup_name}\n` +
                    `The payment made by ${phone_number} ` +
                    `was not successful (${logs.ResultDesc}).\n` +
                    `Kindly reach out to ${req.user.name}.`
            });

            return res.status(400).json({
                success: false,
                message: logs.ResultDesc || "Payment failed",
                data: logs
            });
        }

        // success
        io?.to(`${pickup._id}`).emit(
            "payment-end",
            true
        );

        return res.status(200).json({
            success: true,
            message:
                logs.ResultDesc || "Payment successful",

            MerchantRequestID:
                logs.MerchantRequestID,

            CheckoutRequestID:
                logs.CheckoutRequestID,

            phone_number: logs.phone_number,

            ResponseCode: logs.ResponseCode,

            status: logs.status,

            amount: logs.amount,

            MpesaReceiptNumber:
                logs.MpesaReceiptNumber,

            ResultDesc: logs.ResultDesc
        });

    } catch (error: any) {

        console.error(
            "Wallet operation error:",
            error
        );

        return res.status(400).json({
            success: false,
            message: "Operation failed",
            error: error?.message || error
        });
    }
};

export const get_Mpesa_logs = async (req: Request | any, res: Response | any) => {
    try {
        const { page, limit } = req.query;
        const user: any = await User.findById(req.user.userId)
        let options = {}
        if (user.role === "client") {
            options = { user: req.user.userId }
        }
        if (user.role === "admin") {
            options = { vendor: req.user.userId }
        }
        let logs = await MpesaLogs.find(options).skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });
        const total = await MpesaLogs.countDocuments();
        res.status(200)
            .json({
                logs, page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            });
        return
    } catch (error) {
        console.log(error);
        res
            .status(400)
            .json({ success: false, message: "operation failed ", error });
        return
    }
}
export const get_wallet_balance = async (req: Request | any, res: Response | any) => {
    try {
        let Cash = await User.findOne({ _id: req.user.userId }).select("amount")
        res.status(200)
            .json(Cash);
        return
    } catch (error) {
        console.log(error);
        res
            .status(400)
            .json({ success: false, message: "operation failed ", error });
        return
    }
}


