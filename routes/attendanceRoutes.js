import express from "express";
import {
  // markAttendance,
  getTodayAttendance,
  getStudentAttendance,
  autoMarkAbsentees,
  getAllAttendance,
  markAttendance,
} from "../controllers/attendanceController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected Routes
// router.post("/mark", verifyToken, markAttendance);
// router.post("/mark", markAttendance);
router.get("/today", verifyToken, getTodayAttendance);
router.get("/student/:student_id", verifyToken, getStudentAttendance);
// router.post("/auto-absent", autoMarkAbsentees);
router.post("/mark", markAttendance);
router.post("/all", getAllAttendance)

router.post("/auto-mark", autoMarkAbsentees); // for testing only
// npm install node-cron

export default router;
