import Booking from "../../models/Booking.js";


// ==============================
// ❌ CANCEL SINGLE PASSENGER
// ==============================
export const cancelPassenger = async (req, res) => {
  try {

    const { bookingId, seat } = req.body;

    if (!bookingId || !seat) {
      return res.status(400).json({
        message: "Invalid request ❌",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found ❌",
      });
    }

    // ==============================
    // 🔐 USER SECURITY CHECK
    // ==============================
    if (
      req.passenger &&
      booking.passengerId &&
      booking.passengerId.toString() !== req.passenger.id
    ) {
      return res.status(403).json({
        message: "Not authorized ❌",
      });
    }

    // ==============================
    // 🔍 FIND PASSENGER
    // ==============================
    const passenger = booking.passengers.find(
      (p) => p.seat === seat
    );

    if (!passenger) {
      return res.status(404).json({
        message: "Seat not found ❌",
      });
    }

    // ==============================
    // 🔥 CANCEL THIS PASSENGER
    // ==============================
    passenger.status = "cancelled";

    // ==============================
    // 🔥 UPDATE ACTIVE SEATS
    // ==============================
    booking.seats = booking.passengers
      .filter((p) => p.status !== "cancelled")
      .map((p) => p.seat);

    // ==============================
    // 🔥 IF NO SEATS LEFT → CANCEL BOOKING
    // ==============================
    if (booking.seats.length === 0) {
      booking.bookingStatus = "cancelled";
    }

    await booking.save();

    res.json({
      message: `Seat ${seat} cancelled successfully ✅`,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Cancel failed ❌",
    });
  }
};