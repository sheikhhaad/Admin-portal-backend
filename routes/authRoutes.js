import express from "express";
import {
  deleteUser,
  getAllUsers,
  loginUser,
  registerUser,
  updatePassword,
  updateUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// DELETE /api/users/:id
router.delete("/:id", deleteUser);
router.put("/:id", updateUser);
router.put("/:id/password", updatePassword);
router.get("/", getAllUsers);
// router.post("/logout", verifyToken, logoutUser); // ✅ Protected logout

export default router;
