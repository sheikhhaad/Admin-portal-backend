// controllers/applicantController.js
import { ApplicantModel } from "../models/applicantModel.js";

// ➕ Register new applicant
export const createApplicant = async (req, res) => {
  try {
    const applicantId = await ApplicantModel.create(req.body);
    res
      .status(201)
      .json({
        applicant_id: applicantId,
        message: "Applicant registered successfully",
      });
  } catch (error) {
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
