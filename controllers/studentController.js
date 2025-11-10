import { ApplicantModel } from "../models/applicantModel.js";
import { StudentModel } from "../models/studentModel.js";

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
    res.status(201).json({ message: "Student registered successfully", newStudent });
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

    res.status(200).json({ message: "Students approved successfully", total: count });
  } catch (err) {
    res.status(500).json({ message: "Error approving students", error: err.message });
  }
};
