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
    const query =
      "INSERT INTO courses (name, description, class_time, slot) VALUES (?, ?, ?, ?)";
    const result = await executeQuery(query, [name, description, time, slot]);
    return result.insertId;
  },

  updateCourse: async (course_id, data) => {
    try {
      // 1️⃣ Filter out undefined or null keys (so only valid fields remain)
      const validFields = Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== null
      );

      if (validFields.length === 0) {
        throw new Error("No valid fields to update");
      }

      // 2️⃣ Build query dynamically
      const setClause = validFields.map(([key]) => `${key} = ?`).join(", ");
      const values = validFields.map(([_, value]) => value);

      const query = `UPDATE courses SET ${setClause} WHERE course_id = ?`;
      values.push(course_id); // course_id at the end

      // 3️⃣ Log for debugging
      console.log("Executing query:", query);
      console.log("With values:", values);

      await executeQuery(query, values);
      return { message: "✅ Course updated successfully" };
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  },

  // updateCourse: async (id, data) => {
  //   const query =
  //     "UPDATE courses SET name = ?, description = ?, class_time = ?, class_start_time = ?, class_end_time = ?, slot = ?, days = ? WHERE course_id = ?";
  //   await executeQuery(query, [
  //     data.name,
  //     data.description,
  //     data.class_time,
  //     data.class_start_time,
  //     data.class_end_time,
  //     data.slot,
  //     data.days,
  //     id,
  //   ]);
  //   return { message: "Course updated successfully" };
  // },

  deleteCourse: async (id) => {
    const query = "DELETE FROM courses WHERE course_id = ?";
    await executeQuery(query, [id]);
    return { message: "Course deleted successfully" };
  },

  getClassTime: async (course_id) => {
    const result = await executeQuery(
      "SELECT class_time FROM courses WHERE course_id = ? LIMIT 1",
      [course_id]
    );
    return result.length > 0 ? result[0].class_time : null;
  },

  getClassSchedule: async (course_id) => {
    const result = await executeQuery(
      "SELECT class_start_time, class_end_time FROM courses WHERE course_id = ? LIMIT 1",
      [course_id]
    );
    return result.length > 0
      ? {
          start: result[0].class_start_time,
          end: result[0].class_end_time,
        }
      : null;
  },

  getCoursesByDay: async (dayShort) => {
    // dayShort: e.g. 'Mon', 'Tue', 'Wed'
    const query =
      "SELECT * FROM courses WHERE FIND_IN_SET(?, REPLACE(days, ',', ','))";
    const result = await executeQuery(query, [dayShort]);
    return result;
  },
};
