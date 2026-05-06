"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var business_controller_1 = require("../controllers/business.controller");
var multer_1 = require("multer");
var path_1 = require("path");
var fs_1 = require("fs");
var uuid_1 = require("uuid");
var router = (0, express_1.Router)();
var uploadDir = path_1.default.join(__dirname, "../../public/uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Multer config
var storage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, uploadDir);
    },
    filename: function (_req, file, cb) {
        var uniqueName = "".concat((0, uuid_1.v4)(), "-").concat(file.originalname);
        cb(null, uniqueName);
    },
});
var upload = (0, multer_1.default)({ storage: storage });
router.get("/", business_controller_1.Get);
router.post("/", upload.single('logo'), business_controller_1.Create);
router.post("/create/pickup", business_controller_1.CreatePickup);
router.get("/get/pickups", business_controller_1.GetPickups);
router.put("/:id", business_controller_1.Update);
router.delete("/:id", business_controller_1.Trash);
router.get("/my-business", business_controller_1.Get_one);
router.get("/:id/pickups", business_controller_1.getBusinessPickups);
exports.default = router;
