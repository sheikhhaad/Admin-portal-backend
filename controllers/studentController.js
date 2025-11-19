import { ApplicantModel } from "../models/applicantModel.js";
import { StudentModel } from "../models/studentModel.js";
import { generateStudentId } from "../models/studentModel.js";
// import cloudinary from "../config/cloudinary.js";
import QRCode from "qrcode";
// import uploadToDrive from "../utils/googleDrive.js";
import { executeQuery } from "../config/queryHelper.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

// Utility to sanitize Cloudinary IDs
const sanitizeId = (str) => str.replace(/[^a-zA-Z0-9]/g, "_");

export const addStudent = async (req, res) => {
  try {
    const {
      name,
      cnic = null,
      contact = null,
      address = null,
      email = null,
      course_id,
      class_id = null,
    } = req.body;

    if (!name || !course_id) {
      return res
        .status(400)
        .json({ error: "Name and Course ID are required fields!" });
    }

    // 1️⃣ Generate Student ID
    const student_id = await generateStudentId(course_id);
    const safeStudentId = sanitizeId(student_id);

    let studentImgUrl = null;
    let voucherUrl = null;

    // 2️⃣ Upload Student Photo (Buffer method)
    if (req.files?.student_img?.[0]) {
      const imgBuffer = req.files.student_img[0].buffer;
      const upload = await uploadBufferToCloudinary(
        imgBuffer,
        "students_images",
        `${safeStudentId}_photo`
      );
      studentImgUrl = upload.secure_url;
    }

    // 3️⃣ Upload Fee Voucher (Buffer method)
    if (req.files?.fee_voucher?.[0]) {
      const voucherBuffer = req.files.fee_voucher[0].buffer;
      const upload = await uploadBufferToCloudinary(
        voucherBuffer,
        "students_vouchers",
        `${safeStudentId}_voucher`
      );
      voucherUrl = upload.secure_url;
    }

    // 4️⃣ Generate QR → Convert Base64 PNG to Buffer → Upload
    const qrBase64 = await QRCode.toDataURL(student_id);
    const qrBuffer = Buffer.from(qrBase64.split(",")[1], "base64");

    const qrUpload = await uploadBufferToCloudinary(
      qrBuffer,
      "student_qr",
      `${safeStudentId}_qr`
    );

    const qrUrl = qrUpload.secure_url;

    // 5️⃣ Insert into DB
    await executeQuery(
      `INSERT INTO students 
        (student_id, student_img, name, cnic, contact, address, email, qr_url, course_id, class_id, voucher_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        studentImgUrl,
        name,
        cnic,
        contact,
        address,
        email,
        qrUrl,
        course_id,
        class_id,
        voucherUrl,
      ]
    );

    return res.status(201).json({
      success: true,
      student_id,
      message: "Student registered successfully!",
      student_img: studentImgUrl,
      voucher_url: voucherUrl,
      qr_url: qrUrl,
    });
  } catch (err) {
    console.error("Error in addStudent:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getByStudentId = async (req, res) => {
  try {
    const { student_id } = req.params;
    const students = await StudentModel.getByStudentId(student_id);
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await StudentModel.getAll();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};

export const registerStudent = async (req, res) => {
  try {
    const newStudent = await StudentModel.create(req.body);
    res
      .status(201)
      .json({ message: "Student registered successfully", newStudent });
  } catch (error) {
    res.status(500).json({ message: "Error registering student", error });
  }
};

export const approveStudents = async (req, res) => {
  try {
    const passedApplicants = await ApplicantModel.getPassed();

    let count = 0;
    for (const a of passedApplicants) {
      // Auto-generate student_id (like AIT01-0001)
      const studentId = await StudentModel.generateStudentId(a.course_id);

      await StudentModel.create({
        student_id: studentId,
        name: a.name,
        email: a.email,
        contact: a.contact,
        course_id: a.course_id,
      });

      await ApplicantModel.updateStatus(a.applicant_id, "admitted");
      count++;
    }

    res
      .status(200)
      .json({ message: "Students approved successfully", total: count });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error approving students", error: err.message });
  }
};
