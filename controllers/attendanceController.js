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

    // ✅ Step 1: Check if already marked on same date
    const alreadyMarked = await AttendanceModel.checkAlreadyMarked(
      student_id,
      time_in
    );
    if (alreadyMarked) {
      return res.status(400).json({
        status: "Already Marked",
        message: "Attendance already marked for this student on this date.",
      });
    }

    // ✅ Step 2: Get student and class info
    const student = await StudentModel.getByStudentId(student_id);
    console.log("Student fetched:", student);

    if (!student || !student.class_id) {
      console.log("❌ Student not found or class_id missing");
      return res.status(404).json({ message: "Student or class not found" });
    }

    const classInfo = await ClassModel.getClassSchedule(student.class_id);
    console.log("Class schedule:", classInfo);

    if (!classInfo || !classInfo.start || !classInfo.end || !classInfo.days) {
      console.log("❌ Class schedule incomplete or missing");
      return res
        .status(404)
        .json({ message: "Class schedule not found or incomplete" });
    }

    // ✅ Step 3: Parse time_in and adjust to PKT
    const now = new Date(time_in);
    now.setHours(now.getHours() + 5); // Adjust to PKT if server is in UTC

    // ✅ Step 4: Check if today is a valid class day
    const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "short" }); // e.g. "Mon"
    const allowedDays = classInfo.days.split(",").map((d) => d.trim()); // e.g. ["Mon", "Tue", "Wed"]

    if (!allowedDays.includes(dayOfWeek)) {
      return res.status(400).json({
        message: "No class scheduled on this day",
        details: { dayOfWeek, allowedDays },
      });
    }

    // ✅ Step 5: Parse class start and end times
    const [startHour, startMin] = classInfo.start.split(":");
    const [endHour, endMin] = classInfo.end.split(":");

    const classStart = new Date(now);
    classStart.setHours(parseInt(startHour), parseInt(startMin), 0, 0);

    const classEnd = new Date(now);
    classEnd.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

    // ✅ Step 6: Reject if outside class time
    if (now < classStart || now > classEnd) {
      return res.status(400).json({
        message: "No class in session at this time",
        details: { classStart, classEnd, now },
      });
    }

    // ✅ Step 7: Calculate delay and decide status
    const delayMinutes = Math.floor((now - classStart) / 60000);
    let status = "present";
    let remarks = "On time";

    if (delayMinutes > 15) {
      status = "late";
      remarks = `Late by ${delayMinutes} mins`;
    }

    console.log("Delay:", delayMinutes, "Status:", status);

    // ✅ Step 8: Mark attendance
    await AttendanceModel.markAttendance(student_id, status, remarks, time_in);

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

    // 🔍 Get all classes scheduled today
    const classes = await ClassModel.getCoursesByDay(currentDay);

    if (!classes.length) {
      return res.status(200).json({ message: "No classes scheduled today" });
    }

    let totalAbsent = 0;

    for (const cls of classes) {
      const { class_id, course_id, class_end_time } = cls;

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

      for (const student of students) {
        // Check if attendance already marked today
        const isMarked = await AttendanceModel.checkAlreadyMarked(
          student.student_id,
          todayDate // ✅ Pass date to avoid false positives
        );

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
    const records = await AttendanceModel.getAllAttendence();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching all student attendance",
      error: error.message,
    });
  }
};
