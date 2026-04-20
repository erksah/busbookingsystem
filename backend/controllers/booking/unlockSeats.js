import SeatLock from "../../models/SeatLock.js";

export const unlockSeats = async (req, res) => {
  try {
    const { busId, journeyDate, seats, sessionId } = req.body;

    if (!busId || !journeyDate || !sessionId) {
      return res.status(400).json({ message: "Missing unlock parameters" });
    }

    const normalizedDate = new Date(journeyDate);
    normalizedDate.setHours(0, 0, 0, 0);

    const query = {
      busId,
      journeyDate: normalizedDate,
      reservedBy: sessionId,
      status: "reserved", // Do not unlock anything that was successfully paid!
    };

    if (seats && seats.length > 0) {
       query.seatNumber = { $in: seats.map(String) };
    }

    // Delete precisely the locks that this session holds
    await SeatLock.deleteMany(query);

    res.json({ success: true, message: "Seats formally unlocked" });
  } catch (error) {
    console.error("🔥 SEAT UNLOCK ERROR:", error);
    res.status(500).json({ message: "Internal server error unlocking seats ❌" });
  }
};
