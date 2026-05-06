"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.getBusinessPickups = exports.Trash = exports.Update = exports.Get_one = exports.GetPickupsForClient = exports.GetPickups = exports.Get = exports.CreatePickup = exports.Create = void 0;
var custom_error_util_1 = require("../utils/custom_error.util");
var business_validations_1 = require("../validations/business.validations");
var business_model_1 = require("../models/business.model");
var simplefunctions_util_1 = require("../utils/simplefunctions.util");
var user_model_1 = require("../models/user.model");
var bcryptjs_1 = require("bcryptjs");
var socket_1 = require("../config/socket");
var mongoose_1 = require("mongoose");
var pickups_model_1 = require("../models/pickups.model");
var parcel_model_1 = require("../models/parcel.model");
var notification_1 = require("../utils/notification");
var Create = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session, phone, Exists, newbusiness, business, salt, adminPassword, adminData, user, pickupData, pickup, savedPickup, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _a.sent();
                session.startTransaction();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 13, 15, 16]);
                // Validation
                return [4 /*yield*/, (0, custom_error_util_1.CustomError)(business_validations_1.validateBusinessInput, req.body, res)];
            case 3:
                // Validation
                _a.sent();
                return [4 /*yield*/, (0, simplefunctions_util_1.Format_phone_number)(req.body.contact_number)];
            case 4:
                phone = _a.sent();
                req.body.contact_number = phone;
                return [4 /*yield*/, business_model_1.BusinessModel.findOne({ business_name: req.body.business_name }).session(session)];
            case 5:
                Exists = _a.sent();
                if (Exists) {
                    throw new Error("BUSINESS_EXISTS");
                }
                req.body.createdBy = req.user.userId;
                newbusiness = new business_model_1.BusinessModel(req.body);
                return [4 /*yield*/, newbusiness.save({ session: session })];
            case 6:
                business = _a.sent();
                return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 7:
                salt = _a.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(req.body.contact_number, salt)];
            case 8:
                adminPassword = _a.sent();
                adminData = __assign(__assign({}, req.body), { password: adminPassword, phone_number: req.body.contact_number, role: "superadmin", name: "".concat(req.body.business_name, "'s Admin"), business: business._id, activated: true });
                user = new user_model_1.User(adminData);
                return [4 /*yield*/, user.save({ session: session })];
            case 9:
                _a.sent();
                pickupData = {
                    pickup_name: "".concat(req.body.business_name, " HQ"),
                    phone_number: req.body.contact_number,
                    contact_number: req.body.contact_number,
                    business: business._id,
                    createdBy: user._id,
                    state: "active",
                    isHQ: true,
                };
                pickup = new pickups_model_1.PickuUpModel(pickupData);
                return [4 /*yield*/, pickup.save({ session: session })];
            case 10:
                savedPickup = _a.sent();
                // 4. Create Socket Room for Pickup
                return [4 /*yield*/, (0, notification_1.sendTopicNotification)({
                        topic: "superuser",
                        socket_topic_id: "superuser",
                        event_name: "New  Business",
                        audience: "superusers",
                        title: 'New  Business',
                        body: "Hello , ".concat(req.user.name, " Has Registered a new  Business ").concat(req.body.business_name, "  ")
                    })];
            case 11:
                // 4. Create Socket Room for Pickup
                _a.sent();
                // If we reach here, everything is successful
                return [4 /*yield*/, session.commitTransaction()];
            case 12:
                // If we reach here, everything is successful
                _a.sent();
                res.status(201).json({ ok: true, message: "Business and Admin added successfully", newbusiness: business });
                return [2 /*return*/];
            case 13:
                error_1 = _a.sent();
                // ROLLBACK the database changes
                return [4 /*yield*/, session.abortTransaction()];
            case 14:
                // ROLLBACK the database changes
                _a.sent();
                // CLEANUP: Delete the uploaded file since the DB record failed
                if (error_1.message === "BUSINESS_EXISTS") {
                    res.status(400).json("Business already exists");
                }
                else {
                    res.status(500).json({ ok: false, message: "Server error", error: error_1.message });
                }
                return [3 /*break*/, 16];
            case 15:
                // End the session
                session.endSession();
                return [7 /*endfinally*/];
            case 16: return [2 /*return*/];
        }
    });
}); };
exports.Create = Create;
var CreatePickup = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session, phone, contactPhone, PhoneExists, Exists, newPickup, pickup, salt, adminPassword, adminData, user, socketIo, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _a.sent();
                session.startTransaction();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 14, 16, 17]);
                return [4 /*yield*/, (0, custom_error_util_1.CustomError)(business_validations_1.validatePickupInput, req.body, res)];
            case 3:
                _a.sent();
                return [4 /*yield*/, (0, simplefunctions_util_1.Format_phone_number)(req.body.phone_number)];
            case 4:
                phone = _a.sent();
                return [4 /*yield*/, (0, simplefunctions_util_1.Format_phone_number)(req.body.contact_number)];
            case 5:
                contactPhone = _a.sent();
                req.body.phone_number = phone;
                req.body.contact_number = contactPhone;
                req.body.business = req.user.business;
                return [4 /*yield*/, user_model_1.User.findOne({ phone_number: contactPhone, business: req.user.business }).session(session)];
            case 6:
                PhoneExists = _a.sent();
                if (PhoneExists) {
                    throw new Error("Phone number already exists");
                }
                return [4 /*yield*/, pickups_model_1.PickuUpModel.findOne({ pickup_name: req.body.pickup_name, business: req.user.business }).session(session)];
            case 7:
                Exists = _a.sent();
                if (Exists) {
                    throw new Error("Pickup already exists");
                }
                req.body.createdBy = req.user.userId;
                newPickup = new pickups_model_1.PickuUpModel(req.body);
                return [4 /*yield*/, newPickup.save({ session: session })];
            case 8:
                pickup = _a.sent();
                return [4 /*yield*/, business_model_1.BusinessModel.findByIdAndUpdate(req.user.business, { $push: { pickUps: pickup._id } }, { session: session })];
            case 9:
                _a.sent();
                return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 10:
                salt = _a.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(contactPhone, salt)];
            case 11:
                adminPassword = _a.sent();
                adminData = __assign(__assign({}, req.body), { password: adminPassword, phone_number: req.body.contact_number, role: "admin", name: "".concat(req.body.pickup_name, "'s Admin"), business: req.user.business, pickup: pickup._id, activated: true });
                user = new user_model_1.User(adminData);
                return [4 /*yield*/, user.save({ session: session })];
            case 12:
                _a.sent();
                socketIo = (0, socket_1.getSocketIo)();
                if (socketIo) {
                    socketIo.emit("pickup_created", {
                        pickup: pickup
                    });
                }
                // If we reach here, everything is successful
                return [4 /*yield*/, session.commitTransaction()];
            case 13:
                // If we reach here, everything is successful
                _a.sent();
                res.status(201).json({ ok: true, message: "Pickup and Admin added successfully", newpickup: pickup });
                return [3 /*break*/, 17];
            case 14:
                error_2 = _a.sent();
                // ROLLBACK the database changes
                return [4 /*yield*/, session.abortTransaction()];
            case 15:
                // ROLLBACK the database changes
                _a.sent();
                console.log("Transaction Error:", error_2);
                if (error_2.message === "PICKUP_EXISTS") {
                    res.status(400).json("Pickup already exists");
                }
                else {
                    res.status(500).json({ ok: false, message: "Server error", error: error_2.message });
                }
                return [3 /*break*/, 17];
            case 16:
                // End the session
                session.endSession();
                return [7 /*endfinally*/];
            case 17: return [2 /*return*/];
        }
    });
}); };
exports.CreatePickup = CreatePickup;
var Get = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var options, _a, _b, page, _c, limit, businesses, total, active, inactive, error_3;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 5, , 6]);
                options = { deletedAt: null, };
                if (req.user.role === "superadmin") {
                    options = { deletedAt: null, createdBy: req.user.userId };
                }
                if (req.user.role === "supersales") {
                    options = { deletedAt: null, createdBy: req.user.userId };
                }
                console.log(options);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c;
                return [4 /*yield*/, business_model_1.BusinessModel.find(options).skip((page - 1) * limit)
                        .limit(parseInt(limit))
                        .sort({ createdAt: -1 })];
            case 1:
                businesses = _d.sent();
                return [4 /*yield*/, business_model_1.BusinessModel.countDocuments()];
            case 2:
                total = _d.sent();
                return [4 /*yield*/, business_model_1.BusinessModel.countDocuments({ state: "active" })];
            case 3:
                active = _d.sent();
                return [4 /*yield*/, business_model_1.BusinessModel.countDocuments({ state: "inactive" })];
            case 4:
                inactive = _d.sent();
                res.status(201).json({
                    businesses: businesses,
                    page: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    active: active,
                    inactive: inactive
                });
                return [2 /*return*/];
            case 5:
                error_3 = _d.sent();
                console.log(error_3);
                res.status(500).json({ ok: false, message: "Server error", error: error_3 });
                return [2 /*return*/];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.Get = Get;
