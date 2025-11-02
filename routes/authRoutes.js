import express from "express";
import {
  deleteUser,
  loginUser,
  registerUser,
  updatePassword,
  updateUser,
} from "../Controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// DELETE /api/users/:id
router.delete("/:id", deleteUser);
router.put("/:id", updateUser);
router.put("/:id/password", updatePassword);
// router.post("/logout", verifyToken, logoutUser); // ✅ Protected logout

export default router;
