import Booking from "../../../models/Booking.js";
import mongoose from "mongoose";

export const confirmBooking = async (req, res) => {
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
    // 🔥 GROUP CONFIRM
    // ==============================
    if (booking.groupId) {

      const result = await Booking.updateMany(
        {
          groupId: booking.groupId,
          bookingStatus: "reserved" // only reserved convert
        },
        {
          $set: {
            bookingStatus: "confirmed",
            "passengers.$[].status": "confirmed"
          }
        }
      );

      return res.json({
        message: "Group confirmed ✅",
        modified: result.modifiedCount
      });
    }

    // ==============================
    // 🔥 SINGLE CONFIRM
    // ==============================
    if (booking.bookingStatus !== "reserved") {
      return res.status(400).json({
        message: "Only reserved seats can be confirmed ❌"
      });
    }

    booking.bookingStatus = "confirmed";

    booking.passengers = booking.passengers.map(p => ({
      ...p,
      status: "confirmed"
    }));

    await booking.save();

    res.json({
      message: "Seat confirmed successfully ✅",
      bookingId: booking._id
    });

  } catch (error) {
    console.log("🔥 CONFIRM ERROR:", error);

    res.status(500).json({
      message: "Confirm failed ❌"
    });
  }
};