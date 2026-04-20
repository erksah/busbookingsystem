import React, { useEffect, useState } from "react";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const NewBookings = () => {

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");

  // ==============================
  // 🔥 FETCH NEW BOOKINGS
  // ==============================
  const fetchNewBookings = async () => {
    try {

      const res = await fetch(`${API}/admin/bookings/new`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setBookings(data.bookings || []);
      }

      setLoading(false);

    } catch (err) {
      console.log("🔥 ERROR:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewBookings();
  }, []);

  // ==============================
  // 🔄 LOADING
  // ==============================
  if (loading) {
    return (
      <p className="text-center mt-20 text-gray-500">
        Loading new bookings...
      </p>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <h2 className="text-2xl font-bold">
        🔥 New Bookings
      </h2>

      {bookings.length === 0 ? (
        <p className="text-gray-500">
          No new bookings found 🚫
        </p>
      ) : (
        bookings.map((b) => (
          <div
            key={b._id}
            className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow"
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
              </div>

              <div className="text-right">
                <p className="font-bold text-violet-600">
                  ₹{b.total}
                </p>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  {b.bookingStatus}
                </span>
              </div>

            </div>

            {/* TIME */}
            <div className="text-sm text-gray-500 mt-2">
              📅 {new Date(b.journeyDate).toLocaleDateString()}
              <br />
              ⏰ {b.busId?.departureTime} → {b.busId?.arrivalTime}
            </div>

            {/* PASSENGERS */}
            <div className="mt-3 space-y-2">

              {b.passengers?.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between border rounded p-2 bg-white"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      Seat: {p.seat}
                    </p>
                  </div>

                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                    {p.status}
                  </span>
                </div>
              ))}

            </div>

          </div>
        ))
      )}

    </div>
  );
};

export default NewBookings;