"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullDashboard = exports.collectParcel = exports.markParcelArrived = exports.dispatchParcels = exports.getParcelStatusCount = exports.getTruckParcelCount = exports.getParcels = exports.GetParcelJourney = exports.CancelParcel = exports.GetClientParcel = exports.GetClientParcels = exports.GetParcels = exports.registerParcel = void 0;
var simplefunctions_util_1 = require("../utils/simplefunctions.util");
var mongoose_1 = require("mongoose");
var parcelJouney_model_1 = require("../models/parcelJouney.model");
var parcel_model_1 = require("../models/parcel.model");
var parcelDriverModel_1 = require("../models/parcelDriverModel");
var trucks_model_1 = require("../models/trucks.model");
var sms_sender_util_1 = require("../utils/sms_sender.util");
var pickups_model_1 = require("../models/pickups.model");
var notification_1 = require("../utils/notification");
var socket_1 = require("../config/socket");
var registerParcel = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session, _a, sender, receiver, parcel, sender_phone, receiver_phone, parcelData, newParcel, savedParcel, journey, pickupId, io, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _b.sent();
                session.startTransaction();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 6, 8, 9]);
                _a = req.body, sender = _a.sender, receiver = _a.receiver, parcel = _a.parcel;
                sender_phone = sender.phone;
                receiver_phone = receiver.phone;
                parcelData = {
                    sender_name: sender.name,
                    sender_phone: sender_phone,
                    sender_address: sender.address,
                    receiver_name: receiver.name,
                    receiver_phone: receiver_phone,
                    receiver_address: receiver.address,
                    weight: parcel.weight,
                    sentFrom: parcel.sentFrom,
                    instructions: parcel.instructions,
                    fragile: parcel.fragile,
                    destination: parcel.destination,
                    pickup: parcel.pickup,
                    price: parcel.price,
                    code: parcel.code,
                    createdBy: req === null || req === void 0 ? void 0 : req.user.userId,
                    business: req === null || req === void 0 ? void 0 : req.user.business
                };
                newParcel = new parcel_model_1.Parcels(parcelData);
                return [4 /*yield*/, newParcel.save({ session: session })];
            case 3:
                savedParcel = _b.sent();
                journey = new parcelJouney_model_1.ParcelJourneys({
                    parcel_id: savedParcel._id,
                    DroppedAt: new Date(),
                    recievedBy: req === null || req === void 0 ? void 0 : req.user.userId,
                });
                return [4 /*yield*/, journey.save({ session: session })];
            case 4:
                _b.sent();
                pickupId = newParcel.sentFrom._id.toString();
                io = (0, socket_1.getSocketIo)();
                io.to("pickup_".concat(pickupId)).emit("Parcel-change", newParcel);
                return [4 /*yield*/, session.commitTransaction()];
            case 5:
                _b.sent();
                res.status(201).json({
                    ok: true,
                    message: "Parcel registered successfully",
                    parcel: savedParcel
                });
                return [3 /*break*/, 9];
            case 6:
                error_1 = _b.sent();
                return [4 /*yield*/, session.abortTransaction()];
            case 7:
                _b.sent();
                console.log(error_1);
                res.status(500).json({
                    ok: false,
                    message: "Server error",
                    error: error_1.message
                });
                return [3 /*break*/, 9];
            case 8:
                session.endSession();
                return [7 /*endfinally*/];
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.registerParcel = registerParcel;
var GetParcels = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, limit, sentFrom, status_1, search, sentTo, filter, parcels, total, error_2;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c, sentFrom = _a.sentFrom, status_1 = _a.status, search = _a.search, sentTo = _a.sentTo;
                filter = { deletedAt: null };
                /** ✅ STATUS-BASED LOGIC */
                if (status_1 === "Pending Collection") {
                    // ONLY sentFrom matters
                    if (sentTo) {
                        filter.pickup = sentTo;
                    }
                }
                else if (status_1 === "Pending Dispatch") {
                    // ONLY sentFrom matters
                    if (sentFrom) {
                        filter.sentFrom = sentFrom;
                    }
                }
                else {
                    // Normal case: allow either sentFrom OR sentTo
                    if (sentFrom && sentTo) {
                        filter.$or = [
                            { sentFrom: sentFrom },
                            { pickup: sentTo },
                        ];
                    }
                    else if (sentFrom) {
                        filter.sentFrom = sentFrom;
                    }
                    else if (sentTo) {
                        filter.pickup = sentTo;
                    }
                }
                /** ✅ Filter by status */
                if (status_1 && status_1 !== '') {
                    filter.status = status_1;
                }
                /** ✅ Search */
                if (search && search !== '') {
                    filter.code = { $regex: search, $options: 'i' };
                }
                return [4 /*yield*/, parcel_model_1.Parcels.find(filter)
                        .populate("pickup", "pickup_name")
                        .populate("sentFrom", "pickup_name")
                        .skip((Number(page) - 1) * Number(limit))
                        .limit(Number(limit))
                        .sort({ createdAt: -1 })];
            case 1:
                parcels = _d.sent();
                return [4 /*yield*/, parcel_model_1.Parcels.countDocuments(filter)];
            case 2:
                total = _d.sent();
                res.status(200).json({
                    parcels: parcels,
                    page: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _d.sent();
                console.log(error_2);
                res.status(500).json({
                    ok: false,
                    message: "Server error",
                    error: error_2,
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.GetParcels = GetParcels;
var GetClientParcels = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, limit, sentFrom, status_2, search, sentTo, phone, phoneNo, filter, parcels, total, error_3;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 4, , 5]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c, sentFrom = _a.sentFrom, status_2 = _a.status, search = _a.search, sentTo = _a.sentTo, phone = _a.phone;
                return [4 /*yield*/, (0, simplefunctions_util_1.Format_phone_number)(phone)];
            case 1:
                phoneNo = _d.sent();
                filter = { deletedAt: null, sender_phone: phoneNo };
                /** ✅ STATUS-BASED LOGIC */
                if (status_2 === "Pending Collection") {
                    // ONLY sentFrom matters
                    if (sentTo) {
                        filter.pickup = sentTo;
                    }
                }
                else if (status_2 === "Pending Dispatch") {
                    // ONLY sentFrom matters
                    if (sentFrom) {
                        filter.sentFrom = sentFrom;
                    }
                }
                else {
                    // Normal case: allow either sentFrom OR sentTo
                    if (sentFrom && sentTo) {
                        filter.$or = [
                            { sentFrom: sentFrom },
                            { pickup: sentTo },
                        ];
                    }
                    else if (sentFrom) {
                        filter.sentFrom = sentFrom;
                    }
                    else if (sentTo) {
                        filter.pickup = sentTo;
                    }
                }
                /** ✅ Filter by status */
                if (status_2 && status_2 !== '') {
                    filter.status = status_2;
                }
                /** ✅ Search */
                if (search && search !== '') {
                    filter.code = { $regex: search, $options: 'i' };
                }
                return [4 /*yield*/, parcel_model_1.Parcels.find(filter).select('pickup sentFrom receiver_name receiver_phone updatedAt code status')
                        .populate("pickup", "pickup_name")
                        .populate("sentFrom", "pickup_name")
                        .skip((Number(page) - 1) * Number(limit))
                        .limit(Number(limit))
                        .sort({ createdAt: -1 })];
            case 2:
                parcels = _d.sent();
                return [4 /*yield*/, parcel_model_1.Parcels.countDocuments(filter)];
            case 3:
                total = _d.sent();
                res.status(200).json({
                    parcels: parcels,
                    page: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                });
                return [3 /*break*/, 5];
            case 4:
                error_3 = _d.sent();
                console.log(error_3);
                res.status(500).json({
                    ok: false,
                    message: "Server error",
                    error: error_3,
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.GetClientParcels = GetClientParcels;
var GetClientParcel = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, parcel, Journey, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                return [4 /*yield*/, parcel_model_1.Parcels.findOne({ code: id }).select('pickup charges sentFrom receiver_name receiver_phone status updatedAt code')
                        .populate("pickup", "pickup_name")
                        .populate("sentFrom", "pickup_name")];
            case 1:
                parcel = _a.sent();
                return [4 /*yield*/, parcelJouney_model_1.ParcelJourneys.findOne({ parcel_id: parcel._id })
                        .populate("recievedBy", "name")
                        .populate("DispatchedBy", "name")
                        .populate("DispatchedTo", "name")
                        .populate("deliveredTo", "name")
                        .populate("handedOverBy", "name")];
            case 2:
                Journey = _a.sent();
                res.status(200).json({
                    parcel: parcel,
                    Journey: Journey
                });
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                console.log(error_4);
                res.status(500).json({
                    ok: false,
                    message: "Server error",
                    error: error_4,
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.GetClientParcel = GetClientParcel;
var CancelParcel = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, parcelCode, receiverPhone, originalDestination, phoneNo, existing, updates, pickupId, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.body, id = _a.id, parcelCode = _a.parcelCode, receiverPhone = _a.receiverPhone, originalDestination = _a.originalDestination;
                return [4 /*yield*/, (0, simplefunctions_util_1.Format_phone_number)(receiverPhone)];
            case 1:
                phoneNo = _b.sent();
                return [4 /*yield*/, parcel_model_1.Parcels.findOne({ pickup: originalDestination, receiver_phone: phoneNo, code: parcelCode }).populate("sentFrom", "pickup_name")];
            case 2:
                existing = _b.sent();
                if (!existing) {
                    res.status(404).json({ message: "Parcel not found" });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, parcel_model_1.Parcels.findOneAndUpdate({ pickup: originalDestination, receiver_phone: phoneNo, code: parcelCode }, { status: "Cancelled" }, { new: true })];
            case 3:
                updates = _b.sent();
                pickupId = existing.sentFrom._id.toString();
                return [4 /*yield*/, (0, notification_1.sendTopicNotification)({
                        topic: "pickup_".concat(pickupId, "_attendants"),
                        socket_topic_id: "pickup_".concat(pickupId),
                        event_name: "Parcel-change",
                        audience: "".concat(existing.sentFrom.pickup_name),
                        title: 'Parcel Cancellation',
                        body: "Hello ".concat(existing.sentFrom.pickup_name, ", a parcel with code ").concat(parcelCode, "  destined  for  ").concat(existing.pickup.pickup_name, "  has  been Cancelled and should not be  dispatched .")
                    })];
            case 4:
                _b.sent();
                res.status(200).json("updates");
                return [3 /*break*/, 6];
            case 5:
                error_5 = _b.sent();
                console.error(error_5);
                res.status(400).json(error_5);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.CancelParcel = CancelParcel;
var GetParcelJourney = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, journey, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, parcelJouney_model_1.ParcelJourneys.findOne({ parcel_id: id })
                        .populate("parcel_id", "code")
                        .populate("recievedBy", "name email")
                        .populate("DispatchedBy", "name email")
                        .populate("deliveredTo", "name email")
                        .populate("handedOverBy", "name email")
                        .populate("DispatchedTo", "name email")];
            case 1:
                journey = _a.sent();
                if (!journey) {
                    res.status(404).json({ message: "Journey not found for this parcel" });
                    return [2 /*return*/];
                }
                res.json({ ok: true, journey: journey });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.log(error_6);
                res.status(500).json({ message: "Error fetching journey", error: error_6 });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.GetParcelJourney = GetParcelJourney;
var getParcels = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, status_3, startDate, endDate, pickuId, currentTruck, _b, page, _c, limit, user, matchStage, pickup, pickup, skip, _d, parcels, total, err_1;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 2, , 3]);
                _a = req.query, status_3 = _a.status, startDate = _a.startDate, endDate = _a.endDate, pickuId = _a.pickuId, currentTruck = _a.currentTruck, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c;
                user = req.user;
                matchStage = {
                    deletedAt: null
                };
                // 📌 Status filter
                if (status_3) {
                    matchStage.status = status_3;
                }
                // 🚚 Current Truck filter
                if (currentTruck &&
                    currentTruck !== "null" &&
                    mongoose_1.default.Types.ObjectId.isValid(currentTruck)) {
                    matchStage.currentTruck = new mongoose_1.default.Types.ObjectId(currentTruck);
                }
                // 🔐 Role-based filtering
                if (user.role === "admin") {
                    pickup = new mongoose_1.default.Types.ObjectId(pickuId);
                    matchStage.$or = [
                        { sentFrom: pickup },
                        { pickup: pickup }
                    ];
                }
                if (user.role === "superadmin" && pickuId) {
                    pickup = new mongoose_1.default.Types.ObjectId(pickuId);
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
                skip = (parseInt(page) - 1) * parseInt(limit);
                return [4 /*yield*/, Promise.all([
                        parcel_model_1.Parcels.find(matchStage)
                            .populate("currentTruck", "plate")
                            .populate("currentDriver", "name")
                            .sort({ createdAt: -1 })
                            .skip(skip)
                            .limit(parseInt(limit)),
                        parcel_model_1.Parcels.countDocuments(matchStage)
                    ])];
            case 1:
                _d = _e.sent(), parcels = _d[0], total = _d[1];
                res.json({
                    total: total,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    data: parcels
                });
                return [3 /*break*/, 3];
            case 2:
                err_1 = _e.sent();
                console.error(err_1);
                res.status(500).json({ message: "Error fetching parcels" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getParcels = getParcels;
var getTruckParcelCount = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, pickup, result, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                user = req.user;
                pickup = new mongoose_1.default.Types.ObjectId(user.pickup);
                return [4 /*yield*/, parcel_model_1.Parcels.aggregate([
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
                    ])];
            case 1:
                result = _a.sent();
                res.json({ ok: true, data: result });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getTruckParcelCount = getTruckParcelCount;
var getParcelStatusCount = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, pickup, result, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                user = req.user;
                pickup = new mongoose_1.default.Types.ObjectId(user.pickup);
                return [4 /*yield*/, parcel_model_1.Parcels.aggregate([
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
                                _id: 1, // keep original
                                name: "$_id", // 👈 same value as label
                                count: 1,
                            },
                        },
                        {
                            $sort: { count: -1 },
                        },
                    ])];
            case 1:
                result = _a.sent();
                res.json({ ok: true, data: result });
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getParcelStatusCount = getParcelStatusCount;
var dispatchParcels = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session, _a, parcelIds, truckId_1, truck, driverEntries, index, element, Parcel, pickupId, io, error_9;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 12, , 14]);
                _a = req.body, parcelIds = _a.parcelIds, truckId_1 = _a.truckId;
                // Basic validation
                if (!Array.isArray(parcelIds) || parcelIds.length === 0) {
                    res.status(400).json({ message: "parcelIds must be a non-empty array" });
                    return [2 /*return*/];
                }
                if (!truckId_1) {
                    res.status(400).json({ message: "truckId is required" });
                    return [2 /*return*/];
                }
                session.startTransaction();
                return [4 /*yield*/, trucks_model_1.Trucks.findById(truckId_1).session(session)];
            case 3:
                truck = _b.sent();
                // 1. Update parcels status
                return [4 /*yield*/, parcel_model_1.Parcels.updateMany({ _id: { $in: parcelIds } }, { $set: { status: "In Transit", currentTruck: truckId_1, currentDriver: truck.driverId } }, { session: session })];
            case 4:
                // 1. Update parcels status
                _b.sent();
                // 2. Update journey
                return [4 /*yield*/, parcelJouney_model_1.ParcelJourneys.updateMany({ parcel_id: { $in: parcelIds } }, { $set: { DispatchedAt: new Date() }, DispatchedTo: truck.driverId, DispatchedBy: req === null || req === void 0 ? void 0 : req.user.userId }, { session: session })];
            case 5:
                // 2. Update journey
                _b.sent();
                driverEntries = parcelIds.map(function (id) { return ({
                    parcel: id,
                    truck: truckId_1,
                }); });
                return [4 /*yield*/, parcelDriverModel_1.parcelDriverModel.insertMany(driverEntries, { session: session })];
            case 6:
                _b.sent();
                index = 0;
                _b.label = 7;
            case 7:
                if (!(index < parcelIds.length)) return [3 /*break*/, 10];
                element = parcelIds[index];
                return [4 /*yield*/, parcel_model_1.Parcels.findById(element)];
            case 8:
                Parcel = _b.sent();
                pickupId = Parcel.sentFrom._id.toString();
                io = (0, socket_1.getSocketIo)();
                io.to("pickup_".concat(pickupId)).emit("Parcel-change", Parcel);
                _b.label = 9;
            case 9:
                index++;
                return [3 /*break*/, 7];
            case 10: return [4 /*yield*/, session.commitTransaction()];
            case 11:
                _b.sent();
                session.endSession();
                res.json({
                    ok: true,
                    message: "Parcels dispatched successfully",
                    count: parcelIds.length,
                });
                return [3 /*break*/, 14];
            case 12:
                error_9 = _b.sent();
                console.log(error_9);
                return [4 /*yield*/, session.abortTransaction()];
            case 13:
                _b.sent();
                session.endSession();
                res.status(500).json({
                    message: "Error dispatching parcels",
                    error: error_9.message,
                });
                return [3 /*break*/, 14];
            case 14: return [2 /*return*/];
        }
    });
}); };
exports.dispatchParcels = dispatchParcels;
var markParcelArrived = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, parcel, target_dest, dest, pickupId_1, pickupId, pickup, io, sentToReceiver, sentToSender, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 12, , 13]);
                id = req.params.id;
                return [4 /*yield*/, parcel_model_1.Parcels.findOne({ code: id }).populate('pickup', "pickup_name")];
            case 1:
                parcel = _a.sent();
                if (!((parcel === null || parcel === void 0 ? void 0 : parcel.pickup._id.toString()) !== (req === null || req === void 0 ? void 0 : req.user.pickup.toString()))) return [3 /*break*/, 6];
                return [4 /*yield*/, pickups_model_1.PickuUpModel.findById(req === null || req === void 0 ? void 0 : req.user.pickup)];
            case 2:
                target_dest = _a.sent();
                return [4 /*yield*/, pickups_model_1.PickuUpModel.findById(parcel === null || parcel === void 0 ? void 0 : parcel.pickup._id)];
            case 3:
                dest = _a.sent();
                return [4 /*yield*/, parcel_model_1.Parcels.findOneAndUpdate({ code: id }, {
                        status: "Pending Dispatch",
                        currentDriver: null,
                        sentFrom: dest._id,
                        rerouted: true,
                        currentTruck: null
                    })];
            case 4:
                _a.sent();
                pickupId_1 = target_dest._id.toString();
                return [4 /*yield*/, (0, notification_1.sendTopicNotification)({
                        topic: "pickup_".concat(pickupId_1, "_attendants"),
                        socket_topic_id: "pickup_".concat(pickupId_1),
                        event_name: "Wrong Destination Parcel Rerouting",
                        audience: "".concat(target_dest.pickup_name),
                        title: 'Wrong Destination',
                        body: "Hello ".concat(target_dest.pickup_name, ", a parcel with code ").concat(id, " has been wrongly delivered at ").concat(dest.pickup_name, ". We are working to ship it back to you.\nWe are sorry for the inconvenience caused.\nFor more information contact ").concat(dest.phone_number, ".")
                    })];
            case 5:
                _a.sent();
                res.status(404).json({ message: "Wrong Destination Parcel Rerouting " });
                return [2 /*return*/];
            case 6:
                if ((parcel === null || parcel === void 0 ? void 0 : parcel.status) !== "In Transit") {
                    res.status(404).json({ message: "Parcel  Code Error Kindly  trace the  parcel in the Reports  " });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, parcel_model_1.Parcels.findOneAndUpdate({ code: id }, {
                        status: "Pending Collection",
                        currentDriver: null,
                        currentTruck: null
                    })];
            case 7:
                _a.sent();
                pickupId = parcel.sentFrom._id.toString();
                pickup = parcel.pickup._id.toString();
                io = (0, socket_1.getSocketIo)();
                io.to("pickup_".concat(pickupId)).emit("Parcel-change", parcel);
                io.to("pickup_".concat(pickup)).emit("Parcel-change", parcel);
                if (!parcel) {
                    res.status(404).json({ message: "Parcel not found" });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, sms_sender_util_1.sendTextMessage)("Hello ".concat(parcel.receiver_name, ",Your Parcel has arrived at ").concat(parcel.pickup.pickup_name, ".Parcel Code ").concat(parcel.code, ".Please  come with your National ID  for pick-up."), "".concat(parcel.receiver_phone), parcel._id, "parcel Delivery")];
            case 8:
                sentToReceiver = _a.sent();
                if (!!sentToReceiver.success) return [3 /*break*/, 10];
                return [4 /*yield*/, (0, sms_sender_util_1.sendTextMessage)("Hello ".concat(parcel.sender_name, ", we were unable to reach the receiver (").concat(parcel.receiver_name, "). Please inform them that their parcel (Code: ").concat(parcel.code, ") is ready for pickup at ").concat(parcel.pickup.pickup_name, "."), "".concat(parcel.sender_phone), parcel._id, "fallback notification")];
            case 9:
                sentToSender = _a.sent();
                // Optional: log or handle if fallback also fails
                if (!sentToSender.success) {
                    console.error("Both receiver and sender SMS failed");
                }
                _a.label = 10;
            case 10: return [4 /*yield*/, parcelJouney_model_1.ParcelJourneys.findOneAndUpdate({ parcel_id: parcel._id }, { ArrivedAt: new Date(), deliveredTo: req === null || req === void 0 ? void 0 : req.user.userId })];
            case 11:
                _a.sent();
                res.json({ ok: true, message: "Parcel arrived at destination" });
                return [3 /*break*/, 13];
            case 12:
                error_10 = _a.sent();
                console.log(error_10);
                res.status(500).json({ message: "Error updating arrival", error: error_10.message });
                return [3 /*break*/, 13];
            case 13: return [2 /*return*/];
        }
    });
}); };
exports.markParcelArrived = markParcelArrived;
var collectParcel = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, parcel, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                id = req.params.id;
                if (!req.body.reciever_signature || !req.body.reciever_ID) {
                    res.status(400).json({ message: "Signature and ID are required" });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, parcel_model_1.Parcels.findByIdAndUpdate(id, {
                        status: "Collected",
                        receiver_signature: req.body.reciever_signature,
                        receiver_ID: req.body.reciever_ID,
                    }).populate("pickup", 'pickup_name').populate("sentFrom", "pickup_name")];
            case 1:
                parcel = _a.sent();
                if (!parcel) {
                    res.status(404).json({ message: "Parcel not found" });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, parcelJouney_model_1.ParcelJourneys.findOneAndUpdate({ parcel_id: parcel._id }, { CollectedAt: new Date(), handedOverBy: req === null || req === void 0 ? void 0 : req.user.userId })];
            case 2:
                _a.sent();
                return [4 /*yield*/, (0, notification_1.sendTopicNotification)({
                        topic: "pickup_".concat(parcel.sentFrom, "_attendants"),
                        socket_topic_id: "pickup_".concat(parcel.sentFrom),
                        event_name: "Successful Delivery",
                        audience: "".concat(parcel.sentFrom.pickup_name),
                        title: 'Successful Delivery',
                        body: "Hello ".concat(parcel.sentFrom.pickup_name, ", a parcel with code ").concat(id, " has been Collected by at ").concat(parcel.receiver_name, " of ID No ").concat(req.body.reciever_ID)
                    })];
            case 3:
                _a.sent();
                res.json({ ok: true, message: "Parcel collected successfully" });
                return [3 /*break*/, 5];
            case 4:
                error_11 = _a.sent();
                res.status(500).json({ message: "Error collecting parcel", error: error_11.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.collectParcel = collectParcel;
var getFullDashboard = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, pickupId, _b, filterType, startDate, endDate, user, getDateRange, _c, start_1, end_1, totalParcels, delivered, pending, ontransit, collected, cancelled, awaiting_1, hourlyTrends, groupedByPickup, pickups, err_2;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = req.query, pickupId = _a.pickupId, _b = _a.filterType, filterType = _b === void 0 ? "today" : _b, startDate = _a.startDate, endDate = _a.endDate;
                user = req.user;
                getDateRange = function () {
                    var now = new Date();
                    var start;
                    var end = new Date();
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
                    return { start: start, end: end };
                };
                _d.label = 1;
            case 1:
                _d.trys.push([1, 13, , 14]);
                _c = getDateRange(), start_1 = _c.start, end_1 = _c.end;
                return [4 /*yield*/, parcel_model_1.Parcels.countDocuments({
                        sentFrom: pickupId,
                        createdAt: { $gte: start_1, $lte: end_1 },
                    })];
            case 2:
                totalParcels = _d.sent();
                return [4 /*yield*/, parcel_model_1.Parcels.countDocuments({
                        status: "Collected",
                        sentFrom: pickupId,
                        updatedAt: { $gte: start_1, $lte: end_1 },
                    })];
            case 3:
                delivered = _d.sent();
                return [4 /*yield*/, parcel_model_1.Parcels.countDocuments({
                        status: "Pending Dispatch",
                        sentFrom: pickupId,
                        createdAt: { $gte: start_1, $lte: end_1 },
                    })];
            case 4:
                pending = _d.sent();
                return [4 /*yield*/, parcel_model_1.Parcels.countDocuments({
                        status: "In Transit",
                        sentFrom: pickupId,
                        createdAt: { $gte: start_1, $lte: end_1 },
                    })];
            case 5:
                ontransit = _d.sent();
                return [4 /*yield*/, parcel_model_1.Parcels.countDocuments({
                        status: "Collected",
                        sentFrom: pickupId,
                        updatedAt: { $gte: start_1, $lte: end_1 },
                    })];
            case 6:
                collected = _d.sent();
                return [4 /*yield*/, parcel_model_1.Parcels.countDocuments({
                        status: "Cancelled",
                        sentFrom: pickupId,
                        updatedAt: { $gte: start_1, $lte: end_1 },
                    })];
            case 7:
                cancelled = _d.sent();
                return [4 /*yield*/, parcel_model_1.Parcels.countDocuments({
                        status: "Pending Collection",
                        pickup: pickupId,
                        updatedAt: { $gte: start_1, $lte: end_1 },
                    })];
            case 8:
                awaiting_1 = _d.sent();
                return [4 /*yield*/, parcel_model_1.Parcels.aggregate([
                        {
                            $match: {
                                sentFrom: pickupId,
                                createdAt: { $gte: start_1, $lte: end_1 },
                            },
                        },
                        {
                            $group: {
                                _id: { $hour: "$createdAt" },
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { _id: 1 } },
                    ])];
            case 9:
                hourlyTrends = _d.sent();
                console.log(user);
                groupedByPickup = [];
                if (!((user === null || user === void 0 ? void 0 : user.role) === "superadmin")) return [3 /*break*/, 12];
                return [4 /*yield*/, pickups_model_1.PickuUpModel.find({ business: user.business, state: "active" })];
            case 10:
                pickups = _d.sent();
                return [4 /*yield*/, Promise.all(pickups.map(function (pickup) { return __awaiter(void 0, void 0, void 0, function () {
                        var totalParcels, delivered, pending, ontransit, collected, cancelled;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, parcel_model_1.Parcels.countDocuments({
                                        sentFrom: pickup._id,
                                        createdAt: { $gte: start_1, $lte: end_1 },
                                    })];
                                case 1:
                                    totalParcels = _a.sent();
                                    return [4 /*yield*/, parcel_model_1.Parcels.countDocuments({
                                            status: "Collected",
                                            sentFrom: pickup._id,
                                            updatedAt: { $gte: start_1, $lte: end_1 },
                                        })];
                                case 2:
                                    delivered = _a.sent();
                                    return [4 /*yield*/, parcel_model_1.Parcels.countDocuments({
                                            status: "Pending Dispatch",
                                            sentFrom: pickup._id,
                                            createdAt: { $gte: start_1, $lte: end_1 },
                                        })];
                                case 3:
                                    pending = _a.sent();
                                    return [4 /*yield*/, parcel_model_1.Parcels.countDocuments({
                                            status: "In Transit",
                                            sentFrom: pickup._id,
                                            createdAt: { $gte: start_1, $lte: end_1 },
                                        })];
                                case 4:
                                    ontransit = _a.sent();
                                    return [4 /*yield*/, parcel_model_1.Parcels.countDocuments({
                                            status: "Collected",
                                            sentFrom: pickup._id,
                                            updatedAt: { $gte: start_1, $lte: end_1 },
                                        })];
                                case 5:
                                    collected = _a.sent();
                                    return [4 /*yield*/, parcel_model_1.Parcels.countDocuments({
                                            status: "Returned",
                                            sentFrom: pickup._id,
                                            updatedAt: { $gte: start_1, $lte: end_1 },
                                        })];
                                case 6:
                                    cancelled = _a.sent();
                                    return [2 /*return*/, {
                                            pickupId: pickup._id,
                                            pickupName: pickup.pickup_name,
                                            totalParcels: totalParcels,
                                            delivered: delivered,
                                            ontransit: ontransit,
                                            awaiting: awaiting_1,
                                            pending: pending,
                                            collected: collected,
                                            cancelled: cancelled,
                                        }];
                            }
                        });
                    }); }))];
            case 11:
                // Step 2: compute KPIs for each pickup
                groupedByPickup = _d.sent();
                _d.label = 12;
            case 12:
                res.json({
                    filterType: filterType,
                    start: start_1,
                    end: end_1,
                    pickupStats: {
                        totalParcels: totalParcels,
                        delivered: delivered,
                        pending: pending,
                        collected: collected,
                        ontransit: ontransit,
                        cancelled: cancelled,
                        hourlyTrends: hourlyTrends,
                    },
                    groupedByPickup: groupedByPickup,
                });
                return [3 /*break*/, 14];
            case 13:
                err_2 = _d.sent();
                console.error(err_2);
                res.status(500).json({ error: "Failed to fetch dashboard KPIs" });
                return [3 /*break*/, 14];
            case 14: return [2 /*return*/];
        }
    });
}); };
exports.getFullDashboard = getFullDashboard;
