import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const Login = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==============================
  // 🔐 AUTO REDIRECT
  // ==============================
  useEffect(() => {
    const token = localStorage.getItem("passengerToken");

    if (token && !location.state?.redirect) {
      navigate("/passenger", { replace: true });
    }
  }, [navigate, location.state]);

  // ==============================
  // 🔥 HANDLE LOGIN
  // ==============================
  const handleLogin = async () => {

    if (!form.email || !form.password) {
      return setError("Please fill all fields ❌");
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/passengers/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials ❌");
        return;
      }

      localStorage.setItem("passengerToken", data.token);
      localStorage.setItem("passenger", JSON.stringify(data.passenger));

      const redirect = location.state?.redirect;
      const seats = location.state?.seats;

      if (redirect) {
        navigate(redirect, {
          state: { seats },
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

        <h2 className="text-xl sm:text-2xl font-bold text-center text-violet-700">
          Passenger Login 🔐
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded text-sm text-center">
            {error}
          </div>
        )}

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

        {/* 🔥 FORGOT PASSWORD */}
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-violet-600 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-medium transition ${
            loading
              ? "bg-gray-400"
              : "bg-violet-600 hover:bg-violet-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* REGISTER */}
        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/register"
            state={location.state}
            className="text-violet-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>

      </div>

    </div>
  );
};

export default Login;