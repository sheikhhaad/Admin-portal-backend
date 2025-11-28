//classModel.js
import { executeQuery } from "../config/queryHelper.js";

export const ClassModel = {
  getAllClasses: async () => {
    const query = "SELECT * FROM campus_classes ORDER BY class_id DESC";
    return await executeQuery(query);
  },

  getClassById: async (id) => {
    const query = "SELECT * FROM campus_classes WHERE class_id = ?";
    const result = await executeQuery(query, [id]);
    return result[0];
  },

  getClassTime: async (class_id) => {
    const result = await executeQuery(
      "SELECT class_time FROM campus_classes WHERE class_id = ? LIMIT 1",
      [class_id]
    );
    return result.length > 0 ? result[0].class_time : null;
  },

  //   getClassSchedule: async (class_id) => {
  //     const result = await executeQuery(
  //       "SELECT class_start_time, class_end_time FROM campus_classes WHERE class_id = ? LIMIT 1",
  //       [class_id]
  //     );
  //     return result.length > 0
  //       ? {
  //           start: result[0].class_start_time,
  //           end: result[0].class_end_time,
  //         }
  //       : null;
  //   },
  getClassSchedule: async (class_id) => {
    const query = `
   SELECT 
    class_start_time, 
    class_end_time, 
    days 
  FROM campus_classes 
  WHERE class_id = ?
  LIMIT 1
  `;
    const result = await executeQuery(query, [class_id]);
    return result[0];
  },

  getCoursesByDay: async (dayShort) => {
    // dayShort: e.g. 'Mon', 'Tue', 'Wed'
    const query =
      "SELECT * FROM campus_classes WHERE FIND_IN_SET(?, REPLACE(days, ',', ','))";
    const result = await executeQuery(query, [dayShort]);
    return result;
  },

  createCampusClass: async (
    course_id,
    campus_name,
    class_time,
    class_start_time,
    class_end_time,
    days
  ) => {
    const query =
      "INSERT INTO campus_classes (course_id, campus_name, class_time, class_start_time, class_end_time, days) VALUES (?, ?, ?, ?, ?, ?)";
    const result = await executeQuery(query, [
      course_id,
      campus_name,
      class_time,
      class_start_time,
      class_end_time,
      days,
    ]);
    return result.insertId;
  },

  updateClassCampus: async (id, data) => {
    const query =
      "UPDATE campus_classes SET campus_name = ?, class_time = ?, class_start_time = ?, class_end_time = ?, days = ? WHERE class_id = ?";
    await executeQuery(query, [
      data.campus_name,
      data.class_time,
      data.class_start_time,
      data.class_end_time,
      data.days,
      id,
    ]);
    return { message: "Course updated successfully" };
  },
};
