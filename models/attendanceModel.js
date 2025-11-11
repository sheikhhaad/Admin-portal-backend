import { executeQuery } from "../config/queryHelper.js";

export const AttendanceModel = {
  getAllAttendence: async () => {
    return await executeQuery("SELECT * FROM attendence")
  },

  // ✅ Check if already marked today
  checkAlreadyMarked: async (student_id) => {
    const query = `
      SELECT * FROM attendance
      WHERE student_id = ? AND date = CURDATE()
    `;
    const rows = await executeQuery(query, [student_id]);
    return rows.length > 0;
  },

  // ✅ Mark Attendance
  markAttendance: async (student_id, status, remarks) => {
    const query = `
      INSERT INTO attendance (student_id, status, date, time_in, remarks)
      VALUES (?, ?, CURDATE(), CURTIME(), ?)
    `;
    return await executeQuery(query, [student_id, status, remarks]);
  },

  getTodayAttendance: async () => {
    const query = `
      SELECT a.id, s.name, a.status, a.time_in, a.remarks
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.date = CURDATE()
      ORDER BY a.time_in ASC
    `;
    return await executeQuery(query);
  },

  getStudentAttendance: async (student_id) => {
    const query = `
      SELECT date, status, time_in, remarks
      FROM attendance
      WHERE student_id = ?
      ORDER BY date DESC
    `;
    return await executeQuery(query, [student_id]);
  },
};
