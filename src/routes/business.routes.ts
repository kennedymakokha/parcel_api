import { Router } from "express";
import { Create, CreatePickup, Get, Get_one, getBusinessPickups, GetPickups, getPickupUserStats, Subscribe, Trash, TrashPickup, Update, UpdatePickup, } from "../controllers/business.controller";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
const router = Router();

const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });


router.get("/", Get);
router.post("/", upload.single('logo'), Create);
router.post("/pickup/opening", Subscribe);
router.post("/create/pickup",  CreatePickup);
router.get("/get/pickups",  GetPickups);
router.put("/:id", Update);
router.put("/pickup/:id", UpdatePickup);
router.delete("/pickup/:id", TrashPickup);
router.delete("/:id", Trash);
router.get("/my-business", Get_one);
router.get("/:id/pickups", getBusinessPickups);
router.get("/:id/user/pickups", getPickupUserStats);



export default router;
