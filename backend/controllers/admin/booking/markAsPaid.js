import Booking from "../../../models/Booking.js";

export const markAsPaid = async (req, res) => {
  try {

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found ❌",
      });
    }

    // 🔥 PAYMENT UPDATE
    booking.paymentStatus = "paid";

    await booking.save();

    res.json({
      message: "Payment marked as paid ✅",
    });

  } catch (error) {
    console.log("PAYMENT ERROR:", error);
    res.status(500).json({
      message: "Payment update failed ❌",
    });
  }
};