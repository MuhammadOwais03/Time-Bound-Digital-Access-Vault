
import { userRegistration, login, getMe, logout } from "../controllers/user.controllers.js";
import verifyToken from "../middleware/verifyToken.middleware.js";

import express from "express";

const router = express.Router();

router.post("/register", userRegistration);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.post("/logout", verifyToken, logout);

export default router;