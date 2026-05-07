import { Router } from "express";
import { get_Mpesa_logs, makePayment, mpesa_callback } from "../controllers/mpesa.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/",authenticateToken, makePayment);
router.get("/",authenticateToken, get_Mpesa_logs);
router.post("/callback", mpesa_callback);

export default router;
