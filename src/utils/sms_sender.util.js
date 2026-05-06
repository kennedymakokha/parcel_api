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
exports.sendTextMessage = void 0;
var sms_logs_model_1 = require("../models/sms_logs.model");
var sendTextMessage = function (message, phone, reciever, ref) { return __awaiter(void 0, void 0, void 0, function () {
    var sender_id, api_key, dataIn, response, data, body, message_1, message_2, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                sender_id = "Champ_Int";
                api_key = "9b41859b01914a75a2a899b9f61dec93";
                dataIn = {
                    api_key: api_key,
                    sender_id: sender_id,
                    message: message,
                    phone: phone
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 8, , 9]);
                return [4 /*yield*/, fetch('https://sms.blessedtexts.com/api/sms/v1/sendsms', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(dataIn)
                    })];
            case 2:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 3:
                data = _a.sent();
                body = {
                    reciever: reciever,
                    message: dataIn.message,
                    message_id: "",
                    status_code: "",
                    status_desc: "",
                    ref: ref
                };
                if (!(Array.isArray(data) && data[0].status_code === "1000")) return [3 /*break*/, 5];
                body.status_code = data[0].status_code;
                body.status_desc = data[0].status_desc;
                body.message_id = data[0].message_id;
                message_1 = new sms_logs_model_1.default(body);
                return [4 /*yield*/, message_1.save()];
            case 4:
                _a.sent();
                return [2 /*return*/, {
                        success: true,
                        data: data
                    }];
            case 5:
                body.status_code = data.status_code;
                body.status_desc = data.status_desc;
                message_2 = new sms_logs_model_1.default(body);
                return [4 /*yield*/, message_2.save()];
            case 6:
                _a.sent();
                return [2 /*return*/, {
                        success: false,
                        data: data
                    }];
            case 7: return [3 /*break*/, 9];
            case 8:
                error_1 = _a.sent();
                console.error('Error:', error_1);
                return [2 /*return*/, {
                        success: false,
                        error: error_1.message
                    }];
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.sendTextMessage = sendTextMessage;
