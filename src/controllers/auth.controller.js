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
exports.logout = exports.refresh = exports.UpdatedSince = exports.session_Check = exports.login = exports.verifyuser = exports.activateuser = exports.requestToken = exports.getUser = exports.Update = exports.getUsers = exports.updatePassword = exports.register = void 0;
var user_model_1 = require("../models/user.model");
var simplefunctions_util_1 = require("../utils/simplefunctions.util");
var jsonwebtoken_1 = require("jsonwebtoken");
var cookie_1 = require("cookie");
var bcryptjs_1 = require("bcryptjs");
var generatetoken_util_1 = require("../utils/generatetoken.util");
var cookie_2 = require("cookie");
var jwt_decode_1 = require("jwt-decode");
var generate_activation_util_1 = require("../utils/generate_activation.util");
var sms_sender_util_1 = require("../utils/sms_sender.util");
var mongoose_1 = require("mongoose");
// User Registration
var register = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_1, email, password, phone_number, phone, userExists, salt, _b, activationcode, user, newUser, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 6, , 7]);
                _a = req.body, name_1 = _a.name, email = _a.email, password = _a.password, phone_number = _a.phone_number;
                if (!name_1 || !phone_number) {
                    res.status(400).json("All fields are required");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, simplefunctions_util_1.Format_phone_number)(phone_number)];
            case 1:
                phone = _c.sent();
                return [4 /*yield*/, user_model_1.User.findOne({
                        $or: [
                            { identification_No: req.body.identification_No },
                            { phone_number: phone },
                        ],
                    })];
            case 2:
                userExists = _c.sent();
                if (userExists) {
                    res.status(400).json("User already exists");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 3:
                salt = _c.sent();
                _b = req.body;
                return [4 /*yield*/, bcryptjs_1.default.hash(req.body.phone_number, salt)];
            case 4:
                _b.password = _c.sent();
                activationcode = (0, generate_activation_util_1.MakeActivationCode)(4);
                req.body.phone_number = phone;
                req.body.activationCode = activationcode;
                req.body.createdBy = req.user ? req.user.userId : null;
                req.body.business = req.user ? req.user.business : null;
                req.body.pickup = req.user ? req.user.pickup : null;
                user = new user_model_1.User(req.body);
                return [4 /*yield*/, user.save()];
            case 5:
                newUser = _c.sent();
                res.status(201).json({ ok: true, message: "User registered successfully", newUser: newUser });
                return [2 /*return*/];
            case 6:
                error_1 = _c.sent();
                console.log(error_1);
                res.status(500).json({ message: "Server error", error: error_1 });
                return [2 /*return*/];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.register = register;
var updatePassword = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, password, phone_number, code, phone, user, salt, _b, error_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 6, , 7]);
                _a = req.body, password = _a.password, phone_number = _a.phone_number, code = _a.code;
                return [4 /*yield*/, (0, simplefunctions_util_1.Format_phone_number)(phone_number)];
            case 1:
                phone = _c.sent();
                return [4 /*yield*/, user_model_1.User.findOne({ phone_number: phone, activationCode: code })];
            case 2:
                user = _c.sent();
                if (!user) {
                    res.status(400).json("The  code Youe entered  is  wrong  ");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 3:
                salt = _c.sent();
                _b = user;
                return [4 /*yield*/, bcryptjs_1.default.hash(req.body.password, salt)];
            case 4:
                _b.password = _c.sent();
                return [4 /*yield*/, user.save()];
            case 5:
                _c.sent();
                res.status(200).json({ success: true, message: "Password updated successfully" });
                return [2 /*return*/];
            case 6:
                error_2 = _c.sent();
                console.log(error_2);
                res.status(500).json({ message: "Server error", error: error_2 });
                return [2 /*return*/];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.updatePassword = updatePassword;
var getUsers = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, limit, _d, search, pickup, role, filter, users, total, error_3;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 3, , 4]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c, _d = _a.search, search = _d === void 0 ? '' : _d, pickup = _a.pickup, role = _a.role;
                console.log(req.query);
                console.log(req.user.role);
                filter = {};
                // ✅ CLEAN pickup (handle "undefined", "", null)
                if (pickup &&
                    pickup !== 'undefined' &&
                    pickup !== 'null' &&
                    mongoose_1.default.Types.ObjectId.isValid(pickup)) {
                    filter.pickup = pickup;
                }
                // ✅ ROLE-BASED FILTER
                else if (req.user.role === "superadmin") {
                    filter.business = req.user.business;
                }
                else if (req.user.role === "superuser") {
                    // no restriction
                }
                // ❌ EXCLUDE LOGGED-IN USER
                filter._id = { $ne: req.user._id };
                // ✅ CLEAN role
                if (role && role !== 'undefined' && role !== 'null') {
                    filter.role = role;
                }
                // ✅ SEARCH
                if (search && search.trim() !== '') {
                    filter.$or = [
                        { name: { $regex: search, $options: 'i' } },
                        { phone: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                    ];
                }
                return [4 /*yield*/, user_model_1.User.find(filter)
                        .populate('pickup', 'pickup_name')
                        .populate('business', 'name')
                        .skip((Number(page) - 1) * Number(limit))
                        .limit(Number(limit))
                        .sort({ createdAt: -1 })];
            case 1:
                users = _e.sent();
                return [4 /*yield*/, user_model_1.User.countDocuments(filter)];
            case 2:
                total = _e.sent();
                res.status(200).json({
                    users: users,
                    page: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                    total: total,
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _e.sent();
                console.log('GET USERS ERROR:', error_3);
                res.status(500).json({ message: 'Server error', error: error_3 });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getUsers = getUsers;
var Update = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var updates, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, user_model_1.User.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, useFindAndModify: false })];
            case 1:
                updates = _a.sent();
                res.status(200).json(updates._id);
                return [2 /*return*/];
            case 2:
                error_4 = _a.sent();
                console.log(error_4);
                res.status(400).json(error_4);
                return [2 /*return*/];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.Update = Update;
var getUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, error_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                user = void 0;
                if (!((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId)) return [3 /*break*/, 2];
                return [4 /*yield*/, user_model_1.User.findById(req.user.userId)];
            case 1:
                user = _b.sent();
                console.log(user);
                res.status(200).json(user);
                _b.label = 2;
            case 2: return [2 /*return*/];
            case 3:
                error_5 = _b.sent();
                console.log(error_5);
                res.status(500).json({ message: "Server error", error: error_5 });
                return [2 /*return*/];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getUser = getUser;
var requestToken = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var phone_number, phone, user, activationcode, v, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                phone_number = req.body.phone_number;
                return [4 /*yield*/, (0, simplefunctions_util_1.Format_phone_number)(phone_number)];
            case 1:
                phone = _a.sent();
                return [4 /*yield*/, user_model_1.User.findOne({ phone_number: phone })];
            case 2:
                user = _a.sent();
                if (!user) {
                    console.log("User Not Found");
                    res.status(400).json({ message: "user not found" });
                    return [2 /*return*/];
                }
                activationcode = (0, generate_activation_util_1.MakeActivationCode)(4);
                user.activationCode = activationcode;
                return [4 /*yield*/, user.save()];
            case 3:
                _a.sent();
                return [4 /*yield*/, (0, sms_sender_util_1.sendTextMessage)("Hi ".concat(user.name, "\nYour your Parcel Mtaani Code is ").concat(activationcode), "".concat(phone), user._id, "account-activation")];
            case 4:
                v = _a.sent();
                if (v.success === false) {
                    res.status(400).json({ message: "Message Could  not be sent to ".concat(req.body.phone_number, "\nReason:").concat(v.data.status_desc) });
                    return [2 /*return*/];
                }
                console.log(v);
                res.status(200).json("Token sent to ***********".concat(phone.slice(-3)));
                return [2 /*return*/];
            case 5:
                error_6 = _a.sent();
                console.log(error_6);
                res.status(500).json({ message: "Server error", error: error_6 });
                return [2 /*return*/];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.requestToken = requestToken;
var activateuser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, phone_number, code, phone, user, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                _a = req.body, phone_number = _a.phone_number, code = _a.code;
                return [4 /*yield*/, (0, simplefunctions_util_1.Format_phone_number)(phone_number)];
            case 1:
                phone = _b.sent();
                return [4 /*yield*/, user_model_1.User.findOne({ phone_number: phone })];
            case 2:
                user = _b.sent();
                if (!user) {
                    res.status(400).json("user not found");
                    return [2 /*return*/];
                }
                if (!(user.activationCode === code)) return [3 /*break*/, 4];
                user.activationCode = "";
                user.activated = true;
                return [4 /*yield*/, user.save()];
            case 3:
                _b.sent();
                res.status(200).json({ ok: true, message: "user activated " });
                return [2 /*return*/];
            case 4:
                res.status(400).json("wrong Activation code ");
                return [2 /*return*/];
            case 5: return [3 /*break*/, 7];
            case 6:
                error_7 = _b.sent();
                console.log(error_7);
                res.status(500).json({ message: "Server error", error: error_7 });
                return [2 /*return*/];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.activateuser = activateuser;
var verifyuser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, phone_number, code, phone, user, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, phone_number = _a.phone_number, code = _a.code;
                return [4 /*yield*/, (0, simplefunctions_util_1.Format_phone_number)(phone_number)];
            case 1:
                phone = _b.sent();
                return [4 /*yield*/, user_model_1.User.findOne({ phone_number: phone })];
            case 2:
                user = _b.sent();
                if (!user) {
                    res.status(400).json("user not found");
                    return [2 /*return*/];
                }
                if (user.activationCode === code) {
                    res.status(200).json("code-is correct");
                    return [2 /*return*/];
                }
                else {
                    res.status(400).json("wrong Activation code ");
                    return [2 /*return*/];
                }
                return [3 /*break*/, 4];
            case 3:
                error_8 = _b.sent();
                console.log(error_8);
                res.status(500).json("Server error try again");
                return [2 /*return*/];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.verifyuser = verifyuser;
// User Login
var login = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, phone_number, password, phone, userExists, isMatch, accessToken, decoded, error_9;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                if (req.method !== "POST") {
                    res.status(405).json("Method Not Allowed");
                }
                console.log(req.body);
                _a = req.body, phone_number = _a.phone_number, password = _a.password;
                phone = phone_number;
                return [4 /*yield*/, user_model_1.User.findOne({
                        $or: [
                            { phone_number: phone_number },
                            { phone_number: phone }
                        ]
                    }).select("phone_number name role activated password business pickup").populate("pickup").populate("business")];
            case 1:
                userExists = _b.sent();
                if (!userExists) {
                    res.status(400).json({ message: "User Not Found" });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, bcryptjs_1.default.compare(password, userExists.password)];
            case 2:
                isMatch = _b.sent();
                if (!isMatch) {
                    res.status(401).json({ message: "Invalid credentials" });
                    return [2 /*return*/];
                }
                accessToken = (0, generatetoken_util_1.default)(userExists, "7d").accessToken;
                decoded = (0, jwt_decode_1.jwtDecode)(accessToken);
                // Set cookie
                res.setHeader("Set-Cookie", (0, cookie_1.serialize)("sessionToken", accessToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 3600,
                }));
                // Remove password before sending response
                userExists.password = undefined;
                res.status(200).json({
                    ok: true,
                    message: "Logged in",
                    token: accessToken,
                    exp: decoded === null || decoded === void 0 ? void 0 : decoded.exp,
                    user: userExists,
                });
                return [2 /*return*/];
            case 3:
                error_9 = _b.sent();
                console.log("Login Error:", error_9);
                res.status(500).json({
                    ok: false,
                    message: "Server error",
                    error: error_9.message,
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.login = login;
// session check
var session_Check = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cookies, token, user;
    return __generator(this, function (_a) {
        cookies = (0, cookie_2.parse)(req.headers.cookie || "");
        token = cookies.sessionToken;
        if (!token) {
            // NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            res.status(401).json({ message: "Unauthorized" });
            return [2 /*return*/];
        }
        ;
        try {
            user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET ? process.env.JWT_SECRET : "your_secret_key");
            res.status(200).json(user);
            return [2 /*return*/];
        }
        catch (error) {
            res.status(401).json({ ok: "false", message: "Invalid token" });
        }
        return [2 /*return*/];
    });
}); };
exports.session_Check = session_Check;
var UpdatedSince = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var since, users, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                since = new Date(req.query.since);
                return [4 /*yield*/, user_model_1.User.find({ updatedAt: { $gt: since }, business: req.user.business })];
            case 1:
                users = _a.sent();
                res.status(200).json({ users: users });
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                console.log(err_1);
                res.status(500).json({ error: err_1.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.UpdatedSince = UpdatedSince;
var refresh = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refreshToken;
    return __generator(this, function (_a) {
        refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({ message: "Unauthorized" });
            return [2 /*return*/];
        }
        ;
        jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_SECRET ? process.env.REFRESH_SECRET : "my_secret_key", function (err, decoded) {
            if (err) {
                res.status(403).json({ message: "Forbidden" });
                return;
            }
            ;
            var newAccessToken = jsonwebtoken_1.default.sign({ userId: decoded.userId }, process.env.JWT_SECRET ? process.env.JWT_SECRET : "your_secret_key", { expiresIn: "15m" });
            res.json({ accessToken: newAccessToken });
            return;
        });
        return [2 /*return*/];
    });
}); };
exports.refresh = refresh;
var logout = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.setHeader("Set-Cookie", (0, cookie_1.serialize)("sessionToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 0, // Expire immediately
        }));
        res.status(200).json({ message: "Logged out" });
        return [2 /*return*/];
    });
}); };
exports.logout = logout;
