
import { Request, Response } from "express";
import { Clocks } from "../models/clocks.model";
import { Format_phone_number } from "../utils/simplefunctions.util";
import mongoose from "mongoose";
import { ParcelJourneys } from "../models/parcelJouney.model";
import { Parcels } from "../models/parcel.model";
import { parcelDriverModel } from "../models/parcelDriverModel";
import { Trucks } from "../models/trucks.model";
import moment from "moment-timezone";
import { sendTextMessage } from "../utils/sms_sender.util";
import admin from "firebase-admin";
import { PickuUpModel } from "../models/pickups.model";
import { sendPushNotification, sendTopicNotification } from "../utils/notification";
import { getSocketIo } from "../config/socket";
import { validateParcelInput } from "../validations/parcel.validations";
import { CustomError } from "../utils/custom_error.util";
import { generateParcelCode } from "../utils/generateParcelCodes";
import { getDateRangeByFilter } from "../utils/timezone.util";


export const registerParcel = async (req: Request | any, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { sender, receiver, parcel } = req.body;

    const sender_phone = sender.phone;
    const receiver_phone = receiver.phone;
    const code = await generateParcelCode(req.body.parcel.pickup);

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
      code: code,
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
    else if (status === "Pending Dispatch" || status === "Cancelled") {
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
    const io = getSocketIo();
    io.to(`pickup_${pickupId}`).emit("Parcel-change", updates);
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

    // 1. Fetch parcel and populate the current driver to get their info/FCM token
    const parcel: any = await Parcels.findOne({ code: id })
      .populate('pickup', "pickup_name phone_number")
      .populate('currentDriver');

    if (!parcel) {
      res.status(404).json({ message: "Parcel not found" });
      return;
    }

    // Capture driver and pickup details before we clear them in the update
    const driver = parcel.currentDriver;
    const targetPickupId = parcel.pickup._id;

    // Logic for Wrong Destination Rerouting
    if (parcel.pickup._id.toString() !== req.user.pickup.toString()) {
      const attendantPickup: any = await PickuUpModel.findById(req.user.pickup);
      const originalDest: any = await PickuUpModel.findById(parcel.pickup._id);

      await Parcels.findOneAndUpdate({ code: id }, {
        status: "Pending Dispatch",
        sentFrom: attendantPickup._id, // Set the current location as the sender
        rerouted: true,
      });

      const pickupIdStr = originalDest._id.toString();
      await sendTopicNotification({
        topic: `pickup_${pickupIdStr}_attendants`,
        socket_topic_id: `pickup_${pickupIdStr}`,
        event_name: "Wrong Destination Parcel Rerouting",
        audience: `${originalDest.pickup_name}`,
        title: 'Wrong Destination',
        body: `Hello ${originalDest.pickup_name}, a parcel with code ${id} has been wrongly delivered at ${attendantPickup.pickup_name}. We are working to ship it back to you.\nFor more information contact ${attendantPickup.phone_number}.`
      });

      res.status(404).json({ message: "Wrong Destination Parcel Rerouting" });
      return;
    }

    if (parcel.status !== "In Transit") {
      res.status(400).json({ message: "Parcel Code Error: Kindly trace the parcel in Reports" });
      return;
    }

    // 2. Mark Parcel as Arrived
    await Parcels.findOneAndUpdate({ code: id }, {
      status: "Pending Collection",
      currentDriver: null,
      currentTruck: null
    });

    // 3. CHECK: Is this the driver's last parcel for this specific pickup?
    if (driver) {
      const remainingForDriver = await Parcels.countDocuments({
        currentDriver: driver._id,
        pickup: targetPickupId,
        status: "In Transit",
        deletedAt: null
      });

      if (remainingForDriver === 0 && driver.FCM_token) {
        // Notify the driver specifically
        await sendPushNotification({
          token: driver.FCM_token, // Direct push to driver
          data: {},
          title: 'Delivery Complete',
          body: `All parcels for ${parcel.pickup.pickup_name} have been received. Your manifest for this stop is now clear!`
        });
      }
    }

    // 4. Notifications (Socket, SMS, Journey)
    const pickupId = parcel.sentFrom?._id.toString();
    const pickup = parcel.pickup._id.toString();
    const io = getSocketIo();

    io.to(`pickup_${pickupId}`).emit("Parcel-change", parcel);
    io.to(`pickup_${pickup}`).emit("Parcel-change", parcel);

    const sentToReceiver = await sendTextMessage(
      `Hello ${parcel.receiver_name}, Your Parcel has arrived at ${parcel.pickup.pickup_name}. Parcel Code ${parcel.code}. Please come with your National ID for pick-up.`,
      `${parcel.receiver_phone}`,
      parcel._id,
      "parcel Delivery"
    );

    if (!sentToReceiver.success) {
      await sendTextMessage(
        `Hello ${parcel.sender_name}, we were unable to reach the receiver (${parcel.receiver_name}). Please inform them that their parcel (Code: ${parcel.code}) is ready for pickup at ${parcel.pickup.pickup_name}.`,
        `${parcel.sender_phone}`,
        parcel._id,
        "fallback notification"
      );
    }

    await ParcelJourneys.findOneAndUpdate(
      { parcel_id: parcel._id },
      { ArrivedAt: new Date(), deliveredTo: req.user.userId },
    );

    res.json({ ok: true, message: "Parcel arrived and driver notified" });

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
    const pickupId = parcel.sentFrom._id.toString();


    await sendTopicNotification({
      topic: `pickup_${pickupId}_attendants`,
      socket_topic_id: `pickup_${pickupId}`,
      event_name: "Parcel-change",
      audience: `${parcel.sentFrom.pickup_name}`,
      title: 'Successful Delivery',
      body: `Hello ${parcel.sentFrom.pickup_name}, a parcel with code ${parcel.code} has been Collected by  ${parcel.receiver_name} of ID No ${req.body.reciever_ID}`
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
    const start = moment
      .tz(displayDate, "Africa/Nairobi")
      .startOf("day")
      .toDate();

    const end = moment
      .tz(displayDate, "Africa/Nairobi")
      .endOf("day")
      .toDate();

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


export const getFullDashboard = async (
  req: Request | any,
  res: Response,
): Promise<void> => {
  const { pickupId, filterType = 'today', startDate, endDate } = req.query;

  const user = req.user;

  try {
    const { start, end } = getDateRangeByFilter(
      filterType,
      startDate,
      endDate,
    );

    /**
     * BASE FILTER
     * If attendant -> only fetch parcels created by them
     */
    const baseFilter: any = {
      createdAt: { $gte: start, $lte: end },
    };

    // pickup filter
    if (pickupId) {
      baseFilter.sentFrom = pickupId;
    }

    // attendant restriction
    if (user?.role === 'attendant') {
      baseFilter.createdBy = user.userId;
    }

    // --- Pickup-specific KPIs ---
    const totalParcels = await Parcels.countDocuments(baseFilter);

    const delivered = await Parcels.countDocuments({
      ...baseFilter,
      status: 'Collected',
      updatedAt: { $gte: start, $lte: end },
    });

    const pending = await Parcels.countDocuments({
      ...baseFilter,
      status: 'Pending Dispatch',
    });

    const ontransit = await Parcels.countDocuments({
      ...baseFilter,
      status: 'In Transit',
    });

    const collected = await Parcels.countDocuments({
      ...baseFilter,
      status: 'Collected',
      updatedAt: { $gte: start, $lte: end },
    });

    const cancelled = await Parcels.countDocuments({
      ...baseFilter,
      status: 'Cancelled',
      updatedAt: { $gte: start, $lte: end },
    });

    const awaiting = await Parcels.countDocuments({
      pickup: pickupId,
      status: 'Pending Collection',
      updatedAt: { $gte: start, $lte: end },
      ...(user?.role === 'attendant' && {
        createdBy: user.userId,
      }),
    });

    const hourlyTrends = await Parcels.aggregate([
      {
        $match: baseFilter,
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // --- Super Admin grouping ---
    let groupedByPickup: any = [];

    if (user?.role === 'superadmin') {
      const pickups = await PickuUpModel.find({
        business: user.business,
        state: 'active',
      });

      groupedByPickup = await Promise.all(
        pickups.map(async pickup => {
          const pickupFilter = {
            sentFrom: pickup._id,
            createdAt: { $gte: start, $lte: end },
          };

          const totalParcels = await Parcels.countDocuments(pickupFilter);

          const delivered = await Parcels.countDocuments({
            ...pickupFilter,
            status: 'Collected',
            updatedAt: { $gte: start, $lte: end },
          });

          const pending = await Parcels.countDocuments({
            ...pickupFilter,
            status: 'Pending Dispatch',
          });

          const ontransit = await Parcels.countDocuments({
            ...pickupFilter,
            status: 'In Transit',
          });

          const collected = await Parcels.countDocuments({
            ...pickupFilter,
            status: 'Collected',
            updatedAt: { $gte: start, $lte: end },
          });

          const cancelled = await Parcels.countDocuments({
            ...pickupFilter,
            status: 'Returned',
            updatedAt: { $gte: start, $lte: end },
          });

          const awaiting = await Parcels.countDocuments({
            pickup: pickup._id,
            status: 'Pending Collection',
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
        }),
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
        awaiting,
        hourlyTrends,
      },
      groupedByPickup,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to fetch dashboard KPIs',
    });
  }
};



export const getDriverPickupStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const driverId = req.params.id;
    const filter = (req.query.filter as string) || "today";

    const timezone = "Africa/Nairobi";
    let start: Date;
    let end: Date;

    // Time logic
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

    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      res.status(400).json({ error: "Invalid driverId" });
      return;
    }

    const results = await Parcels.aggregate([
      // 1. Filter by Driver, Status: "In Transit", and the Date range
      {
        $match: {
          currentDriver: new mongoose.Types.ObjectId(driverId),
          status: "In Transit",
          deletedAt: null,
          createdAt: { $gte: start, $lte: end } // Applying the date filter
        }
      },

      // 2. Join with the Pickup collection
      {
        $lookup: {
          from: "pickup_tbs",
          localField: "pickup",
          foreignField: "_id",
          as: "pickupDetails"
        }
      },

      // 3. Flatten the array
      { $unwind: "$pickupDetails" },

      // 4. Group by pickup station
      {
        $group: {
          _id: "$pickup",
          pickup_name: { $first: "$pickupDetails.pickup_name" }, // Get name only
          totalParcels: { $sum: 1 },
          parcels: {
            $push: {
              _id: "$_id",
              sender_name: "$sender_name",
              receiver_name: "$receiver_name",
              code: "$code",
              status: "$status"
            }
          }
        }
      },

      // 5. Clean up the output to only return ID and Name in the header
      {
        $project: {
          _id: 1,
          pickup_name: 1,
          totalParcels: 1,
          parcels: 1
        }
      },

      { $sort: { pickup_name: 1 } }
    ]);

    res.json(results);
    return
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch driver pickup stats" });
  }
};




