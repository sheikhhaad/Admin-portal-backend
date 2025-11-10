// models/applicantModel.js
import { executeQuery } from "../config/queryHelper.js";

export const ApplicantModel = {
  // ➕ Register new applicant
  create: async ({ name, email, phone, course_id }) => {
    const query = `
      INSERT INTO applicants (name, email, phone, course_id, status)
      VALUES (?, ?, ?, ?, 'pending')
    `;
    const result = await executeQuery(query, [name, email, phone, course_id]);
    return result.insertId;
  },

  // 🔍 Find applicant by email
  findByEmail: async (email) => {
    const query = `SELECT * FROM applicants WHERE email = ? LIMIT 1`;
    const result = await executeQuery(query, [email]);
    return result[0];
  },

  // 🔄 Update applicant status
  updateStatus: async (applicant_id, status) => {
    const query = `UPDATE applicants SET status = ? WHERE applicant_id = ?`;
    const result = await executeQuery(query, [status, applicant_id]);
    return result.affectedRows > 0;
  },

  // 🧾 Get all passed applicants
  getPassed: async () => {
    const query = `SELECT * FROM applicants WHERE status = 'passed'`;
    const result = await executeQuery(query);
    return result;
  },

  // 📋 Get all applicants (for admin view)
  getAll: async () => {
    const query = `SELECT * FROM applicants ORDER BY created_at DESC`;
    const result = await executeQuery(query);
    return result;
  },
};
