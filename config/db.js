// config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let pool;

export const connectToDatabase = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10, // ✅ Multiple simultaneous connections
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
      // ✅ optional: force the latest authentication & TLS handling
      ssl: { rejectUnauthorized: false },
    });
    console.log("✅ MySQL 8.3 Pool Created Successfully (Async Mode)");
  }
  return pool;
};
