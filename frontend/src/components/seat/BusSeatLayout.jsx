import React, { useEffect, useState } from "react";
import SeatBox from "./SeatBox";
import Legend from "./Legend";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const BusSeatLayout = ({
  busId,
  date,
  selectedSeats,
  onSelect,
}) => {

  const [seatData, setSeatData] = useState([]);
  const [bus, setBus] = useState(null);

  // ==============================
  // 🔥 FETCH BUS
  // ==============================
  useEffect(() => {
    if (!busId) return;

    fetch(`${API}/buses/${busId}`)
      .then(res => res.json())
      .then(setBus)
      .catch(console.log);

  }, [busId]);

  // ==============================
  // 🔥 FETCH SEATS
  // ==============================
  const fetchSeats = async () => {
    try {
      const res = await fetch(
        `${API}/bookings/seats/${busId}?journeyDate=${date}`
      );

      const data = await res.json();

      const formatted = Array.isArray(data)
        ? data.map(s => ({
            ...s,
            seat: String(s.seat)
          }))
        : [];

      setSeatData(formatted);

      // HYDRATE REFRESHES: If they own locks, auto-select them locally
      const sessionId = localStorage.getItem("bookingSessionId");
      if (sessionId) {
          const myReservedSeats = formatted
            .filter(s => s.status === "reserved" && s.reservedBy === sessionId)
            .map(s => s.seat);

          if (myReservedSeats.some(s => !selectedSeats.includes(s))) {
            const merged = Array.from(new Set([...selectedSeats, ...myReservedSeats]));
            onSelect(merged);
          }
      }

    } catch (err) {
      console.log(err);
      setSeatData([]);
    }
  };

  useEffect(() => {
    if (busId && date) {
      fetchSeats();
      const interval = setInterval(fetchSeats, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [busId, date, selectedSeats]); // Add selectedSeats to dependency to prevent stale hydration arrays

  // ==============================
  // 🔥 CLICK (REAL-TIME LOCk)
  // ==============================
  const handleClick = async (seat) => {

    const seatStr = String(seat.seatNumber);
    const seatInfo = seatData.find(s => s.seat === seatStr);

    const sessionId = localStorage.getItem("bookingSessionId");
    const isSelfReserved = seatInfo?.status === "reserved" && seatInfo?.reservedBy === sessionId;

    // 🚫 BLOCK IF BOOKED BY OTHERS
    if (seatInfo && !isSelfReserved && seatInfo.status !== "available") return;
    if (seat.isBlocked) return;

    const isSelecting = !selectedSeats.includes(seatStr);

    let updated;

    if (isSelecting) {
      // 🔒 ATTEMPT LOCK
      const res = await fetch(`${API}/bookings/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busId, journeyDate: date, seats: [seatStr], sessionId })
      });
      if (!res.ok) {
         const data = await res.json();
         alert(data.message || "This seat is booked by another user");
         fetchSeats(); // Refresh immediately to show the clash
         return;
      }
      updated = [...selectedSeats, seatStr];
    } else {
      // 🔓 ATTEMPT UNLOCK (but optimally visual release immediately)
      await fetch(`${API}/bookings/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busId, journeyDate: date, seats: [seatStr], sessionId })
      });
      updated = selectedSeats.filter(s => s !== seatStr);
    }

    onSelect(updated);
    fetchSeats(); // Refresh seat layout instantly to show yellow/grey changes
  };

  // ==============================
  // UI
  // ==============================
  if (!bus) return <p>Loading seats...</p>;

  const seats = bus.seatLayout || [];

  const rows = [];
  for (let i = 0; i < seats.length; i += 4) {
    rows.push(seats.slice(i, i + 4));
  }

  return (
    <div className="space-y-6">

      <h2 className="text-lg font-semibold">
        Select Seats 🪑
      </h2>

      <div className="text-right text-sm text-gray-500 pr-4">
        🧑‍✈️ Driver
      </div>

      <div className="bg-gray-100 p-6 rounded-xl flex flex-col items-center">

        {rows.map((row, i) => (
          <div key={i} className="flex gap-12 mb-4">

            <div className="flex gap-2">
              {row.slice(0, 2).map(seat => (
                <SeatBox
                  key={seat.seatNumber}
                  seat={seat}
                  seatData={seatData}
                  selectedSeats={selectedSeats}
                  onClick={handleClick}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {row.slice(2, 4).map(seat => (
                <SeatBox
                  key={seat.seatNumber}
                  seat={seat}
                  seatData={seatData}
                  selectedSeats={selectedSeats}
                  onClick={handleClick}
                />
              ))}
            </div>

          </div>
        ))}

      </div>

      <Legend />

    </div>
  );
};

export default BusSeatLayout;