import fs from "fs";
import csv from "csv-parser";
import { connectToDatabase } from "../config/db.js";

const connection = await connectToDatabase();

fs.createReadStream("fees_dummy.csv")
  .pipe(csv())
  .on("data", async (row) => {
    const query = `
      INSERT INTO fees 
        (student_id, month, amount_paid, payment_status, payment_date, remarks)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [
      row.student_id,
      row.month,
      row.amount_paid,
      row.payment_status,
      row.payment_date || null,
      row.remarks || null,
    ]);
  })
  .on("end", () => {
    console.log("✅ All fees imported successfully!");
  });
