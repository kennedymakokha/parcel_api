import { Router } from "express";
import { CreatePay, dailyReconciliations, getDailyReconciliationParcels } from "../controllers/payments.controller";

const router = Router();




router.post("/", CreatePay);
router.get("/", getDailyReconciliationParcels);
router.get("/daily/reconciliations", dailyReconciliations);



export default router;
