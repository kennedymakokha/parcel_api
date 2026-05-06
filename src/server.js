"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var express_1 = require("express");
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var socket_1 = require("./config/socket");
var db_1 = require("./config/db");
var auth_routes_1 = require("./routes/auth.routes");
var parcel_route_1 = require("./routes/parcel.route");
var business_routes_1 = require("./routes/business.routes");
var trucks_route_1 = require("./routes/trucks.route");
var client_route_1 = require("./routes/client.route");
var clocks_route_1 = require("./routes/clocks.route");
var auth_middleware_1 = require("./middleware/auth.middleware");
var body_parser_1 = require("body-parser");
var cookie_parser_1 = require("cookie-parser");
var cors_1 = require("cors");
var path_1 = require("path");
require("./crons/monthlybilling");
require("./crons/hourlyBilling");
var firebase_admin_1 = require("firebase-admin");
var dev = process.env.NODE_ENV !== 'production';
var firebasePrivateKey = (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n');
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !firebasePrivateKey) {
    throw new Error('Missing Firebase admin credentials in environment variables');
}
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines to ensure the key is parsed correctly
        privateKey: firebasePrivateKey,
    }),
});
var app = (0, express_1.default)();
var httpServer = (0, http_1.createServer)(app);
var allowedOrigins = [
    "http://localhost:3001/",
    "http://192.168.100.156:3000/",
    "http://localhost:3000",
    "https://parcel-mtaani.mtandao.co.ke/",
    "https://smartshop-api.marapesa.com",
    "http://185.113.249.137:3000",
    "https://api.marapesa.com",
    "https://a899-102-205-188-82.ngrok-free.app"
];
var io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
    }
});
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../public/uploads")));
app.use((0, cors_1.default)({ origin: allowedOrigins, credentials: true }));
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
var PORT = Number(process.env.PORT) || 5000;
(0, db_1.connectDB)();
app.use("/api/auth", auth_routes_1.default);
app.use("/api/business", auth_middleware_1.authenticateToken, business_routes_1.default);
app.use("/api/parcel", auth_middleware_1.authenticateToken, parcel_route_1.default);
app.use("/api/clocks", auth_middleware_1.authenticateToken, clocks_route_1.default);
app.use("/api/trucks", auth_middleware_1.authenticateToken, trucks_route_1.default);
app.use("/api/clients", client_route_1.default);
app.use('*', function (req, res) {
    res.status(404).json({ message: 'API endpoint not found' });
});
httpServer.listen(PORT, function () {
    console.log("\uD83D\uDE80 Backend server running on http://localhost:".concat(PORT));
});
(0, socket_1.setupSocket)(io);
