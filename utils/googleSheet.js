import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

export const appendToSheet = async (values) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(fs.readFileSync("./google-service-account-sheet.json")),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:F",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [values],
      },
    });

    console.log("Sheet updated:", response.data);
  } catch (err) {
    console.error("Google Sheet Error:", err);
  }
};
