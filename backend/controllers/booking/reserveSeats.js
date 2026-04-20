import Booking from "../../models/Booking.js";
import Bus from "../../models/Bus.js";
import { v4 as uuidv4 } from "uuid";

export const reserveSeats = async (req, res) => {
  try {

    const { name, phone, email, busId, seats, journeyDate } = req.body;

    // ==============================
    // ✅ VALIDATION
    // ==============================
    if (!busId || !seats || seats.length === 0 || !journeyDate) {
      return res.status(400).json({
        message: "Bus, seats & journey date required ❌",
      });
    }

    // ==============================
    // 🔥 DATE FIX (IMPORTANT)
    // ==============================
    const selectedDate = new Date(journeyDate);

    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    // ==============================
    // 🔥 FIND BUS
    // ==============================
    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found ❌",
      });
    }

    // ==============================
    // 🔥 REMOVE DUPLICATES
    // ==============================
    const incomingSeats = [...new Set(seats.map(String))];

    // ==============================
    // 🔥 VALID SEATS CHECK
    // ==============================
    const validSeats = bus.seatLayout.map(s => String(s.seatNumber));

    const invalidSeats = incomingSeats.filter(
      s => !validSeats.includes(s)
    );

    if (invalidSeats.length > 0) {
      return res.status(400).json({
        message: "Invalid seats ❌",
        invalidSeats,
      });
    }

    // ==============================
    // 🔥 BLOCKED SEATS CHECK
    // ==============================
    const blockedSeats = bus.seatLayout
      .filter(s => s.isBlocked)
      .map(s => String(s.seatNumber));

    const blockedConflict = incomingSeats.filter(s =>
      blockedSeats.includes(s)
    );

    if (blockedConflict.length > 0) {
      return res.status(400).json({
        message: "Seat blocked ❌",
        blockedConflict,
      });
    }

    // ==============================
    // 🔥 EXISTING BOOKINGS (DATE-WISE)
    // ==============================
    const existing = await Booking.find({
      busId,
      journeyDate: { $gte: start, $lte: end },
      bookingStatus: { $in: ["reserved", "confirmed"] },
    });

    // ==============================
    // 🔥 EXTRACT BOOKED SEATS
    // ==============================
    const bookedSeats = existing.flatMap((b) =>
      (b.passengers || [])
        .filter(p => p.status !== "cancelled")
        .map(p => String(p.seat))
    );

    // ==============================
    // 🔥 CHECK CONFLICT
    // ==============================
    const conflicts = incomingSeats.filter(s =>
      bookedSeats.includes(s)
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        message: "Seats already reserved ❌",
        conflicts,
      });
    }

    // ==============================
    // 🔥 GROUP ID
    // ==============================
    const groupId = uuidv4();

    const bookings = [];

    // ==============================
    // 🔥 CREATE BOOKINGS
    // ==============================
    for (const seat of incomingSeats) {

      const seatInfo = bus.seatLayout.find(
        s => String(s.seatNumber) === seat
      );

      const booking = new Booking({
        name: name || "Admin Hold",
        phone: phone || "",
        email: email || "",
        busId,

        // ✅ FINAL FIX (DATE OBJECT)
        journeyDate: new Date(journeyDate),

        seats: [seat],

        passengers: [
          {
            name: name || "Reserved",
            age: 0,
            gender: "M",
            seat,
            isLadies: seatInfo?.isLadies || false,
            status: "reserved",
          },
        ],

        total: 0,

        from: bus.from,
        to: bus.to,

        bookingStatus: "reserved",
        paymentStatus: "pending",
        bookedBy: "admin",

        holdExpiry: null,
        groupId,
      });

      await booking.save();
      bookings.push(booking);
    }

    // ==============================
    // ✅ RESPONSE
    // ==============================
    return res.json({
      message: "Seats reserved successfully ✅",
      bookings,
      groupId,
    });

  } catch (error) {
    console.log("🔥 RESERVE ERROR:", error);

    res.status(500).json({
      message: "Reserve failed ❌",
    });
  }
};