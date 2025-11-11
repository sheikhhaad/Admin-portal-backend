import { AttendanceModel } from "../models/attendanceModel.js";
import { CourseModel } from "../models/courseModel.js";


// export const markAttendance = async (req, res) => {
//   try {
//     const { student_id } = req.body;
//     if (!student_id)
//       return res.status(400).json({ message: "Student ID required" });

//     // Check if already marked for today
//     const already = await AttendanceModel.checkAlreadyMarked(student_id);
//     if (already)
//       return res.status(200).json({ message: "Already marked present today" });

//     // Mark as present
//     const now = new Date();
//     await AttendanceModel.markAttendance(student_id, "present", "QR Scan", now);

//     res.status(200).json({
//       message: "✅ Attendance marked successfully",
//       student_id,
//       status: "present",
//       time: now,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error marking attendance", error: error.message });
//   }
// };

// ✅ Mark Attendance (QR Scan or Manual)
// npm install node-cron




// ✅ Mark Attendance (QR Scan or Manual)
export const markAttendance = async (req, res) => {
  try {
    const { student_id, time_in } = req.body;

    if (!student_id) {
      return res.status(400).json({ message: "student_id is required" });
    }

    const alreadyMarked = await AttendanceModel.checkAlreadyMarked(student_id);
    if (alreadyMarked) {
      return res.status(400).json({
        message: "Attendance already marked for this student today.",
      });
    }

    // Class starts at 9:00 AM (example)
    const classStartTime = new Date();
    classStartTime.setHours(9, 0, 0, 0);

    const now = new Date();
    const delayMinutes = Math.floor((now - classStartTime) / 60000);

    let status = "present";
    let remarks = "On time";

    if (delayMinutes > 5 && delayMinutes <= 20) {
      status = "late";
      remarks = `Late by ${delayMinutes} mins`;
    } else if (delayMinutes > 20) {
      status = "absent";
      remarks = "Exceeded late grace period";
    }

    await AttendanceModel.markAttendance(student_id, status, remarks);

    res.status(201).json({
      message: `Attendance marked as ${status}`,
      details: { student_id, status, remarks },
    });
  } catch (error) {
    res.status(500).json({ message: "Error marking attendance", error: error.message });
  }
};

export const autoMarkAbsentees = async (req, res) => {
  try {
    const today = new Date();
    const currentDay = today.toLocaleString("en-US", { weekday: "short" }); // e.g. "Mon"
    const todayDate = today.toISOString().split("T")[0]; // yyyy-mm-dd

    // 🔍 Get all courses whose 'days' include today
    const courses = await CourseModel.getCoursesByDay(currentDay);

    if (!courses.length)
      return res.status(200).json({ message: "No classes scheduled today" });

    let totalAbsent = 0;

    for (const course of courses) {
      const { course_id, class_end_time } = course;

      // Convert end time to Date for comparison
      const [endH, endM] = class_end_time.split(":");
      const classEnd = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        endH,
        endM
      );

      // Run only after class end
      if (today < classEnd) continue;

      // 🔍 Fetch all students of this course
      const students = await StudentModel.getByCourse(course_id);

      for (const student of students) {
        // Check if attendance exists for today
        const isMarked = await AttendanceModel.checkAlreadyMarked(
          student.student_id
        );

        if (!isMarked) {
          await AttendanceModel.markAttendance(
            student.student_id,
            "absent",
            "Did not attend / no scan",
            classEnd
          );
          totalAbsent++;
        }
      }
    }

    res.status(200).json({
      status: `Absent`,
      message: `Auto-absent process complete.`,
      totalAbsent,
    });
  } catch (error) {
    console.error("Auto-absent error:", error);
    res.status(500).json({
      message: "Error auto-marking absentees",
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
