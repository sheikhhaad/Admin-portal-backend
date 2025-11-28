//attendenceController.js
import { AttendanceModel } from "../models/attendanceModel.js";
import { ClassModel } from "../models/classModel.js";
import { CourseModel } from "../models/courseModel.js";
import { StudentModel } from "../models/studentModel.js";

// ✅ Mark Attendance (QR Scan or Manual)
// export const markAttendance = async (req, res) => {
//   try {
//     const { student_id, time_in } = req.body;

//     if (!student_id) {
//       return res.status(400).json({ message: "student_id is required" });
//     }

//     const alreadyMarked = await AttendanceModel.checkAlreadyMarked(student_id);
//     if (alreadyMarked) {
//       return res.status(400).json({
//         message: "Attendance already marked for this student today.",
//       });
//     }

//     // Class starts at 9:00 AM (example)
//     const classStartTime = new Date();
//     classStartTime.setHours(9, 0, 0, 0);

//     const now = new Date();
//     const delayMinutes = Math.floor((now - classStartTime) / 60000);

//     let status = "present";
//     let remarks = "On time";

//     if (delayMinutes > 5 && delayMinutes <= 20) {
//       status = "late";
//       remarks = `Late by ${delayMinutes} mins`;
//     } else if (delayMinutes > 20) {
//       status = "absent";
//       remarks = "Exceeded late grace period";
//     }

//     await AttendanceModel.markAttendance(student_id, status, remarks);

//     res.status(201).json({
//       message: `Attendance marked as ${status}`,
//       details: { student_id, status, remarks },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error marking attendance", error: error.message });
//   }
// };

const moment = require("moment-timezone");

export const markAttendance = async (req, res) => {
  try {
    console.log("Incoming payload:", req.body);
    const { student_id } = req.body;

    if (!student_id || typeof student_id !== "string") {
      return res.status(400).json({ error: "Invalid student_id" });
    }

    // ✅ FIX: Use moment-timezone for reliable timezone handling
    const scanTime = moment().tz("Asia/Karachi");
    const dayOfWeek = scanTime.format("ddd").toLowerCase();
    const dateStr = scanTime.format("YYYY-MM-DD");
    const isoString = scanTime.toISOString();

    console.log("PKT time:", scanTime.toString());
    console.log("Detected day:", dayOfWeek);

    // Rest of your code remains the same...
    const alreadyMarked = await AttendanceModel.checkAlreadyMarked(
      student_id,
      dateStr
    );
    if (alreadyMarked) {
      return res.status(400).json({
        status: "Already Marked",
        message: "Attendance already marked for today",
      });
    }

    const student = await StudentModel.getByStudentId(student_id);
    if (!student || !student.class_id) {
      return res.status(404).json({
        message: "Student not found or class not assigned",
      });
    }

    const classInfo = await ClassModel.getClassSchedule(student.class_id);

    if (
      !classInfo ||
      !classInfo.class_start_time ||
      !classInfo.class_end_time ||
      !classInfo.days
    ) {
      return res.status(400).json({
        message: "Class timing not configured by admin",
      });
    }

    const allowedDays = classInfo.days
      .split(",")
      .map((d) => d.trim().toLowerCase().slice(0, 3));

    console.log("Allowed days:", allowedDays);
    console.log("Today is:", dayOfWeek);

    if (!allowedDays.includes(dayOfWeek)) {
      return res.status(400).json({
        message: "No class today",
        today: dayOfWeek,
        allowed: allowedDays,
      });
    }

    // ✅ Convert moment time to minutes for comparison
    const scanTotal = scanTime.hours() * 60 + scanTime.minutes();

    const [startH, startM] = classInfo.class_start_time.split(":").map(Number);
    const [endH, endM] = classInfo.class_end_time.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (scanTotal < startMinutes || scanTotal > endMinutes) {
      return res.status(400).json({
        message: "No class running at this time",
        allowed_time: `${classInfo.class_start_time} - ${classInfo.class_end_time}`,
        scan_time: scanTime.format("HH:mm:ss"),
      });
    }

    let status = "present";
    let remarks = "On time";

    const delay = scanTotal - startMinutes;
    const gracePeriod = 15;

    if (delay > gracePeriod) {
      status = "late";
      remarks = `Late by ${delay} mins`;
    }

    await AttendanceModel.markAttendance(
      student_id,
      status,
      remarks,
      dateStr,
      isoString
    );

    res.status(201).json({
      success: true,
      message: `Attendance marked as ${status}`,
      details: {
        student_id,
        status,
        remarks,
        date: dateStr,
        scan_time: scanTime.format("HH:mm:ss"),
        detected_day: dayOfWeek,
      },
    });
  } catch (error) {
    console.error("Attendance Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ Auto absent Attendance (QR Scan or Manual)
// npm install node-cron
export const autoMarkAbsentees = async (req, res) => {
  try {
    const today = new Date();
    const currentDay = today.toLocaleString("en-US", { weekday: "short" }); // e.g. "Mon"
    const todayDate = today.toISOString().split("T")[0]; // yyyy-mm-dd
    console.log("📅 Today:", todayDate);

    // 🔍 Get all classes scheduled today
    const classes = await ClassModel.getCoursesByDay(currentDay);
    console.log("📚 Classes today:", classes);

    if (!classes.length) {
      return res.status(200).json({ message: "No classes scheduled today" });
    }

    let totalAbsent = 0;

    for (const cls of classes) {
      const { class_id, course_id, class_end_time } = cls;
      console.log("⏰ Skipping class:", class_id);

      // Convert class_end_time to Date
      const [endH, endM] = class_end_time.split(":");
      const classEnd = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        parseInt(endH),
        parseInt(endM)
      );

      // Skip if current time is before class end
      if (today < classEnd) continue;

      // 🔍 Get all students in this course
      const students = await StudentModel.getByCourse(course_id);
      console.log("👨‍🎓 Students:", students);

      for (const student of students) {
        // Check if attendance already marked today
        const isMarked = await AttendanceModel.checkAlreadyMarked(
          student.student_id,
          todayDate // ✅ Pass date to avoid false positives
        );
        console.log("✅ Already marked:", isMarked);

        if (!isMarked) {
          await AttendanceModel.markAttendance(
            student.student_id,
            "absent",
            "Did not attend / no scan",
            classEnd // optional: use as time_in
          );
          totalAbsent++;
        }
      }
    }

    res.status(200).json({
      status: "Absent",
      message: "✅ Auto-absent process complete.",
      totalAbsent,
    });
  } catch (error) {
    console.error("Auto-absent error:", error);
    res.status(500).json({
      message: "❌ Error auto-marking absentees",
      error: error.message,
    });
  }
};

// ✅ Get Today’s Attendance
export const getTodayAttendance = async (req, res) => {
  try {
    const records = await AttendanceModel.getTodayAttendance();
    res.status(200).json(records);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching attendance", error: error.message });
  }
};

// ✅ Get a Student’s Attendance History
export const getStudentAttendance = async (req, res) => {
  try {
    const { student_id } = req.params;
    const records = await AttendanceModel.getStudentAttendance(student_id);
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching student attendance",
      error: error.message,
    });
  }
};

// get all student's attendence
export const getAllAttendance = async (req, res) => {
  try {
    const records = await AttendanceModel.getAllAttendance();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching all student attendance",
      error: error.message,
    });
  }
};
