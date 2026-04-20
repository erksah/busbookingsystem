import Booking from "../../../models/Booking.js";
import mongoose from "mongoose";

export const releaseSeat = async (req, res) => {
  try {

    const { bookingId } = req.params;

    // ==============================
    // ❌ VALIDATION
    // ==============================
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID ❌"
      });
    }

    // ==============================
    // 🔍 FIND BOOKING
    // ==============================
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found ❌"
      });
    }

    // ==============================
    // 🔥 GROUP RELEASE
    // ==============================
    if (booking.groupId) {

      const result = await Booking.deleteMany({
        groupId: booking.groupId,
        bookingStatus: "reserved" // only reserved delete
      });

      return res.json({
        message: "Group released successfully ✅",
        deleted: result.deletedCount
      });
    }

    // ==============================
    // 🔥 SINGLE RELEASE
    // ==============================
    if (booking.bookingStatus !== "reserved") {
      return res.status(400).json({
        message: "Only reserved seats can be released ❌"
      });
    }

    await Booking.findByIdAndDelete(bookingId);

    res.json({
      message: "Seat released successfully ✅",
      bookingId
    });

  } catch (error) {
    console.log("🔥 RELEASE ERROR:", error);

    res.status(500).json({
      message: "Release failed ❌"
    });
  }
};