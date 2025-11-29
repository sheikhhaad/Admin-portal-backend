// models/applicantModel.js
import { executeQuery } from "../config/queryHelper.js";

export const ApplicantModel = {
  updateRegistrationAndQR: async (
    applicant_id,
    registration_no,
    qr_code_url
  ) => {
    const query = `
    UPDATE applicants 
    SET registration_no = ?, qr_code_url = ? 
    WHERE applicant_id = ?
  `;
    return await executeQuery(query, [
      registration_no,
      qr_code_url,
      applicant_id,
    ]);
  },

  saveQrUrl: async (applicant_id, qr_url) => {
    const query = "UPDATE applicants SET qr_url = ? WHERE applicant_id = ?";
    return await executeQuery(query, [qr_url, applicant_id]);
  },

  // ➕ Create new applicant
  create: async (data) => {
    const query = `
      INSERT INTO applicants 
        (name, father_name, contact, cnic, email, address, city, gender, qualification,
         course_id, class_id, applicant_img, register_fee, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;

    const params = [
      data.name,
      data.father_name,
      data.contact,
      data.cnic,
      data.email,
      data.address,
      data.city,
      data.gender,
      data.qualification,
      data.course_id,
      data.class_id,
      data.applicant_img,
      data.register_fee,
    ];

    const result = await executeQuery(query, params);
    return result.insertId;
  },

  findByEmail: async (email) => {
    const r = await executeQuery(
      "SELECT * FROM applicants WHERE email = ? LIMIT 1",
      [email]
    );
    return r[0];
  },

  findByCnic: async (cnic) => {
    const r = await executeQuery(
      "SELECT * FROM applicants WHERE cnic = ? LIMIT 1",
      [cnic]
    );
    return r[0];
  },

  findByContact: async (contact) => {
    const r = await executeQuery(
      "SELECT * FROM applicants WHERE contact = ? LIMIT 1",
      [contact]
    );
    return r[0];
  },

  updateStatus: async (applicant_id, status) => {
    const result = await executeQuery(
      "UPDATE applicants SET status = ? WHERE applicant_id = ?",
      [status, applicant_id]
    );

    return result.affectedRows > 0;
  },

  getPassed: async () => {
    return await executeQuery(
      "SELECT * FROM applicants WHERE status = 'passed'"
    );
  },

  getAll: async () => {
    return await executeQuery(
      "SELECT * FROM applicants ORDER BY created_at DESC"
    );
  },

  delete: async (applicant_id) => {
    const result = await executeQuery(
      "DELETE FROM applicants WHERE applicant_id = ?",
      [applicant_id]
    );
    return result.affectedRows > 0;
  },
};
