import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectToDatabase } from "./config/db.js";
import studentRoutes from "./routes/studentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: env.process.FRONTEND_URL, // or your frontend domain
    credentials: true, // ✅ allows cookies to be sent
  })
);
app.use(express.json()); // ✅ This line is CRUCIAL

const PORT = process.env.PORT || 8000;

// ✅ Connect DB once
await connectToDatabase();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fee", feeRoutes);
app.use("/api/config", configRoutes);
app.use("/api/courses", courseRoutes);

// Default route
app.get("/", (req, res) =>
  res.send("Attendance Management System API Running...")
);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
