import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const Dashboard = () => {

  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==============================
  // 🔥 FETCH DATA
  // ==============================
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("passengerToken");

      if (!token) {
        navigate("/login");
        return;
      }

      // ==============================
      // 👤 PROFILE
      // ==============================
      const profileRes = await fetch(`${API}/passengers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profileData = await profileRes.json();

      // ==============================
      // 🎟 BOOKINGS
      // ==============================
      const bookingRes = await fetch(`${API}/passengers/my-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const bookingData = await bookingRes.json();

      // ✅ FIX (IMPORTANT)
      setProfile(profileData);
      setBookings(bookingData.bookings || []);

    } catch (error) {
      console.log("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==============================
  // 🔐 LOGOUT
  // ==============================
  const handleLogout = () => {
    localStorage.removeItem("passengerToken");
    localStorage.removeItem("passenger");
    navigate("/login");
  };

  // ==============================
  // ⏳ LOADING
  // ==============================
  if (loading) {
    return (
      <p className="text-center mt-20 text-gray-500">
        Loading dashboard...
      </p>
    );
  }

  // ==============================
  // 📊 STATS
  // ==============================
  const total = bookings.length;

  const active = bookings.filter(
    (b) => b.bookingStatus !== "cancelled"
  ).length;

  const cancelled = bookings.filter(
    (b) => b.bookingStatus === "cancelled"
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center flex-wrap gap-3">

        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Welcome, {profile?.name || "Passenger"} 
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your bookings easily
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>

      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-gray-500">Total Bookings</p>
          <h2 className="text-2xl font-bold">{total}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-gray-500">Active</p>
          <h2 className="text-2xl font-bold text-green-600">
            {active}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-gray-500">Cancelled</p>
          <h2 className="text-2xl font-bold text-red-600">
            {cancelled}
          </h2>
        </div>

      </div>

      {/* ================= ACTIONS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <button
          onClick={() => navigate("/")}
          className="bg-violet-600 text-white p-4 rounded-xl text-lg hover:bg-violet-700 transition"
        >
          🚌 Book New Ticket
        </button>

        <button
          onClick={() => navigate("/passenger/my-bookings")}
          className="bg-gray-200 p-4 rounded-xl text-lg hover:bg-gray-300 transition"
        >
          🎟 View My Bookings
        </button>

      </div>

      {/* ================= RECENT BOOKINGS ================= */}
      <div className="space-y-4">

        <h2 className="text-lg sm:text-xl font-semibold">
          Recent Bookings
        </h2>

        {bookings.length === 0 ? (
          <p className="text-gray-500">
            No bookings yet 🚫
          </p>
        ) : (
          bookings.slice(0, 3).map((b) => (
            <div
              key={b._id}
              onClick={() => navigate(`/receipt?id=${b._id}`)}
              className="p-4 border rounded-xl flex justify-between items-center flex-wrap gap-3 cursor-pointer hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium">
                  {b.from} → {b.to}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  🕐 {b.departureTime || b.busId?.departureTime || "-"} → {b.arrivalTime || b.busId?.arrivalTime || "-"}
                </p>
                <p className="text-sm text-gray-500">
                  Seats: {b.seats?.join(", ")}
                </p>
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
          ))
        )}

      </div>

    </div>
  );
};

export default Dashboard;