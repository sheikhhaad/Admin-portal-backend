// config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let connection;

export const connectToDatabase = async () => {
  try {
    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
      console.log("✅ MySQL Connected Successfully (Async Mode)");
    }
    return connection;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};
