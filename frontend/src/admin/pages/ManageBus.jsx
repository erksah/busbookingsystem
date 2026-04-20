import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const ManageBus = () => {

  const navigate = useNavigate();

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ==============================
  // 🔥 FETCH
  // ==============================
  const fetchBuses = async () => {
    try {
      const res = await fetch(`${API}/buses`);
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load buses ❌");
        return;
      }

      setBuses(Array.isArray(data) ? data : []);

    } catch (error) {
      console.log(error);
      setMessage("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  // ==============================
  // 🔥 DELETE
  // ==============================
  const handleDelete = async (id) => {

    if (!window.confirm("Delete this bus?")) return;

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const res = await fetch(`${API}/admin/bus/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
        return;
      }

      if (!res.ok) {
        return setMessage(data.message || "Delete failed ❌");
      }

      setMessage("Bus deleted successfully ✅");

      setBuses(prev => prev.filter(bus => bus._id !== id));

    } catch (error) {
      console.log(error);
      setMessage("Server error ❌");
    }
  };

  // ==============================
  // 🔥 LOADING
  // ==============================
  if (loading) {
    return <p className="text-center mt-20 text-lg">Loading buses...</p>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <h2 className="text-xl md:text-2xl font-bold">
          Manage Buses 🚌
        </h2>

        <button
          onClick={() => navigate("/admin/add-bus")}
          className="bg-violet-600 text-white px-4 py-2 rounded"
        >
          + Add Bus
        </button>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="bg-gray-100 text-center p-2 rounded text-sm">
          {message}
        </div>
      )}

      {/* EMPTY */}
      {buses.length === 0 ? (
        <p className="text-gray-500 text-center">
          No buses available 🚫
        </p>
      ) : (

        <div className="grid gap-4">

          {buses.map((bus) => {

            const totalSeats =
              bus.totalSeats || bus.seatLayout?.length || 0;

            return (
              <div
                key={bus._id}
                className="bg-white p-4 md:p-5 rounded-xl shadow border flex flex-col md:flex-row justify-between gap-4"
              >

                {/* LEFT */}
                <div className="space-y-1">
                  <p className="font-semibold text-lg">
                    {bus.name}
                  </p>

                  <p className="text-gray-500 text-sm">
                    {bus.from} → {bus.to}
                  </p>

                  <p className="text-sm text-gray-600">
                    🕒 {bus.departureTime} - {bus.arrivalTime}
                  </p>

                  <p className="text-sm">
                    Seats: {totalSeats}
                  </p>

                  <p className="text-xs text-gray-500">
                    {bus.busCategory} | {bus.seatType}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col md:items-end gap-2">

                  <p className="font-bold text-violet-600 text-lg">
                    ₹{bus.price}
                  </p>

                  <div className="flex gap-2 flex-wrap">

                    <button
                      onClick={() =>
                        navigate(`/admin/edit-bus/${bus._id}`)
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/admin/seat/${bus._id}`)
                      }
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Seats
                    </button>

                    <button
                      onClick={() => handleDelete(bus._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};

export default ManageBus;