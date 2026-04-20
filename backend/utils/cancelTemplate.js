export const cancelTemplate = (booking) => {
  return `
    <div style="font-family: Arial; padding:20px; line-height:1.6;">
      
      <h2 style="color:red;">❌ Booking Cancelled</h2>

      <p>Hello <b>${booking.name}</b>,</p>

      <p>Your booking has been cancelled successfully.</p>

      <hr/>

      <h3>🧾 Booking Details</h3>

      <p><b>🎫 Ticket ID:</b> ${booking.ticketNumber || booking._id}</p>

      <p><b>🚌 Bus:</b> ${booking.busName || "Express Bus"}</p>

      <p><b>📍 Route:</b> ${booking.from} → ${booking.to}</p>

      <p><b>📅 Journey Date:</b> 
        ${new Date(booking.journeyDate).toDateString()}
      </p>

      <p><b>🕒 Departure Time:</b> 
        ${booking.departureTime || "N/A"}
      </p>

      <p><b>🕓 Arrival Time:</b> 
        ${booking.arrivalTime || "N/A"}
      </p>

      <p><b>💺 Seats:</b> ${booking.seats.join(", ")}</p>

      <hr/>

      <h3>👥 Passenger Details</h3>

      ${
        booking.passengers?.map(p => `
          <div style="margin-bottom:8px;">
            👤 ${p.name} | 🎂 ${p.age} | 🚻 ${p.gender} | 💺 Seat ${p.seat}
          </div>
        `).join("")
      }

      <hr/>

      <p style="color:orange;">
        <b>💳 Payment Status:</b> ${booking.paymentStatus}
      </p>

      <p>
        💸 Refund: ${
          booking.paymentStatus === "refunded"
            ? "Initiated"
            : booking.paymentStatus === "paid"
            ? "Will be processed soon"
            : "Not applicable"
        }
      </p>

      <br/>

      <p style="color:red;">
        We’re sorry for the inconvenience 🙏
      </p>

      <p style="color:#7c3aed;">
        Thank you for using our service 🚀
      </p>

    </div>
  `;
};