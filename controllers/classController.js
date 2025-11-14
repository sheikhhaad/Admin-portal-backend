import { ClassModel } from "../models/classModel.js";

// ✅ Create a new campus class
export const createClass = async (req, res) => {
  try {
    const {
      course_id,
      campus_name,
      class_time,
      class_start_time,
      class_end_time,
      days,
    } = req.body;

    if (!course_id || !campus_name || !class_start_time || !class_end_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const classId = await ClassModel.createCampusClass(
      course_id,
      campus_name,
      class_time,
      class_start_time,
      class_end_time,
      days
    );

    res.status(201).json({
      message: "✅ Class created successfully",
      class_id: classId,
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error creating class",
      error: error.message,
    });
  }
};

// ✅ Get class by ID
export const getClassById = async (req, res) => {
  try {
    const { class_id } = req.params;
    const classData = await ClassModel.getClassById(class_id);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json(classData);
  } catch (error) {
    res.status(500).json({
      message: "❌ Error fetching class",
      error: error.message,
    });
  }
};

// ✅ Get class time only
export const getClassTime = async (req, res) => {
  try {
    const { class_id } = req.params;
    const time = await ClassModel.getClassTime(class_id);

    res.status(200).json({ class_time: time });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error fetching class time",
      error: error.message,
    });
  }
};

// ✅ Get class schedule (start & end time)
export const getClassSchedule = async (req, res) => {
  try {
    const { class_id } = req.params;
    const schedule = await ClassModel.getClassSchedule(class_id);

    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({
      message: "❌ Error fetching class schedule",
      error: error.message,
    });
  }
};

// ✅ Get classes by day (e.g. 'Mon', 'Tue')
export const getClassesByDay = async (req, res) => {
  try {
    const { day } = req.params;
    const classes = await ClassModel.getCoursesByDay(day);

    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({
      message: "❌ Error fetching classes by day",
      error: error.message,
    });
  }
};

// ✅ Update class details
export const updateClass = async (req, res) => {
  try {
    const { class_id } = req.params;
    const result = await ClassModel.updateClassCampus(class_id, req.body);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "❌ Error updating class",
      error: error.message,
    });
  }
};