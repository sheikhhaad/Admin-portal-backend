//attendenceController.js
import { AttendanceModel } from "../models/attendanceModel.js";
import { ClassModel } from "../models/classModel.js";
import { CourseModel } from "../models/courseModel.js";
import { StudentModel } from "../models/studentModel.js";

// ✅ Auto absent Attendance (QR Scan or Manual)
// npm install node-cron

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
export const markAttendance = async (req, res) => {
  try {
    console.log("Incoming payload:", req.body);

    const { student_id, time_in } = req.body;

    if (!student_id || !time_in) {
      return res.status(400).json({
        message: "student_id and time_in are required",
      });
    }

    // ✅ FIXED: Proper timezone handling
    let scanTime;
    if (time_in.endsWith('Z')) {
      // If UTC time, convert to PK time (UTC+5)
      const utcDate = new Date(time_in);
      scanTime = new Date(utcDate.getTime() + (5 * 60 * 60 * 1000));
    } else {
      // If already local time, use as is
      scanTime = new Date(time_in);
    }

    // Validate date
    if (isNaN(scanTime.getTime())) {
      return res.status(400).json({
        message: "Invalid time_in format",
        received: time_in
      });
    }

    console.log("Parsed scanTime:", scanTime);
    console.log("PK Time:", scanTime.toLocaleString("en-US", { timeZone: "Asia/Karachi" }));

    // ✅ STEP 2: Extract Date only (YYYY-MM-DD)
    const dateStr = scanTime.toISOString().split("T")[0];
    console.log("Date string:", dateStr);

    // ✅ STEP 3: Prevent duplicate attendance
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

    // ✅ STEP 4: Get student record
    const student = await StudentModel.getByStudentId(student_id);
    if (!student || !student.class_id) {
      return res.status(404).json({
        message: "Student not found or class not assigned",
      });
    }

    // ✅ STEP 5: Fetch class schedule
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

    console.log("Class Info:", {
      start: classInfo.class_start_time,
      end: classInfo.class_end_time,
      days: classInfo.days
    });

    // ✅ STEP 6: Normalize Day check (Mon Tue Wed)
    const dayOfWeek = scanTime.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "Asia/Karachi"
    });
    const allowedDays = classInfo.days
      .split(",")
      .map((d) => d.trim().slice(0, 3));

    console.log("Today:", dayOfWeek, "Allowed Days:", allowedDays);

    if (!allowedDays.includes(dayOfWeek)) {
      return res.status(400).json({
        message: "No class today",
        today: dayOfWeek,
        allowed: allowedDays,
      });
    }

    // ✅ STEP 7: Convert Scan Time into Minutes (PK Time)
    const scanTotal = scanTime.getHours() * 60 + scanTime.getMinutes();
    console.log("Scan time in minutes:", scanTotal);

    // ✅ STEP 8: Convert SQL TIME → Minutes
    const [startH, startM] = classInfo.class_start_time.split(":").map(Number);
    const [endH, endM] = classInfo.class_end_time.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    console.log("Class time in minutes:", { startMinutes, endMinutes });

    // ✅ STEP 9: Validate time window
    if (scanTotal < startMinutes || scanTotal > endMinutes) {
      return res.status(400).json({
        message: "No class running at this time",
        allowed_time: `${classInfo.class_start_time} - ${classInfo.class_end_time}`,
        scan_time: scanTime.toLocaleTimeString("en-US", { timeZone: "Asia/Karachi" }),
        scan_minutes: scanTotal,
        start_minutes: startMinutes,
        end_minutes: endMinutes
      });
    }

    // ✅ STEP 10: Attendance logic
    let status = "present";
    let remarks = "On time";

    const delay = scanTotal - startMinutes;
    if (delay > 15) {
      status = "late";
      remarks = `Late by ${delay} mins`;
    }

    console.log("Attendance status:", { status, remarks, delay });

    // ✅ STEP 11: Save Attendance
    await AttendanceModel.markAttendance(
      student_id,
      status,
      remarks,
      dateStr,
      scanTime.toISOString() // Save the corrected time
    );

    res.status(201).json({
      success: true,
      message: `Attendance marked as ${status}`,
      details: {
        student_id,
        status,
        remarks,
        date: dateStr,
        scan_time: scanTime.toLocaleTimeString("en-US", { timeZone: "Asia/Karachi" }),
        class_time: `${classInfo.class_start_time} - ${classInfo.class_end_time}`
      },
    });
  } catch (error) {
    console.error("Attendance Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      received_data: {
        student_id,
        time_in
      }
    });
  }
};
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
