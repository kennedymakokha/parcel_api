"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var auth_controller_1 = require("../controllers/auth.controller");
var auth_middleware_1 = require("../middleware/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/auth/register:
 *   get:
 *     summary: register  a new user
 *     responses:
 *       200:
 *         description: register User
 */
router.post("/register", auth_middleware_1.authenticateToken, auth_controller_1.register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: login user
 *     responses:
 *       200:
 *         description: login User
 */
router.post("/login", auth_controller_1.login);
/**
 * @swagger
 * /api/auth:
 *   get:
 *     summary: return authenticated User
 *     responses:
 *       200:
 *         description: return logged in user
 */
router.get("/", auth_controller_1.session_Check);
router.get("/users", auth_middleware_1.authenticateToken, auth_controller_1.getUsers);
router.post("/refresh", auth_middleware_1.authenticateToken, auth_controller_1.refresh);
router.post("/reset-password", auth_controller_1.updatePassword);
/**
 * @swagger
 * /api/auth/reset-password:
 *   get:
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A user object
 *       404:
 *         description: User not found
 */
router.post("/activate-user", auth_controller_1.activateuser);
router.get("/active-user", auth_controller_1.getUser);
router.put("/:id", auth_controller_1.Update);
router.post("/verify-otp", auth_controller_1.verifyuser);
router.post("/request-otp", auth_controller_1.requestToken);
router.post("/logout", auth_controller_1.logout);
router.get("/updated-since", auth_middleware_1.authenticateToken, auth_controller_1.UpdatedSince);
exports.default = router;
