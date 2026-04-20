import Booking from "../../../models/Booking.js";
import SeatLock from "../../../models/SeatLock.js";

export const getBookedSeats = async (req, res) => {
  try {

    const { busId } = req.params;
    const { journeyDate } = req.query;

    if (!busId || !journeyDate) {
      return res.status(400).json({
        message: "Bus ID and journey date required ❌"
      });
    }

    // ==============================
    // 🔥 DATE RANGE
    // ==============================
    const start = new Date(journeyDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(journeyDate);
    end.setHours(23, 59, 59, 999);

    // ==============================
    // 🔥 FETCH BOOKINGS
    // ==============================
    const bookings = await Booking.find({
      busId,
      journeyDate: { $gte: start, $lte: end },
      bookingStatus: { $in: ["reserved", "confirmed"] }
    });

    // ==============================
    // 🔥 FETCH ACTIVE SEAT LOCKS (NEW)
    // ==============================
    const activeLocks = await SeatLock.find({
      busId,
      journeyDate: { $gte: start, $lte: end },
      status: "reserved",
      holdExpiry: { $gt: new Date() }
    });

    // ==============================
    // 🔥 EXTRACT SEATS (FINAL FIX)
    // ==============================
    const bookedSeats = bookings.flatMap(b =>
      (b.passengers || []).filter(p => p.status !== "cancelled").map(p => ({
        seat: String(p.seat),
        status: b.bookingStatus, 
        bookingId: b._id,
        groupId: b.groupId || null,
        name: p.name,
      }))
    );

    const lockedSeats = activeLocks.map(l => ({
        seat: String(l.seatNumber),
        status: "reserved",
        bookingId: l._id,
        groupId: null,
        name: "Reserved",
        reservedBy: l.reservedBy
    }));

    // Merge without duplicates
    const allSeats = [...bookedSeats];
    lockedSeats.forEach(ls => {
       if (!allSeats.find(s => s.seat === ls.seat)) {
           allSeats.push(ls);
       }
    });

    res.json(allSeats);

  } catch (error) {
    console.log("🔥 GET SEATS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch seats ❌"
    });
  }
};