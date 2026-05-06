"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantMiddleware = void 0;
var tenantMiddleware = function (req, res, next) {
    var business = req.headers["x-business-id"];
    if (!business) {
        return res.status(400).json({ message: "business ID missing" });
    }
    req.business = business;
    next();
};
exports.tenantMiddleware = tenantMiddleware;
