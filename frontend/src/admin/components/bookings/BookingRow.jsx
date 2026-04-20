import React from "react";

const BookingRow = ({ b, markPaid }) => {

  // ==============================
  // 🔥 BACKEND STATUS ONLY
  // ==============================
  const statusTag = b.dateStatus;

  // ==============================
  // 🎨 ROW STYLE (NO BLUR)
  // ==============================
  let rowStyle = "";

  if (statusTag === "today") {
    rowStyle = "bg-green-50 border-l-4 border-green-500";
  } else if (statusTag === "upcoming") {
    rowStyle = "bg-blue-50";
  } else if (statusTag === "past") {
    rowStyle = "bg-gray-50"; // ✅ FIXED (no opacity)
  }

  return (
    <tr className={`border-t hover:bg-gray-50 ${rowStyle}`}>

      {/* 🎟 Ticket */}
      <td className="p-3 font-medium">
        {b.ticketNumber}
      </td>

      {/* 👤 Name */}
      <td className="p-3">{b.name}</td>

      {/* 🧾 Type */}
      <td className="p-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
          b.type === "passenger" 
            ? "bg-violet-100 text-violet-700 border border-violet-200" 
            : "bg-gray-100 text-gray-600 border border-gray-200"
        }`}>
          {b.type === "passenger" ? "User" : "guest"}
        </span>
      </td>

      {/* 🚌 Route + Bus */}
      <td className="p-3 text-sm">
        <div>{b.route}</div>
        <div className="text-xs text-gray-500">
          🚌 {b.bus || "N/A"}
        </div>
      </td>

      {/* ⏰ Time */}
      <td className="p-3 text-xs">

        {/* 📅 DATE */}
        {b.journeyDate
          ? new Date(b.journeyDate).toLocaleDateString()
          : "-"}

        <br />

        {/* ⏰ TIME */}
        {b.departureTime} → {b.arrivalTime}

        {/* 🔥 STATUS TAG */}
        <div className="mt-1">

          {statusTag === "today" && (
            <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-[10px]">
              today
            </span>
          )}

          {statusTag === "upcoming" && (
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px]">
              upcoming
            </span>
          )}

          {statusTag === "past" && (
            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px]">
              past
            </span>
          )}

        </div>

      </td>

      {/* 💺 Seats */}
      <td className="p-3">
        {b.seats?.length ? b.seats.join(", ") : "-"}
      </td>

      {/* 💰 Amount */}
      <td className="p-3 font-semibold text-violet-600">
        ₹{b.total}
      </td>

      {/* 💳 Payment */}
      <td className="p-3">
        <span
          className={`text-xs px-2 py-1 rounded ${
            b.paymentStatus === "paid"
              ? "bg-green-100 text-green-600"
              : b.paymentStatus === "refunded"
              ? "bg-blue-100 text-blue-600"
              : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {b.paymentStatus}
        </span>
      </td>

      {/* 📞 Contact */}
      <td className="p-3 space-x-2">

        <a
          href={`tel:${b.phone}`}
          className="text-blue-600 text-xs"
        >
          📞 Call
        </a>

        <a
          href={`https://wa.me/${b.phone?.replace("+", "")}`}
          target="_blank"
          rel="noreferrer"
          className="text-green-600 text-xs"
        >
          💬 WA
        </a>

      </td>

      {/* ⚙️ Action */}
      <td className="p-3">

        {b.paymentStatus !== "paid" ? (
          <button
            onClick={() => markPaid(b.id)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
          >
            Mark Paid
          </button>
        ) : (
          <span className="text-green-600 text-xs">
            ✔ Done
          </span>
        )}

      </td>

    </tr>
  );
};

export default BookingRow;