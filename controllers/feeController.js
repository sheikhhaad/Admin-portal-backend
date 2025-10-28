import { FeeModel } from "../models/feeModel.js";

// ✅ Mark Fee as Paid
export const payFee = async (req, res) => {
  try {
    const { student_id, month, amount } = req.body;
    if (!student_id || !month || !amount) {
      return res.status(400).json({ message: "student_id, month, and amount are required" });
    }

    await FeeModel.markAsPaid(student_id, month, amount);
    res.status(200).json({ message: "Fee marked as paid successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error marking fee as paid", error: error.message });
  }
};

// ✅ Get Fee History for a Student
export const getFeeHistory = async (req, res) => {
  try {
    const { student_id } = req.params;
    const records = await FeeModel.getByStudent(student_id);
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fee history", error: error.message });
  }
};

// ✅ Get All Fees (Admin View)
export const getAllFees = async (req, res) => {
  try {
    const fees = await FeeModel.getAllFees();
    res.status(200).json(fees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all fees", error: error.message });
  }
};

// ✅ Get Unpaid Students (for reminders)
export const getUnpaidStudents = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ message: "month is required" });

    const unpaidList = await FeeModel.getUnpaidStudents(month);
    res.status(200).json(unpaidList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching unpaid students", error: error.message });
  }
};
