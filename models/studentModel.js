import { executeQuery } from "../config/queryHelper.js";

export const StudentModel = {
  getAll: async () => {
    return await executeQuery("SELECT * FROM students");
  },

  getById: async (id) => {
    return await executeQuery("SELECT * FROM students WHERE id = ?", [id]);
  },

  // create: async (data) => {
  //   const { name, cnic, contact, address, course_id } = data;
  //   const query = `
  //     INSERT INTO students (name, cnic, contact, address, course_id)
  //     VALUES (?, ?, ?, ?, ?, ?, ?)
  //   `;
  //   return await executeQuery(query, [name, cnic, contact, address, course_id]);
  // },

  // ✅ Create new student
  create: async (data) => {
    const {
      student_img,
      name,
      cnic,
      contact,
      address,
      fee_amount,
      qr_url,
      course_id,
      class_id,
    } = data;

    // 🔢 Step 1: Generate next student_id
    const prefix = course_id.toUpperCase();
    const countResult = await executeQuery(
      "SELECT COUNT(*) AS total FROM students WHERE course_id = ?",
      [course_id]
    );
    const next = countResult[0].total + 1;
    const student_id = `${prefix}-${String(next).padStart(4, "0")}`;

    // 🧾 Step 2: Insert student with generated ID
    const query = `
    INSERT INTO students (
      student_id, student_img, name, cnic, contact, address,
      fee_amount, qr_url, course_id, class_id, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

    const values = [
      student_id,
      student_img,
      name,
      cnic,
      contact,
      address,
      fee_amount,
      qr_url,
      course_id,
      class_id,
    ];

    await executeQuery(query, values);

    // ✅ Step 3: Return the generated student_id
    return { message: "Student created successfully", student_id };
  },

  getByCourse: async (course_id) => {
    const result = await executeQuery(
      "SELECT * FROM students WHERE course_id = ?",
      [course_id]
    );
    return result;
  },

  generateStudentId: async (course_id) => {
    const prefix = course_id.toUpperCase(); // e.g. AIT01
    const countResult = await executeQuery(
      "SELECT COUNT(*) AS total FROM students WHERE course_id = ?",
      [course_id]
    );
    const next = countResult[0].total + 1;
    return `${prefix}-${String(next).padStart(4, "0")}`;
  },
};
