"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = require("jsonwebtoken");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var generateTokens = function (user, accessExpiry) {
    var _a, _b;
    var jwtSecret = process.env.JWT_SECRET || "development_secret_key_change_in_prod";
    var refreshSecret = process.env.REFRESH_SECRET || "my_secret_key";
    var accessToken = jsonwebtoken_1.default.sign({
        userId: user._id,
        username: user.name,
        role: user.role,
        name: user.name,
        business: (_a = user === null || user === void 0 ? void 0 : user.business) === null || _a === void 0 ? void 0 : _a._id,
        pickup: (_b = user === null || user === void 0 ? void 0 : user.pickup) === null || _b === void 0 ? void 0 : _b._id
    }, jwtSecret, { expiresIn: accessExpiry });
    var refreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, refreshSecret, { expiresIn: "7d" } // You could make this dynamic too if needed
    );
    return { accessToken: accessToken, refreshToken: refreshToken };
};
exports.default = generateTokens;
