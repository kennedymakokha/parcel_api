import { Router } from "express";
import { collectParcel, dispatchParcels, getParcels, GetParcels, markParcelArrived, registerParcel, GetParcelJourney, getTruckParcelCount, getParcelStatusCount, getParcelEventStats, getFullDashboard } from "../controllers/parcel.controller";

const router = Router();


router.post("/", registerParcel);
router.get("/", GetParcels);
router.post("/dispatch/bulk", dispatchParcels);
router.get("/grouped", getParcels);
router.put("/:id/arrive", markParcelArrived);
router.put("/:id/collect", collectParcel);
router.get("/:id/journey", GetParcelJourney);
router.get("/trucks/count", getTruckParcelCount);
router.get("/status/count", getParcelStatusCount);
router.get("/events/stats", getFullDashboard);




export default router;
