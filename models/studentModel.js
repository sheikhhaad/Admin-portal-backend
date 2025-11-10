import { executeQuery } from "../config/queryHelper.js";

export const StudentModel = {
  getAll: async () => {
    return await executeQuery("SELECT * FROM students");
  },

  getById: async (id) => {
    return await executeQuery("SELECT * FROM students WHERE id = ?", [id]);
  },

  create: async (data) => {
    const { name, cnic, contact, address, course_id } = data;
    const query = `
      INSERT INTO students (name, cnic, contact, address, course_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    return await executeQuery(query, [name, cnic, contact, address, course_id]);
  },

  getByCourse: async (course_id) => {
    const result = await executeQuery(
      "SELECT * FROM students WHERE course_id = ?",
      [course_id]
    );
    return result;
  },

  generateStudentId: async (course_id) => {
    const prefix = course_id.toUpperCase(); // e.g. AIT01
    const countResult = await executeQuery(
      "SELECT COUNT(*) AS total FROM students WHERE course_id = ?",
      [course_id]
    );
    const next = countResult[0].total + 1;
    return `${prefix}-${String(next).padStart(4, "0")}`; // ✅ e.g. AIT01-0001
  },
};
