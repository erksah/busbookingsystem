import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

export const useCheckout = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const busId = query.get("busId");

  const today = new Date().toISOString().split("T")[0];
  const rawDate = query.get("date") || today;
  const journeyDate = new Date(rawDate).toISOString().split("T")[0];

  const selectedSeats = location.state?.seats || [];

  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [booker, setBooker] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passengers, setPassengers] = useState([]);

  const token = localStorage.getItem("passengerToken");

  // ==============================
  // RESET BOOKING FLAG
  // ==============================
  useEffect(() => {
    sessionStorage.removeItem("booking_done");
  }, []);

  // ==============================
  // SAFETY CHECK
  // ==============================
  useEffect(() => {
    if (!selectedSeats || selectedSeats.length === 0) {
      navigate("/");
    }
  }, []);

  // ==============================
  // INIT PASSENGERS
  // ==============================
  useEffect(() => {
    const initial = selectedSeats.map((seat) => ({
      name: "",
      age: "",
      gender: "",
      seat,
    }));
    setPassengers(initial);
  }, [selectedSeats]);

  // ==============================
  // FETCH PROFILE
  // ==============================
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${API}/passengers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        setBooker({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });

      } catch {}
    };

    fetchProfile();
  }, [token]);

  // ==============================
  // FETCH BUS
  // ==============================
  useEffect(() => {

    const fetchBus = async () => {
      try {
        const res = await fetch(
          `${API}/buses/${busId}?date=${journeyDate}`
        );

        const data = await res.json();

        if (!res.ok) {
          setError("Failed to load bus ❌");
        } else {
          setBus(data);
        }

      } catch {
        setError("Failed to load bus ❌");
      }
    };

    if (busId) fetchBus();

  }, [busId, journeyDate]);

  // ==============================
  // PASSENGER CHANGE
  // ==============================
  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  // ==============================
  // PHONE VALIDATION
  // ==============================
  const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

  // ==============================
  // LOAD RAZORPAY
  // ==============================
  const loadScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ==============================
  // HANDLE BOOKING
  // ==============================
  const handleBooking = async () => {

    setError("");

    if (!booker.name || !booker.phone) {
      return setError("Name & phone required ❌");
    }

    if (!isValidPhone(booker.phone)) {
      return setError("Enter valid phone ❌");
    }

    if (selectedSeats.length === 0) {
      return setError("No seats selected ❌");
    }

    for (let p of passengers) {
      if (!p.name || !p.age || !p.gender) {
        return setError("Fill all passenger details ❌");
      }

      // 🔥 LADIES RULE VALIDATION
      const seatLayoutItem = bus.seatLayout.find(s => s.seatNumber === String(p.seat));
      if (seatLayoutItem?.category === "ladies" && p.gender !== "F") {
        return setError(`Seat ${p.seat} is reserved for ladies 👩. Please select Female gender.`);
      }

      // 🔥 ELDERLY RULE VALIDATION
      if (seatLayoutItem?.category === "elderly") {
        const age = Number(p.age);
        if (isNaN(age) || age < 60 || age > 120) {
          return setError(`Seat ${p.seat} is reserved for elderly passengers (60-120 years) 👴. Current age: ${p.age}`);
        }
      }
    }

    setLoading(true);

    try {

      // ==============================
      // 🔒 EXACT-MILLISECOND SEAT LOCK
      // ==============================
      let sessionId = localStorage.getItem("bookingSessionId");
      if (!sessionId) {
        sessionId = "session_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("bookingSessionId", sessionId);
      }

      const lockRes = await fetch(`${API}/bookings/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: bus._id,
          journeyDate,
          seats: selectedSeats,
          sessionId
        })
      });

      const lockData = await lockRes.json();
      if (!lockRes.ok) {
        setLoading(false);
        return setError(lockData.message || "Seats are unavailable ❌");
      }

      // ==============================
      // 🏦 RAZORPAY INIT
      // ==============================
      const loaded = await loadScript();
      if (!loaded) {
        setLoading(false);
        return alert("Razorpay failed ❌");
      }

      const totalAmount = selectedSeats.length * bus.price;

      // CREATE ORDER
      const orderRes = await fetch(`${API}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });

      const order = await orderRes.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,

        handler: async function (response) {

          // VERIFY PAYMENT
          const verifyRes = await fetch(`${API}/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();

          if (!verifyData.success) {
            setLoading(false);
            return setError("Payment verification failed ❌");
          }

          // BOOKING API
          const url = token
            ? `${API}/passengers/booking`
            : `${API}/guest/booking`;

          const bookingRes = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({
              ...(token ? {} : booker),
              busId: bus._id,
              journeyDate,
              seats: selectedSeats,
              passengers,
              sessionId,
            }),
          });

          const data = await bookingRes.json();

          if (!bookingRes.ok) {
            setLoading(false);
            return setError("Booking failed ❌");
          }

          sessionStorage.setItem("booking_done", "true");

          // 👉 PROCESSING PAGE
          navigate("/processing", {
            state: { booking: data.booking }
          });
        },

        prefill: {
          name: booker.name,
          email: booker.email,
          contact: booker.phone,
        },

        theme: {
          color: "#7c3aed",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.log(error);
      setLoading(false);
      setError("Something went wrong ❌");
    }
  };

  return {
    bus,
    error,
    loading,
    booker,
    passengers,
    selectedSeats,
    journeyDate,

    setBooker,
    handlePassengerChange,
    handleBooking,
  };
};