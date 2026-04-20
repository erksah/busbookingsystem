import Booking from "../../../models/Booking.js";

export const cancelBooking = async (req, res) => {
  try {

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found ❌",
      });
    }

    // 🔥 CANCEL STATUS
    booking.bookingStatus = "cancelled";

    // 🔥 ALL PASSENGERS CANCEL
    booking.passengers = booking.passengers.map(p => ({
      ...p,
      status: "cancelled",
    }));

    await booking.save();

    res.json({
      message: "Booking cancelled successfully ✅",
    });

  } catch (error) {
    console.log("CANCEL ERROR:", error);
    res.status(500).json({
      message: "Cancel failed ❌",
    });
  }
};