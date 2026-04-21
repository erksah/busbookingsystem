import Booking from "../../../models/Booking.js";

import { sendEmail } from "../../../utils/sendEmail.js";
import { cancelTemplate } from "../../../utils/cancelTemplate.js";
import { sendNotification } from "../../../utils/notificationService.js";
import { getCancellationStatus } from "../../../utils/cancellationLogic.js";

// ==============================
// 📞 FORMAT PHONE (INDIA FIX 🔥)
// ==============================
const formatPhone = (phone) => {
  if (!phone) return "";

  phone = phone.replace(/\D/g, ""); // remove non digits
  phone = phone.slice(-10); // last 10 digits

  return `+91${phone}`;
};

// ==============================
// ❌ CANCEL PASSENGER BOOKING
// ==============================
export const cancelPassengerBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // ==============================
    // 🔐 AUTH CHECK
    // ==============================
    if (!req.passenger?.id) {
      return res.status(401).json({
        message: "Unauthorized ❌",
      });
    }

    const userId = req.passenger.id;

    // ==============================
    // 🔍 FIND BOOKING
    // ==============================
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found ❌",
      });
    }

    // ==============================
    // 🔐 OWNERSHIP CHECK
    // ==============================
    if (String(booking.passengerId) !== String(userId)) {
      return res.status(403).json({
        message: "Not allowed ❌",
      });
    }

    // ==============================
    // 🚫 ALREADY CANCELLED
    // ==============================
    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        message: "Already cancelled ❌",
      });
    }

    // ==============================
    // ⏱️ TIME CONSTRAINTS LOGIC
    // ==============================
    const { canCancel, isRefundable, message: cancelMessage } = getCancellationStatus(
      booking.journeyDate,
      booking.departureTime
    );

    if (!canCancel) {
      return res.status(400).json({
        message: `${cancelMessage} ❌`,
      });
    }

    // ==============================
    // 🔥 CANCEL LOGIC
    // ==============================
    booking.bookingStatus = "cancelled";

    booking.passengers = booking.passengers.map((p) => ({
      ...p._doc,
      status: "cancelled",
    }));

    // ==============================
    // 💸 REFUND
    // ==============================
    if (booking.paymentStatus === "paid" && isRefundable) {
      booking.paymentStatus = "refunded";
    }

    await booking.save();

    // ==============================
    // 📧 EMAIL
    // ==============================
    if (booking.email) {
      await sendEmail({
        to: booking.email,
        subject: "Booking Cancelled ❌",
        html: cancelTemplate(booking),
      });
    }

    // ==============================
    // 📲 WHATSAPP + SMS 🔥
    // ==============================
    const finalPhone = formatPhone(booking.phone);

    if (finalPhone) {
      await sendNotification(
        finalPhone,
        `
❌ Booking Cancelled

👤 Name: ${booking.name}
🚌 Route: ${booking.from} → ${booking.to}
📅 Date: ${new Date(booking.journeyDate).toLocaleDateString()}

🕒 Departure: ${booking.departureTime || "-"}
🏁 Arrival: ${booking.arrivalTime || "-"}

💺 Seats: ${booking.seats.join(", ")}

 💸 Refund: ${
           booking.paymentStatus === "refunded" 
             ? "Initiated" 
             : (!isRefundable && canCancel ? "No refund (Same Day)" : "N/A")
         }

🎫 Ticket: ${booking.ticketNumber}

Sorry for inconvenience 🙏
        `
      );
    }

    // ==============================
    // ✅ RESPONSE
    // ==============================
    res.json({
      message: `${cancelMessage} ✅`,
      booking,
    });
  } catch (error) {
    console.log("🔥 CANCEL BOOKING ERROR:", error);

    res.status(500).json({
      message: error.message || "Cancel failed ❌",
    });
  }
};