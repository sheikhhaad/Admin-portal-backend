import { executeQuery } from "../config/queryHelper.js";
import { connectToDatabase } from "../config/db.js";
// SAFE & atomic increment per course

// SAFE & ATOMIC course-wise student ID generation
export const generateStudentId = async (course_id) => {
  const connection = await connectToDatabase();

  // 1️⃣ Ensure a sequence row exists for this course
  await connection.execute(
    `INSERT IGNORE INTO course_sequences (course_id, sequence) VALUES (?, 0)`,
    [course_id]
  );

  // 2️⃣ Atomic increment using LAST_INSERT_ID to avoid collisions
  await connection.execute(
    `UPDATE course_sequences
     SET sequence = LAST_INSERT_ID(sequence + 1)
     WHERE course_id = ?`,
    [course_id]
  );

  // 3️⃣ Read LAST_INSERT_ID safely from the same connection
  const [rows] = await connection.query(`SELECT LAST_INSERT_ID() AS seq`);
  const seq = rows[0].seq;

  if (!seq) throw new Error("Failed to generate student sequence");

  // 4️⃣ Format final student ID like A&IT-0001
  return `${course_id.toUpperCase()}-${String(seq).padStart(4, "0")}`;
};

export const StudentModel = {
  getAll: async () => {
    return await executeQuery("SELECT * FROM students");
  },

  getByStudentId: async (student_id) => {
    const result = await executeQuery(
      "SELECT * FROM students WHERE student_id = ?",
      [student_id]
    );
    return result[0];
  },

  getById: async (id) => {
    const result = await executeQuery("SELECT * FROM students WHERE id = ?", [
      id,
    ]);
    return result[0];
  },

  getByCourse: async (course_id) => {
    return await executeQuery("SELECT * FROM students WHERE course_id = ?", [
      course_id,
    ]);
  },

  insertStudent: async (data) => {
    return await executeQuery(
      `INSERT INTO students 
        (student_id, student_img, name, cnic, contact, address, email, qr_url, 
         course_id, class_id, voucher_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        data.student_id,
        data.student_img,
        data.name,
        data.cnic,
        data.contact,
        data.address,
        data.email,
        data.qr_url,
        data.course_id,
        data.class_id,
        data.voucher_url,
      ]
    );
  },

  // ✅ Create new student (atomic student_id)
  // create: async (data) => {
  //   const {
  //     student_img = null,
  //     name,
  //     cnic = null,
  //     contact = null,
  //     address = null,
  //     fee_amount = 0,
  //     qr_url = null,
  //     course_id,
  //     class_id = null,
  //     voucher_url = null,
  //     email = null,
  //   } = data;

  //   if (!name || !course_id) {
  //     throw new Error("Name and course_id are required!");
  //   }

  //   // 🔢 Step 1: Generate course-wise unique student_id
  //   const student_id = await generateStudentId(course_id);

  //   // 🧾 Step 2: Insert into students table
  //   const query = `
  //     INSERT INTO students
  //       (student_id, student_img, name, cnic, contact, address,
  //        fee_amount, qr_url, course_id, class_id, voucher_url, email, created_at)
  //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  //   `;

  //   const values = [
  //     student_id,
  //     student_img,
  //     name,
  //     cnic,
  //     contact,
  //     address,
  //     fee_amount,
  //     qr_url,
  //     course_id,
  //     class_id,
  //     voucher_url,
  //     email,
  //   ];

  //   await executeQuery(query, values);

  //   // ✅ Return generated student_id
  //   return { message: "Student created successfully", student_id };
  // },

  // 🗑️ Move student to trash by student_id
  deleteToTrashByStudentId: async (
    student_id,
    deleted_by = null,
    reason = null
  ) => {
    if (!student_id) {
      throw new Error("student_id is required for deletion!");
    }

    // Step 1: Copy record into trash
    const insertTrash = `
      INSERT INTO students_trash
      (student_id, student_img, name, cnic, contact, email, address,
       qr_url, course_id, created_at, class_id, voucher_url,
       deleted_at, deleted_by, reason)
      SELECT student_id, student_img, name, cnic, contact, email, address,
             qr_url, course_id, created_at, class_id, voucher_url,
             NOW(), ?, ?
      FROM students WHERE student_id = ?
    `;
    await executeQuery(insertTrash, [deleted_by, reason, student_id]);

    // Step 2: Delete from main table
    const deleteMain = "DELETE FROM students WHERE student_id = ?";
    const result = await executeQuery(deleteMain, [student_id]);

    return {
      message:
        result.affectedRows > 0
          ? "Student moved to trash successfully"
          : "No student found with given student_id",
    };
  },
};
