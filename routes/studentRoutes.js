import express from "express";
import { getAllStudents, registerStudent } from "../controllers/studentController.js";

const router = express.Router();

router.get("/", getAllStudents);
router.post("/register", registerStudent);

export default router;
