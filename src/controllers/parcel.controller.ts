
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
import admin from "firebase-admin";
import { PickuUpModel } from "../models/pickups.model";
import { sendTopicNotification } from "../utils/notification";
import { getSocketIo } from "../config/socket";
import { validateParcelInput } from "../validations/parcel.validations";
import { CustomError } from "../utils/custom_error.util";


export const registerParcel = async (req: Request | any, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { sender, receiver, parcel } = req.body;

    const sender_phone = sender.phone;
    const receiver_phone = receiver.phone;

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
    await CustomError(validateParcelInput, parcelData, res);
    // 1. Create parcel
    const newParcel: any = new Parcels(parcelData);
    const savedParcel = await newParcel.save({ session });

    // 2. Create journey
    const journey = new ParcelJourneys({
      parcel_id: savedParcel._id,
      DroppedAt: new Date(),
      recievedBy: req?.user.userId,
    });

    await journey.save({ session });
    const pickupId = newParcel.sentFrom._id.toString();
    const io = getSocketIo();
    io.to(`pickup_${pickupId}`).emit("Parcel-change", newParcel);

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

export const GetClientParcels = async (req: Request | any, res: Response | any) => {
  try {
    const {
      page = 1,
      limit = 10,
      sentFrom,
      status,
      search,
      sentTo,
      phone
    } = req.query;
    let phoneNo = await Format_phone_number(phone);
    let filter: any = { deletedAt: null, sender_phone: phoneNo };

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
    const parcels = await Parcels.find(filter).select('pickup sentFrom receiver_name receiver_phone updatedAt code status')
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
export const GetClientParcel = async (req: Request | any, res: Response | any) => {
  try {
    const { id } = req.params;
    const parcel: any = await Parcels.findOne({ code: id }).select('pickup charges sentFrom receiver_name receiver_phone status updatedAt code')
      .populate("pickup", "pickup_name")
      .populate("sentFrom", "pickup_name")

    const Journey = await ParcelJourneys.findOne({ parcel_id: parcel._id })
      .populate("recievedBy", "name")
      .populate("DispatchedBy", "name")
      .populate("DispatchedTo", "name")
      .populate("deliveredTo", "name")
      .populate("handedOverBy", "name")

    res.status(200).json({
      parcel,
      Journey

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
export const CancelParcel = async (req: Request | any, res: Response | any) => {
  try {


    const { id, parcelCode, receiverPhone, originalDestination } = req.body;
    let phoneNo = await Format_phone_number(receiverPhone);
    const existing: any = await Parcels.findOne({ pickup: originalDestination, receiver_phone: phoneNo, code: parcelCode }).populate("sentFrom", "pickup_name");

    if (!existing) {
      res.status(404).json({ message: "Parcel not found" });
      return
    }

    const updates = await Parcels.findOneAndUpdate(
      { pickup: originalDestination, receiver_phone: phoneNo, code: parcelCode },
      { status: "Cancelled" },
      { new: true }
    );

    const pickupId = existing.sentFrom._id.toString();
    await sendTopicNotification({
      topic: `pickup_${pickupId}_attendants`,
      socket_topic_id: `pickup_${pickupId}`,
      event_name: "Parcel-change",
      audience: `${existing.sentFrom.pickup_name}`,
      title: 'Parcel Cancellation',
      body: `Hello ${existing.sentFrom.pickup_name}, a parcel with code ${parcelCode}  destined  for  ${existing.pickup.pickup_name}  has  been Cancelled and should not be  dispatched .`
    });
    res.status(200).json("updates");

  } catch (error) {
    console.error(error);
    res.status(400).json(error);
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
      pickuId,
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
      const pickup = new mongoose.Types.ObjectId(pickuId);
      matchStage.$or = [
        { sentFrom: pickup },
        { pickup: pickup }
      ];
    }

    if (user.role === "superadmin" && pickuId) {
      const pickup = new mongoose.Types.ObjectId(pickuId);
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
    for (let index = 0; index < parcelIds.length; index++) {
      const element = parcelIds[index];
      const Parcel: any = await Parcels.findById(element)
      const pickupId = Parcel.sentFrom._id.toString();
      const io = getSocketIo();
      io.to(`pickup_${pickupId}`).emit("Parcel-change", Parcel);


    }
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

    const parcel: any = await Parcels.findOne({ code: id }).populate('pickup', "pickup_name");


    if (parcel?.pickup._id.toString() !== req?.user.pickup.toString()) {
      const target_dest: any = await PickuUpModel.findById(req?.user.pickup)
      const dest: any = await PickuUpModel.findById(parcel?.pickup._id)
      await Parcels.findOneAndUpdate({ code: id }, {
        status: "Pending Dispatch",
        currentDriver: null,
        sentFrom: dest._id,
        rerouted: true,
        currentTruck: null
      });
      const pickupId = target_dest._id.toString();
      await sendTopicNotification({
        topic: `pickup_${pickupId}_attendants`,
        socket_topic_id: `pickup_${pickupId}`,
        event_name: "Wrong Destination Parcel Rerouting",
        audience: `${target_dest.pickup_name}`,
        title: 'Wrong Destination',
        body: `Hello ${target_dest.pickup_name}, a parcel with code ${id} has been wrongly delivered at ${dest.pickup_name}. We are working to ship it back to you.\nWe are sorry for the inconvenience caused.\nFor more information contact ${dest.phone_number}.`
      });

      res.status(404).json({ message: "Wrong Destination Parcel Rerouting " });


      return;
    }
    if (parcel?.status !== "In Transit") {
      res.status(404).json({ message: "Parcel  Code Error Kindly  trace the  parcel in the Reports  " });
      return;
    }
    await Parcels.findOneAndUpdate({ code: id }, {
      status: "Pending Collection",
      currentDriver: null,
      currentTruck: null
    });
    const pickupId = parcel.sentFrom._id.toString();
    const pickup = parcel.pickup._id.toString();
    const io = getSocketIo();
    io.to(`pickup_${pickupId}`).emit("Parcel-change", parcel);
    io.to(`pickup_${pickup}`).emit("Parcel-change", parcel);
    if (!parcel) {
      res.status(404).json({ message: "Parcel not found" });
      return;
    }
    const sentToReceiver = await sendTextMessage(
      `Hello ${parcel.receiver_name},Your Parcel has arrived at ${parcel.pickup.pickup_name}.Parcel Code ${parcel.code}.Please  come with your National ID  for pick-up.`,
      `${parcel.receiver_phone}`,
      parcel._id,
      "parcel Delivery"
    )
    if (!sentToReceiver.success) {
      const sentToSender = await sendTextMessage(
        `Hello ${parcel.sender_name}, we were unable to reach the receiver (${parcel.receiver_name}). Please inform them that their parcel (Code: ${parcel.code}) is ready for pickup at ${parcel.pickup.pickup_name}.`,
        `${parcel.sender_phone}`,
        parcel._id,
        "fallback notification"
      );

      // Optional: log or handle if fallback also fails
      if (!sentToSender.success) {
        console.error("Both receiver and sender SMS failed");
      }
    }
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
    if (!req.body.reciever_signature || !req.body.reciever_ID) {
      res.status(400).json({ message: "Signature and ID are required" });
      return;
    }
    const parcel: any = await Parcels.findByIdAndUpdate(id, {
      status: "Collected",
      receiver_signature: req.body.reciever_signature
      ,
      receiver_ID: req.body.reciever_ID,

    }).populate("pickup", 'pickup_name').populate("sentFrom", "pickup_name");
    if (!parcel) {
      res.status(404).json({ message: "Parcel not found" });
      return;
    }

    await ParcelJourneys.findOneAndUpdate(
      { parcel_id: parcel._id },
      { CollectedAt: new Date(), handedOverBy: req?.user.userId }
    );
    await sendTopicNotification({
      topic: `pickup_${parcel.sentFrom}_attendants`,
      socket_topic_id: `pickup_${parcel.sentFrom}`,
      event_name: "Successful Delivery",
      audience: `${parcel.sentFrom.pickup_name}`,
      title: 'Successful Delivery',
      body: `Hello ${parcel.sentFrom.pickup_name}, a parcel with code ${id} has been Collected by at ${parcel.receiver_name} of ID No ${req.body.reciever_ID}`
    });
    res.json({ ok: true, message: "Parcel collected successfully" });

  } catch (error: any) {
    res.status(500).json({ message: "Error collecting parcel", error: error.message });
  }
};


export const GetParcelsCount = async (req: Request | any, res: Response | any) => {
  try {
    // console.log("object");
    const { displayDate, pickupId } = req.query
    const start = new Date(displayDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(displayDate);
    end.setHours(23, 59, 59, 999);

    const count = await Parcels.countDocuments({
      sentFrom: new mongoose.Types.ObjectId(pickupId),
      createdAt: {
        $gte: start,
        $lte: end,
      },
    });
  } catch (error) {

  }
};


export const getFullDashboard = async (req: Request | any, res: Response): Promise<void> => {
  const { pickupId, filterType = "today", startDate, endDate } = req.query;
  const user = req.user; // assume middleware attaches { role, business }

  // Utility: compute date range
  const getDateRange = () => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date();

    switch (filterType) {
      case "today":
        start = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "yesterday":
        start = new Date();
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        start = new Date();
        start.setDate(start.getDate() - 7);
        break;
      case "month":
        start = new Date();
        start.setDate(start.getDate() - 30);
        break;
      case "year":
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case "custom":
        start = startDate ? new Date(startDate) : new Date(0);
        end = endDate ? new Date(endDate) : new Date();
        break;
      default:
        start = new Date(0);
    }

    return { start, end };
  };

  try {
    const { start, end } = getDateRange();

    // --- Pickup-specific KPIs ---
    const totalParcels = await Parcels.countDocuments({
      sentFrom: pickupId,
      createdAt: { $gte: start, $lte: end },
    });

    const delivered = await Parcels.countDocuments({
      status: "Collected",
      sentFrom: pickupId,
      updatedAt: { $gte: start, $lte: end },
    });

    const pending = await Parcels.countDocuments({
      status: "Pending Dispatch",
      sentFrom: pickupId,
      createdAt: { $gte: start, $lte: end },
    });

    const ontransit = await Parcels.countDocuments({
      status: "In Transit",
      sentFrom: pickupId,
      createdAt: { $gte: start, $lte: end },
    });
    const collected = await Parcels.countDocuments({
      status: "Collected",
      sentFrom: pickupId,
      updatedAt: { $gte: start, $lte: end },
    });

    const cancelled = await Parcels.countDocuments({
      status: "Cancelled",
      sentFrom: pickupId,
      updatedAt: { $gte: start, $lte: end },
    });
    const awaiting = await Parcels.countDocuments({
      status: "Pending Collection",
      pickup: pickupId,
      updatedAt: { $gte: start, $lte: end },
    });

    const hourlyTrends = await Parcels.aggregate([
      {
        $match: {
          sentFrom: pickupId,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    console.log(user);
    // --- Admin grouping ---
    let groupedByPickup: any = [];
    if (user?.role === "superadmin") {
      const pickups = await PickuUpModel.find({ business: user.business, state: "active" });

      // Step 2: compute KPIs for each pickup
      groupedByPickup = await Promise.all(
        pickups.map(async (pickup) => {
          const totalParcels = await Parcels.countDocuments({
            sentFrom: pickup._id,
            createdAt: { $gte: start, $lte: end },
          });

          const delivered = await Parcels.countDocuments({
            status: "Collected",
            sentFrom: pickup._id,
            updatedAt: { $gte: start, $lte: end },
          });

          const pending = await Parcels.countDocuments({
            status: "Pending Dispatch",
            sentFrom: pickup._id,
            createdAt: { $gte: start, $lte: end },
          });

          const ontransit = await Parcels.countDocuments({
            status: "In Transit",
            sentFrom: pickup._id,
            createdAt: { $gte: start, $lte: end },
          });

          const collected = await Parcels.countDocuments({
            status: "Collected",
            sentFrom: pickup._id,
            updatedAt: { $gte: start, $lte: end },
          });

          const cancelled = await Parcels.countDocuments({
            status: "Returned",
            sentFrom: pickup._id,
            updatedAt: { $gte: start, $lte: end },
          });

          return {
            pickupId: pickup._id,
            pickupName: pickup.pickup_name,
            totalParcels,
            delivered,
            ontransit,
            awaiting,
            pending,
            collected,
            cancelled,
          };
        })
      );


    }

    res.json({
      filterType,
      start,
      end,
      pickupStats: {
        totalParcels,
        delivered,
        pending,
        collected,
        ontransit,
        cancelled,
        hourlyTrends,
      },
      groupedByPickup, // only populated if admin
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard KPIs" });
  }
};



