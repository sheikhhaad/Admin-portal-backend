// controllers/applicantController.js
import { ApplicantModel } from "../models/applicantModel.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

// Utility to clean file names
const sanitizeId = (str) => str.replace(/[^a-zA-Z0-9]/g, "_");

// ➕ Register new applicant
export const createApplicant = async (req, res) => {
  try {
    const {
      name,
      father_name,
      contact,
      cnic,
      email,
      address,
      city,
      gender,
      qualification,
      course_id,
      class_id,
    } = req.body;

    // Required validation
    if (!name || !contact || !cnic || !course_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // DUPLICATE CHECK → contact or CNIC same NOT allowed
    const existingByContact = await ApplicantModel.findByContact(contact);
    const existingByCnic = await ApplicantModel.findByCnic(cnic);

    if (existingByContact || existingByCnic) {
      return res.status(409).json({
        success: false,
        message: "Applicant already registered!",
      });
    }
    const makeCloudinaryName = (name, type) => {
      const clean = name.replace(/[^a-zA-Z0-9]/g, "_");
      const random = Math.floor(Math.random() * 100000);
      return `APP_${clean}_${Date.now()}_${random}_${type}`;
    };

    // Upload applicant photo
    let applicantImgUrl = null;
    if (req.files?.applicant_img?.[0]) {
      const buffer = req.files.applicant_img[0].buffer;
      applicantImgUrl = (
        await uploadBufferToCloudinary(
          buffer,
          "applicants/photos",
          makeCloudinaryName(name, "photo")
        )
      ).secure_url;
    }

    // Upload fee slip
    let registerFeeUrl = null;
    if (req.files?.register_fee?.[0]) {
      const buffer = req.files.register_fee[0].buffer;
      registerFeeUrl = (
        await uploadBufferToCloudinary(
          buffer,
          "applicants/fee_slips",
          makeCloudinaryName(name, "fee")
        )
      ).secure_url;
    }

    // Create record
    const applicantId = await ApplicantModel.create({
      name,
      father_name,
      contact,
      cnic,
      email,
      address: address || null,
      city: city || null,
      gender,
      qualification,
      course_id,
      class_id,
      applicant_img: applicantImgUrl || null,
      register_fee: registerFeeUrl || null,
    });

    res.status(201).json({
      success: true,
      message: "Applicant registered successfully",
      applicant_id: applicantId,
      applicant_img: applicantImgUrl,
      register_fee: registerFeeUrl,
    });
  } catch (error) {
    console.error("APPLICANT CREATE ERROR:", error);
    res.status(500).json({
      message: "Error creating applicant",
      error: error.message,
    });
  }
};

// 🔍 Get applicant by email
export const getApplicantByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const applicant = await ApplicantModel.findByEmail(email);
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    res.status(200).json(applicant);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching applicant by email",
      error: error.message,
    });
  }
};

// 🔍 Get applicant by CNIC
export const getApplicantByCnic = async (req, res) => {
  try {
    const { cnic } = req.params;
    const applicant = await ApplicantModel.findByCnic(cnic);
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    res.status(200).json(applicant);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching applicant by CNIC",
      error: error.message,
    });
  }
};

// 🔄 Update applicant status
export const updateApplicantStatus = async (req, res) => {
  try {
    const { applicant_id } = req.params;
    const { status } = req.body;
    const updated = await ApplicantModel.updateStatus(applicant_id, status);
    if (!updated) {
      return res
        .status(404)
        .json({ message: "Applicant not found or status not updated" });
    }
    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error updating applicant status",
      error: error.message,
    });
  }
};

// 📋 Get all applicants
export const getAllApplicants = async (req, res) => {
  try {
    const applicants = await ApplicantModel.getAll();
    res.status(200).json(applicants);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching applicants",
      error: error.message,
    });
  }
};

// 🧾 Get all passed applicants
export const getPassedApplicants = async (req, res) => {
  try {
    const applicants = await ApplicantModel.getPassed();
    res.status(200).json(applicants);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching passed applicants",
      error: error.message,
    });
  }
};

// ❌ Delete applicant
export const deleteApplicant = async (req, res) => {
  try {
    const { applicant_id } = req.params;
    const deleted = await ApplicantModel.delete(applicant_id);
    if (!deleted) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    res.status(200).json({ message: "Applicant deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting applicant",
      error: error.message,
    });
  }
};
