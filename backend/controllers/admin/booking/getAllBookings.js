import Booking from "../../../models/Booking.js";

// ==============================
// 📅 TODAY RANGE HELPER
// ==============================
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// ==============================
// 🎟 GET ALL BOOKINGS (ADMIN)
// ==============================
export const getAllBookings = async (req, res) => {
  try {

    const { type, status, filter } = req.query;

    const query = {};

    // ==============================
    // 🔥 TYPE FILTER (Robust 🔥)
    // ==============================
    if (type) {
      if (type === "passenger") {
        query.bookedBy = { $in: ["passenger", "user"] }; // handle legacy 'user' tag
      } else {
        query.bookedBy = type;
      }
    }

    // ==============================
    // 🔥 PAYMENT FILTER
    // ==============================
    if (status) {
      query.paymentStatus = status;
    }

    // ==============================
    // 🔥 DATE FILTER (Normalized 🔥)
    // ==============================
    const { start, end } = getTodayRange();

    if (filter === "today") {
      // Matches the normalized midnight journeyDate
      query.journeyDate = { $gte: start, $lte: end };
    } else if (filter === "upcoming") {
      query.journeyDate = { $gt: end };
    } else if (filter === "past") {
      query.journeyDate = { $lt: start };
    }

    // ==============================
    // 🔥 FETCH BOOKINGS
    // ==============================
    const bookings = await Booking.find(query)
      .populate("busId", "name departureTime arrivalTime")
      .sort({ createdAt: -1 }); // Show newest first

    // ==============================
    // 🔥 FORMAT RESPONSE
    // ==============================
    const formatted = bookings.map((b) => {

      let dateStatus = "today";
      if (b.journeyDate < start) dateStatus = "past";
      if (b.journeyDate > end) dateStatus = "upcoming";

      // Normalize Type for UI
      let displayType = b.bookedBy;
      if (displayType === "user") displayType = "passenger";

      return {
        id: b._id,
        ticketNumber: b.ticketNumber || `TKT-${b._id.toString().slice(-6)}`,

        name: b.name,
        phone: b.phone,
        email: b.email,

        // 👤 TYPE (Mapped for UI)
        type: displayType,

        // 🚌 BUS
        bus: b.busId?.name || "Deleted Bus",

        // 📍 ROUTE
        route: `${b.from} → ${b.to}`,

        // 📅 DATE
        journeyDate: b.journeyDate,

        // ⏰ TIME
        departureTime: b.departureTime || b.busId?.departureTime || "-",
        arrivalTime: b.arrivalTime || b.busId?.arrivalTime || "-",

        // 💺 SEATS
        seats: (b.passengers || [])
          .filter(p => p.status !== "cancelled")
          .map(p => p.seat),

        // 💰 PRICE
        total: b.total,

        // 📊 STATUS
        bookingStatus: b.bookingStatus,
        paymentStatus: b.paymentStatus,

        dateStatus,
        createdAt: b.createdAt,
      };
    });

    res.json({
      count: formatted.length,
      bookings: formatted,
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings ❌" });
  }
};