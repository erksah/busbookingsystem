import SeatLock from "../../models/SeatLock.js";
import Booking from "../../models/Booking.js";

export const lockSeatsForPayment = async (req, res) => {
  try {
    const { busId, journeyDate, seats, sessionId } = req.body;

    if (!busId || !journeyDate || !seats || seats.length === 0 || !sessionId) {
      return res.status(400).json({ message: "Missing locking parameters" });
    }

    const normalizedDate = new Date(journeyDate);
    normalizedDate.setHours(0, 0, 0, 0);

    // 1. CLEARED EXPIRED LOCKS TO FREE UP INVENTORY
    await SeatLock.deleteMany({
      busId,
      journeyDate: normalizedDate,
      holdExpiry: { $lt: new Date() },
      status: "reserved"
    });

    // 2. CHECK EXISTING BOOKINGS (Defensive check just in case)
    const existingBookings = await Booking.find({
      busId,
      journeyDate: normalizedDate,
      bookingStatus: { $in: ["reserved", "confirmed"] },
    });
    const officiallyBookedSeats = existingBookings.flatMap(b =>
      (b.passengers || []).filter(p => p.status !== "cancelled").map(p => String(p.seat))
    );
    const hasOfficialConflict = seats.find(s => officiallyBookedSeats.includes(String(s)));
    if (hasOfficialConflict) {
      return res.status(400).json({ message: "Seat just got booked by another user. Please select another seat." });
    }

    // 3. CHECK EXISTING ATOMIC LOCKS
    const existingLocks = await SeatLock.find({
      busId,
      journeyDate: normalizedDate,
      seatNumber: { $in: seats.map(String) }
    });

    // If another user holds ANY of these seats and they aren't expired
    const lockedByOthers = existingLocks.filter(lock => lock.reservedBy !== sessionId);
    if (lockedByOthers.length > 0) {
      return res.status(400).json({ message: "Seat just got booked by another user. Please select another seat." });
    }

    // 4. ATOMICALLY LOCK EACH SEAT
    const lockedSeatsList = [];
    try {
      for (const seat of seats) {
        const alreadyLockedByMe = existingLocks.find(l => l.seatNumber === String(seat));
        if (alreadyLockedByMe) {
          // Extend our existing lock
          alreadyLockedByMe.holdExpiry = new Date(Date.now() + 2 * 60 * 1000);
          await alreadyLockedByMe.save();
          lockedSeatsList.push(alreadyLockedByMe);
        } else {
          // Attempt atomic insert (Will throw immediately if another request beat us to this exact millisecond)
          const lock = await SeatLock.create({
            busId,
            journeyDate: normalizedDate,
            seatNumber: String(seat),
            status: "reserved",
            reservedBy: sessionId,
            holdExpiry: new Date(Date.now() + 2 * 60 * 1000)
          });
          lockedSeatsList.push(lock);
        }
      }

      return res.json({ success: true, message: "Seats successfully locked" });

    } catch (atomicError) {
      // 5. ROLLBACK EXACT-MILLISECOND LOCK COLLISIONS
      if (atomicError.code === 11000) {
        // We only rollback the locks WE cleanly generated in this loop BEFORE hitting the error
        const newLockIds = lockedSeatsList
          .filter(l => !existingLocks.find(e => e._id.toString() === l._id.toString()))
          .map(l => l._id);

        if (newLockIds.length > 0) {
          await SeatLock.deleteMany({ _id: { $in: newLockIds } });
        }
        
        return res.status(400).json({ message: "Seat just got booked by another user. Please select another seat." });
      }
      throw atomicError; // Pass to global catch
    }

  } catch (error) {
    console.error("🔥 SEAT LOCK ERROR:", error);
    res.status(500).json({ message: "Internal server error applying seat lock ❌" });
  }
};
