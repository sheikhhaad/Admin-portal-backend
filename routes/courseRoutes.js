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

// Public or token-protected routes
router.get("/", getCourses);
router.get("/:course_id", verifyToken, getCourseById);

// Admin-only routes
router.post("/", verifyToken, verifyRole("admin"), addCourse);
router.put("/:course_id", verifyToken, verifyRole("admin"), updateCourse);
router.delete("/:course_id", verifyToken, verifyRole("admin"), deleteCourse);

export default router;