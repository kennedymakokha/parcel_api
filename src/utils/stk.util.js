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
exports.sendB2C = exports.Mpesa_stk = void 0;
var node_fetch_1 = require("node-fetch");
var axios_1 = require("axios");
var moment_1 = require("moment");
var mpesaLogs_model_1 = require("../models/mpesaLogs.model");
var validatePhone = function (phone) {
    var raw_phone_number = phone.trim();
    var valid_phone_number = "";
    if (raw_phone_number.startsWith("+254")) {
        valid_phone_number = raw_phone_number.replace("+254", "254");
    }
    else if (raw_phone_number.startsWith("0")) {
        valid_phone_number = raw_phone_number.replace("0", "254");
    }
    else {
        valid_phone_number = raw_phone_number;
    }
    return valid_phone_number.replace(/\s+/g, ""); // Remove any spaces
};
var Mpesa_stk = function (No, amount, user) { return __awaiter(void 0, void 0, void 0, function () {
    var consumer_key, consumer_secret, passkey, short_code, timestamp, phone, new_amount, Authorization, response, token, headers, fetch_response, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                consumer_key = process.env.MPESA_CONSUMER_KEY;
                consumer_secret = process.env.MPESA_CONSUMER_SECRETE;
                passkey = process.env.MPESA_CONSUMER_PASSKEY;
                short_code = parseInt(process.env.MPESA_SHORT_CODE, 10);
                timestamp = (0, moment_1.default)().format("YYYYMMDDHHmmss");
                phone = validatePhone(No);
                new_amount = parseInt(amount.toString(), 10);
                Authorization = "Bearer ".concat(Buffer.from("".concat(consumer_key, ":").concat(consumer_secret)).toString("base64"));
                return [4 /*yield*/, axios_1.default.get("".concat(process.env.MPESA_BASE_URL, "/oauth/v1/generate?grant_type=client_credentials"), {
                        headers: {
                            Authorization: "Basic ".concat(Buffer.from("".concat(consumer_key, ":").concat(consumer_secret)).toString("base64")),
                        },
                    })];
            case 1:
                response = _a.sent();
                token = response.data.access_token;
                headers = new node_fetch_1.Headers();
                headers.append("Content-Type", "application/json");
                headers.append("Authorization", "Bearer ".concat(token));
                return [4 /*yield*/, (0, node_fetch_1.default)("".concat(process.env.MPESA_BASE_URL, "/mpesa/stkpush/v1/processrequest"), {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify({
                            BusinessShortCode: short_code,
                            Password: Buffer.from("".concat(short_code).concat(passkey).concat(timestamp)).toString("base64"),
                            Timestamp: timestamp,
                            TransactionType: "CustomerPayBillOnline",
                            Amount: new_amount,
                            PartyA: phone,
                            PartyB: process.env.MPESA_SHORT_CODE,
                            PhoneNumber: phone,
                            CallBackURL: process.env.MPESA_CALLbACK,
                            AccountReference: "Mtadao Pack Ltd",
                            TransactionDesc: "Payment delivery of *",
                        }),
                    })];
            case 2:
                fetch_response = _a.sent();
                return [4 /*yield*/, fetch_response.json()];
            case 3:
                data = _a.sent();
                return [4 /*yield*/, new mpesaLogs_model_1.default({
                        MerchantRequestID: data.MerchantRequestID,
                        CheckoutRequestID: data.CheckoutRequestID,
                        phone_number: phone,
                        amount: new_amount,
                        ResponseCode: data.ResponseCode,
                        user: user,
                        log: "",
                    }).save()];
            case 4:
                _a.sent();
                return [2 /*return*/, {
                        MerchantRequestID: data.MerchantRequestID,
                        CheckoutRequestID: data.CheckoutRequestID,
                        phone_number: phone,
                        amount: new_amount,
                        ResponseCode: data.ResponseCode,
                        user: user,
                        log: "",
                    }];
        }
    });
}); };
exports.Mpesa_stk = Mpesa_stk;
exports.default = exports.Mpesa_stk;
var getAccessToken = function () { return __awaiter(void 0, void 0, void 0, function () {
    var auth, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                auth = Buffer.from("".concat(process.env.MPESA_CONSUMER_KEY, ":").concat(process.env.MPESA_CONSUMER_SECRET)).toString("base64");
                return [4 /*yield*/, axios_1.default.get("".concat(process.env.MPESA_BASE_URL, "/oauth/v1/generate?grant_type=client_credentials"), {
                        headers: {
                            Authorization: "Basic ".concat(auth),
                        },
                    })];
            case 1:
                response = _a.sent();
                return [2 /*return*/, response.data.access_token];
        }
    });
}); };
var sendB2C = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, payload, response, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                return [4 /*yield*/, getAccessToken()];
            case 1:
                token = _b.sent();
                payload = {
                    InitiatorName: process.env.MPESA_INITIATOR_NAME,
                    SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
                    CommandID: "BusinessPayment", // can also be "SalaryPayment", "PromotionPayment"
                    Amount: req.body.amount,
                    PartyA: process.env.MPESA_SHORTCODE,
                    PartyB: req.body.phone, // 2547XXXXXXXX
                    Remarks: "Payment from Mtadao",
                    QueueTimeOutURL: process.env.MPESA_B2C_CALLBACK,
                    ResultURL: process.env.MPESA_B2C_CALLBACK,
                    Occasion: "Payout",
                };
                return [4 /*yield*/, axios_1.default.post("".concat(process.env.MPESA_BASE_URL, "/mpesa/b2c/v1/paymentrequest"), payload, {
                        headers: {
                            Authorization: "Bearer ".concat(token),
                            "Content-Type": "application/json",
                        },
                    })];
            case 2:
                response = _b.sent();
                console.log("B2C Response:", response.data);
                res.json(response.data);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.error("B2C Error:", ((_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _a === void 0 ? void 0 : _a.data) || error_1.message);
                res.status(500).json({ error: "B2C payment failed" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.sendB2C = sendB2C;
// import fetch, { Headers } from "node-fetch";
// import axios from "axios";
// import moment from "moment";
// const validatePhone = (phone: string): string => {
//     let raw_phone_number = phone.trim();
//     let valid_phone_number = "";
//     if (raw_phone_number.startsWith("+254")) {
//         valid_phone_number = raw_phone_number.replace("+254", "254");
//     } else if (raw_phone_number.startsWith("0")) {
//         valid_phone_number = raw_phone_number.replace("0", "254");
//     } else {
//         valid_phone_number = raw_phone_number;
//     }
//     return valid_phone_number.replace(/\s+/g, ""); // Remove any spaces
// };
// interface MpesaStkResponse {
//     MerchantRequestID: string;
//     CheckoutRequestID: string;
//     phone_number: string;
//     amount: number;
//     ResponseCode: string;
//     user: string;
//     log: string;
// }
// export const Mpesa_stk = async (
//     No: string,
//     amount: number,
//     user: string
// ): Promise<MpesaStkResponse> => {
//     const consumer_key = process.env.MPESA_CONSUMER_KEY as string;
//     const consumer_secret = process.env.MPESA_CONSUMER_SECRETE as string;
//     const passkey = process.env.MPESA_CONSUMER_PASSKEY as string;
//     const short_code = parseInt(process.env.MPESA_SHORT_CODE as string, 10);
//     const timestamp = moment().format("YYYYMMDDHHmmss");
//     const phone = validatePhone(No);
//     const new_amount = parseInt(amount.toString(), 10);
//     const Authorization = `Bearer ${Buffer.from(
//         `${consumer_key}:${consumer_secret}`
//     ).toString("base64")}`;
//     const response = await axios.get<{ access_token: string }>(
//         `${process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
//         {
//             headers: {
//                 Authorization: `Basic ${Buffer.from(
//                     `${consumer_key}:${consumer_secret}`
//                 ).toString("base64")}`,
//             },
//         }
//     );
//     const token = response.data.access_token;
//     console.log(`token: ${token}`);
//     const headers = new Headers();
//     headers.append("Content-Type", "application/json");
//     headers.append("Authorization", `Bearer ${token}`);
//     const fetch_response = await fetch(
//         `${process.env.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
//         {
//             method: "POST",
//             headers,
//             body: JSON.stringify({
//                 BusinessShortCode: short_code,
//                 Password: Buffer.from(
//                     `${short_code}${passkey}${timestamp}`
//                 ).toString("base64"),
//                 Timestamp: timestamp,
//                 TransactionType: "CustomerPayBillOnline",
//                 Amount: new_amount,
//                 PartyA: phone,
//                 PartyB: 4115395,
//                 PhoneNumber: phone,
//                 CallBackURL: process.env.MPESA_CALLbACK,
//                 AccountReference: "Mtadao Pack Ltd",
//                 TransactionDesc: "Payment delivery of *",
//             }),
//         }
//     );
//     const data: any = await fetch_response.json();
//     return {
//         MerchantRequestID: data.MerchantRequestID,
//         CheckoutRequestID: data.CheckoutRequestID,
//         phone_number: phone,
//         amount: new_amount,
//         ResponseCode: data.ResponseCode,
//         user: user,
//         log: "",
//     };
// };
// export default Mpesa_stk;
