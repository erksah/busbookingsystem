import Bus from "../../../models/Bus.js";

export const toggleSeatBlock = async (req, res) => {
  try {

    const { busId, seatNumber } = req.body;

    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found ❌",
      });
    }

    const seat = bus.seatLayout.find(
      (s) => s.seatNumber === seatNumber
    );

    if (!seat) {
      return res.status(404).json({
        message: "Seat not found ❌",
      });
    }

    seat.isBlocked = !seat.isBlocked;

    await bus.save();

    res.json({
      message: seat.isBlocked
        ? "Seat blocked 🚫"
        : "Seat unblocked ✅",
    });

  } catch (error) {
    res.status(500).json({
      message: "Seat update failed ❌",
    });
  }
};