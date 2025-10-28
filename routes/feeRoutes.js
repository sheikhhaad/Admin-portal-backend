import express from "express";
import {
  payFee,
  getFeeHistory,
  getAllFees,
  getUnpaidStudents,
} from "../controllers/feeController.js";

import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin or Receptionist can access
router.post("/pay", verifyToken, payFee);
router.get("/history/:student_id", verifyToken, getFeeHistory);
router.get("/all", verifyToken, verifyRole("admin"), getAllFees);
router.get("/unpaid", verifyToken, verifyRole("admin"), getUnpaidStudents);

export default router;
