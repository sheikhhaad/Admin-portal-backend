import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectToDatabase } from "./config/db.js";
import studentRoutes from "./routes/studentRoutes.js";
import authRoutes from "./routes/authRoutes.js";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;

// ✅ Connect DB once
await connectToDatabase();

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

// Default route
app.get("/", (req, res) =>
  res.send("Attendance Management System API Running...")
);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
