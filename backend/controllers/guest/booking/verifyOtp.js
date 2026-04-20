import Booking from "../../../models/Booking.js";

export const verifyOtpAndCancel = async (req, res) => {
  try {

    const { bookingId, otp } = req.body;

    if (!bookingId || !otp) {
      return res.status(400).json({
        message: "OTP required ❌",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found ❌",
      });
    }

    if (booking.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP ❌",
      });
    }

    if (booking.otpExpires < new Date()) {
      return res.status(400).json({
        message: "OTP expired ❌",
      });
    }

    // ==============================
    // 🔥 CANCEL BOOKING
    // ==============================
    booking.bookingStatus = "cancelled";

    booking.passengers = booking.passengers.map(p => ({
      ...p,
      status: "cancelled",
    }));

    booking.otp = null;
    booking.otpExpires = null;

    await booking.save();

    res.json({
      message: "Booking cancelled successfully ✅",
    });

  } catch (error) {
    console.log("🔥 VERIFY OTP ERROR:", error);

    res.status(500).json({
      message: "Cancel failed ❌",
    });
  }
};