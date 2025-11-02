import { executeQuery } from "../config/queryHelper.js";

export const CourseModel = {
  getAllCourses: async () => {
    const query = "SELECT * FROM courses ORDER BY course_id DESC";
    return await executeQuery(query);
  },

  getCourseById: async (id) => {
    const query = "SELECT * FROM courses WHERE course_id = ?";
    const result = await executeQuery(query, [id]);
    return result[0];
  },

  createCourse: async (name, description, duration) => {
    const query = "INSERT INTO courses (name, description, duration) VALUES (?, ?, ?)";
    const result = await executeQuery(query, [name, description, duration]);
    return result.insertId;
  },

  updateCourse: async (id, data) => {
    const query = "UPDATE courses SET name = ?, description = ?, duration = ? WHERE course_id = ?";
    await executeQuery(query, [data.name, data.description, data.duration, id]);
    return { message: "Course updated successfully" };
  },

  deleteCourse: async (id) => {
    const query = "DELETE FROM courses WHERE course_id = ?";
    await executeQuery(query, [id]);
    return { message: "Course deleted successfully" };
  },
};
