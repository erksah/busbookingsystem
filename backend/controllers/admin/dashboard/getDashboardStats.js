import Booking from "../../../models/Booking.js";
import Bus from "../../../models/Bus.js";
import Passenger from "../../../models/Passenger.js";

export const getDashboardStats = async (req, res) => {
  try {

    // ==============================
    // 📊 TOTAL COUNTS
    // ==============================
    const totalBookings = await Booking.countDocuments();
    const totalBuses = await Bus.countDocuments();
    const totalPassengers = await Passenger.countDocuments();

    // ==============================
    // 💰 TOTAL REVENUE (ONLY PAID + CONFIRMED)
    // ==============================
    const revenueData = await Booking.aggregate([
      {
        $match: {
          bookingStatus: "confirmed",
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // ==============================
    // 📅 TODAY BOOKINGS
    // ==============================
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todayBookings = await Booking.countDocuments({
      createdAt: {
        $gte: start,
        $lte: end,
      },
    });

    // ==============================
    // 🪑 STATUS COUNT
    // ==============================
    const reserved = await Booking.countDocuments({
      bookingStatus: "reserved",
    });

    const confirmed = await Booking.countDocuments({
      bookingStatus: "confirmed",
    });

    // ==============================
    // ✅ RESPONSE
    // ==============================
    res.json({
      totalBookings,
      totalBuses,
      totalPassengers,
      totalRevenue,
      todayBookings,
      reserved,
      confirmed,
    });

  } catch (error) {
    console.log("🔥 DASHBOARD ERROR:", error);

    res.status(500).json({
      message: "Dashboard failed ❌",
    });
  }
};