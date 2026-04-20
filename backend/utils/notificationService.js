import dotenv from "dotenv";
dotenv.config();

import twilio from "twilio";

// ==============================
// 🔐 TWILIO CLIENT (SAFE CHECK)
// ==============================
if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH) {
  console.log("❌ Twilio credentials missing in .env");
}

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

// ==============================
// 📞 FORMAT PHONE (+91 AUTO)
// ==============================
const formatPhone = (phone) => {
  if (!phone) return null;

  phone = phone.replace(/\D/g, "");

  // last 10 digits safe
  phone = phone.slice(-10);

  return `+91${phone}`;
};

// ==============================
// 📲 SEND WHATSAPP
// ==============================
export const sendWhatsApp = async (to, message) => {
  try {
    const formatted = formatPhone(to);

    if (!formatted) {
      console.log("❌ Invalid phone number:", to);
      return;
    }

    console.log("📲 WhatsApp to:", formatted);

    const res = await client.messages.create({
      from: "whatsapp:+14155238886", // ✅ sandbox
      to: `whatsapp:${formatted}`,
      body: message,
    });

    console.log("✅ WhatsApp sent:", res.sid);

  } catch (error) {
    console.log("🔥 WhatsApp Error:", error.message);
  }
};

// ==============================
// 📩 SEND SMS (OPTIONAL)
// ==============================
export const sendSMS = async (to, message) => {
  try {
    const formatted = formatPhone(to);

    if (!formatted) return;

    const res = await client.messages.create({
      from: process.env.TWILIO_PHONE,
      to: formatted,
      body: message,
    });

    console.log("📩 SMS sent:", res.sid);

  } catch (error) {
    console.log("🔥 SMS Error:", error.message);
  }
};

// ==============================
// 🚀 COMMON NOTIFICATION
// ==============================
export const sendNotification = async (phone, message) => {
  try {
    if (!phone) {
      console.log("❌ No phone provided");
      return;
    }

    // 🔥 WhatsApp FIRST (primary)
    await sendWhatsApp(phone, message);

    // 🔥 SMS optional (enable later)
    // await sendSMS(phone, message);

  } catch (error) {
    console.log("🔥 Notification Error:", error.message);
  }
};