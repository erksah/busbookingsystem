import nodemailer from "nodemailer";

// ==============================
// 📩 SEND EMAIL FUNCTION
// ==============================
export const sendEmail = async ({ to, subject, html }) => {
  try {

    console.log("👉 EMAIL_USER:", process.env.EMAIL_USER);
    console.log("👉 EMAIL_PASS:", process.env.EMAIL_PASS ? "✔ Loaded" : "❌ Missing");
    console.log("👉 Sending email to:", to);

    // 🔥 USE SMTP (NOT service: gmail)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Bus Booking" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.response);

  } catch (error) {
    console.log("🔥 EMAIL ERROR:", error.message);
  }
};