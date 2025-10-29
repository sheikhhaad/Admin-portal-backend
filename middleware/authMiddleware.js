// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { TokenModel } from "../models/tokenModel.js";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Role-based check
export const verifyRole = (role) => (req, res, next) => {
  if (req.user.role !== role)
    return res.status(403).json({ message: "Access denied. Insufficient role." });
  next();
};
