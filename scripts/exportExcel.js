import ExcelJS from "exceljs";

export const exportStudentsExcel = async (req, res) => {
  const connection = await connectToDatabase();

  const [rows] = await connection.execute(`
    SELECT 
      s.created_at AS timestamp,
      s.email AS username,
      s.name AS fullname,
      s.contact AS contact,
      s.student_id AS idcard,
      c.days AS slot,
      s.voucher_url AS fee_slip
    FROM students s
    LEFT JOIN campus_classes c
      ON s.class_id = c.id
  `);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Students");

  sheet.columns = [
    { header: "Timestamp", key: "timestamp" },
    { header: "Username(email)", key: "username" },
    { header: "FullName", key: "fullname" },
    { header: "ContactNumber", key: "contact" },
    { header: "IDCardNo", key: "idcard" },
    { header: "Slots", key: "slot" },
    { header: "FeesSlip", key: "fee_slip" },
  ];

  rows.forEach(r => sheet.addRow(r));

  res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");
  await workbook.xlsx.write(res);
  res.end();
};
