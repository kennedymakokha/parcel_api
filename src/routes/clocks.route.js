"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var clocks_controller_1 = require("../controllers/clocks.controller");
var router = (0, express_1.Router)();
router.post("/bulk", clocks_controller_1.Bulk);
router.get("/updated-since", clocks_controller_1.UpdatedSince);
exports.default = router;
