import { executeQuery } from "../config/queryHelper.js";

export const StudentModel = {
  getAll: async () => {
    return await executeQuery("SELECT * FROM students");
  },

  getById: async (id) => {
    return await executeQuery("SELECT * FROM students WHERE id = ?", [id]);
  },

  create: async (data) => {
    const { name, cnic, contact, address, course, slot, campus } = data;
    const query = `
      INSERT INTO students (name, cnic, contact, address, course, slot, campus)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    return await executeQuery(query, [name, cnic, contact, address, course, slot, campus]);
  },
};
