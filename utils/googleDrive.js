import { google } from "googleapis";
import fs from "fs";

const auth = new google.auth.GoogleAuth({
  keyFile: "./google-service-account.json",
  scopes: ["https://www.googleapis.com/auth/drive"]
});

const drive = google.drive({ version: "v3", auth });

// const folderId = "1onRKYTdIaD5KVeCWO0WMVjf5nV4YJG2i"; // your folder
const folderId = "1EmMvT5A9QT9bA34-Sy6oVYV91khhllrx"; // your folder

const uploadToDrive = async (filePath, fileName) => {
  const fileMetadata = {
    name: `${fileName}.png`,
    parents: [folderId],
  };

  const media = {
    mimeType: "image/png",
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: "id"
  });

  const fileId = response.data.id;

  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" }
  });

  return `https://drive.google.com/uc?id=${fileId}`;
};

export default uploadToDrive;
