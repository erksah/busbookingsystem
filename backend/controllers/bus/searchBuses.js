import Bus from "../../models/Bus.js";
import Booking from "../../models/Booking.js";
import BusAvailability from "../../models/BusAvailability.js";
import { applyDefaultCategories } from "./seatGenerator.js";

export const searchBuses = async (req, res) => {
  try {

    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({
        message: "From, To & Date required ❌",
      });
    }

    // ==============================
    // 📅 DATE RANGE
    // ==============================
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    // ==============================
    // 🔍 FIND BUSES
    // ==============================
    const buses = await Bus.find({
      from: { $regex: `^${from}$`, $options: "i" },
      to: { $regex: `^${to}$`, $options: "i" },
    });

    const result = [];

    for (let bus of buses) {

      // ==============================
      // 🔥 AVAILABILITY CHECK
      // ==============================
      const availability = await BusAvailability.findOne({
        busId: bus._id,
        date: { $gte: start, $lte: end },
      });

      // ❌ INACTIVE → skip
      if (availability && !availability.isActive) {
        continue;
      }

      // ==============================
      // 💰 PRICE OVERRIDE
      // ==============================
      const finalPrice =
        availability?.priceOverride || bus.price;

      // ==============================
      // 🎟 BOOKINGS
      // ==============================
      const bookings = await Booking.find({
        busId: bus._id,
        journeyDate: { $gte: start, $lte: end },
        bookingStatus: { $in: ["reserved", "confirmed"] },
      });

      const bookedSeats = bookings.flatMap((b) =>
        (b.passengers || [])
          .filter(p => p.status !== "cancelled")
          .map(p => p.seat)
      );

      // ==============================
      // 🪑 SEAT AUGMENTATION (NEW 🔥)
      // ==============================
      let layout = bus.seatLayout;
      if (!bus.isCustomLayout) {
        layout = applyDefaultCategories(layout);
      }

      const totalSeats = layout.length;
      const availableSeats = totalSeats - bookedSeats.length;

      // ==============================
      // ✅ FINAL RESULT
      // ==============================
      result.push({
        ...bus.toObject(),
        seatLayout: layout, // 🔥 FORCE THE AUGMENTED LAYOUT
        price: finalPrice, 
        availableSeats,
        totalSeats,
        isFull: availableSeats === 0,
      });
    }

    res.json(result);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Search failed ❌",
    });
  }
};