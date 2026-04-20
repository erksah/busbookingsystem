import Passenger from "../../../models/Passenger.js";
import { sendEmail } from "../../../utils/sendEmail.js";

export const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    // ==============================
    // ❌ VALIDATION
    // ==============================
    if (!email) {
      return res.status(400).json({
        message: "Email required ❌",
      });
    }

    // ==============================
    // 🔍 FIND USER
    // ==============================
    const user = await Passenger.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Email not found ❌",
      });
    }

    // ==============================
    // 🔥 GENERATE OTP
    // ==============================
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ==============================
    // ⏳ SAVE OTP (10 MIN EXPIRY)
    // ==============================
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // ==============================
    // 📧 SEND EMAIL
    // ==============================
    await sendEmail({
      to: email,
      subject: "Password Reset OTP 🔐",
      html: `
        <h2>Your OTP is: ${otp}</h2>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    });

    // ==============================
    // ✅ RESPONSE
    // ==============================
    res.json({
      message: "OTP sent to your email ✅",
    });

  } catch (error) {
    console.log("🔥 FORGOT PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Something went wrong ❌",
    });
  }
};