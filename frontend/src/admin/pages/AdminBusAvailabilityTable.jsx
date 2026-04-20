import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;
const API = (API_BASE || "").replace(/\/$/, "");


const AdminBusAvailabilityTable = () => {

  const [buses, setBuses] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({}); // state: { [busId]: data[] | null (loading) | {error: true} }
  const [loadingBuses, setLoadingBuses] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  // ==============================
  // 🔥 GROUP FUNCTION
  // ==============================
  const groupAvailability = (data) => {
    // If not array or empty, return empty
    if (!Array.isArray(data) || data.length === 0) return [];

    const sorted = [...data].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const groups = [];

    let current = {
      start: sorted[0].date,
      end: sorted[0].date,
      isActive: sorted[0].isActive,
    };

    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date);
      const curr = new Date(sorted[i].date);

      const diff = (curr - prev) / (1000 * 60 * 60 * 24);

      if (diff === 1 && sorted[i].isActive === current.isActive) {
        current.end = sorted[i].date;
      } else {
        groups.push(current);
        current = {
          start: sorted[i].date,
          end: sorted[i].date,
          isActive: sorted[i].isActive,
        };
      }
    }

    groups.push(current);
    return groups;
  };

  // ==============================
  // 🔥 FETCH
  // ==============================
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoadingBuses(true);
        const busRes = await fetch(`${API}/buses`);
        if (!busRes.ok) throw new Error("Failed to fetch buses");
        const busData = await busRes.json();
        setBuses(busData);
        setLoadingBuses(false);

        // Initialize map with null (loading) for each busId
        const initialMap = {};
        busData.forEach(b => initialMap[b._id] = null);
        setAvailabilityMap(initialMap);

        // Parallel fetch
        const promises = busData.map(async (bus) => {
          try {
            const res = await fetch(`${API}/admin/availability/${bus._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();

            // Ensure data is array
            setAvailabilityMap(prev => ({
              ...prev,
              [bus._id]: Array.isArray(data) ? data : { error: true }
            }));
          } catch (err) {
            console.error(`Fetch error for bus ${bus._id}:`, err);
            setAvailabilityMap(prev => ({
              ...prev,
              [bus._id]: { error: true }
            }));
          }
        });

        await Promise.all(promises);
      } catch (error) {
        console.error("General Fetch Error:", error);
        setLoadingBuses(false);
      }
    };

    fetchAll();
  }, [token]);

  const renderStatus = (busId) => {
    const data = availabilityMap[busId];

    if (data === null) {
      return <span className="text-gray-400 animate-pulse">Loading...</span>;
    }

    if (data.error) {
      return <span className="text-red-400">Error ⚠️</span>;
    }

    const grouped = groupAvailability(data);
    
    // Check for "currently active" - isActive AND date is today or future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeFuture = grouped.filter(g => 
      g.isActive && new Date(g.end).setHours(0,0,0,0) >= today.getTime()
    );

    if (activeFuture.length > 0) {
      return <span className="text-green-600 font-semibold">Active</span>;
    }

    return <span className="text-red-500">Inactive</span>;
  };

  const renderActiveDates = (busId) => {
    const data = availabilityMap[busId];

    if (data === null) return "---";
    if (data.error) return "Check server";

    const grouped = groupAvailability(data);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Only show current/future active dates
    const activeFuture = grouped.filter(g => 
      g.isActive && new Date(g.end).setHours(0,0,0,0) >= today.getTime()
    );

    if (activeFuture.length === 0) return "No Upcoming Dates";

    return (
      <div className="space-y-1">
        {activeFuture.map((r, i) => (
          <div key={i} className="whitespace-nowrap">
            {new Date(r.start).toLocaleDateString()} →{" "}
            {new Date(r.end).toLocaleDateString()}
          </div>
        ))}
      </div>
    );
  };

  if (loadingBuses) {
    return (
      <div className="p-8 text-center text-gray-500 text-lg">
        Loading buses... 🚌
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">

      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
        Bus Availability 🚍
        <button 
          onClick={() => window.location.reload()}
          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded font-normal"
        >
          Refresh
        </button>
      </h2>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">

        <table className="w-full text-sm text-left">

          <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
            <tr>
              <th className="p-4 font-semibold">Bus</th>
              <th className="p-4 font-semibold">Route</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold">Upcoming Active Dates</th>
              <th className="p-4 font-semibold text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {buses.map(bus => (
              <tr key={bus._id} className="hover:bg-gray-50 transition-colors">

                <td className="p-4 font-medium text-gray-900">
                  {bus.name}
                </td>

                <td className="p-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{bus.from}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium">{bus.to}</span>
                  </div>
                </td>

                <td className="p-4 text-center">
                  {renderStatus(bus._id)}
                </td>

                <td className="p-4 text-xs text-gray-500">
                  {renderActiveDates(bus._id)}
                </td>

                <td className="p-4 text-center">
                  <button
                    onClick={() => navigate(`/admin/availability/${bus._id}`)}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Edit
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="grid md:hidden gap-4">

        {buses.map(bus => (
          <div
            key={bus._id}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3"
          >

            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-gray-900">
                  {bus.name}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                   {bus.from} <span className="text-gray-300">→</span> {bus.to}
                </div>
              </div>
              <div className="text-sm">
                {renderStatus(bus._id)}
              </div>
            </div>

            <div className="bg-gray-50 p-2.5 rounded-lg">
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                Active Dates
              </div>
              <div className="text-xs text-gray-600">
                {renderActiveDates(bus._id)}
              </div>
            </div>

            <button
              onClick={() => navigate(`/admin/availability/${bus._id}`)}
              className="w-full bg-violet-600 text-white py-2.5 rounded-lg text-sm font-semibold shadow-sm active:scale-95 transition-all"
            >
              Edit
            </button>

          </div>
        ))}

      </div>

    </div>
  );
};

export default AdminBusAvailabilityTable;