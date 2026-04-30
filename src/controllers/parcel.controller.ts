
import { Request, Response } from "express";
import { Clocks } from "../models/clocks.model";
import { Format_phone_number } from "../utils/simplefunctions.util";
import mongoose from "mongoose";
import { ParcelJourneys } from "../models/parcelJouney.model";
import { Parcels } from "../models/parcel.model";
import { parcelDriverModel } from "../models/parcelDriverModel";
import { Trucks } from "../models/trucks.model";
import moment from "moment";
import { sendTextMessage } from "../utils/sms_sender.util";

// const [formData, setFormData] = useState<ParcelFormState>({
//     sender: { name: "", phone: "", address: "" },
//     receiver: { name: "", phone: "", address: "" },
//     parcel: { weight: "", instructions: "", destination: "pickup", pickup: "", price: "" },
//   });


// export const registerPercel = async (req: Request, res: Response) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     const { sender, receiver, parcel } = req.body;
//     const body = { sender_name: sender.name, sender_phone: sender.phone, sender_address: sender.address, receiver_name: receiver.name, receiver_phone: receiver.phone, receiver_address: receiver.address, weight: parcel.weight, instructions: parcel.instructions, fragile: parcel.fragile, destination: parcel.destination, pickup: parcel.pickup, price: parcel.price };
//     try {

//         let Senderphone = await Format_phone_number(body.sender_phone);
//         let Receiverphone = await Format_phone_number(body.receiver_phone);




//         req.body.phone_number = phone



//         res.status(201).json({ ok: true, message: "User registered successfully", newUser });
//         return;

//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ message: "Server error", error });
//         return;

//     }
// };

