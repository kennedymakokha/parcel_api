import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import { setupSocket } from './config/socket';
import { connectDB } from "./config/db";
import authRoutes from './routes/auth.routes';

import businessRoute from './routes/business.routes';

import ClocksRoute from './routes/clocks.route'
import { authenticateToken } from "./middleware/auth.middleware";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from 'cors';
import path from "path";
import './crons/monthlybilling'
import './crons/hourlyBilling'
const dev = process.env.NODE_ENV !== 'production';

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  "http://localhost:3001/",
  "https://marapesa.com",
  "https://smartshop-api.marapesa.com",
  "http://185.113.249.137:3000",
  "https://api.marapesa.com",
  "https://a899-102-205-188-82.ngrok-free.app"
];

const io = new IOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = Number(process.env.PORT) || 5000;

connectDB();

app.use("/api/auth", authRoutes);

app.use("/api/business", authenticateToken, businessRoute);

app.use("/api/clocks", authenticateToken, ClocksRoute);

app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});

setupSocket(io);

