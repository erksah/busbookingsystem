import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import SeatBox from "./SeatBox";
import Legend from "./Legend";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const SleeperSeatLayout = ({
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
            seat: String(s.seat) // ✅ FORCE STRING
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
  }, [busId, date, selectedSeats]);

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
      // 🔓 ATTEMPT UNLOCK
      await fetch(`${API}/bookings/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busId, journeyDate: date, seats: [seatStr], sessionId })
      });
      updated = selectedSeats.filter(s => s !== seatStr);
    }

    onSelect(updated);
    fetchSeats();
  };

  if (!bus) return <p>Loading sleeper layout...</p>;

  const seats = bus.seatLayout || [];

  const lower = seats.filter(s => s.deck === "lower");
  const upper = seats.filter(s => s.deck === "upper");

  return (
    <div className="space-y-6">

      <h2 className="text-lg font-semibold">
        Sleeper Layout 🛏️
      </h2>

      {/* LOWER DECK */}
      <Deck
        title="Lower Deck"
        seats={lower}
        seatData={seatData}
        selectedSeats={selectedSeats}
        onClick={handleClick}
      />

      {/* UPPER DECK */}
      <Deck
        title="Upper Deck"
        seats={upper}
        seatData={seatData}
        selectedSeats={selectedSeats}
        onClick={handleClick}
      />

      <Legend />

    </div>
  );
};


// ==============================
// 🛏️ DECK
// ==============================
const Deck = ({
  title,
  seats,
  seatData,
  selectedSeats,
  onClick
}) => {

  return (
    <div className="bg-gray-100 p-4 rounded-xl">

      <h3 className="font-medium mb-3">{title}</h3>

      <div className="grid grid-cols-4 gap-4 justify-items-center">

        {seats.map(seat => (
          <div
            key={seat.seatNumber}
            className="flex flex-col items-center"
          >

            {/* 🛏️ BED STYLE (RECTANGLE LOOK) */}
            <div className="rotate-90">
              <SeatBox
                seat={seat}
                seatData={seatData}
                selectedSeats={selectedSeats}
                onClick={onClick}
              />
            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default SleeperSeatLayout;