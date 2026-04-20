import Booking from "../../../models/Booking.js";
import Bus from "../../../models/Bus.js";
import SeatLock from "../../../models/SeatLock.js";

import { sendEmail } from "../../../utils/sendEmail.js";
import { bookingTemplate } from "../../../utils/emailTemplate.js";

import { sendNotification } from "../../../utils/notificationService.js";

// ==============================
// 📞 FORMAT PHONE (INDIA FIX 🔥)
// ==============================
const formatPhone = (phone) => {
  if (!phone) return "";

  phone = phone.replace(/\D/g, "");
  phone = phone.slice(-10);

  return `+91${phone}`;
};

export const createGuestBooking = async (req, res) => {
  try {

    const {
      name,
      phone,
      email,
      busId,
      seats,
      journeyDate,
      passengers
    } = req.body;

    // ==============================
    // ❌ VALIDATION
    // ==============================
    if (!name || !phone || !busId || !seats?.length || !journeyDate) {
      return res.status(400).json({
        message: "Required fields missing ❌",
      });
    }

    // ==============================
    // 🔍 BUS
    // ==============================
    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found ❌",
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
    // 🔥 CHECK SEATS
    // ==============================
    const existing = await Booking.find({
      busId,
      journeyDate: { $gte: start, $lte: end },
      bookingStatus: { $in: ["reserved", "confirmed"] },
    });

    const bookedSeats = existing.flatMap(b =>
      (b.passengers || []).map(p => String(p.seat))
    );

    const conflict = seats.find(seat =>
      bookedSeats.includes(String(seat))
    );

    if (conflict) {
      return res.status(400).json({
        message: `Seat ${conflict} already booked ❌`,
      });
    }

    // ==============================
    // 👥 PASSENGERS & 🎭 VALIDATION
    // ==============================
    const finalPassengers = [];

    for (const seatNum of seats) {
      const p = passengers?.find(x => String(x.seat) === String(seatNum));
      const seatLayoutItem = bus.seatLayout.find(s => s.seatNumber === String(seatNum));

      const seatCategory = seatLayoutItem?.category || "normal";
      const gender = p?.gender || "M";

      // 🔥 LADIES RULE
      if (seatCategory === "ladies" && gender !== "F") {
        return res.status(400).json({
          message: `Seat ${seatNum} is reserved for ladies 👩. Please select a female passenger.`,
        });
      }

      finalPassengers.push({
        name: p?.name || name,
        age: Number(p?.age) || 25,
        gender,
        seat: String(seatNum),
        seatCategory,
        status: "confirmed",
      });
    }

    const normalizedDate = new Date(journeyDate);
    normalizedDate.setHours(0, 0, 0, 0);

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required ❌" });
    }

    // ==============================
    // 🔒 2-MINUTE SESSION/LOCK VALIDATION (CRITICAL)
    // ==============================
    const activeLocks = await SeatLock.find({
      busId,
      journeyDate: normalizedDate,
      seatNumber: { $in: seats.map(String) }
    });

    for (const seatStr of seats.map(String)) {
      const lock = activeLocks.find(l => l.seatNumber === seatStr);
      
      // If lock is completely missing OR it's reserved by someone else
      if (!lock || lock.reservedBy !== sessionId) {
         return res.status(400).json({ message: "This seat was booked by another user. Please select a different seat." });
      }

      // If lock has technically expired (meaning user took too long to pay)
      if (lock.holdExpiry < new Date()) {
         // Auto-release the seat so others can take it (or standard cleanup will)
         return res.status(400).json({ message: "Session expired. Another user may have booked this seat." });
      }
    }

    // ==============================
    // 🎟 TICKET
    // ==============================
    const ticketNumber =
      "TKT-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

    // ==============================
    // 📞 FORMAT PHONE
    // ==============================
    const finalPhone = formatPhone(phone);

    // ==============================
    // ✅ CREATE BOOKING (🔥 TIME FIX ADDED)
    // ==============================
    const booking = await Booking.create({
      name,
      phone: finalPhone,
      email,

      busId,
      from: bus.from,
      to: bus.to,

      // 🔥 IMPORTANT (LOGISTICS)
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      distanceKm: bus.distanceKm,
      journeyDays: bus.journeyDays,

      journeyDate: normalizedDate,

      seats: seats.map(String),
      passengers: finalPassengers,

      total: seats.length * bus.price,

      bookingStatus: "confirmed",
      paymentStatus: "paid",
      bookedBy: "guest",

      ticketNumber
    });

    // ==============================
    // 🔒 CONVERT SEAT LOCKS TO 'BOOKED'
    // ==============================
    await SeatLock.updateMany(
      { busId, journeyDate: normalizedDate, seatNumber: { $in: seats.map(String) } },
      { $set: { status: "booked" } }
    );

    // ==============================
    // 📧 EMAIL
    // ==============================
    if (email) {
      await sendEmail({
        to: email,
        subject: "Bus Booking Confirmation 🎟",
        html: bookingTemplate(booking),
      });
    }

    // ==============================
    // 📲 SMS + WHATSAPP
    // ==============================
    if (finalPhone) {
      await sendNotification(finalPhone, `
🎟 Booking Confirmed!

👤 Name: ${name}
🚌 Route: ${bus.from} → ${bus.to}
🛣 Distance: ${bus.distanceKm ? bus.distanceKm + " km" : "N/A"}
🕐 Departure: ${bus.departureTime}
🕐 Arrival: ${bus.arrivalTime} ${bus.journeyDays > 0 ? `(+${bus.journeyDays} Day)` : ""}
📅 Date: ${journeyDate}
💺 Seats: ${seats.join(", ")}

🎫 Ticket: ${ticketNumber}

Happy Journey 🚌🔥
      `);
    }

    // ==============================
    // ✅ RESPONSE
    // ==============================
    res.json({
      message: "Booking successful ✅",
      booking,
    });

  } catch (error) {
    console.log("🔥 GUEST BOOKING ERROR:", error);

    res.status(500).json({
      message: "Booking failed ❌",
    });
  }
};