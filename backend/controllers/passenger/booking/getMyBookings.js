import Booking from "../../../models/Booking.js";
import mongoose from "mongoose";

// ==============================
// 📅 DATE HELPERS
// ==============================
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// ==============================
// 🎟 GET MY BOOKINGS
// ==============================
export const getMyBookings = async (req, res) => {
  try {

    if (!req.passenger?.id) {
      return res.status(401).json({
        message: "Unauthorized ❌",
      });
    }

    const userId = req.passenger.id;

    const { type } = req.query;

    let filter = {
      passengerId: new mongoose.Types.ObjectId(userId), // 🔥 FIX
    };

    const { start, end } = getTodayRange();

    if (type === "today") {
      filter.journeyDate = { $gte: start, $lte: end };
    }

    if (type === "upcoming") {
      filter.journeyDate = { $gt: end };
    }

    if (type === "past") {
      filter.journeyDate = { $lt: start };
    }

    // ==============================
    // 🔍 FETCH BOOKINGS (RAW DATA)
    // ==============================
    const bookings = await Booking.find(filter)
      .populate("busId", "name departureTime arrivalTime")
      .sort({ createdAt: -1 }); // 🔥 latest first

    // ==============================
    // ✅ RESPONSE (NO FORMAT ❌)
    // ==============================
    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });

  } catch (error) {
    console.log("🔥 GET MY BOOKINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed ❌",
    });
  }
};