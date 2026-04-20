import Bus from "../../../models/Bus.js";

export const toggleLadiesSeat = async (req, res) => {
  try {

    const { busId, seatNumber } = req.body;

    const bus = await Bus.findById(busId);

    const seat = bus.seatLayout.find(
      (s) => s.seatNumber === seatNumber
    );

    if (!seat) {
      return res.status(404).json({
        message: "Seat not found ❌",
      });
    }

    seat.isLadies = !seat.isLadies;

    await bus.save();

    res.json({
      message: seat.isLadies
        ? "Marked as Ladies 👩"
        : "Removed Ladies",
    });

  } catch (error) {
    res.status(500).json({
      message: "Update failed ❌",
    });
  }
};