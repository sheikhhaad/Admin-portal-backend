// index.js
import express from "express";
import mysql2 from "mysql2";
import cors from "cors";

const app = express();

const PORT = 8000;

app.use(cors());
const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  database: "st_portal",
  password: "",
});

// // List Posts
// app.get('/api/posts', (req, res) => {
//     db.query('SELECT * FROM posts', (err, rows) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json(rows);
//     });
// });

app.get("/api/users", (req, res) => {
  db.query("SELECT * FROM users", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});