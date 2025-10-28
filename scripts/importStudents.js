import fs from "fs";
import csv from "csv-parser";
import QRCode from "qrcode";
import { connectToDatabase } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

const importStudents = async () => {
  const connection = await connectToDatabase();
  const results = [];

  fs.createReadStream("students.csv")
    .pipe(csv())
    .on("data", (row) => results.push(row))
    .on("end", async () => {
      console.log(`📥 Found ${results.length} students in CSV.`);

      for (const student of results) {
        try {
          const qrText = student.student_id;

          // 1️⃣ Generate QR Code as base64
          const qrBuffer = await QRCode.toBuffer(qrText, { width: 300 });

          // 2️⃣ Upload to Cloudinary directly from buffer
          const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                { folder: "student_qr_codes", public_id: student.student_id },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              )
              .end(qrBuffer);
          });

          // 3️⃣ Store student in database with QR URL
          const query = `
            INSERT INTO students
              (student_id, name, cnic, contact, address, course, slot, campus, fee_amount, qr_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          await connection.execute(query, [
            student.student_id,
            student.name,
            student.cnic,
            student.contact,
            student.address,
            student.course,
            student.slot,
            student.campus,
            student.fee_amount || 0,
            uploadResult.secure_url,
          ]);

          console.log(`✅ Added ${student.name} (${student.student_id})`);
        } catch (error) {
          console.error(`❌ Failed for ${student.name}:`, error.message);
        }
      }

      console.log("🎉 Import complete with Cloudinary QR uploads!");
      process.exit();
    });
};

importStudents();
