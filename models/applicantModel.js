// models/applicantModel.js
import { executeQuery } from "../config/queryHelper.js";

export const ApplicantModel = {
  // ➕ Register new applicant
  create: async ({
    name,
    father_name,
    contact,
    cnic,
    email,
    address,
    city,
    gender,
    qualification,
    course_id,
    class_id,
    student_img,
    register_fee,
  }) => {
    const query = `
      INSERT INTO applicants 
        (name, father_name, contact, cnic, email, address, gender, qualification, 
         course_id, class_id, student_img, register_fee, status, created_at)
      VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;
    const params = [
      name,
      father_name,
      contact,
      cnic,
      email,
      address,
      city,
      gender,
      qualification,
      course_id,
      class_id,
      student_img,
      register_fee,
    ];
    const result = await executeQuery(query, params);
    return result.insertId;
  },

  // 🔍 Find applicant by email
  findByEmail: async (email) => {
    const query = `SELECT * FROM applicants WHERE email = ? LIMIT 1`;
    const result = await executeQuery(query, [email]);
    return result[0];
  },

  // 🔍 Find applicant by CNIC
  findByCnic: async (cnic) => {
    const query = `SELECT * FROM applicants WHERE cnic = ? LIMIT 1`;
    const result = await executeQuery(query, [cnic]);
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
  // ❌ Delete applicant
  delete: async (applicant_id) => {
    const query = `DELETE FROM applicants WHERE applicant_id = ?`;
    const result = await executeQuery(query, [applicant_id]);
    return result.affectedRows > 0;
  },
};
