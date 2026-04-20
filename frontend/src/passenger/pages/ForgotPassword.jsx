import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const ForgotPassword = () => {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==============================
  // 📧 STEP 1: SEND OTP
  // ==============================
  const handleSendOtp = async () => {

    if (!email) {
      return setError("Enter email ❌");
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/passengers/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed ❌");
        return;
      }

      setMessage("OTP sent to email ✅");
      setStep(2);

    } catch {
      setError("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 🔢 STEP 2: VERIFY OTP
  // ==============================
  const handleVerifyOtp = async () => {

    if (!otp) {
      return setError("Enter OTP ❌");
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/passengers/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid OTP ❌");
        return;
      }

      setMessage("OTP verified ✅");
      setStep(3);

    } catch {
      setError("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 🔐 STEP 3: RESET PASSWORD
  // ==============================
  const handleResetPassword = async () => {

    if (!newPassword) {
      return setError("Enter new password ❌");
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/passengers/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Reset failed ❌");
        return;
      }

      setMessage("Password reset successful ✅");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch {
      setError("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-200 px-4">

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">

        <h2 className="text-xl sm:text-2xl font-bold text-center text-violet-700">
          Forgot Password 🔐
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded text-sm text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 text-green-600 p-2 rounded text-sm text-center">
            {message}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-violet-600 text-white py-3 rounded"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-violet-600 text-white py-3 rounded"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </>
        )}

      </div>

    </div>
  );
};

export default ForgotPassword;