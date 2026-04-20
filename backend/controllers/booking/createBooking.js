import Booking from "../../models/Booking.js";
import Bus from "../../models/Bus.js";
import SeatLock from "../../models/SeatLock.js";

export const createBooking = async (req, res) => {
  try {

    const {
      name,
      email,
      phone,
      busId,
      seats,
      passengers,
      journeyDate,
      total,
    } = req.body;

    // ==============================
    // ✅ VALIDATION
    // ==============================
    if (!busId || !seats || seats.length === 0 || !journeyDate) {
      return res.status(400).json({
        message: "Invalid booking ❌",
      });
    }

    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found ❌",
      });
    }

    const incomingSeats = seats.map(String);

    // ==============================
    // 🔥 DATE FORMAT FIX (IMPORTANT)
    // ==============================
    const formattedDate = new Date(journeyDate)
      .toISOString()
      .split("T")[0]; // ✅ YYYY-MM-DD

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
    // 🔥 CHECK ALREADY BOOKED (DATE-WISE)
    // ==============================
    const existing = await Booking.find({
      busId,
      journeyDate: formattedDate, // ✅ FIX
      bookingStatus: { $in: ["reserved", "confirmed"] },
    });

    const bookedSeats = existing.flatMap((b) =>
      (b.passengers || [])
        .filter(p => p.status !== "cancelled")
        .map(p => String(p.seat))
    );

    const conflicts = incomingSeats.filter(s =>
      bookedSeats.includes(s)
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        message: "Seats already booked ❌",
        conflicts,
      });
    }

    // ==============================
    // 🔥 PASSENGER DATA
    // ==============================
    const finalPassengers = incomingSeats.map((seat) => {

      const p = passengers?.find(
        x => String(x.seat) === seat
      );

      const seatInfo = bus.seatLayout.find(
        s => String(s.seatNumber) === seat
      );

      const gender = p?.gender === "Female" ? "F" : "M";

      // 🚫 LADIES SEAT CHECK
      if (seatInfo?.isLadies && gender !== "F") {
        throw new Error(`Seat ${seat} is for ladies 👩`);
      }

      return {
        name: p?.name || name,
        age: Number(p?.age) || 25,
        gender,
        seat,
        isLadies: seatInfo?.isLadies || false,
        status: "confirmed",
      };
    });

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required ❌" });
    }

    // ==============================
    // 🔥 DATE NORMALIZATION (CRITICAL FOR VISIBILITY)
    // ==============================
    const dateObj = new Date(journeyDate);
    dateObj.setHours(0, 0, 0, 0);

    // ==============================
    // 🔒 2-MINUTE SESSION/LOCK VALIDATION (CRITICAL)
    // ==============================
    const activeLocks = await SeatLock.find({
      busId,
      journeyDate: dateObj,
      seatNumber: { $in: incomingSeats.map(String) }
    });

    for (const seatStr of incomingSeats.map(String)) {
      const lock = activeLocks.find(l => l.seatNumber === seatStr);
      
      // If lock is completely missing OR it's reserved by someone else
      if (!lock || lock.reservedBy !== sessionId) {
         return res.status(400).json({ message: "This seat was booked by another user. Please select a different seat." });
      }

      // If lock has technically expired (meaning user took too long to pay)
      if (lock.holdExpiry < new Date()) {
         return res.status(400).json({ message: "Session expired. Another user may have booked this seat." });
      }
    }

    // ==============================
    // 🔥 USER ID (OPTIONAL)
    // ==============================
    const passengerId = req.passenger?.id || null;

    // ==============================
    // 🔥 CREATE BOOKING
    // ==============================
    const booking = new Booking({
      name,
      email,
      phone,
      busId,
      seats: incomingSeats,
      passengers: finalPassengers,
      journeyDate: dateObj, 
      total,
      passengerId,
      from: bus.from,
      to: bus.to,
      bookingStatus: "confirmed",
      paymentStatus: "pending",
      bookedBy: passengerId ? "passenger" : "guest",
    });

    await booking.save();

    // ==============================
    // 🔒 CONVERT SEAT LOCKS TO 'BOOKED'
    // ==============================
    await SeatLock.updateMany(
      { busId, journeyDate: dateObj, seatNumber: { $in: incomingSeats } },
      { $set: { status: "booked" } }
    );

    // ==============================
    // ✅ RESPONSE
    // ==============================
    res.status(201).json({
      message: "Booking successful ✅",
      booking,
    });

  } catch (error) {
    console.log("❌ ERROR:", error.message);

    res.status(500).json({
      message: error.message || "Booking failed ❌",
    });
  }
};