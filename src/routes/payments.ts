import { Router } from "express";
import { get_Mpesa_logs, makePayment } from "../controllers/mpesa.controller";

const router = Router();




router.post("/", makePayment);
router.get("/", get_Mpesa_logs);



export default router;
