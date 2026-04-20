import Booking from "../../models/Booking.js";


// ==============================
// 👤 GET MY BOOKINGS (USER)
// ==============================
export const getMyBookings = async (req, res) => {
  try {

    if (!req.passenger?.id) {
      return res.status(401).json({
        message: "Unauthorized ❌",
      });
    }

    const bookings = await Booking.find({
      passengerId: req.passenger.id,
    }).sort({ createdAt: -1 });

    res.json(bookings);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching bookings ❌",
    });
  }
};


// ==============================
// 👨‍💼 GET ALL BOOKINGS (ADMIN)
// ==============================
export const getAllBookings = async (req, res) => {
  try {

    const bookings = await Booking.find()
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to fetch bookings ❌",
    });
  }
};


// ==============================
// 🔍 GET SINGLE BOOKING
// ==============================
export const getSingleBooking = async (req, res) => {
  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found ❌",
      });
    }

    // 🔐 USER SECURITY
    if (
      req.passenger &&
      booking.passengerId &&
      booking.passengerId.toString() !== req.passenger.id
    ) {
      return res.status(403).json({
        message: "Not authorized ❌",
      });
    }

    res.json(booking);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error ❌",
    });
  }
};