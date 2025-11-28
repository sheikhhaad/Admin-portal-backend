import express from "express";
import {
  addStudent,
  deleteStudentToTrash,
  getAllStudents,
  getByStudentId,
  registerStudent,
} from "../controllers/studentController.js";
import multer from "multer";

const router = express.Router();
// const upload = multer({ dest: "uploads/" });

// 👉 Use memory storage (NO folder needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

router.get("/", getAllStudents);
router.post("/register", registerStudent);
router.get("/:student_id", getByStudentId);

router.post(
  "/addstudent",
  upload.fields([
    { name: "student_img", maxCount: 1 },
    { name: "fee_voucher", maxCount: 1 },
  ]),
  addStudent
);

router.delete("/:student_id", deleteStudentToTrash);

export default router;
