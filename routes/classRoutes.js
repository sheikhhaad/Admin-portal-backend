import express from "express";
import {
  createClass,
  getClassById,
  getClassTime,
  getClassSchedule,
  getClassesByDay,
  updateClass,
  getClasses,
} from "../controllers/classController.js";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public or token-protected routes
router.get("/", getClasses);
router.get("/:class_id", verifyToken, getClassById);
router.get("/time/:class_id", verifyToken, getClassTime);
router.get("/schedule/:class_id", verifyToken, getClassSchedule);
router.get("/day/:day", verifyToken, getClassesByDay);

// Admin-only routes
router.post("/create", verifyToken, verifyRole("admin"), createClass);
router.put("/:class_id", verifyToken, verifyRole("admin"), updateClass);

export default router;
