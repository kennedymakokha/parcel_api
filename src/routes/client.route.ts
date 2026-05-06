import { Router } from "express";
import { GetClientParcels, GetClientParcel, CancelParcel } from "../controllers/parcel.controller";
import { GetPickupsForClient } from "../controllers/business.controller";

const router = Router();



router.get("/parcels", GetClientParcels);
router.post("/parcels/cancellation", CancelParcel);

router.get("/parcels/:id", GetClientParcel);
router.get("/pickups", GetPickupsForClient);





export default router;
