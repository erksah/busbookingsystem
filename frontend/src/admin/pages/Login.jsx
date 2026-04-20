import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const Login = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==============================
  // 🔐 AUTO REDIRECT (ALREADY LOGIN)
  // ==============================
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin/dashboard");
    }
  }, []);

  // ==============================
  // 🔥 HANDLE LOGIN
  // ==============================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      return setError("Please fill all fields ❌");
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.message || "Login failed ❌");
      }

      // ✅ SAVE TOKEN
      localStorage.setItem("adminToken", data.token);

      // ✅ SAVE ADMIN (optional)
      if (data.admin) {
        localStorage.setItem("admin", JSON.stringify(data.admin));
      }

      // 🔥 REDIRECT
      navigate("/admin/dashboard", { replace: true });

    } catch (error) {
      console.log(error);
      setError("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow w-full max-w-sm space-y-5"
      >

        <h2 className="text-2xl font-bold text-center">
          Admin Login 🔐
        </h2>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded text-sm text-center">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 text-white py-3 rounded hover:bg-violet-700 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

    </div>
  );
};

export default Login;