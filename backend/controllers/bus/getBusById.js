import Bus from "../../models/Bus.js";
import BusAvailability from "../../models/BusAvailability.js";
import { generateSeats, applyDefaultCategories } from "./seatGenerator.js";

export const getBusById = async (req, res) => {
  try {

    const { id } = req.params;
    const { date } = req.query;

    const bus = await Bus.findById(id);

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found ❌",
      });
    }

    // ==============================
    // 🔥 AUTO GENERATE / REPAIR SEATS
    // ==============================
    let needsSave = false;

    if (!bus.seatLayout || bus.seatLayout.length === 0) {
      bus.seatLayout = generateSeats(
        bus.totalSeats || 40,
        bus.seatType || "Seater"
      );
      needsSave = true;
    } else if (!bus.isCustomLayout) {
      // 🛠 REPAIR LEGACY DATA or FORCE DEFAULT RULES
      const original = JSON.stringify(bus.seatLayout);
      bus.seatLayout = applyDefaultCategories(bus.seatLayout);
      
      if (JSON.stringify(bus.seatLayout) !== original) {
        needsSave = true;
      }
    }

    if (needsSave) {
      bus.markModified("seatLayout");
      await bus.save();
    }

    // ==============================
    // 🔥 APPLY AVAILABILITY LOGIC
    // ==============================
    let finalPrice = bus.price;

    if (date) {

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const availability = await BusAvailability.findOne({
        busId: id,
        date: { $gte: start, $lte: end },
      });

      // ❌ inactive bus
      if (availability && !availability.isActive) {
        return res.status(400).json({
          message: "Bus not available ❌",
        });
      }

      // 💰 override price
      if (availability?.priceOverride) {
        finalPrice = availability.priceOverride;
      }
    }

    // ==============================
    // ✅ FINAL RESPONSE
    // ==============================
    res.json({
      ...bus.toObject(),
      price: finalPrice, // 🔥 IMPORTANT
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching bus ❌",
    });
  }
};