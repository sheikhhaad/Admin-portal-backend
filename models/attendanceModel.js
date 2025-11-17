import { executeQuery } from "../config/queryHelper.js";

export const AttendanceModel = {
  getAllAttendance: async () => {
    return await executeQuery("SELECT * FROM attendance");
  },

  // ✅ Check if already marked today
  // checkAlreadyMarked: async (student_id, date = null) => {
  //   const query = `
  //   SELECT id FROM attendance
  //   WHERE student_id = ? AND date = ?
  // `;
  //   const today = date || new Date().toISOString().split("T")[0];
  //   const rows = await executeQuery(query, [student_id, today]);
  //   return rows.length > 0;
  // },

  checkAlreadyMarked: async (student_id, time_in) => {
    const date = new Date(time_in).toISOString().split("T")[0]; // extract YYYY-MM-DD
    const query = `
    SELECT id FROM attendance
    WHERE student_id = ? AND date = ?
  `;
    const result = await executeQuery(query, [student_id, date]);
    return result.length > 0;
  },

  // ✅ Mark Attendance
  // markAttendance: async (student_id, status, remarks, time_in) => {
  //   const query = `
  //   INSERT INTO attendance (
  //     student_id, status, date, time_in, remarks, created_at
  //   ) VALUES (?, ?, CURDATE(), CURTIME(), ?, NOW())
  // `;
  //   const values = [student_id, status, time_in, remarks];
  //   return await executeQuery(query, values);
  // },

  markAttendance: async (student_id, status, remarks, time_in) => {
    const query = `
    INSERT INTO attendance (
      student_id, status, date, time_in, remarks, created_at
    ) VALUES (?, ?, CURDATE(), ?, ?, NOW())
  `;
    const values = [student_id, status, time_in, remarks];
    return await executeQuery(query, values);
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
