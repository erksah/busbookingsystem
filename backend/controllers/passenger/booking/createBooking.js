import Booking from "../../../models/Booking.js";
import Bus from "../../../models/Bus.js";
import Passenger from "../../../models/Passenger.js";

import { sendEmail } from "../../../utils/sendEmail.js";
import { bookingTemplate } from "../../../utils/emailTemplate.js";
import { sendNotification } from "../../../utils/notificationService.js";

// ==============================
// 📞 FORMAT PHONE (INDIA FIX 🔥)
// ==============================
const formatPhone = (phone) => {
  if (!phone) return "";

  phone = phone.replace(/\D/g, ""); // remove non-digits
  phone = phone.slice(-10); // last 10 digits

  return `+91${phone}`;
};

// ==============================
// 🎟 CREATE PASSENGER BOOKING
// ==============================
export const createPassengerBooking = async (req, res) => {
  try {
    const { busId, seats, journeyDate, passengers } = req.body;

    // ==============================
    // 🔐 GET PASSENGER
    // ==============================
    const passengerData = await Passenger.findById(req.passenger.id);

    if (!passengerData) {
      return res.status(404).json({
        message: "Passenger not found ❌",
      });
    }

    // ==============================
    // ❌ VALIDATION
    // ==============================
    if (!busId || !seats?.length || !journeyDate) {
      return res.status(400).json({
        message: "Bus, seats & journey date required ❌",
      });
    }

    if (!passengers || passengers.length !== seats.length) {
      return res.status(400).json({
        message: "Passengers must match seats ❌",
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
    // 🔥 CONFLICT CHECK
    // ==============================
    const existing = await Booking.find({
      busId,
      journeyDate: { $gte: start, $lte: end },
      bookingStatus: { $in: ["reserved", "confirmed"] },
    });

    const bookedSeats = existing.flatMap((b) =>
      (b.passengers || [])
        .filter((p) => p.status !== "cancelled")
        .map((p) => String(p.seat))
    );

    const incomingSeats = seats.map(String);

    const conflicts = incomingSeats.filter((s) =>
      bookedSeats.includes(s)
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        message: "Seats already booked ❌",
        conflicts,
      });
    }

    // ==============================
    // 🎟 TICKET NUMBER
    // ==============================
    const ticketNumber =
      "TKT-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

    // ==============================
    // 👥 PASSENGERS & 🎭 VALIDATION
    // ==============================
    const finalPassengers = [];

    for (let i = 0; i < incomingSeats.length; i++) {
      const seatNum = incomingSeats[i];
      const p = passengers[i];
      const seatLayoutItem = bus.seatLayout.find(s => s.seatNumber === String(seatNum));

      const seatCategory = seatLayoutItem?.category || "normal";
      const gender = p?.gender || "M";

      // 🔥 LADIES RULE
      if (seatCategory === "ladies" && gender !== "F") {
        return res.status(400).json({
          message: `Seat ${seatNum} is reserved for ladies 👩. Please select a female passenger.`,
        });
      }

      // 🔥 ELDERLY RULE
      if (seatCategory === "elderly") {
        const age = Number(p?.age);
        if (isNaN(age) || age < 60 || age > 120) {
          return res.status(400).json({
            message: `Seat ${seatNum} is reserved for elderly passengers (60-120 years) 👴. Current age: ${p?.age}`,
          });
        }
      }

      finalPassengers.push({
        ...p,
        seat: String(seatNum),
        seatCategory,
        status: "confirmed",
      });
    }

    // ==============================
    // 📞 FORMAT PHONE
    // ==============================
    const finalPhone = formatPhone(passengerData.phone);

    const normalizedDate = new Date(journeyDate);
    normalizedDate.setHours(0, 0, 0, 0);

    // ==============================
    // ✅ CREATE BOOKING
    // ==============================
    const booking = await Booking.create({
      name: passengerData.name,
      email: passengerData.email,
      phone: finalPhone,

      busId,
      from: bus.from,
      to: bus.to,

      // 🔥 NEW (TIME & LOGISTICS)
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      distanceKm: bus.distanceKm,
      journeyDays: bus.journeyDays,

      journeyDate: normalizedDate,

      seats: incomingSeats,
      passengers: finalPassengers,

      total: incomingSeats.length * bus.price,

      passengerId: passengerData._id,

      bookingStatus: "confirmed",
      paymentStatus: "paid",

      bookedBy: "passenger",

      ticketNumber,
    });

    // ==============================
    // 📧 EMAIL
    // ==============================
    if (passengerData.email) {
      await sendEmail({
        to: passengerData.email,
        subject: "Bus Booking Confirmation 🎟",
        html: bookingTemplate(booking),
      });
    }

    // ==============================
    // 📲 SMS + WHATSAPP 🔥
    // ==============================
    if (finalPhone) {
      const hasSpecialSeat = finalPassengers.some(p => p.seatCategory === "ladies" || p.seatCategory === "elderly");
      const idNotice = hasSpecialSeat ? "\n\n⚠️ ID Verification required for Special Seats (Ladies/Elderly) during boarding." : "";

      await sendNotification(
        finalPhone,
        `
🎟 Booking Confirmed!

👤 Name: ${passengerData.name}
🚌 Route: ${bus.from} → ${bus.to}
🛣 Distance: ${bus.distanceKm ? bus.distanceKm + " km" : "N/A"}
📅 Date: ${journeyDate}

🕒 Departure: ${bus.departureTime}
🏁 Arrival: ${bus.arrivalTime} ${bus.journeyDays > 0 ? `(+${bus.journeyDays} Day)` : ""}

💺 Seats: ${incomingSeats.join(", ")}

🎫 Ticket: ${ticketNumber}
${idNotice}
Happy Journey 🚌🔥
        `
      );
    }

    // ==============================
    // ✅ RESPONSE
    // ==============================
    res.json({
      message: "Booking successful ✅",
      booking,
    });
  } catch (error) {
    console.log("🔥 PASSENGER BOOKING ERROR:", error);

    res.status(500).json({
      message: "Booking failed ❌",
    });
  }
};