var GetPickups = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, limit, pickups, total, error_4;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c;
                return [4 /*yield*/, pickups_model_1.PickuUpModel.find({ deletedAt: null, business: req.user.business }).skip((page - 1) * limit)
                        .limit(parseInt(limit))
                        .sort({ createdAt: -1 })];
            case 1:
                pickups = _d.sent();
                return [4 /*yield*/, pickups_model_1.PickuUpModel.countDocuments()];
            case 2:
                total = _d.sent();
                res.status(201).json({
                    pickups: pickups,
                    page: parseInt(page),
                    totalPages: Math.ceil(total / limit)
                });
                return [2 /*return*/];
            case 3:
                error_4 = _d.sent();
                console.log(error_4);
                res.status(500).json({ ok: false, message: "Server error", error: error_4 });
                return [2 /*return*/];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.GetPickups = GetPickups;
var GetPickupsForClient = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, limit, pickup, pickupObj, pickups, total, error_5;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 4, , 5]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c, pickup = _a.pickup;
                return [4 /*yield*/, pickups_model_1.PickuUpModel.findById(pickup).select('business')];
            case 1:
                pickupObj = _d.sent();
                return [4 /*yield*/, pickups_model_1.PickuUpModel.find({ deletedAt: null, business: pickupObj.business }).skip((page - 1) * limit)
                        .limit(parseInt(limit))
                        .sort({ createdAt: -1 })];
            case 2:
                pickups = _d.sent();
                return [4 /*yield*/, pickups_model_1.PickuUpModel.countDocuments()];
            case 3:
                total = _d.sent();
                res.status(201).json({
                    pickups: pickups,
                    page: parseInt(page),
                    totalPages: Math.ceil(total / limit)
                });
                return [2 /*return*/];
            case 4:
                error_5 = _d.sent();
                console.log(error_5);
                res.status(500).json({ ok: false, message: "Server error", error: error_5 });
                return [2 /*return*/];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.GetPickupsForClient = GetPickupsForClient;
