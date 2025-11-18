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
import cookieParser from "cookie-parser";
import classRoutes from "./routes/classRoutes.js"
// import cron from "node-cron";
// import { autoMarkAbsentees } from "./controllers/attendanceController.js";

//! Run every day at 11:59 PM
// cron.schedule("59 23 * * *", async () => {
//   console.log("⏰ Running auto absentee marking...");
//   await autoMarkAbsentees({}, { status: () => ({ json: console.log }) });
// });

dotenv.config();
const app = express();

app.use(cookieParser());

const allowedOrigins = [
  "https://student-admin-portal.pages.dev",
  "https://sbilform.vercel.app",
  "https://sbil.vercel.app",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "https://student-admin-portal.pages.dev", // or your frontend domain
//     credentials: true, // ✅ allows cookies to be sent
//   })
// );
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
app.use("/api/class", classRoutes);

// Default route
app.get("/", (req, res) =>
  res.send("Attendance Management System API Running...")
);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
