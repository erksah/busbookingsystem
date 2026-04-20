import Booking from "../../models/Booking.js";


// ==============================
// 💰 UPDATE PAYMENT STATUS
// ==============================
export const updatePaymentStatus = async (req, res) => {
  try {

    const { status } = req.body; // paid / pending / failed

    if (!status) {
      return res.status(400).json({
        message: "Payment status required ❌",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found ❌",
      });
    }

    // ==============================
    // 🔥 UPDATE PAYMENT
    // ==============================
    booking.paymentStatus = status;

    // ==============================
    // 🔥 AUTO CONFIRM IF PAID
    // ==============================
    if (status === "paid") {
      booking.bookingStatus = "confirmed";

      // update all passengers
      booking.passengers.forEach((p) => {
        if (p.status !== "cancelled") {
          p.status = "confirmed";
        }
      });
    }

    // ==============================
    // ❌ IF FAILED → KEEP RESERVED
    // ==============================
    if (status === "failed") {
      booking.bookingStatus = "reserved";
    }

    await booking.save();

    res.json({
      message: "Payment updated successfully ✅",
      booking,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Payment update failed ❌",
    });
  }
};