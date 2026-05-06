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
var billingModel_1 = require("../models/billingModel");
var business_model_1 = require("../models/business.model");
var usageModel_1 = require("../models/usageModel");
var node_cron_1 = require("node-cron");
var PRICE_PER_MB = 0.02; // $0.02 per MB
var PRICE_PER_USER = 0.01; // $0.01 per user
var BASE_PRICE = 5; // $5 minimum
var calculateBill = function (usage) {
    var mb = usage.storage_bytes / (1024 * 1024);
    var cost = 0;
    cost += mb * PRICE_PER_MB;
    cost += usage.users_count * PRICE_PER_USER;
    return Math.max(cost, BASE_PRICE);
};
node_cron_1.default.schedule("0 0 1 * *", function () { return __awaiter(void 0, void 0, void 0, function () {
    var businesses, month, _i, businesses_1, biz, usage, amount, mb;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Generating monthly invoices...");
                return [4 /*yield*/, business_model_1.BusinessModel.find()];
            case 1:
                businesses = _a.sent();
                month = new Date().toISOString().slice(0, 7);
                _i = 0, businesses_1 = businesses;
                _a.label = 2;
            case 2:
                if (!(_i < businesses_1.length)) return [3 /*break*/, 6];
                biz = businesses_1[_i];
                return [4 /*yield*/, usageModel_1.UsageModel.findOne({ business: biz._id })];
            case 3:
                usage = _a.sent();
                if (!usage)
                    return [3 /*break*/, 5];
                amount = calculateBill(usage);
                mb = usage.storage_bytes / (1024 * 1024);
                return [4 /*yield*/, billingModel_1.BillingModel.create({
                        business: biz._id,
                        month: month,
                        storage_mb: Math.ceil(mb),
                        users: usage.users_count,
                        amount: amount,
                        status: "pending"
                    })];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 2];
            case 6: return [2 /*return*/];
        }
    });
}); });
