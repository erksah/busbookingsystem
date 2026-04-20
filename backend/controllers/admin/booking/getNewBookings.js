import Booking from "../../../models/Booking.js";

export const getNewBookings = async (req, res) => {
  try {

    // 🔥 last 24 hours
    const last24hrs = new Date();
    last24hrs.setHours(last24hrs.getHours() - 24);

    const bookings = await Booking.find({
      createdAt: { $gte: last24hrs }
    })
      .populate("busId", "name departureTime arrivalTime")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });

  } catch (err) {
    console.log("🔥 NEW BOOKINGS ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch new bookings ❌"
    });
  }
};