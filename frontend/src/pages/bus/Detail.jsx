import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaStar } from "react-icons/fa";

import BusSeatLayout from "../../components/seat/BusSeatLayout";
import SleeperSeatLayout from "../../components/seat/SleeperSeatLayout";
import { calculateDuration, formatArrivalLabel, getBusStatus } from "../../utils/timeCalc";

import Bus1 from "../../assets/images/bus1.png";
import Bus2 from "../../assets/images/bus2.png";
import Bus3 from "../../assets/images/bus3.png";
import Bus4 from "../../assets/images/bus4.png";
import Bus5 from "../../assets/images/bus5.png";
import Bus6 from "../../assets/images/bus6.png";
import Bus7 from "../../assets/images/bus7.png";
import Bus8 from "../../assets/images/bus8.png";
import Bus9 from "../../assets/images/bus9.png";
import Bus10 from "../../assets/images/bus10.png";

const busImages = [
  Bus1, Bus2, Bus3, Bus4, Bus5,
  Bus6, Bus7, Bus8, Bus9, Bus10,
];

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const Detail = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  const getLocalTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const today = getLocalTodayDate();
  const journeyDate = queryParams.get("date") || today;

  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [image, setImage] = useState("");
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [error, setError] = useState("");

  // 🎲 RANDOM IMAGE
  useEffect(() => {
    const random =
      busImages[Math.floor(Math.random() * busImages.length)];
    setImage(random);
  }, []);

  // 🔥 FETCH BUS WITH DATE (MAIN FIX)
  useEffect(() => {

    const fetchBus = async () => {
      try {

        const res = await fetch(
          `${API}/buses/${id}?date=${journeyDate}`
        );

        const data = await res.json();

        console.log("BUS DATA 👉", data); // 🔍 debug

        if (!res.ok) {
          setError(data.message || "Bus not found ❌");
        } else {
          setBus(data);
        }

      } catch {
        setError("Server error ❌");
      }
    };

    fetchBus();

  }, [id, journeyDate]);

  // ==============================
  // 🧹 CLEANUP ON ROUTE CHANGES (BACK BUTTON)
  // ==============================
  useEffect(() => {
    return () => {
      // If user navigates Back or away from site organically via router
      if (!window.isProceedingToCheckout) {
        const sessionId = localStorage.getItem("bookingSessionId");
        if (sessionId && bus) {
          const payload = JSON.stringify({ busId: bus._id, journeyDate, sessionId });
          navigator.sendBeacon(`${API}/bookings/unlock`, new Blob([payload], { type: "application/json" }));
        }
      }
      window.isProceedingToCheckout = false;
    };
  }, [bus, journeyDate]);

  // 🔄 LOADING
  if (!bus && !error) {
    return (
      <p className="text-center mt-20 text-lg">
        Loading bus details...
      </p>
    );
  }

  // ❌ ERROR
  if (error) {
    return (
      <div className="text-center mt-20 space-y-3">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="text-violet-600 underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  // 💰 TOTAL
  const totalAmount = selectedSeats.length * bus.price;

  const scheduleStatus = bus ? getBusStatus(bus.departureTime, bus.arrivalTime, bus.journeyDays, journeyDate) : "OPEN";
  const isBusUnavailable = scheduleStatus !== "OPEN";

  // 🚫 LIMIT
  const handleSeatSelect = (seats) => {
    if (seats.length > 6) {
      return alert("Max 6 seats allowed ❌");
    }
    setSelectedSeats(seats);
  };

  return (
    <div className="w-full lg:px-28 md:px-16 sm:px-7 px-4 mt-[13ch] mb-[10ch]">

      <div className="grid md:grid-cols-2 gap-12">

        {/* LEFT */}
        <div className="space-y-6">

          <img
            src={image}
            alt="bus"
            className="w-full h-64 object-cover rounded-xl shadow"
          />

          <h1 className="text-3xl font-bold">{bus.name}</h1>

          <div className="flex items-center gap-2 text-yellow-500">
            <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            <span className="text-black text-sm">(4.5)</span>
          </div>

          <p className="text-lg text-gray-700">
            {bus.from} → {bus.to}
          </p>

          <p className="text-sm text-gray-500">
            📅 {new Date(journeyDate).toLocaleDateString()}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="text-sm text-violet-600 underline"
          >
            Change Search
          </button>

        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          <div className="bg-white p-5 rounded-xl shadow space-y-2">

            <p><b>From:</b> {bus.from}</p>
            <p><b>To:</b> {bus.to}</p>

            <div className="py-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Please select travel date
              </label>
              <input 
                type="date" 
                value={journeyDate}
                min={today}
                onChange={(e) => navigate(`/bus/${id}?date=${e.target.value}`)}
                className="w-full border rounded-lg p-2 text-sm focus:outline-violet-500 bg-gray-50"
              />
            </div>

            <p><b>Departure:</b> {bus.departureTime}</p>
            <p><b>Arrival:</b> {formatArrivalLabel(bus.arrivalTime, bus.journeyDays)}</p>

            {isBusUnavailable && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-semibold border border-red-200 mt-2">
                {scheduleStatus === "REACHED" ? "🏁 Journey Completed" :
                 scheduleStatus === "ON_THE_WAY" ? "🚌 Bus already Departed" :
                 scheduleStatus === "CLOSING" ? "🔒 Booking Closed" :
                 "🚫 Bus Not Available"}
                <br/>
                <span className="text-xs font-normal">Please choose a different date.</span>
              </div>
            )}

            <div className="pt-2">
              <p className="font-semibold text-violet-600 text-sm mb-1">
                ⏱ Duration: {calculateDuration(bus.departureTime, bus.arrivalTime, bus.journeyDays)}
              </p>
              {bus.distanceKm > 0 && (
                <p className="text-gray-500 text-xs">
                  🛣 Distance: {bus.distanceKm} km
                </p>
              )}
            </div>

            {/* 🔥 DYNAMIC PRICE */}
            <div className="text-xl font-bold text-violet-600 mt-2">
              ₹{bus.price}
            </div>

            <div className="text-sm text-gray-500">
              {bus.busCategory} | {bus.seatType}
            </div>

          </div>

          {/* SEATS */}
          <div className={`bg-white p-5 rounded-xl shadow relative ${isBusUnavailable ? "opacity-50 pointer-events-none grayscale" : ""}`}>
            
            {isBusUnavailable && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/30 backdrop-blur-[1px] rounded-xl">
                 <p className="bg-white px-4 py-2 rounded-lg shadow-lg font-bold text-red-600 border border-red-100">
                    SELECTION DISABLED
                 </p>
              </div>
            )}

            {bus.seatType === "Sleeper" ? (
              <SleeperSeatLayout
                busId={id}
                date={journeyDate}
                selectedSeats={selectedSeats}
                onSelect={handleSeatSelect}
              />
            ) : (
              <BusSeatLayout
                busId={id}
                date={journeyDate}
                selectedSeats={selectedSeats}
                onSelect={handleSeatSelect}
              />
            )}

          </div>

          {/* TOTAL */}
          {selectedSeats.length > 0 && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm">
                Seats: {selectedSeats.join(", ")}
              </p>
              <p className="font-semibold">
                Total: ₹{totalAmount}
              </p>
            </div>
          )}

          {/* BUTTON */}
          {selectedSeats.length > 0 && (
            <button
              onClick={() => {

                const token = localStorage.getItem("passengerToken");

                if (token) {
                  window.isProceedingToCheckout = true;
                  navigate(`/checkout?busId=${id}&date=${journeyDate}`, {
                    state: { seats: selectedSeats },
                  });
                } else {
                  setShowAuthPopup(true);
                }

              }}
              className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700"
            >
              Proceed to Checkout ({selectedSeats.length})
            </button>
          )}

        </div>

      </div>

      {/* POPUP */}
      {showAuthPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-[350px] text-center space-y-4">

            <h2 className="text-xl font-semibold">
              Continue Booking
            </h2>

            <p className="text-sm text-gray-500">
              Login recommended for better experience
            </p>

            <button
              onClick={() => {
                window.isProceedingToCheckout = true;
                navigate(`/checkout?busId=${id}&date=${journeyDate}`, {
                  state: { seats: selectedSeats, isGuest: true },
                })
              }}
              className="w-full bg-gray-300 py-2 rounded"
            >
              Continue as Guest
            </button>

            <button
              onClick={() => {
                window.isProceedingToCheckout = true;
                navigate("/login", {
                  state: {
                    redirect: `/checkout?busId=${id}&date=${journeyDate}`,
                    seats: selectedSeats,
                  },
                })
              }}
              className="w-full bg-violet-600 text-white py-2 rounded"
            >
              Login / Register
            </button>

            <button
              onClick={() => setShowAuthPopup(false)}
              className="text-sm text-red-500"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

    </div>
  );
};

export default Detail;