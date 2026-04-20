import Bus from "../../../models/Bus.js";
import { generateSeats, applyDefaultCategories } from "../../bus/seatGenerator.js";

export const resetBusSeats = async (req, res) => {
  try {
    const { busId, action } = req.body; 

    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found ❌",
      });
    }

    if (action === "resetAll") {
      // 🔄 SET ALL TO NORMAL (ADMIN OVERRIDE)
      bus.seatLayout.forEach((seat) => {
        seat.category = "normal";
      });
      bus.isCustomLayout = true; // 🔥 NOW A CUSTOM 'ALL NORMAL' LAYOUT
      bus.markModified("seatLayout");
      
      await bus.save();
      return res.json({ message: "All seats reset to normal ✅", bus });
    }

    if (action === "restoreDefaults") {
      // 🛠 RESTORE AUTO DEFAULTS
      bus.isCustomLayout = false; // 🔥 BACK TO SYSTEM DEFAULTS
      bus.seatLayout = applyDefaultCategories(bus.seatLayout);

      bus.markModified("seatLayout");
      await bus.save();
      return res.json({ message: "Default classification restored ✅", bus });
    }

    res.status(400).json({ message: "Invalid action ❌" });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Reset failed ❌",
    });
  }
};
