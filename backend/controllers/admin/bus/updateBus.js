import Bus from "../../../models/Bus.js";
import { generateSeats } from "../../bus/seatGenerator.js";

export const updateBus = async (req, res) => {
  try {

    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found ❌",
      });
    }

    // 🔥 update normal fields
    Object.assign(bus, req.body);

    // ==============================
    // 🔥 MAIN FIX (SEAT SYNC)
    // ==============================
    if (req.body.totalSeats || req.body.seatType) {
      bus.seatLayout = generateSeats(
        req.body.totalSeats || bus.totalSeats,
        req.body.seatType || bus.seatType
      );
    }

    await bus.save();

    res.json({
      message: "Bus updated successfully ✅",
      bus,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Update failed ❌",
    });
  }
};