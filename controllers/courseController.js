import { CourseModel } from "../models/courseModel.js";

// ✅ Add a new course
export const addCourse = async (req, res) => {
  try {
    const { course_id, course_name, description } = req.body;

    if (!course_id || !course_name) {
      return res
        .status(400)
        .json({ message: "Course ID and name are required" });
    }

    const insertedId = await CourseModel.createCourse(
      course_id,
      course_name,
      description
    );
    res.status(201).json({
      message: "✅ Course added successfully",
      course_id: insertedId,
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error adding course",
      error: error.message,
    });
  }
};

// ✅ Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await CourseModel.getAllCourses();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({
      message: "❌ Error fetching courses",
      error: error.message,
    });
  }
};

// ✅ Get single course by ID
export const getCourseById = async (req, res) => {
  try {
    const { course_id } = req.params;

    if (!course_id) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const course = await CourseModel.getCourseById(course_id);
    if (!course) {
      return res.status(404).json({ message: "❌ Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({
      message: "❌ Error fetching course",
      error: error.message,
    });
  }
};

// ✅ Update course
export const updateCourse = async (req, res) => {
  try {
    const { course_id } = req.params;

    if (!course_id) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const result = await CourseModel.updateCourse(course_id, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "❌ Error updating course",
      error: error.message,
    });
  }
};

// ✅ Delete course
export const deleteCourse = async (req, res) => {
  try {
    const { course_id } = req.params;

    if (!course_id) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const result = await CourseModel.deleteCourse(course_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "❌ Error deleting course",
      error: error.message,
    });
  }
};
