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

  // ✅ Fetch all users (useful for Admin)
  getAll: async () => {
    const query = "SELECT id, name, email, role, created_at FROM users";
    return await executeQuery(query);
  },

  // ✅ Delete user by ID (Admin / Receptionist control)
  delete: async (id) => {
    const query = "DELETE FROM users WHERE id = ?";
    const result = await executeQuery(query, [id]);
    return result.affectedRows;
  },

  // ✅ Update user info (optional)
  update: async (id, { name, email, role }) => {
    const query = `
      UPDATE users
      SET name = ?, email = ?, role = ?
      WHERE id = ?
    `;
    const result = await executeQuery(query, [name, email, role, id]);
    return result.affectedRows;
  },

  updatePassword: async (id, hashedPassword) => {
    const query = "UPDATE users SET password = ? WHERE id = ?";
    const result = await executeQuery(query, [hashedPassword, id]);
    return result.affectedRows;
  },
};
