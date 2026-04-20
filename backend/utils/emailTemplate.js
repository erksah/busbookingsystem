export const bookingTemplate = (booking) => {
  return `
    <div style="font-family: Arial; padding:20px; line-height:1.6;">
      
      <h2 style="color:#7c3aed;">🎟 Bus Booking Confirmed</h2>

      <p>Hello <b>${booking.name}</b>,</p>

      <p>Your ticket has been successfully booked ✅</p>

      <hr/>

      <h3>🧾 Booking Details</h3>

      <p><b>🎫 Ticket ID:</b> ${booking.ticketNumber || booking._id}</p>

      <p><b>🚌 Bus:</b> ${booking.busName || "Express Bus"}</p>

      <p><b>📍 Route:</b> ${booking.from} → ${booking.to}</p>

      <p><b>📅 Journey Date:</b> 
        ${new Date(booking.journeyDate).toDateString()}
      </p>

      <p><b>🛣 Distance:</b> ${booking.distanceKm ? booking.distanceKm + " km" : "N/A"}</p>

      <p><b>🕒 Departure Time:</b> 
        ${booking.departureTime || "N/A"}
      </p>

      <p><b>🕓 Arrival Time:</b> 
        ${booking.arrivalTime || "N/A"} ${booking.journeyDays > 0 ? `(+${booking.journeyDays} Day)` : ""}
      </p>

      <p><b>💺 Seats:</b> ${booking.seats.join(", ")}</p>

      <p><b>💰 Total Fare:</b> ₹${booking.total}</p>

      <p style="color:green;">
        <b>💳 Payment Status:</b> ${booking.paymentStatus}
      </p>

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

      <p>📲 Please carry this ticket during travel.</p>

      <p style="color:#7c3aed;">
        Thank you for booking with us 🚀
      </p>

    </div>
  `;
};