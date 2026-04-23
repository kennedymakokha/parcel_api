import { Router } from "express";
import { Bulk, UpdatedSince, } from "../controllers/clocks.controller";

const router = Router();




router.post("/bulk", Bulk);
router.get("/updated-since", UpdatedSince);



export default router;
