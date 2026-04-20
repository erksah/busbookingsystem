import Booking from "../../../models/Booking.js";
import Bus from "../../../models/Bus.js";
import Passenger from "../../../models/Passenger.js";

export const getDashboardStats = async (req, res) => {
  try {

    // ==============================
    // 🔥 TOTAL BOOKINGS
    // ==============================
    const totalBookings = await Booking.countDocuments();

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
    // 🚌 TOTAL BUSES
    // ==============================
    const totalBuses = await Bus.countDocuments();

    // ==============================
    // 👤 TOTAL USERS
    // ==============================
    const totalPassengers = await Passenger.countDocuments();

    // ==============================
    // 📊 RESPONSE
    // ==============================
    res.json({
      bookings: totalBookings,
      revenue: totalRevenue,
      buses: totalBuses,
      passengers: totalPassengers,
    });

  } catch (error) {
    console.log("🔥 DASHBOARD ERROR:", error);

    res.status(500).json({
      message: "Dashboard error ❌",
    });
  }
};