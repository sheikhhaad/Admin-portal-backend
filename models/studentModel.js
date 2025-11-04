import { executeQuery } from "../config/queryHelper.js";

export const StudentModel = {
  getAll: async () => {
    return await executeQuery("SELECT * FROM students");
  },

  getById: async (id) => {
    return await executeQuery("SELECT * FROM students WHERE id = ?", [id]);
  },

  create: async (data) => {
    const { name, cnic, contact, address, course_id} = data;
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
};
