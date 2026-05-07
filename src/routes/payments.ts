import { Router } from "express";
import { get_Mpesa_logs, makePayment, mpesa_callback } from "../controllers/mpesa.controller";

const router = Router();

router.post("/", makePayment);
router.get("/", get_Mpesa_logs);
router.post("/callback", mpesa_callback);

export default router;
