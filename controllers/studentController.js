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
