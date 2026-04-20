import React, { useEffect, useState } from "react";
import BookingTable from "../components/bookings/BookingTable";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const Bookings = () => {

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  // 🔥 NEW FILTER
  const [filter, setFilter] = useState("today"); // default today

  const token = localStorage.getItem("adminToken");

  // ==============================
  // 🔥 FETCH BOOKINGS
  // ==============================
  const fetchBookings = async () => {
    try {

      let url = `${API}/admin/bookings?`;

      if (type) url += `type=${type}&`;
      if (status) url += `status=${status}&`;
      if (filter) url += `filter=${filter}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setBookings(data.bookings || []);
      setLoading(false);

    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [type, status, filter]); // 🔥 include filter

  // ==============================
  // 💰 MARK AS PAID
  // ==============================
  const markPaid = async (id) => {
    try {

      const res = await fetch(`${API}/admin/payment/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message || "Failed ❌");
      }

      alert("Marked as Paid ✅");

      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, paymentStatus: "paid" } : b
        )
      );

    } catch {
      alert("Error ❌");
    }
  };

  // ==============================
  // LOADING
  // ==============================
  if (loading) {
    return <p className="text-center mt-20">Loading bookings...</p>;
  }

  return (
    <div className="p-6 space-y-6">

      <h2 className="text-2xl font-bold">
        Bookings Management 🎟️
      </h2>

      {/* ================= FILTERS ================= */}
      <div className="flex gap-4 flex-wrap">

        {/* TYPE */}
        <select
          value={type}
          className="p-2 border rounded"
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="guest">Guest</option>
          <option value="passenger">Passenger</option>
        </select>

        {/* PAYMENT */}
        <select
          value={status}
          className="p-2 border rounded"
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>

        {/* 🔥 DATE FILTER */}
        <select
          value={filter}
          className="p-2 border rounded"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>

      </div>

      {/* ================= TABLE ================= */}
      <BookingTable bookings={bookings} markPaid={markPaid} />

    </div>
  );
};

export default Bookings;