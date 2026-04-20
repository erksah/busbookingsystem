import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { formatArrivalLabel } from "../../../src/utils/timeCalc";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const Receipt = () => {

  const location = useLocation();

  const bookingFromState = location.state?.booking;

  const query = new URLSearchParams(location.search);
  const id = query.get("id");

  const [booking, setBooking] = useState(bookingFromState || null);
  const [loading, setLoading] = useState(!bookingFromState);

  // ==============================
  // 🔥 FETCH BOOKING
  // ==============================
  const fetchBooking = async () => {
    if (!id || id === "null") return;

    try {
      const res = await fetch(`${API}/bookings/${id}`);
      const data = await res.json();

      setBooking(data);
      setLoading(false);

    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  // ==============================
  // 🔥 LOAD DATA
  // ==============================
  useEffect(() => {
    if (id && id !== "null") {
      fetchBooking();
    }
  }, [id]);

  // ==============================
  // ❌ CANCEL BOOKING
  // ==============================
  const cancelBooking = async () => {

    if (!window.confirm("Cancel this booking?")) return;

    try {
      const token = localStorage.getItem("passengerToken");

      if (!token) {
        return alert("Login required ❌");
      }

      const res = await fetch(`${API}/passengers/cancel/${booking._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message || "Cancel failed ❌");
      }

      alert("Booking cancelled ❌\nRefund initiated 💸");

      fetchBooking();

    } catch {
      alert("Server error ❌");
    }
  };

  // ==============================
  // 🖨 PRINT
  // ==============================
  const handlePrint = () => window.print();

  // ==============================
  // 🔄 LOADING
  // ==============================
  if (loading) {
    return <p className="text-center mt-20">Loading receipt...</p>;
  }

  // ==============================
  // ❌ NOT FOUND
  // ==============================
  if (!booking) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">Receipt</h2>
        <p className="mt-4 text-neutral-600">Booking not found ❌</p>
        <Link to="/" className="text-violet-600 mt-4 inline-block">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full lg:px-28 md:px-16 sm:px-7 px-4 mt-[13ch] mb-[8ch]">

      <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 shadow space-y-6">

        <h2 className="text-2xl font-bold text-center">
          Booking Receipt 🎟️
        </h2>

        {/* SUCCESS INFO */}
        <div className="text-center text-green-600 text-sm">
          📲 Ticket sent via SMS & WhatsApp
        </div>

        <div className="text-center text-sm text-gray-500">
          Ticket ID:
          <span className="font-semibold text-black ml-1">
            {booking.ticketNumber || booking._id}
          </span>
        </div>

        {/* DETAILS */}
        <div className="space-y-3">

          <Row label="Name" value={booking.name} />
          <Row label="Email" value={booking.email || "-"} />
          <Row label="Phone" value={booking.phone || "-"} />

          <Row
            label="Route"
            value={
              booking.from && booking.to
                ? `${booking.from} → ${booking.to}`
                : "-"
            }
          />

          <Row
            label="Date"
            value={
              booking.journeyDate
                ? new Date(booking.journeyDate).toLocaleDateString()
                : "-"
            }
          />

          {/* 🔥 DYNAMIC TIME SECTION */}
          <Row
            label="Time"
            value={`${booking.departureTime || "-"} → ${booking.arrivalTime ? formatArrivalLabel(booking.arrivalTime, booking.journeyDays) : "-"}`}
          />

          {booking.distanceKm > 0 && (
             <Row label="Distance" value={`${booking.distanceKm} km`} />
          )}

          <Row
            label="Booking Status"
            value={<Badge type={booking.bookingStatus} />}
          />

          <Row
            label="Payment"
            value={<Badge type={booking.paymentStatus} />}
          />

        </div>

        {/* PASSENGERS */}
        <div className="space-y-4">

          <h3 className="text-lg font-semibold">
            Passenger Details 👥
          </h3>

          {booking.passengers?.map((p, i) => (
            <div
              key={i}
              className="border rounded p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-gray-500">
                  Age: {p.age} | {p.gender}
                </p>
                <p className="text-sm">Seat: {p.seat}</p>
              </div>

              <Badge type={p.status} />
            </div>
          ))}

        </div>

        {/* TOTAL */}
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-violet-600">
            ₹{booking.total}
          </span>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 pt-4">

          <button
            onClick={handlePrint}
            className="w-full bg-gray-300 py-3 rounded"
          >
            🖨 Print
          </button>

          {booking.bookingStatus !== "cancelled" && (
            <button
              onClick={cancelBooking}
              className="w-full bg-red-500 text-white py-3 rounded"
            >
              Cancel Booking
            </button>
          )}

          <Link
            to="/"
            className="w-full text-center bg-violet-600 text-white py-3 rounded"
          >
            Book Again
          </Link>

        </div>

      </div>

    </div>
  );
};

// ==============================
// 🔹 ROW COMPONENT
// ==============================
const Row = ({ label, value }) => (
  <div className="flex justify-between">
    <span>{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

// ==============================
// 🔹 BADGE COMPONENT
// ==============================
const Badge = ({ type }) => {
  let color = "bg-gray-200 text-gray-700";

  if (type === "confirmed") color = "bg-green-100 text-green-600";
  if (type === "reserved") color = "bg-yellow-100 text-yellow-600";
  if (type === "cancelled") color = "bg-red-100 text-red-600";
  if (type === "paid") color = "bg-green-100 text-green-600";
  if (type === "pending") color = "bg-yellow-100 text-yellow-600";
  if (type === "refunded") color = "bg-blue-100 text-blue-600";

  return (
    <span className={`text-xs px-2 py-1 rounded ${color}`}>
      {type}
    </span>
  );
};

export default Receipt;