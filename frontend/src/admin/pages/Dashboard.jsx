import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const Dashboard = () => {

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    bookings: 0,
    revenue: 0,
    buses: 0,
    passengers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // 🔥 FETCH STATS
  // ==============================
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const res = await fetch(`${API}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("DASHBOARD DATA 👉", data); // 🔥 DEBUG

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
        return;
      }

      if (!res.ok) {
        setError(data.message || "Failed to load dashboard ❌");
        return;
      }

      // 🔥 SAFE SET (important)
      setStats({
        bookings: data.bookings || data.totalBookings || 0,
        revenue: data.revenue || data.totalRevenue || 0,
        buses: data.buses || data.totalBuses || 0,
        passengers: data.passengers || data.totalPassengers || 0,
      });

    } catch (error) {
      console.log(error);
      setError("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ==============================
  // 🔄 LOADING
  // ==============================
  if (loading) {
    return (
      <p className="text-center mt-20 text-gray-500">
        Loading Dashboard...
      </p>
    );
  }

  // ==============================
  // ❌ ERROR
  // ==============================
  if (error) {
    return (
      <p className="text-center mt-20 text-red-500">
        {error}
      </p>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <h2 className="text-2xl font-bold">
        Admin Dashboard 📊
      </h2>

      {/* 🔥 STATS */}
      <div className="grid md:grid-cols-4 gap-5">

        {/* BOOKINGS */}
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Bookings</p>
          <h2 className="text-2xl font-bold">
            {stats.bookings}
          </h2>
        </div>

        {/* REVENUE */}
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Revenue</p>
          <h2 className="text-2xl font-bold text-violet-600">
            ₹{stats.revenue}
          </h2>
        </div>

        {/* BUSES */}
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Buses</p>
          <h2 className="text-2xl font-bold">
            {stats.buses}
          </h2>
        </div>

        {/* USERS */}
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Users</p>
          <h2 className="text-2xl font-bold">
            {stats.passengers}
          </h2>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;