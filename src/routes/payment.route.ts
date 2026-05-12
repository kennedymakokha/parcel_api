import { Router } from "express";
import { Bulk, UpdatedSince, } from "../controllers/clocks.controller";
import { CreatePay, dailyReconciliations } from "../controllers/payments.controller";

const router = Router();




router.post("/", CreatePay);
router.get("/", UpdatedSince);
router.get("/daily/reconciliations", dailyReconciliations);



export default router;
