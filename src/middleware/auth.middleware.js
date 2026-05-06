"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var SECRET_KEY = process.env.JWT_SECRET || "evelopment_secret_key_change_in_prod";
var authenticateToken = function (req, res, next) {
    var _a;
    var token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Access denied. No token provided." });
        return;
    }
    try {
        var decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
        return;
    }
    catch (err) {
        console.log(err);
        res.status(403).json({ message: "Invalid token" });
        return;
    }
};
exports.authenticateToken = authenticateToken;
