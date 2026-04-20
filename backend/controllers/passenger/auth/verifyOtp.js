import Passenger from "../../../models/Passenger.js";

export const verifyOtp = async (req, res) => {
  try {

    const { email, otp } = req.body;

    // ==============================
    // ❌ VALIDATION
    // ==============================
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email & OTP required ❌",
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
    // ✅ SUCCESS
    // ==============================
    res.json({
      message: "OTP verified successfully ✅",
    });

  } catch (error) {
    console.log("🔥 VERIFY OTP ERROR:", error);

    res.status(500).json({
      message: "Something went wrong ❌",
    });
  }
};