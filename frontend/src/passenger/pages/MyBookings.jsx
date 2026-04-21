import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const MyBookings = () => {

  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // 📅 CHECK DATE TYPE
  // ==============================
  const getBookingType = (date, time) => {
    const now = new Date();
    const journey = new Date(date);

    // Parse time (e.g., "10:00 AM" or "02:30 PM")
    if (time) {
      const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const mins = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3];
        
        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
        
        journey.setHours(hours, mins, 0, 0);
      }
    } else {
      journey.setHours(23, 59, 59, 999);
    }

    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    const journeyDateOnly = new Date(date);
    journeyDateOnly.setHours(0,0,0,0);

    if (journey.getTime() < now.getTime()) return "past";
    if (journeyDateOnly.getTime() === todayDate.getTime()) return "today";
    return "upcoming";
  };

  const isCancellable = (booking) => {
    if (booking.bookingStatus === "cancelled") return false;

    const journey = new Date(booking.journeyDate);
    const time = booking.departureTime || booking.busId?.departureTime;

    if (time) {
      const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const mins = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3];
        
        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
        
        journey.setHours(hours, mins, 0, 0);
      }
    } else {
      journey.setHours(23, 59, 59, 999);
    }

    const now = new Date();
    const msDifference = journey.getTime() - now.getTime();
    const hoursDifference = msDifference / (1000 * 60 * 60);

    // Can only cancel if departure is at least 1 hour away
    return hoursDifference >= 1;
  };

  // ==============================
  // 🔥 FETCH BOOKINGS
  // ==============================
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("passengerToken");

      if (!token) {
        setError("Please login first ❌");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/passengers/my-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setBookings(data.bookings || []);
      setLoading(false);

    } catch (error) {
      console.log(error);
      setError("Server error ❌");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    
    const handleRefresh = () => fetchBookings();
    window.addEventListener("refreshBookings", handleRefresh);
    return () => window.removeEventListener("refreshBookings", handleRefresh);
  }, []);

  // ==============================
  // ❌ CANCEL BOOKING
  // ==============================
  const handleCancelBooking = async (bookingId) => {

    if (!window.confirm("Cancel this booking?")) return;

    try {
      const token = localStorage.getItem("passengerToken");

      const res = await fetch(`${API}/passengers/cancel/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message || "Cancel failed ❌");
      }

      alert("Booking cancelled ✅");
      fetchBookings();

    } catch (error) {
      console.log(error);
      alert("Server error ❌");
    }
  };

  // ==============================
  // 🔄 LOADING
  // ==============================
  if (loading) {
    return (
      <p className="text-center mt-20 text-gray-500">
        Loading bookings...
      </p>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      <h2 className="text-xl sm:text-2xl font-bold">
        My Bookings 🎟️
      </h2>

      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded text-sm">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center mt-10 text-gray-500">
          No bookings found 🚫
        </div>
      ) : (
        bookings.map((b) => {

          const departureTime = b.departureTime || b.busId?.departureTime;
          const type = getBookingType(b.journeyDate, departureTime);

          return (
            <div
              key={b._id}
              className={`bg-white p-5 rounded-xl shadow border space-y-4 ${
                type === "today"
                  ? "border-green-400"
                  : type === "upcoming"
                  ? "border-blue-400"
                  : "border-gray-200"
              }`}
            >

              {/* HEADER */}
              <div className="flex justify-between flex-wrap gap-2">

                <div>
                  <p className="font-semibold text-lg">
                    🎟 {b.ticketNumber}
                  </p>

                  <p className="text-sm text-gray-500">
                    {b.from} → {b.to}
                  </p>

                  {/* 🔥 DATE + TIME */}
                  <p className="text-sm mt-1 text-gray-600">
                    📅 {new Date(b.journeyDate).toLocaleDateString()}
                  </p>

                  <p className="text-sm text-gray-600">
                    🕐 {b.departureTime || b.busId?.departureTime || "-"} → {b.arrivalTime || b.busId?.arrivalTime || "-"}
                  </p>

                  {/* TYPE BADGE */}
                  <span className={`text-xs mt-1 inline-block px-2 py-1 rounded ${
                    type === "today"
                      ? "bg-green-100 text-green-600"
                      : type === "upcoming"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {type}
                  </span>
                </div>

                <div className="text-right">
                  <p className="font-bold text-violet-600">
                    ₹{b.total}
                  </p>

                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      b.bookingStatus === "cancelled"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {b.bookingStatus}
                  </span>
                </div>

              </div>

              {/* PASSENGERS */}
              <div className="space-y-2">

                {b.passengers?.map((p, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border rounded p-2"
                  >
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-gray-500">
                        Seat: {p.seat}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        p.status === "cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}

              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 flex-wrap">

                <button
                  onClick={() => navigate(`/receipt?id=${b._id}`)}
                  className="px-3 py-2 border rounded hover:bg-gray-100"
                >
                  View Receipt
                </button>

                {isCancellable(b) && (
                  <button
                    onClick={() => handleCancelBooking(b._id)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Cancel Booking
                  </button>
                )}

              </div>

            </div>
          );
        })
      )}

    </div>
  );
};

export default MyBookings;