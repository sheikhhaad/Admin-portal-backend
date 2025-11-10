import { ApplicantModel } from "../models/applicantModel.js";

export const registerApplicant = async (req, res) => {
  try {
    const { name, email, phone, course_id } = req.body;
    if (!name || !email || !course_id)
      return res.status(400).json({ message: "Required fields missing" });

    const exists = await ApplicantModel.findByEmail(email);
    if (exists)
      return res.status(400).json({ message: "Applicant already exists" });

    const id = await ApplicantModel.create({ name, email, phone, course_id });
    res.status(201).json({ message: "Applicant registered successfully", id });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering applicant", error: err.message });
  }
};
