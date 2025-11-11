// config/queryHelper.js
import { connectToDatabase } from "./db.js";

export const executeQuery = async (query, params = []) => {
  const pool = connectToDatabase();
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (err) {
    console.error("❌ Query execution error:", err.message);
    throw err;
  }
};
