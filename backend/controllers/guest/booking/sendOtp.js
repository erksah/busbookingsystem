import Booking from "../../../models/Booking.js";

export const sendCancelOTP = async (req, res) => {
  try {

    const { bookingId, phone } = req.body;

    // ==============================
    // ❌ VALIDATION
    // ==============================
    if (!bookingId || !phone) {
      return res.status(400).json({
        message: "Booking ID & phone required ❌",
      });
    }

    // ==============================
    // 🔍 FIND BOOKING
    // ==============================
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found ❌",
      });
    }

    // ==============================
    // 📱 PHONE VERIFY
    // ==============================
    if (booking.phone !== phone) {
      return res.status(400).json({
        message: "Phone number mismatch ❌",
      });
    }

    // ==============================
    // 🔥 GENERATE OTP
    // ==============================
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ==============================
    // ⏳ EXPIRY (5 MIN)
    // ==============================
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    booking.otp = otp;
    booking.otpExpires = expiry;

    await booking.save();

    // ==============================
    // 📩 SEND OTP (TEMP: console)
    // ==============================
    console.log("🔐 OTP:", otp);

    res.json({
      message: "OTP sent successfully ✅",
    });

  } catch (error) {
    console.log("🔥 SEND OTP ERROR:", error);

    res.status(500).json({
      message: "Failed to send OTP ❌",
    });
  }
};