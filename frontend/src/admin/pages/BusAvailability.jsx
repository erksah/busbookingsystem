import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const BusAvailability = () => {

  const { busId: paramBusId } = useParams();
  const navigate = useNavigate();

  const [busId, setBusId] = useState(paramBusId || "");
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);

  const [availabilityList, setAvailabilityList] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [price, setPrice] = useState("");

  const token = localStorage.getItem("adminToken");

  // ================= FETCH BUSES =================
  useEffect(() => {
    fetch(`${API}/buses`)
      .then(res => res.json())
      .then(data => setBuses(data))
      .catch(console.log);
  }, []);

  // ================= FETCH AVAILABILITY =================
  const fetchAvailability = async (id) => {
    if (!id) return;

    try {
      const res = await fetch(`${API}/admin/availability/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setAvailabilityList(data);

    } catch (err) {
      console.log(err);
    }
  };

  // ================= LOAD =================
  useEffect(() => {
    if (busId) {
      fetchAvailability(busId);

      const bus = buses.find(b => b._id === busId);
      setSelectedBus(bus);
    }
  }, [busId, buses]);

  // ================= SAVE =================
  const handleSubmit = async () => {

    if (!startDate || !endDate) {
      return alert("Select dates ❌");
    }

    try {
      const res = await fetch(`${API}/admin/availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          busId,
          startDate,
          endDate,
          isActive,
          price: price ? Number(price) : null,
        }),
      });

      if (!res.ok) return alert("Failed ❌");

      alert("Saved ✅");
      fetchAvailability(busId);

      // reset form
      setStartDate("");
      setEndDate("");
      setPrice("");

    } catch {
      alert("Error ❌");
    }
  };

  return (
    <div className="p-4 md:p-6">

      {/* CENTER WRAPPER */}
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">

          <div>
            <h2 className="text-xl md:text-2xl font-bold">
              Edit Bus Availability 🚌
            </h2>

            {selectedBus && (
              <p className="text-gray-600 text-sm">
                {selectedBus.name} ({selectedBus.from} → {selectedBus.to})
              </p>
            )}
          </div>

          {/* DROPDOWN */}
          <select
            value={busId}
            onChange={(e) => {
              setBusId(e.target.value);
              navigate(`/admin/availability/${e.target.value}`);
            }}
            className="border p-2 rounded w-full md:w-auto"
          >
            <option value="">Change Bus</option>
            {buses.map(bus => (
              <option key={bus._id} value={bus._id}>
                {bus.name} ({bus.from} → {bus.to})
              </option>
            ))}
          </select>

        </div>

        {/* ================= GRID ================= */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* ================= FORM ================= */}
          <div className="bg-white p-5 rounded-xl shadow space-y-3">

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border rounded"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 border rounded"
            />

            <input
              type="number"
              placeholder="Price ₹"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 border rounded"
            />

            <button
              onClick={() => setIsActive(!isActive)}
              className={`w-full py-3 rounded text-white ${
                isActive ? "bg-green-600" : "bg-red-500"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </button>

            <button
              onClick={handleSubmit}
              className="w-full bg-violet-600 text-white py-3 rounded"
            >
              Save
            </button>

          </div>

          {/* ================= EXISTING ================= */}
          <div className="bg-white p-5 rounded-xl shadow">

            <h3 className="font-semibold mb-4">
              Existing Data 📊
            </h3>

            {availabilityList.length === 0 && (
              <p className="text-sm text-gray-500">
                No data found
              </p>
            )}

            <div className="space-y-3 max-h-[400px] overflow-y-auto">

              {availabilityList.map((a, i) => (
                <div
                  key={i}
                  className="border p-3 rounded flex justify-between items-center"
                >

                  <div>
                    <p className="text-sm font-medium">
                      {new Date(a.date).toLocaleDateString()}
                    </p>

                    <p className="text-xs text-gray-500">
                      ₹{a.priceOverride || "-"}
                    </p>
                  </div>

                  <span className={`text-xs px-2 py-1 rounded ${
                    a.isActive
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-500"
                  }`}>
                    {a.isActive ? "Active" : "Inactive"}
                  </span>

                </div>
              ))}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default BusAvailability;