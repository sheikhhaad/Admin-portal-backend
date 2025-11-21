import { google } from "googleapis";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export const appendToSheet = async (row) => {
  try {
    const creds = fs.readFileSync(
      "./google-service-account-sheet.json",
      "utf8"
    );

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:F",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [row],
      },
    });

    console.log("Sheet updated");
  } catch (err) {
    console.error("Google Sheet Error:", err.response?.data || err);
  }
};
