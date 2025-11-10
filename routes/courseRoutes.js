import express from "express";
import {
  addCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only routes
router.get("/", verifyToken, getCourses);
router.get("/:id", verifyToken, getCourseById);
router.post("/", verifyToken, verifyRole("admin"), addCourse);
router.put("/:id", verifyToken, verifyRole("admin"), updateCourse);
router.delete("/:id", verifyToken, verifyRole("admin"), deleteCourse);

export default router;
