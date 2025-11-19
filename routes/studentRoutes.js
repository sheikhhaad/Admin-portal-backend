import express from "express";
import {
  addStudent,
  getAllStudents,
  registerStudent,
} from "../controllers/studentController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getAllStudents);
router.post("/register", registerStudent);

router.post(
  "/addstudent",
  upload.fields([
    { name: "student_img", maxCount: 1 },
    { name: "fee_voucher", maxCount: 1 },
  ]),
  addStudent
);

export default router;
