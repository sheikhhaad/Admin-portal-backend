import { ApplicantModel } from "../models/applicantModel.js";
import { StudentModel } from "../models/studentModel.js";
import { generateStudentId } from "../models/studentModel.js";
import cloudinary from "../config/cloudinary.js";
import QRCode from "qrcode";
import uploadToDrive from "../utils/googleDrive.js";
import { executeQuery } from "../config/queryHelper.js";

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

    // 1️⃣ Generate Course-wise Student ID
    const student_id = await generateStudentId(course_id);

    // 2️⃣ Upload Student Image to Cloudinary (optional)
    let studentImgUrl = null;
    if (req.files?.student_img?.[0]) {
      const upload = await cloudinary.uploader.upload(
        req.files.student_img[0].path,
        {
          folder: "students_images",
          public_id: `${student_id}_photo`,
        }
      );
      studentImgUrl = upload.secure_url;
    }

    // 3️⃣ Upload Fee Voucher to Cloudinary (optional)
    let voucherUrl = null;
    if (req.files?.fee_voucher?.[0]) {
      const upload = await cloudinary.uploader.upload(
        req.files.fee_voucher[0].path,
        {
          folder: "students_vouchers",
          public_id: `${student_id}_voucher`,
        }
      );
      voucherUrl = upload.secure_url;
    }

    // 4️⃣ Generate QR Code for Student ID
    const qrDataURL = await QRCode.toDataURL(student_id);
    const qrUpload = await cloudinary.uploader.upload(qrDataURL, {
      folder: "student_qr",
      public_id: `${student_id}_qr`,
    });
    const qrUrl = qrUpload.secure_url;

    // 5️⃣ Insert student into DB
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
