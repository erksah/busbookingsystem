import Booking from "../../../models/Booking.js";

export const getBookingById = async (req, res) => {
  try {

    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found ❌",
      });
    }

    res.json(booking);

  } catch (error) {
    console.log("🔥 GET BOOKING ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch booking ❌",
    });
  }
};