import { AttendanceModel } from "../models/attendanceModel.js";

// ✅ Mark Attendance (QR Scan or Manual)
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
        message: "Error fetching all student attendance",
        error: error.message,
      });
  }
};
