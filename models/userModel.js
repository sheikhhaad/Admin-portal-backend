import { executeQuery } from "../config/queryHelper.js";

export const UserModel = {
  findByEmail: async (email) => {
    const query = "SELECT * FROM users WHERE email = ?";
    const rows = await executeQuery(query, [email]);
    return rows[0];
  },
  
  create: async (name, email, hashedPassword, role) => {
    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    const result = await executeQuery(query, [
      name,
      email,
      hashedPassword,
      role,
    ]);
    return result.insertId;
  },
};
