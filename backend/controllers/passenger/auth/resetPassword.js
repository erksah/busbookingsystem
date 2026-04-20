import Passenger from "../../../models/Passenger.js";
import bcrypt from "bcryptjs";

export const resetPassword = async (req, res) => {
  try {

    const { email, otp, newPassword } = req.body;

    // ==============================
    // ❌ VALIDATION
    // ==============================
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "All fields required ❌",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters ❌",
      });
    }

    // ==============================
    // 🔍 FIND USER
    // ==============================
    const user = await Passenger.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found ❌",
      });
    }

    // ==============================
    // ❌ OTP CHECK
    // ==============================
    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP ❌",
      });
    }

    // ==============================
    // ⏳ OTP EXPIRY CHECK
    // ==============================
    if (!user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({
        message: "OTP expired ❌",
      });
    }

    // ==============================
    // 🔐 HASH PASSWORD
    // ==============================
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    // ==============================
    // 🔥 CLEAR OTP
    // ==============================
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    // ==============================
    // ✅ RESPONSE
    // ==============================
    res.json({
      message: "Password reset successful ✅",
    });

  } catch (error) {
    console.log("🔥 RESET PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Something went wrong ❌",
    });
  }
};