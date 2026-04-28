import { Router } from "express";
import { Create, CreatePickup, Get, Get_one, GetPickups, Lock, Trash, Update, } from "../controllers/business.controller";
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
router.post("/create/pickup",  CreatePickup);
router.get("/get/pickups",  GetPickups);
router.put("/:id", Update);
router.delete("/:id", Trash);
router.get("/my-business", Get_one);
router.post("/lock-business", Lock);


export default router;
