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

  createCourse: async (name, description, time, slot) => {
    const query = "INSERT INTO courses (name, description, class_time, slot) VALUES (?, ?, ?, ?)";
    const result = await executeQuery(query, [name, description, time, slot]);
    return result.insertId;
  },

  updateCourse: async (id, data) => {
    const query = "UPDATE courses SET name = ?, description = ?, class_time = ? , slot =? WHERE course_id = ?";
    await executeQuery(query, [data.name, data.description, data.time, data.slot, id]);
    return { message: "Course updated successfully" };
  },

  deleteCourse: async (id) => {
    const query = "DELETE FROM courses WHERE course_id = ?";
    await executeQuery(query, [id]);
    return { message: "Course deleted successfully" };
  },
};
