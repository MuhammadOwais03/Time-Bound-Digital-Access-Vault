
import express from "express";
import { createVault, getVaults, getVault, updateVault, deleteVault } from "../controllers/vault.controllers.js";
import verifyToken from "../middleware/verifyToken.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createVault);
router.get("/", verifyToken, getVaults);
router.get("/:id", verifyToken, getVault);
router.put("/:id", verifyToken, updateVault);
router.delete("/:id", verifyToken, deleteVault);

export default router;