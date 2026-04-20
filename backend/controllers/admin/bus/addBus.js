import Bus from "../../../models/Bus.js";
import { generateSeats } from "../../bus/seatGenerator.js";

export const addBus = async (req, res) => {
  try {

    const {
      name,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      totalSeats,
      busCategory,
      seatType,
      journeyDays,
      distanceKm,
      basePricePerKm, // ✅ NEW
      averageSpeed,   // ✅ NEW
      fromLat,        // ✅ NEW
      fromLon,        // ✅ NEW
      toLat,          // ✅ NEW
      toLon,          // ✅ NEW
    } = req.body;

    if (!name || !from || !to || !price || !totalSeats) {
      return res.status(400).json({
        message: "All fields required ❌",
      });
    }

    const seatLayout = generateSeats(totalSeats, seatType);

    const bus = new Bus({
      name,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      totalSeats,
      busCategory,
      seatType,
      journeyDays,
      distanceKm,
      basePricePerKm: basePricePerKm || 2.0,
      averageSpeed: averageSpeed || 60,
      fromLat,
      fromLon,
      toLat,
      toLon,
      seatLayout,
    });

    await bus.save();

    res.status(201).json({
      message: "Bus added successfully ✅",
      bus,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to add bus ❌",
    });
  }
};