//courseModel.js
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

  createCourse: async (course_id, course_name, description) => {
    const query =
      "INSERT INTO courses (course_id, course_name, description) VALUES (?, ?, ?)";
    const result = await executeQuery(query, [
      course_id,
      course_name,
      description,
    ]);
    return result.insertId;
  },

  // updateCourse: async (course_id, data) => {
  //   try {
  //     // 1️⃣ Filter out undefined or null keys (so only valid fields remain)
  //     const validFields = Object.entries(data).filter(
  //       ([_, value]) => value !== undefined && value !== null
  //     );

  //     if (validFields.length === 0) {
  //       throw new Error("No valid fields to update");
  //     }

  //     // 2️⃣ Build query dynamically
  //     const setClause = validFields.map(([key]) => `${key} = ?`).join(", ");
  //     const values = validFields.map(([_, value]) => value);

  //     const query = `UPDATE courses SET ${setClause} WHERE course_id = ?`;
  //     values.push(course_id); // course_id at the end

  //     // 3️⃣ Log for debugging
  //     console.log("Executing query:", query);
  //     console.log("With values:", values);

  //     await executeQuery(query, values);
  //     return { message: "✅ Course updated successfully" };
  //   } catch (error) {
  //     console.error("Error updating course:", error);
  //     throw error;
  //   }
  // },

  updateCourse: async (id, data) => {
    const query =
      "UPDATE courses SET course_name = ?, description = ? WHERE course_id = ?";
    await executeQuery(query, [data.course_name, data.description, id]);
    return { message: "Course updated successfully" };
  },

  deleteCourse: async (id) => {
    const query = "DELETE FROM courses WHERE course_id = ?";
    await executeQuery(query, [id]);
    return { message: "Course deleted successfully" };
  },
};
