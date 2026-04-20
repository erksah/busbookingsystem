import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import SeatBox from "./SeatBox";
import Legend from "./Legend";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const Seat = ({ onSelect }) => {

  const { id } = useParams();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [bus, setBus] = useState(null);

  // ==============================
  // 🔥 FETCH BUS
  // ==============================
  useEffect(() => {
    fetch(`${API}/buses/${id}`)
      .then(res => res.json())
      .then(data => setBus(data))
      .catch(err => console.log(err));
  }, [id]);

  // ==============================
  // 🔥 FETCH BOOKED + RESERVED
  // ==============================
  useEffect(() => {
    fetch(`${API}/bookings/seats/${id}`)
      .then(res => res.json())
      .then(data => {

        console.log("SEATS API:", data); 

        const booked = data
          .filter(s => s.status === "confirmed")
          .map(s => String(s.seat));

        const reserved = data
          .filter(s => s.status === "reserved")
          .map(s => String(s.seat));

        setBookedSeats(booked);
        setReservedSeats(reserved);

      })
      .catch(err => console.log(err));
  }, [id]);

  // ==============================
  // 🔥 CLICK
  // ==============================
  const handleClick = (seat) => {

    const seatStr = String(seat.seatNumber);

    if (bookedSeats.includes(seatStr)) return;
    if (reservedSeats.includes(seatStr)) return;
    if (seat.isBlocked) return;

    let updated;

    if (selectedSeats.includes(seatStr)) {
      updated = selectedSeats.filter(s => s !== seatStr);
    } else {
      updated = [...selectedSeats, seatStr];
    }

    setSelectedSeats(updated);
    onSelect(updated);
  };

  if (!bus) return <p>Loading seats...</p>;

  const seats = bus.seatLayout || [];

  // ==============================
  // 🪑 GRID
  // ==============================
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

            {/* LEFT */}
            <div className="flex gap-2">
              {row.slice(0, 2).map(seat => (
                <SeatBox
                  key={seat.seatNumber}
                  seat={seat}
                  bookedSeats={bookedSeats}
                  reservedSeats={reservedSeats}
                  selectedSeats={selectedSeats}
                  onClick={handleClick}
                />
              ))}
            </div>

            {/* RIGHT */}
            <div className="flex gap-2">
              {row.slice(2, 4).map(seat => (
                <SeatBox
                  key={seat.seatNumber}
                  seat={seat}
                  bookedSeats={bookedSeats}
                  reservedSeats={reservedSeats}
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

export default Seat;