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
      return res
        .status(400)
        .json({ message: "student_id and time_in are required" });
    }

    // Convert scan time into Date object
    const scanTime = new Date(time_in);

    // Extract date only (YYYY-MM-DD)
    const dateStr = scanTime.toISOString().split("T")[0];

    // Step 1: Check if already marked today
    const alreadyMarked = await AttendanceModel.checkAlreadyMarked(
      student_id,
      dateStr
    );
    if (alreadyMarked) {
      return res.status(400).json({
        status: "Already Marked",
        message: "Attendance already marked for this student on this date.",
      });
    }

    // Step 2: Get student + class info
    const student = await StudentModel.getByStudentId(student_id);
    if (!student || !student.class_id) {
      return res.status(404).json({ message: "Student or class not found" });
    }

    const classInfo = await ClassModel.getClassSchedule(student.class_id);
    if (!classInfo || !classInfo.start || !classInfo.end || !classInfo.days) {
      return res
        .status(404)
        .json({ message: "Class schedule not found or incomplete" });
    }

    // Step 3: Validate class day
    const dayOfWeek = scanTime.toLocaleDateString("en-US", {
      weekday: "short",
    }); // e.g. "Mon"
    const allowedDays = classInfo.days.split(",").map((d) => d.trim());

    if (!allowedDays.includes(dayOfWeek)) {
      return res.status(400).json({
        message: "No class scheduled on this day",
        details: { dayOfWeek, allowedDays },
      });
    }

    // Step 4: Convert scan time into minutes
    const scanHour = scanTime.getHours();
    const scanMin = scanTime.getMinutes();
    const scanTotalMinutes = scanHour * 60 + scanMin;

    // Step 5: Convert SQL TIME to minutes
    const [startH, startM] = classInfo.start.split(":").map(Number);
    const [endH, endM] = classInfo.end.split(":").map(Number);

    const classStartMinutes = startH * 60 + startM;
    const classEndMinutes = endH * 60 + endM;

    // Step 6: Validate class time window
    if (
      scanTotalMinutes < classStartMinutes ||
      scanTotalMinutes > classEndMinutes
    ) {
      return res.status(400).json({
        message: "No class in session at this time",
        details: {
          classStart: classInfo.start,
          classEnd: classInfo.end,
          scanTime: `${scanHour}:${scanMin}`,
        },
      });
    }

    // Step 7: Calculate delay (for Late)
    const delay = scanTotalMinutes - classStartMinutes;
    let status = "present";
    let remarks = "On time";

    if (delay > 15) {
      status = "late";
      remarks = `Late by ${delay} mins`;
    }

    // Step 8: Save attendance
    await AttendanceModel.markAttendance(
      student_id,
      status,
      remarks,
      dateStr,
      time_in
    );

    res.status(201).json({
      message: `Attendance marked as ${status}`,
      details: { student_id, status, remarks, time_in },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error marking attendance",
      error: error.message,
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