var Get_one = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var business_obj, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, business_model_1.BusinessModel.findById(req.user.business)];
            case 1:
                business_obj = _a.sent();
                res.status(201).json(business_obj);
                return [2 /*return*/];
            case 2:
                error_6 = _a.sent();
                console.log(error_6);
                res.status(500).json({ message: "Server error", error: error_6 });
                return [2 /*return*/];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.Get_one = Get_one;
var Update = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, existing, updates, io, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                return [4 /*yield*/, business_model_1.BusinessModel.findById(id)];
            case 1:
                existing = _a.sent();
                if (!existing) {
                    return [2 /*return*/, res.status(404).json({ message: "Business not found" })];
                }
                return [4 /*yield*/, business_model_1.BusinessModel.findOneAndUpdate({ _id: id }, req.body, { new: true })];
            case 2:
                updates = _a.sent();
                io = (0, socket_1.getSocketIo)();
                io === null || io === void 0 ? void 0 : io.emit("business:update", updates);
                res.status(200).json(updates);
                return [3 /*break*/, 4];
            case 3:
                error_7 = _a.sent();
                console.error(error_7);
                res.status(400).json(error_7);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.Update = Update;
var Trash = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var deleted, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, business_model_1.BusinessModel.findOneAndUpdate({ _id: req.params.id }, { deletedAt: Date.now() }, { new: true, useFindAndModify: false })];
            case 1:
                deleted = _a.sent();
                res.status(200).json("".concat(deleted.business_name, " deleted successfully"));
                return [2 /*return*/];
            case 2:
                error_8 = _a.sent();
                res.status(404).json(error_8);
                return [2 /*return*/];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.Trash = Trash;
var getBusinessPickups = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var businessId, start, end, pickupFilter, pickups, pickupIds, parcelCounts, countMap_1, results, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                businessId = req.params.id;
                start = new Date();
                start.setHours(0, 0, 0, 0);
                end = new Date();
                end.setHours(23, 59, 59, 999);
                pickupFilter = { state: "active" };
                if (mongoose_1.default.Types.ObjectId.isValid(businessId)) {
                    pickupFilter.business = businessId;
                }
                return [4 /*yield*/, pickups_model_1.PickuUpModel.find(pickupFilter)
                        .select("_id pickup_name")
                        .populate("business", "business_name")];
            case 1:
                pickups = _a.sent();
                pickupIds = pickups.map(function (p) { return p._id; });
                return [4 /*yield*/, parcel_model_1.Parcels.aggregate([
                        {
                            $match: {
                                sentFrom: { $in: pickupIds },
                                createdAt: { $gte: start, $lte: end },
                            },
                        },
                        {
                            $group: {
                                _id: "$sentFrom",
                                count: { $sum: 1 },
                            },
                        },
                    ])];
            case 2:
                parcelCounts = _a.sent();
                countMap_1 = new Map(parcelCounts.map(function (p) { return [p._id.toString(), p.count]; }));
                results = pickups.map(function (pickup) {
                    var _a;
                    return ({
                        pickupId: pickup._id,
                        pickupName: pickup.pickup_name,
                        business: ((_a = pickup.business) === null || _a === void 0 ? void 0 : _a.business_name) || null,
                        parcelsToday: countMap_1.get(pickup._id.toString()) || 0,
                    });
                });
                res.json({
                    businessId: businessId,
                    date: start,
                    pickups: results,
                });
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.error(err_1);
                res.status(500).json({
                    error: "Failed to fetch business pickups",
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getBusinessPickups = getBusinessPickups;
