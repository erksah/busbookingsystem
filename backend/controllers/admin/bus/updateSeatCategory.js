import Bus from "../../../models/Bus.js";

export const updateSeatCategory = async (req, res) => {
  try {
    const { busId, seatNumbers, category } = req.body;

    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ message: "No seats selected ❌" });
    }

    if (!["normal", "elderly", "ladies"].includes(category)) {
      return res.status(400).json({
        message: "Invalid category ❌",
      });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found ❌" });
    }

    // 🔥 BULK UPDATE
    bus.seatLayout.forEach((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        seat.category = category;
      }
    });

    bus.isCustomLayout = true; 
    bus.markModified("seatLayout");

    await bus.save();

    res.json({
      message: `${seatNumbers.length} seats updated to ${category} ✅`,
      bus
    });

  } catch (error) {
    res.status(500).json({
      message: "Update failed ❌",
    });
  }
};
