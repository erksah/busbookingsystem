import Booking from "../../models/Booking.js";


// ==============================
// 🔐 SEND OTP (GUEST)
// ==============================
export const sendCancelOTP = async (req, res) => {
  try {

    const { ticketNumber, email } = req.body;

    if (!ticketNumber || !email) {
      return res.status(400).json({
        message: "Ticket & email required ❌",
      });
    }

    const booking = await Booking.findOne({ ticketNumber });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found ❌",
      });
    }

    if (booking.email !== email) {
      return res.status(403).json({
        message: "Email mismatch ❌",
      });
    }

    // ==============================
    // 🔥 GENERATE OTP
    // ==============================
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    booking.otp = otp;
    booking.otpExpires = Date.now() + 5 * 60 * 1000; // 5 min

    await booking.save();

    // ⚠️ For now console (later email integrate)
    console.log("OTP:", otp);

    res.json({
      message: "OTP sent successfully ✅",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "OTP send failed ❌",
    });
  }
};


// ==============================
// 🔐 VERIFY OTP + CANCEL
// ==============================
export const verifyOTPAndCancel = async (req, res) => {
  try {

    const { ticketNumber, otp } = req.body;

    if (!ticketNumber || !otp) {
      return res.status(400).json({
        message: "Invalid request ❌",
      });
    }

    const booking = await Booking.findOne({ ticketNumber });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found ❌",
      });
    }

    // ==============================
    // 🔥 OTP VALIDATION
    // ==============================
    if (booking.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP ❌",
      });
    }

    if (booking.otpExpires < Date.now()) {
      return res.status(400).json({
        message: "OTP expired ❌",
      });
    }

    // ==============================
    // 🔥 CANCEL BOOKING
    // ==============================
    booking.bookingStatus = "cancelled";

    booking.passengers.forEach((p) => {
      p.status = "cancelled";
    });

    booking.seats = [];

    // clear otp
    booking.otp = null;
    booking.otpExpires = null;

    await booking.save();

    res.json({
      message: "Booking cancelled successfully ✅",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Cancel failed ❌",
    });
  }
};