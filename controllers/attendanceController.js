import { AttendanceModel } from "../models/attendanceModel.js";

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

// ✅ Get Today’s Attendance
export const getTodayAttendance = async (req, res) => {
  try {
    const records = await AttendanceModel.getTodayAttendance();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance", error: error.message });
  }
};

// ✅ Get a Student’s Attendance History
export const getStudentAttendance = async (req, res) => {
  try {
    const { student_id } = req.params;
    const records = await AttendanceModel.getStudentAttendance(student_id);
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student attendance", error: error.message });
  }
};
