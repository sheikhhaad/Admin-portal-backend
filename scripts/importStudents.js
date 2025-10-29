import fs from "fs";
import csv from "csv-parser";
import { connectToDatabase } from "../config/db.js";



const connection = await connectToDatabase();

fs.createReadStream("fees_dummy.csv")
  .pipe(csv())
  .on("data", async (row) => {
    const query = `
      INSERT INTO students 
        (student_id, name, cnic, contact, address, course_id, class_time, slot, campus, fee_amount, qr_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [
      row.student_id,
      row.name,
      row.cnic,
      row.contact,
      row.address,
      row.course_id,
      row.class_time,
      row.slot,
      row.campus,
      row.fee_amount,
      row.qr_url || null,
    ]);
  })
  .on("end", () => {
    console.log("✅ All students imported successfully!");
  });



//   import QRCode from "qrcode";
// import { v2 as cloudinary } from "cloudinary";

// // Inside import loop
// const qrBuffer = await QRCode.toBuffer(row.student_id);
// const uploadResult = await new Promise((resolve, reject) => {
//   cloudinary.uploader.upload_stream(
//     { folder: "student_qr_codes", public_id: row.student_id },
//     (error, result) => error ? reject(error) : resolve(result)
//   ).end(qrBuffer);
// });

// await connection.execute(query, [..., uploadResult.secure_url]);
