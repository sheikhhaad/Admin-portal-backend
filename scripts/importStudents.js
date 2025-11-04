// import fs from "fs";
// import csv from "csv-parser";
// import { connectToDatabase } from "../config/db.js";

// const connection = await connectToDatabase();
// const students = [];

// fs.createReadStream("students_dummy.csv")
//   .pipe(csv())
//   .on("data", (row) => {
//     students.push(row);
//   })
//   .on("end", async () => {
//     const query = `
//       INSERT INTO students 
//         (student_id, student_img, name, cnic, contact, address, course_id, fee_amount, qr_url)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     for (const row of students) {
//       await connection.execute(query, [
//         row.student_id,
//         row.student_img || null,
//         row.name,
//         row.cnic,
//         row.contact,
//         row.address,
//         row.course_id,
//         row.fee_amount || null,
//         row.qr_url || null,
//       ]);
//     }

//     console.log("✅ All students imported successfully!");
//   });

import QRCode from "qrcode";
import { v2 as cloudinary } from "cloudinary";

// Inside import loop
const qrBuffer = await QRCode.toBuffer(row.student_id);
const uploadResult = await new Promise((resolve, reject) => {
  cloudinary.uploader.upload_stream(
    { folder: "student_qr_codes", public_id: row.student_id },
    (error, result) => error ? reject(error) : resolve(result)
  ).end(qrBuffer);
});

await connection.execute(query, [...uploadResult.secure_url]);
