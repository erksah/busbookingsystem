import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const Register = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const bookingData = location.state?.bookingData;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==============================
  // 🔥 REGISTER
  // ==============================
  const handleRegister = async () => {

    if (!form.name || !form.email || !form.password) {
      return setError("Please fill all fields ❌");
    }

    if (form.password.length < 5) {
      return setError("Password must be at least 5 characters 🔐");
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/passengers/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed ❌");
        return;
      }

      // ==============================
      // 🔐 AUTO LOGIN AFTER REGISTER
      // ==============================
      localStorage.setItem("passengerToken", data.token);
      localStorage.setItem("passenger", JSON.stringify(data.passenger));

      // ==============================
      // 🔄 REDIRECT (FIXED 🔥)
      // ==============================
      if (bookingData) {
        navigate("/checkout", {
          state: bookingData,
          replace: true,
        });
      } else {
        navigate("/passenger", { replace: true });
      }

    } catch (err) {
      console.log(err);
      setError("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-200 px-4">

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">

        {/* TITLE */}
        <h2 className="text-xl sm:text-2xl font-bold text-center text-violet-700">
          Create Account 📝
        </h2>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded text-sm text-center">
            {error}
          </div>
        )}

        {/* NAME */}
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Enter Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Enter Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
        />

        {/* BUTTON */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-medium transition ${
            loading
              ? "bg-gray-400"
              : "bg-violet-600 hover:bg-violet-700"
          }`}
        >
          {loading ? "Creating..." : "Register"}
        </button>

        {/* LOGIN LINK */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            state={location.state}
            className="text-violet-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

        {/* GUEST */}
        {bookingData && (
          <button
            onClick={() => navigate(-1)}
            className="w-full border py-2 rounded text-sm hover:bg-gray-100"
          >
            Continue as Guest 🚀
          </button>
        )}

      </div>

    </div>
  );
};

export default Register;