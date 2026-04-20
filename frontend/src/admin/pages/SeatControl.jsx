import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdOutlineChair } from "react-icons/md";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const SeatControl = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [bus, setBus] = useState(null);
  const [seatStatus, setSeatStatus] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedSeatInfo, setSelectedSeatInfo] = useState(null);
  const [highlightGroup, setHighlightGroup] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const token = localStorage.getItem("adminToken");

  // 🔐 TOKEN CHECK
  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, []);

  // 🚌 FETCH BUS
  useEffect(() => {
    fetch(`${API}/buses/${id}`)
      .then(res => res.json())
      .then(setBus)
      .catch(console.log);
  }, [id]);

  // 🪑 FETCH SEATS
  const fetchSeatStatus = async () => {
    try {
      const res = await fetch(
        `${API}/bookings/seats/${id}?journeyDate=${date}`
      );
      const data = await res.json();
      setSeatStatus(Array.isArray(data) ? data : []);
    } catch {
      setSeatStatus([]);
    }
  };

  useEffect(() => {
    fetchSeatStatus();
  }, [id, date]);

  // 🎯 SELECT SEAT
  const handleSelect = (seat) => {
    const seatStr = String(seat.seatNumber);
    const status = seatStatus.find(s => s.seat === seatStr);

    // 🔥 already booked → show popup
    if (status) {
      setSelectedSeatInfo(status);
      setHighlightGroup(status.groupId);
      return;
    }

    if (seat.isBlocked) return;

    setSelectedSeats(prev =>
      prev.includes(seatStr)
        ? prev.filter(s => s !== seatStr)
        : [...prev, seatStr]
    );
  };



  // 🔄 RESET / RESTORE
  const handleReset = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action === "resetAll" ? "reset all seats to normal" : "restore default classification"}?`)) return;

    try {
      setLoading(true);

      const res = await fetch(`${API}/admin/seat/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          busId: id,
          action,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      alert(data.message);
      
      // Refresh
      const busRes = await fetch(`${API}/buses/${id}`);
      const busData = await busRes.json();
      setBus(busData);
      setSelectedSeats([]);

    } catch {
      alert("Reset failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CONFIRM
  const handleConfirm = async () => {
    try {
      setLoading(true);

      await fetch(`${API}/admin/confirm/${selectedSeatInfo.bookingId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedSeatInfo(null);
      setHighlightGroup(null);
      fetchSeatStatus();

    } catch {
      alert("Confirm failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔓 RELEASE
  const handleRelease = async () => {
    try {
      setLoading(true);

      await fetch(`${API}/admin/release/${selectedSeatInfo.bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          seat: selectedSeatInfo.seat,
        }),
      });

      setSelectedSeatInfo(null);
      setHighlightGroup(null);
      fetchSeatStatus();

    } catch {
      alert("Release failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 AUTH HELPER
  const checkAuth = (res) => {
    if (res.status === 401) {
      alert("Session expired, please log in again ❌");
      localStorage.removeItem("adminToken");
      navigate("/admin/login");
      return false;
    }
    return true;
  };

  // 🎭 UPDATE CATEGORY (BULK 🔥)
  const handleCategoryUpdate = async (category) => {
    if (!selectedSeats.length) return;

    try {
      setLoading(true);

      const res = await fetch(`${API}/admin/seat/classification`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          busId: id,
          seatNumbers: selectedSeats,
          category,
        }),
      });

      if (!checkAuth(res)) return;

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      // Refresh bus data
      setBus(data.bus);
      setSelectedSeats([]);

    } catch {
      alert("Classification update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // ⚡ QUICK RESERVE (with auth check)
  const handleQuickReserve = async () => {
    if (!selectedSeats.length) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/admin/reserve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          busId: id,
          seats: selectedSeats,
          journeyDate: date,
        }),
      });
      if (!checkAuth(res)) return;
      const data = await res.json();
      if (!res.ok) return alert(data.message);
      setSelectedSeats([]);
      fetchSeatStatus();
    } catch {
      alert("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  if (!bus) return <p className="text-center mt-10">Loading...</p>;

  // ==============================
  // 🪑 GRID LOGIC
  // ==============================
  const rows = [];
  const seats = bus.seatLayout || [];
  for (let i = 0; i < seats.length; i += 4) {
    rows.push(seats.slice(i, i + 4));
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Seat Control 🛠️</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded-lg shadow-sm"
        />
      </div>

      <div className="bg-gray-50 p-8 rounded-2xl flex flex-col items-center border border-gray-200">
        <div className="w-full text-right text-sm text-gray-400 mb-4 pr-10">🧑‍✈️ Driver</div>
        
        {rows.map((row, i) => (
          <div key={i} className="flex gap-16 mb-6">
            <div className="flex gap-3">
              {row.slice(0, 2).map(seat => (
                <SeatBox
                  key={seat.seatNumber}
                  seat={seat}
                  seatStatus={seatStatus}
                  selectedSeats={selectedSeats}
                  onSelect={handleSelect}
                  highlightGroup={highlightGroup}
                />
              ))}
            </div>
            <div className="flex gap-3">
              {row.slice(2, 4).map(seat => (
                <SeatBox
                  key={seat.seatNumber}
                  seat={seat}
                  seatStatus={seatStatus}
                  selectedSeats={selectedSeats}
                  onSelect={handleSelect}
                  highlightGroup={highlightGroup}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ACTION BUTTONS */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white shadow-2xl border p-4 rounded-2xl flex gap-4 items-center z-50 animate-bounce-subtle">
           <span className="text-sm font-bold text-violet-600 px-2">{selectedSeats.length} Selected</span>
           
           <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

          <button
            onClick={handleQuickReserve}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-xl font-bold transition shadow-lg shadow-yellow-100"
          >
            ⚡ Quick
          </button>

          <button
            onClick={() => setShowPopup(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-xl font-bold transition shadow-lg shadow-violet-100"
          >
            Full Reserve
          </button>

          {/* 🔥 CLASSIFICATION ACTIONS */}
          <div className="flex gap-2 border-l pl-4">
            <button
              onClick={() => handleCategoryUpdate("normal")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold transition"
            >
              Normal
            </button>
            <button
              onClick={() => handleCategoryUpdate("elderly")}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold transition"
            >
              Elderly
            </button>
            <button
              onClick={() => handleCategoryUpdate("ladies")}
              className="bg-pink-50 hover:bg-pink-100 text-pink-700 px-4 py-2 rounded-xl text-sm font-bold transition"
            >
              Ladies
            </button>
          </div>
        </div>
      )}

      {/* 🛠 MAINTENANCE */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mt-10">
        <div>
          <h3 className="font-bold text-lg">Layout Maintenance ⚙️</h3>
          <p className="text-sm text-gray-500">Restore system defaults or clear classifications</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleReset("resetAll")}
            className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl font-bold transition text-sm"
          >
            Reset All
          </button>

          <button
            onClick={() => handleReset("restoreDefaults")}
            className="bg-gray-900 text-white px-6 py-2 rounded-xl hover:bg-black font-bold transition shadow-lg"
          >
            Restore Defaults
          </button>
        </div>
      </div>

      {/* MODALS RENDERED HERE... */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100]">
          <div className="bg-white p-8 rounded-3xl w-[360px] relative shadow-2xl animate-pop">
            <button onClick={() => setShowPopup(false)} className="absolute top-4 right-5 text-gray-400 hover:text-black">✖</button>
            <h3 className="text-xl font-bold mb-6 text-center">Reserve Details</h3>
            <input placeholder="Customer Name" className="border-2 border-gray-100 focus:border-violet-500 outline-none p-3 rounded-xl w-full mb-3 transition" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
            <input placeholder="Phone Number" className="border-2 border-gray-100 focus:border-violet-500 outline-none p-3 rounded-xl w-full mb-6 transition" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}/>
            <button onClick={handleReserve} disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white w-full py-4 rounded-2xl font-bold transition shadow-xl shadow-violet-100">Confirm Booking</button>
          </div>
        </div>
      )}
      
      {/* BOOKED DATA POPUP... */}
      {selectedSeatInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100]">
          <div className="bg-white p-8 rounded-3xl w-[360px] relative shadow-2xl animate-pop">
            <button onClick={() => { setSelectedSeatInfo(null); setHighlightGroup(null); }} className="absolute top-4 right-5 text-gray-400 hover:text-black">✖</button>
            <div className="flex items-center gap-3 mb-6">
               <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center text-xl font-bold">{selectedSeatInfo.seat}</div>
               <h3 className="text-xl font-bold">Booking Details</h3>
            </div>
            <div className="space-y-3 mb-8">
               <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Name</span><span className="font-bold">{selectedSeatInfo.name}</span></div>
               <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Status</span><span className={`font-bold capitalize ${selectedSeatInfo.status === 'confirmed' ? 'text-red-500' : 'text-yellow-600'}`}>{selectedSeatInfo.status}</span></div>
            </div>
            <div className="flex gap-3">
              {selectedSeatInfo.status === "reserved" && (
                <button onClick={handleConfirm} className="bg-green-500 hover:bg-green-600 text-white flex-1 py-3 rounded-2xl font-bold shadow-lg shadow-green-100 transition">Confirm</button>
              )}
              <button onClick={handleRelease} className="bg-red-50 hover:bg-red-100 text-red-600 flex-1 py-3 rounded-2xl font-bold transition text-sm">Release Seat</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// 🪑 SEAT BOX (SYNCED WITH PASSENGER VIEW)
const SeatBox = ({ seat, seatStatus, selectedSeats, onSelect, highlightGroup }) => {
  const seatStr = String(seat.seatNumber);
  const status = seatStatus.find(s => s.seat === seatStr);
  const isSelected = selectedSeats.includes(seatStr);

  let color = "text-green-500"; // 🟢 Available (Standard)

  if (seat.isBlocked) color = "text-black";
  else if (highlightGroup && status?.groupId === highlightGroup) color = "text-blue-600";
  else if (status?.status === "confirmed") color = "text-red-500";
  else if (status?.status === "reserved") color = "text-yellow-500";
  else if (isSelected) color = "text-violet-600"; // Lavender for selection
  else if (seat.category === "ladies") color = "text-pink-400";
  else if (seat.category === "elderly") color = "text-blue-400";

  return (
    <div
      onClick={() => onSelect(seat)}
      className={`cursor-pointer flex flex-col items-center transition duration-200 hover:scale-110 ${isSelected ? 'drop-shadow-md' : ''}`}
    >
      <MdOutlineChair className={`text-3xl ${color} ${isSelected ? 'scale-110' : ''}`} />
      <span className="text-[11px] font-bold mt-1">{seatStr}</span>
      
      <div className="flex h-3">
        {seat.category === "ladies" && <span className="text-[10px]">👩</span>}
        {seat.category === "elderly" && <span className="text-[10px]">👴</span>}
      </div>
    </div>
  );
};

export default SeatControl;