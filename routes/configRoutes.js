import express from "express";
import { getConfig, updateConfig } from "../controllers/configController.js";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only
router.get("/", verifyToken, verifyRole("admin"), getConfig);
router.put("/", verifyToken, verifyRole("admin"), updateConfig);

export default router;
