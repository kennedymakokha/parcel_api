
import { Request, Response } from "express";
import { Clocks } from "../models/clocks.model";
import { PaymentModel } from "../models/payments.model";





export const CreatePay = async (req: Request | any, res: Response) => {
    try {
        const data = req.body;


        const paymentsToSave = [];

        // SPLIT PAYMENT
        if (data.isSplitPayment) {
            // MPESA RECORD
            if (Number(data.mpesaPortion) > 0) {
                paymentsToSave.push({
                    parcel_id: data.parcel,
                    method: "MPESA",
                    amount: Number(data.mpesaPortion),
                    synced: 0,
                    createdBy: req.user.userId,

                    customer_phone:
                        data?.mpesaData?.phone ?? data.phone ?? "",

                    customer_name:
                        data?.mpesaData?.customer_name ??
                        "Unknown Customer",

                    mpesa_receipt:
                        data?.mpesaData?.receiptNumber ?? "",

                    receipt_no: data?.receiptNo ?? "",
                });
            }

            // CASH RECORD
            if (Number(data.amountGiven) > 0) {
                paymentsToSave.push({

                    parcel_id: data.parcel,
                    method: "CASH",
                    amount: Number(data.amountGiven),
                    synced: 0,
                    createdBy: req.user.userId,
                    customer_phone: "",
                    customer_name: "",
                    mpesa_receipt: "",

                    receipt_no: data?.receiptNo ?? "",
                });
            }

        } else {

            
            // SINGLE PAYMENT
            paymentsToSave.push({

                parcel_id: data.parcel,
                method: data.payments[0].method,
                amount: Number(data.payments[0].amount ),
            
                createdBy: req.user.userId,

                customer_phone:
                    data.payments[0].method === "MPESA"
                        ? (data?.mpesaData?.phone ?? data.phone ?? "")
                        : "",

                customer_name:
                    data.payments[0].method === "MPESA"
                        ? (data?.mpesaData?.customer_name ??
                            "Unknown Customer")
                        : "",

                mpesa_receipt:
                    data.payments[0].method === "MPESA"
                        ? (data?.mpesaData?.receiptNumber ?? "")
                        : "",

                receipt_no: data?.receiptNo ?? "",
            });
        }

        const savedPayments = await PaymentModel.insertMany(paymentsToSave);

        res.status(201).json({
            success: true,
            payments: savedPayments,
        });

    } catch (err: any) {
        console.log(err);

        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};
export const dailyReconciliations = async (req: Request | any, res: Response | any) => {
    try {

        const cashTotal = await PaymentModel.aggregate([
            {
                $match: {
                    method: "CASH"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);
        const mpesaTotal = await PaymentModel.aggregate([
            {
                $match: {
                    method: "MPESA"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);
        res.status(200).json({ mpesaTotal, cashTotal });
    } catch (err: any) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
};


