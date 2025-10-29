import QRCode from "qrcode";
import cloudinary from "../config/cloudinary.js";
import { connectToDatabase } from "../config/db.js";

(async () => {
  try {
    const connection = await connectToDatabase();
    console.log("✅ MySQL Connected Successfully");

    const [students] = await connection.execute("SELECT student_id, name FROM students");

    for (const student of students) {
      const { student_id, name } = student;

      // Generate QR Code as a data URL
      const qrDataUrl = await QRCode.toDataURL(student_id);

      // Upload to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(qrDataUrl, {
        folder: "student_qr_codes",
        public_id: student_id,
      });

      // Update DB with the QR URL
      await connection.execute(
        "UPDATE students SET qr_url = ? WHERE student_id = ?",
        [uploadResponse.secure_url, student_id]
      );

      console.log(`✅ QR generated & uploaded for ${name} (${student_id})`);
    }

    console.log("🎉 All student QR codes generated and uploaded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error generating QR codes:", error);
    process.exit(1);
  }
})();
