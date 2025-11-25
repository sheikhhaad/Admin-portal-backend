// routes/applicantRoutes.js
import express from "express";
import {
  createApplicant,
  getApplicantByEmail,
  getApplicantByCnic,
  updateApplicantStatus,
  getAllApplicants,
  getPassedApplicants,
  deleteApplicant,
} from "../controllers/applicantController.js";
import multer from "multer";

const router = express.Router();

// 👉 Use memory storage (NO folder needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// ➕ Register new applicant
router.post(
  "/create",
  upload.fields([
    { name: "applicant_img", maxCount: 1 },
    { name: "register_fee", maxCount: 1 },
  ]),
  createApplicant
);

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
