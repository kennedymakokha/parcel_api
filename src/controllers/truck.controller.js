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
exports.Trash = exports.Update = exports.Get_one = exports.Get = exports.Create = void 0;
var socket_1 = require("../config/socket");
var trucks_model_1 = require("../models/trucks.model");
var mongoose_1 = require("mongoose");
var bcryptjs_1 = require("bcryptjs");
var user_model_1 = require("../models/user.model");
var truckDriverModel_1 = require("../models/truckDriverModel");
var Create = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session, createdDriver, _a, plate, driverId, driver, model, capacity, existingTruck, finalDriverId, existingUser, salt, password, newDriver, driverAssigned, truck, newTruck, truckDriver, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _b.sent();
                session.startTransaction();
                createdDriver = null;
                _b.label = 2;
            case 2:
                _b.trys.push([2, 19, 21, 22]);
                _a = req.body, plate = _a.plate, driverId = _a.driverId, driver = _a.driver, model = _a.model, capacity = _a.capacity;
                return [4 /*yield*/, trucks_model_1.Trucks.findOne({ plate: plate }).session(session)];
            case 3:
                existingTruck = _b.sent();
                if (!existingTruck) return [3 /*break*/, 5];
                return [4 /*yield*/, session.abortTransaction()];
            case 4:
                _b.sent();
                res.status(400).json({ message: 'Truck already exists' });
                return [2 /*return*/];
            case 5:
                finalDriverId = driverId;
                if (!(!driverId && driver)) return [3 /*break*/, 12];
                return [4 /*yield*/, user_model_1.User.findOne({
                        $or: [
                            { phone_number: driver.phone_number },
                            { identification_No: driver.identification_No },
                        ],
                    }).session(session)];
            case 6:
                existingUser = _b.sent();
                if (!existingUser) return [3 /*break*/, 8];
                return [4 /*yield*/, session.abortTransaction()];
            case 7:
                _b.sent();
                res.status(400).json({
                    message: 'Driver already exists (phone or ID number in use)',
                });
                return [2 /*return*/];
            case 8: return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 9:
                salt = _b.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(driver.phone_number, salt)];
            case 10:
                password = _b.sent();
                newDriver = new user_model_1.User({
                    name: driver.name,
                    phone_number: driver.phone_number,
                    identification_No: driver.identification_No,
                    role: 'driver',
                    password: password,
                    createdBy: req.user.userId,
                    business: req.user.business,
                    // pickup: req.user.pickup,
                });
                return [4 /*yield*/, newDriver.save({ session: session })];
            case 11:
                createdDriver = _b.sent();
                finalDriverId = createdDriver._id;
                _b.label = 12;
            case 12:
                if (!finalDriverId) return [3 /*break*/, 15];
                return [4 /*yield*/, trucks_model_1.Trucks.findOne({
                        driverId: finalDriverId,
                    }).session(session)];
            case 13:
                driverAssigned = _b.sent();
                if (!driverAssigned) return [3 /*break*/, 15];
                return [4 /*yield*/, session.abortTransaction()];
            case 14:
                _b.sent();
                res.status(400).json({
                    message: 'Driver is already assigned to another truck',
                });
                return [2 /*return*/];
            case 15:
                truck = new trucks_model_1.Trucks({
                    plate: plate.trim().toUpperCase(),
                    model: model === null || model === void 0 ? void 0 : model.trim(),
                    capacity: capacity === null || capacity === void 0 ? void 0 : capacity.trim(),
                    driverId: finalDriverId,
                    createdBy: req.user.userId,
                    business: req.user.business,
                });
                return [4 /*yield*/, truck.save({ session: session })];
            case 16:
                newTruck = _b.sent();
                truckDriver = new truckDriverModel_1.truckDriverModel({
                    driverId: finalDriverId,
                    truckId: newTruck._id,
                });
                return [4 /*yield*/, truckDriver.save({ session: session })];
            case 17:
                _b.sent();
                // ✅ commit everything
                return [4 /*yield*/, session.commitTransaction()];
            case 18:
                // ✅ commit everything
                _b.sent();
                res.status(201).json({
                    ok: true,
                    message: 'Truck registered successfully',
                    truck: newTruck,
                });
                return [2 /*return*/];
            case 19:
                error_1 = _b.sent();
                return [4 /*yield*/, session.abortTransaction()];
            case 20:
                _b.sent();
                console.log(error_1);
                res.status(500).json({
                    message: 'Server error',
                    error: error_1,
                });
                return [2 /*return*/];
            case 21:
                session.endSession();
                return [7 /*endfinally*/];
            case 22: return [2 /*return*/];
        }
    });
}); };
exports.Create = Create;
var Get = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, limit, trucks, total, error_2;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c;
                return [4 /*yield*/, trucks_model_1.Trucks.find({ business: req.user.business, deletedAt: null }).skip((page - 1) * limit)
                        .limit(parseInt(limit))
                        .sort({ createdAt: -1 })];
            case 1:
                trucks = _d.sent();
                return [4 /*yield*/, trucks_model_1.Trucks.countDocuments()];
            case 2:
                total = _d.sent();
                res.status(201).json({
                    trucks: trucks,
                    page: parseInt(page),
                    totalPages: Math.ceil(total / limit)
                });
                return [2 /*return*/];
            case 3:
                error_2 = _d.sent();
                console.log(error_2);
                res.status(500).json({ ok: false, message: "Server error", error: error_2 });
                return [2 /*return*/];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.Get = Get;
var Get_one = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var truck_obj, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, trucks_model_1.Trucks.findById(req.params.id).populate("business")];
            case 1:
                truck_obj = _a.sent();
                res.status(201).json(truck_obj);
                return [2 /*return*/];
            case 2:
                error_3 = _a.sent();
                console.log(error_3);
                res.status(500).json({ message: "Server error", error: error_3 });
                return [2 /*return*/];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.Get_one = Get_one;
var Update = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, existing, updates, io, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                return [4 /*yield*/, trucks_model_1.Trucks.findOne({
                        driverId: req.body.driverId,
                        _id: { $ne: req.params.id } // exclude current truck
                    })];
            case 1:
                existing = _a.sent();
                if (!existing) {
                    return [2 /*return*/, res.status(404).json({ message: "Truck not found" })];
                }
                return [4 /*yield*/, trucks_model_1.Trucks.findOneAndUpdate({ _id: id }, req.body, { new: true })];
            case 2:
                updates = _a.sent();
                io = (0, socket_1.getSocketIo)();
                io === null || io === void 0 ? void 0 : io.emit("trucks:update", updates);
                res.status(200).json(updates);
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                console.error(error_4);
                res.status(400).json(error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.Update = Update;
var Trash = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var deleted, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, trucks_model_1.Trucks.findOneAndUpdate({ _id: req.params.id }, { deletedAt: Date.now() }, { new: true, useFindAndModify: false })];
            case 1:
                deleted = _a.sent();
                res.status(200).json("".concat(deleted.plate, " deleted successfully"));
                return [2 /*return*/];
            case 2:
                error_5 = _a.sent();
                res.status(404).json(error_5);
                return [2 /*return*/];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.Trash = Trash;
