// config/queryHelper.js
import { connectToDatabase } from "./db.js";

export const executeQuery = async (query, params = []) => {
  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.execute(query, params);
    return rows;
  } catch (error) {
    console.error("❌ Query execution error:", error.message);
    throw error;
  }
};