export const registerParcel = async (req: Request | any, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { sender, receiver, parcel } = req.body;

    const sender_phone = await Format_phone_number(sender.phone);
    const receiver_phone = await Format_phone_number(receiver.phone);

    const parcelData = {
      sender_name: sender.name,
      sender_phone,
      sender_address: sender.address,
      receiver_name: receiver.name,
      receiver_phone,
      receiver_address: receiver.address,
      weight: parcel.weight,
      sentFrom: parcel.sentFrom,
      instructions: parcel.instructions,
      fragile: parcel.fragile,
      destination: parcel.destination,
      pickup: parcel.pickup,
      price: parcel.price,
      code: parcel.code,
      createdBy: req?.user.userId,
      business: req?.user.business
    };

    // 1. Create parcel
    const newParcel = new Parcels(parcelData);
    const savedParcel = await newParcel.save({ session });

    // 2. Create journey
    const journey = new ParcelJourneys({
      parcel_id: savedParcel._id,
      DroppedAt: new Date(),
      recievedBy: req?.user.userId,
    });

    await journey.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      ok: true,
      message: "Parcel registered successfully",
      parcel: savedParcel
    });

  } catch (error: any) {
    await session.abortTransaction();
    console.log(error);

    res.status(500).json({
      ok: false,
      message: "Server error",
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

export const GetParcels = async (req: Request | any, res: Response | any) => {
  try {
    const {
      page = 1,
      limit = 10,
      sentFrom,
      status,
      search,
      sentTo,
    } = req.query;

    let filter: any = { deletedAt: null };

    /** ✅ STATUS-BASED LOGIC */
    if (status === "Pending Collection") {
      // ONLY sentFrom matters
      if (sentTo) {
        filter.pickup = sentTo;
      }
    }
    else if (status === "Pending Dispatch") {
      // ONLY sentFrom matters
      if (sentFrom) {
        filter.sentFrom = sentFrom;
      }
    } else {
      // Normal case: allow either sentFrom OR sentTo
      if (sentFrom && sentTo) {
        filter.$or = [
          { sentFrom: sentFrom },
          { pickup: sentTo },
        ];
      } else if (sentFrom) {
        filter.sentFrom = sentFrom;
      } else if (sentTo) {
        filter.pickup = sentTo;
      }
    }

    /** ✅ Filter by status */
    if (status && status !== '') {
      filter.status = status;
    }

    /** ✅ Search */
    if (search && search !== '') {
      filter.code = { $regex: search, $options: 'i' };
    }

    /** ✅ Query */
    const parcels = await Parcels.find(filter)
      .populate("pickup", "pickup_name")
      .populate("sentFrom", "pickup_name")
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Parcels.countDocuments(filter);

    res.status(200).json({
      parcels,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      message: "Server error",
      error,
    });
  }
};

export const GetParcelJourney = async (req: Request | any, res: Response | any) => {
  try {
    const { id } = req.params;

    const journey = await ParcelJourneys.findOne({ parcel_id: id })
      .populate("parcel_id", "code")
      .populate("recievedBy", "name email")
      .populate("DispatchedBy", "name email")
      .populate("deliveredTo", "name email")
      .populate("handedOverBy", "name email")
      .populate("DispatchedTo", "name email");

    if (!journey) {
      res.status(404).json({ message: "Journey not found for this parcel" });
      return;
    }

    res.json({ ok: true, journey });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching journey", error });

  }
};

export const getParcels = async (req: Request | any, res: Response | any) => {
  try {
    const {
      status,
      startDate,
      endDate,
      pickupId,
      currentTruck, // ✅ new filter
      page = 1,
      limit = 10
    } = req.query;

    const user = req.user;

    let matchStage: any = {
      deletedAt: null
    };

    // 📌 Status filter
    if (status) {
      matchStage.status = status;
    }

    // 🚚 Current Truck filter
    if (
      currentTruck &&
      currentTruck !== "null" &&
      mongoose.Types.ObjectId.isValid(currentTruck)
    ) {
      matchStage.currentTruck = new mongoose.Types.ObjectId(currentTruck);
    }

    // 🔐 Role-based filtering
    if (user.role === "admin") {
      const pickup = new mongoose.Types.ObjectId(user.pickup);
      matchStage.$or = [
        { sentFrom: pickup },
        { pickup: pickup }
      ];
    }

    if (user.role === "superadmin" && pickupId) {
      const pickup = new mongoose.Types.ObjectId(pickupId);
      matchStage.$or = [
        { sentFrom: pickup },
        { pickup: pickup }
      ];
    }

    if (user.role === "driver") {
      matchStage.currentDriver = user._id;
    }

    // 📅 Date filter
    if (startDate || endDate) {
      matchStage.createdAt = {};

      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        matchStage.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ✅ Query (NO aggregation)
    const [parcels, total] = await Promise.all([
      Parcels.find(matchStage)
        .populate("currentTruck", "plate")
        .populate("currentDriver", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),

      Parcels.countDocuments(matchStage)
    ]);

    res.json({
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: parcels
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching parcels" });
  }
};

export const getTruckParcelCount = async (req: Request | any, res: Response | any) => {
  try {
    const user = req.user;
    const pickup = new mongoose.Types.ObjectId(user.pickup);
    const result = await Parcels.aggregate([
      {
        $match: {
          status: "In Transit",
          deletedAt: null,
          currentTruck: { $ne: null },
          $or: [
            { pickup: pickup },
            { sentFrom: pickup },
          ],
        },
      },
      {
        $group: {
          _id: "$currentTruck",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "trucks_tbs",
          localField: "_id",
          foreignField: "_id",
          as: "truck",
        },
      },
      { $unwind: "$truck" },
      {
        $project: {
          _id: 0,
          truck_id: "$_id",
          name: "$truck.plate",
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
    res.json({ ok: true, data: result });

  } catch (error) {

  }
};
export const getParcelStatusCount = async (req: Request | any, res: Response | any) => {
  try {
    const user = req.user;
    const pickup = new mongoose.Types.ObjectId(user.pickup);

    const result = await Parcels.aggregate([
      {
        $match: {
          deletedAt: null,
          $or: [
            { pickup: pickup },
            { sentFrom: pickup },
          ],
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,              // keep original
          name: "$_id",        // 👈 same value as label
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
    res.json({ ok: true, data: result });

  } catch (error) {

  }
};
export const dropParcel = async (req: Request | any, res: Response): Promise<void> => {
  try {
    const { parcelId } = req.params;

    await Parcels.findByIdAndUpdate(parcelId, {
      status: "Pending Dispatch"
    });

    await ParcelJourneys.findOneAndUpdate(
      { parcel_id: parcelId },
      { DroppedAt: new Date() }
    );

    res.json({ ok: true, message: "Parcel dropped successfully" });

  } catch (error: any) {
    res.status(500).json({ message: "Error dropping parcel", error: error.message });
  }
};

export const dispatchParcels = async (req: Request | any, res: Response): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    const { parcelIds, truckId } = req.body;
    // Basic validation
    if (!Array.isArray(parcelIds) || parcelIds.length === 0) {
      res.status(400).json({ message: "parcelIds must be a non-empty array" });
      return;
    }

    if (!truckId) {
      res.status(400).json({ message: "truckId is required" });
      return;
    }

    session.startTransaction();
    const truck: any = await Trucks.findById(truckId).session(session);
    // 1. Update parcels status
    await Parcels.updateMany(
      { _id: { $in: parcelIds } },
      { $set: { status: "In Transit", currentTruck: truckId, currentDriver: truck.driverId } },
      { session }
    );

    // 2. Update journey
    await ParcelJourneys.updateMany(
      { parcel_id: { $in: parcelIds } },
      { $set: { DispatchedAt: new Date() }, DispatchedTo: truck.driverId, DispatchedBy: req?.user.userId },
      { session }
    );

    // 3. Insert into parcelDriver table
    const driverEntries = parcelIds.map((id: string) => ({
      parcel: id,
      truck: truckId,
    }));

    await parcelDriverModel.insertMany(driverEntries, { session });
    await session.commitTransaction();
    session.endSession();

    res.json({
      ok: true,
      message: "Parcels dispatched successfully",
      count: parcelIds.length,
    });

  } catch (error: any) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: "Error dispatching parcels",
      error: error.message,
    });
  }
};
export const markParcelArrived = async (req: Request | any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const parcel: any = await Parcels.findOne({ code: id });

    if (parcel?.pickup.toString() !== req?.user.pickup.toString()) {
      console.log("Unauthorized arrival attempt by user:", req?.user);
      res.status(404).json({ message: "Parcel not found" });
      return;
    }
    if (parcel?.status !== "In Transit") {
      res.status(404).json({ message: "Not in transit" });
      return;
    }
    await Parcels.findOneAndUpdate({ code: id }, {
      status: "Pending Collection",
      currentDriver: null,
      currentTruck: null
    });
    if (!parcel) {
      res.status(404).json({ message: "Parcel not found" });
      return;
    }
    await sendTextMessage(
      `Hello ${parcel.reciever_name},Your Parcel has arrived at ${parcel.pickup.pickup_name}.Parcel Code ${parcel.code}.Please  come with your National ID  for pick-up.`,
      `${parcel.receiver_phone}`,
      parcel._id,
      "parcel Delivery"
    )
    await ParcelJourneys.findOneAndUpdate(
      { parcel_id: parcel._id },
      { ArrivedAt: new Date(), deliveredTo: req?.user.userId },
    );

    res.json({ ok: true, message: "Parcel arrived at destination" });

  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: "Error updating arrival", error: error.message });
  }
};
export const collectParcel = async (req: Request | any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.body.signature || !req.body.ID) {
      res.status(400).json({ message: "Signature and ID are required" });
      return;
    }
    const parcel: any = await Parcels.findByIdAndUpdate(id, {
      status: "Collected",
      receiver_signature: req.body.signature,
      receiver_ID: req.body.ID,

    }).populate("pickup", 'pickup_name');
    if (!parcel) {
      res.status(404).json({ message: "Parcel not found" });
      return;
    }

    await ParcelJourneys.findOneAndUpdate(
      { parcel_id: parcel._id },
      { CollectedAt: new Date(), handedOverBy: req?.user.userId }
    );

    res.json({ ok: true, message: "Parcel collected successfully" });

  } catch (error: any) {
    res.status(500).json({ message: "Error collecting parcel", error: error.message });
  }
};


export const getParcelEventStats = async (req: Request | any, res: Response): Promise<void> => {
  try {
    const {
      pickupId,
      filterType = "today",
      startDate,
      endDate
    }: any = req.query


    // const pickupId = "64b8c9f1c9d898e4b1a2e5f"; // Replace with actual pickup ID
    let start, end;

    // 🌍 Global date filter
    switch (filterType) {
      case "today":
        start = moment().startOf("day").toDate();
        end = moment().endOf("day").toDate();
        break;

      case "week":
        start = moment().subtract(7, "days").startOf("day").toDate();
        end = moment().endOf("day").toDate();
        break;

      case "month":
        start = moment().startOf("month").toDate();
        end = moment().endOf("month").toDate();
        break;

      case "range":
        start = moment(startDate).startOf("day").toDate();
        end = moment(endDate).endOf("day").toDate();
        break;

      default:
        throw new Error("Invalid filter");
    }


    const pickupObjectId = mongoose.Types.ObjectId.isValid(pickupId)
      ? new mongoose.Types.ObjectId(pickupId)
      : null;

    if (!pickupObjectId) {
      throw new Error("Invalid pickupId");
    }
    const result = await ParcelJourneys.aggregate([
      {
        $lookup: {
          from: "parcels_tbs",
          localField: "parcel_id",
          foreignField: "_id",
          as: "parcel"
        }
      },
      { $unwind: "$parcel" },

      {
        $match: {
          deletedAt: null,
          "parcel.deletedAt": null
        }
      },

      {
        $facet: {
          // 📦 ORIGIN (sentFrom)
          dropped: [
            {
              $match: {
                DroppedAt: { $gte: start, $lte: end },
                "parcel.sentFrom": pickupObjectId
              }
            },
            { $count: "count" }
          ],

          dispatched: [
            {
              $match: {
                DispatchedAt: { $gte: start, $lte: end },
                "parcel.sentFrom": pickupObjectId
              }
            },
            { $count: "count" }
          ],

          // 📍 DESTINATION (pickup)
          arrived: [
            {
              $match: {
                ArrivedAt: { $gte: start, $lte: end },
                "parcel.pickup": pickupObjectId
              }
            },
            { $count: "count" }
          ],

          collected: [
            {
              $match: {
                CollectedAt: { $gte: start, $lte: end },
                "parcel.pickup": pickupObjectId
              }
            },
            { $count: "count" }
          ]
        }
      }
    ]);

    const data = result[0];

    const kpis = [
      { label: "Dropped", value: data.dropped[0]?.count || 0 },
      { label: "Dispatched", value: data.dispatched[0]?.count || 0 },
      { label: "Arrived", value: data.arrived[0]?.count || 0 },
      { label: "Collected", value: data.collected[0]?.count || 0 },
    ];

    res.json({ data: kpis });
    return

  } catch (err) {
    console.error(err);
    throw err;
  }
};


export const getFullDashboard = async (req: Request | any, res: Response): Promise<void> => {
  const { pickupId,
    filterType = "today",
    startDate,
    endDate
  } = req.query;
  try {
    const pickupObjectId = new mongoose.Types.ObjectId(pickupId);

    // 🗓️ Global filter
    let start, end;
    switch (filterType) {
      case "today":
        start = moment().startOf("day").toDate();
        end = moment().endOf("day").toDate();
        break;
      case "week":
        start = moment().subtract(7, "days").toDate();
        end = moment().toDate();
        break;
      case "month":
        start = moment().startOf("month").toDate();
        end = moment().endOf("month").toDate();
        break;
      case "range":
        start = moment(startDate).toDate();
        end = moment(endDate).toDate();
        break;
    }

    const basePipeline = [
      {
        $lookup: {
          from: "parcels_tbs",
          localField: "parcel_id",
          foreignField: "_id",
          as: "parcel"
        }
      },
      { $unwind: "$parcel" },
      {
        $match: {
          deletedAt: null,
          "parcel.deletedAt": null
        }
      }
    ];

    // =========================
    // 📊 KPI COUNTS
    // =========================
    const kpiAgg = await ParcelJourneys.aggregate([
      ...basePipeline,
      {
        $facet: {
          dropped: [
            {
              $match: {
                DroppedAt: { $gte: start, $lte: end },
                "parcel.sentFrom": pickupObjectId
              }
            },
            { $count: "count" }
          ],
          dispatched: [
            {
              $match: {
                DispatchedAt: { $gte: start, $lte: end },
                "parcel.sentFrom": pickupObjectId
              }
            },
            { $count: "count" }
          ],
          arrived: [
            {
              $match: {
                ArrivedAt: { $gte: start, $lte: end },
                "parcel.pickup": pickupObjectId
              }
            },
            { $count: "count" }
          ],
          collected: [
            {
              $match: {
                CollectedAt: { $gte: start, $lte: end },
                "parcel.pickup": pickupObjectId
              }
            },
            { $count: "count" }
          ]
        }
      }
    ]);

    const kpis = [
      { label: "Dropped", value: kpiAgg[0].dropped[0]?.count || 0 },
      { label: "Dispatched", value: kpiAgg[0].dispatched[0]?.count || 0 },
      { label: "Arrived", value: kpiAgg[0].arrived[0]?.count || 0 },
      { label: "Collected", value: kpiAgg[0].collected[0]?.count || 0 }
    ];

    // =========================
    // 📈 HOURLY CHARTS (Collected example)
    // =========================
    const hourlyCollected = await ParcelJourneys.aggregate([
      ...basePipeline,
      {
        $match: {
          CollectedAt: { $gte: start, $lte: end },
          "parcel.pickup": pickupObjectId
        }
      },
      {
        $group: {
          _id: { $hour: "$CollectedAt" },
          value: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const hourlyData = hourlyCollected.map(h => ({
      key: h?._id?.toString().padStart(2, "0"),
      value: h.value
    }));

    // =========================
    // 🚚 DRIVER PERFORMANCE
    // =========================
    const driverStats = await ParcelJourneys.aggregate([
      ...basePipeline,
      {
        $match: {
          CollectedAt: { $gte: start, $lte: end },
          "parcel.pickup": pickupObjectId
        }
      },
      {
        $group: {
          _id: "$handedOverBy", // driver
          totalCollected: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "user_tbs",
          localField: "_id",
          foreignField: "_id",
          as: "driver"
        }
      },
      { $unwind: "$driver" },
      {
        $project: {
          name: "$driver.name",
          totalCollected: 1
        }
      },
      { $sort: { totalCollected: -1 } }
    ]);
    res.json({
      kpis,
      hourlyData,
      driverStats
    });
    return;

  } catch (err) {
    console.error(err);
    throw err;
  }
};