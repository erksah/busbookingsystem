import React, { useEffect, useState } from "react";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const NotificationBell = () => {

  const [count, setCount] = useState(0);
  const token = localStorage.getItem("adminToken");

  // ==============================
  // 🔥 FETCH NEW BOOKINGS COUNT
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
        setCount(data.count || 0);
      }

    } catch (err) {
      console.log("Notification Error:", err);
    }
  };

  // ==============================
  // 🔄 AUTO REFRESH
  // ==============================
  useEffect(() => {

    fetchNewBookings();

    const interval = setInterval(fetchNewBookings, 5000); // every 5 sec

    return () => clearInterval(interval);

  }, []);

  return (
    <div className="relative cursor-pointer">

      {/* 🔔 ICON */}
      <span className="text-xl">🔔</span>

      {/* 🔴 BADGE */}
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}

    </div>
  );
};

export default NotificationBell;