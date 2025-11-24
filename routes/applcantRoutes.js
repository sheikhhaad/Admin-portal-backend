// routes/applicantRoutes.js
import express from "express";
import {
  createApplicant,
  getApplicantByEmail,
  getApplicantByCnic,
  updateApplicantStatus,
  getAllApplicants,
  getPassedApplicants,
  deleteApplicant
} from "../controllers/applicantController.js";

const router = express.Router();

// ➕ Register new applicant
router.post("/create", createApplicant);

// 🔍 Get applicant by email
router.get("/email/:email", getApplicantByEmail);

// 🔍 Get applicant by CNIC
router.get("/cnic/:cnic", getApplicantByCnic);

// 🔄 Update applicant status
router.put("/:applicant_id/status", updateApplicantStatus);

// 📋 Get all applicants
router.get("/", getAllApplicants);

// 🧾 Get all passed applicants
router.get("/passed", getPassedApplicants);

// ❌ Delete applicant
router.delete("/:applicant_id", deleteApplicant);

export default router;