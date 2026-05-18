
import { Request, Response } from "express";
import { PaymentModel } from "../models/payments.model";
import moment from "moment-timezone";
import { Parcels } from "../models/parcel.model";




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
                amount: Number(data.payments[0].amount),

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
export const dailyReconciliations = async (
    req: Request,
    res: Response
) => {
    try {
        const filter = (req.query.filter as string) || "today";

        const timezone = "Africa/Nairobi";

        let start: Date;
        let end: Date;

        switch (filter) {
            case "week":
                start = moment.tz(timezone).startOf("week").toDate();
                end = moment.tz(timezone).endOf("week").toDate();
                break;

            case "month":
                start = moment.tz(timezone).startOf("month").toDate();
                end = moment.tz(timezone).endOf("month").toDate();
                break;

            case "year":
                start = moment.tz(timezone).startOf("year").toDate();
                end = moment.tz(timezone).endOf("year").toDate();
                break;

            case "today":
            default:
                start = moment.tz(timezone).startOf("day").toDate();
                end = moment.tz(timezone).endOf("day").toDate();
                break;
        }

        const cashResult = await PaymentModel.aggregate([
            {
                $match: {
                    method: "CASH",
                    createdAt: {
                        $gte: start,
                        $lte: end,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]);

        const mpesaResult = await PaymentModel.aggregate([
            {
                $match: {
                    method: "MPESA",
                    createdAt: {
                        $gte: start,
                        $lte: end,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]);

        const cashTotal = cashResult[0]?.total || 0;
        const mpesaTotal = mpesaResult[0]?.total || 0;

        const totalRevenue = cashTotal + mpesaTotal;

        res.status(200).json({
            filter,
            cashTotal,
            mpesaTotal,
            totalRevenue,
            start,
            end,
        });
    } catch (err: any) {
        console.log(err);

        res.status(500).json({
            error: err.message,
        });
    }
};


export const dailyReconciliationd = async (req: Request | any, res: Response | any) => {
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


export const getDailyReconciliationParcels = async (
  req: Request,
  res: Response
) => {
  try {
    const filter = (req.query.filter as string) || "today";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const timezone = "Africa/Nairobi";

    let start: Date;
    let end: Date;

    switch (filter) {
      case "week":
        start = moment.tz(timezone).startOf("week").toDate();
        end = moment.tz(timezone).endOf("week").toDate();
        break;

      case "month":
        start = moment.tz(timezone).startOf("month").toDate();
        end = moment.tz(timezone).endOf("month").toDate();
        break;

      case "year":
        start = moment.tz(timezone).startOf("year").toDate();
        end = moment.tz(timezone).endOf("year").toDate();
        break;

      case "today":
      default:
        start = moment.tz(timezone).startOf("day").toDate();
        end = moment.tz(timezone).endOf("day").toDate();
        break;
    }

    const payments = await PaymentModel.aggregate([
      // Filter by date
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },

      // Join parcel
      {
        $lookup: {
          from: "parcels_tbs",
          localField: "parcel_id",
          foreignField: "_id",
          as: "parcel",
        },
      },

      {
        $unwind: "$parcel",
      },

      // Join FROM pickup
      {
        $lookup: {
          from: "pickup_tbs",
          localField: "parcel.sentFrom",
          foreignField: "_id",
          as: "fromPickup",
        },
      },

      {
        $unwind: {
          path: "$fromPickup",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Join TO pickup
      {
        $lookup: {
          from: "pickup_tbs",
          localField: "parcel.pickup",
          foreignField: "_id",
          as: "toPickup",
        },
      },

      {
        $unwind: {
          path: "$toPickup",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Shape data
      {
        $project: {
          _id: 1,
          amount: 1,
          method: 1,
          createdAt: 1,

          code: "$parcel.code",
          weight: "$parcel.weight",

          from: "$fromPickup.short_code",
          to: "$toPickup.short_code",
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },

      {
        $skip: skip,
      },

      {
        $limit: limit,
      },
    ]);

    const total = await PaymentModel.countDocuments({
      createdAt: {
        $gte: start,
        $lte: end,
      },
    });

    res.status(200).json({
      success: true,
      filter,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: payments,
    });
  } catch (err: any) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
};


