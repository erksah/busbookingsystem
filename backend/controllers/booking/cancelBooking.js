import Booking from "../../models/Booking.js";


// ==============================
// ❌ CANCEL FULL BOOKING
// ==============================
export const cancelBooking = async (req, res) => {
  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found ❌",
      });
    }

    // ==============================
    // 🔐 USER SECURITY CHECK
    // ==============================
    if (
      req.passenger &&                  // user logged in
      booking.passengerId &&           // booking belongs to someone
      booking.passengerId.toString() !== req.passenger.id
    ) {
      return res.status(403).json({
        message: "Not authorized ❌",
      });
    }

    // ==============================
    // 🔥 CANCEL BOOKING
    // ==============================
    booking.bookingStatus = "cancelled";

    // cancel all passengers
    booking.passengers.forEach((p) => {
      p.status = "cancelled";
    });

    // clear seats
    booking.seats = [];

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