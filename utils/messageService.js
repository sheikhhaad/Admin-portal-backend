import axios from "axios";
import dotenv from "dotenv";
import { executeQuery } from "../config/queryHelper.js";

dotenv.config();

const WHATSAPP_API_URL = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

export const sendWhatsAppMessage = async (student_id, phone, message, type = "reminder") => {
  try {
    // Send message through WhatsApp Cloud API
    await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Log success
    await executeQuery(
      "INSERT INTO message_log (student_id, message_type, message_text, status) VALUES (?, ?, ?, 'sent')",
      [student_id, type, message]
    );

    console.log(`✅ WhatsApp message sent to ${phone}`);
  } catch (error) {
    // Log failure
    await executeQuery(
      "INSERT INTO message_log (student_id, message_type, message_text, status) VALUES (?, ?, ?, 'failed')",
      [student_id, type, message]
    );

    console.error(`❌ WhatsApp send failed for ${phone}:`, error.message);
  }
};
