import express from "express";
import {
  registerUser,
  loginUser,
  deleteUser,
  updateUser,
  updatePassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// DELETE /api/users/:id
router.delete("/:id", deleteUser);
router.put("/:id", updateUser);
router.put("/:id/password", updatePassword);
// router.post("/logout", verifyToken, logoutUser); // ✅ Protected logout

export default router;
