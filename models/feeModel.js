import { executeQuery } from "../config/queryHelper.js";

export const FeeModel = {
  getAllFees: async () => {
    const query = `
      SELECT f.*, s.name, s.course, s.campus
      FROM fees f
      JOIN students s ON f.student_id = s.id
      ORDER BY f.id DESC
    `;
    return await executeQuery(query);
  },

  getByStudent: async (student_id) => {
    const query = `
      SELECT * FROM fees
      WHERE student_id = ?
      ORDER BY id DESC
    `;
    return await executeQuery(query, [student_id]);
  },

  markAsPaid: async (student_id, month, amount) => {
    const query = `
      INSERT INTO fees (student_id, month, amount, paid, payment_date)
      VALUES (?, ?, ?, 1, CURDATE())
      ON DUPLICATE KEY UPDATE paid = 1, payment_date = CURDATE();
    `;
    return await executeQuery(query, [student_id, month, amount]);
  },

  getUnpaidStudents: async (month) => {
    const query = `
      SELECT s.id, s.name, s.contact, s.course, s.campus
      FROM students s
      LEFT JOIN fees f ON s.id = f.student_id AND f.month = ?
      WHERE f.paid IS NULL OR f.paid = 0;
    `;
    return await executeQuery(query, [month]);
  },
};
