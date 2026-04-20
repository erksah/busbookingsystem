import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const Bookings = () => {

  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("passengerToken");

  // ==============================
  // 🔥 FETCH BOOKINGS
  // ==============================
  const fetchBookings = async () => {
    try {

      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/passengers/my-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("📦 API RESPONSE:", data); // 🔥 DEBUG

      if (!res.ok) {
        setError(data.message || "Failed ❌");
      } else {
        // ✅ FIXED HERE
        setBookings(data.bookings || []);
      }

    } catch (err) {
      console.log(err);
      setError("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ==============================
  // ❌ CANCEL BOOKING
  // ==============================
  const handleCancel = async (id) => {

    if (!window.confirm("Cancel this booking?")) return;

    try {

      const res = await fetch(`${API}/passengers/cancel/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message || "Cancel failed ❌");
      }

      fetchBookings();

    } catch {
      alert("Server error ❌");
    }
  };

  // ==============================
  // 🔄 LOADING
  // ==============================
  if (loading) {
    return <p className="text-center mt-20">Loading bookings...</p>;
  }

  return (
    <div className="p-8 space-y-4">

      <h2 className="text-xl font-semibold">
        Your Bookings 🎟️
      </h2>

      {error && (
        <div className="bg-red-100 text-red-600 p-2 rounded">
          {error}
        </div>
      )}

      {!token && (
        <p className="text-neutral-600">
          Please login to see your bookings ❌
        </p>
      )}

      {token && bookings.length === 0 && (
        <p className="text-neutral-600">
          No bookings yet 🚫
        </p>
      )}

      {/* 🔥 LIST */}
      {bookings.map((b) => (
        <div key={b._id} className="p-4 border rounded-xl shadow-sm space-y-3">

          <div className="flex justify-between">

            <div>
              <p className="font-medium">
                🎟 {b.ticketNumber || b._id}
              </p>

              <p className="text-sm text-neutral-500">
                {b.from} → {b.to}
              </p>

              <p className="text-xs text-gray-400">
                📅 {new Date(b.journeyDate).toLocaleDateString()}
              </p>

              <p className="text-xs text-violet-500 mt-1">
                ⏱ {b.departureTime || b.busId?.departureTime || "-"} → {b.arrivalTime || b.busId?.arrivalTime || "-"}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-violet-600">
                ₹{b.total}
              </p>

              <p className="text-sm text-neutral-500">
                Seats: {b.seats?.join(", ")}
              </p>
            </div>

          </div>

          {/* STATUS */}
          <div className="flex gap-2 text-xs">

            <Badge type={b.bookingStatus} />
            <Badge type={b.paymentStatus} />

          </div>

          {/* ACTIONS */}
          <div className="flex gap-2">

            {b.bookingStatus !== "cancelled" && (
              <button
                onClick={() => handleCancel(b._id)}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Cancel
              </button>
            )}

            <Link
              to={`/receipt?id=${b._id}`}
              className="px-3 py-1 border rounded"
            >
              Receipt
            </Link>

          </div>

        </div>
      ))}

    </div>
  );
};


// ==============================
// 🔥 BADGE COMPONENT
// ==============================
const Badge = ({ type }) => {

  let color = "bg-gray-200 text-gray-700";

  if (type === "confirmed") color = "bg-green-100 text-green-600";
  if (type === "reserved") color = "bg-yellow-100 text-yellow-600";
  if (type === "cancelled") color = "bg-red-100 text-red-600";
  if (type === "paid") color = "bg-green-100 text-green-600";
  if (type === "pending") color = "bg-yellow-100 text-yellow-600";

  return (
    <span className={`px-2 py-1 rounded ${color}`}>
      {type}
    </span>
  );
};

export default Bookings;