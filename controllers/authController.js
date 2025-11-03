import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModel } from "../models/userModel.js";

dotenv.config();

// ✅ Register User (Admin or Receptionist)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(name, email.password, role);

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await UserModel.create(name, email, hashedPassword, role);

    res.status(201).json({ message: "User registered successfully", userId });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

// ✅ Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    // ✅ Match role (admin/receptionist etc.)
    if (role && user.role !== role)
      return res
        .status(403)
        .json({ success: false, message: `Access denied for role: ${role}` });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Login failed", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await UserModel.delete(id);

    if (deleted)
      return res.status(200).json({ message: "User deleted successfully" });
    res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Update user details
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // user id from URL
    const { name, email, role } = req.body; // fields to update

    // validation
    if (!name || !email || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updated = await UserModel.update(id, { name, email, role });

    if (updated) {
      return res.status(200).json({ message: "User updated successfully" });
    }

    res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Update user password
export const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update DB
    const updated = await UserModel.updatePassword(id, hashedPassword);

    if (updated) {
      return res.status(200).json({ message: "Password updated successfully" });
    }

    res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const user = await UserModel.getAll();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};