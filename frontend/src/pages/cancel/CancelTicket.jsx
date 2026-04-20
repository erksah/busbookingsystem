import React, { useState } from "react";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const CancelTicket = () => {

  const [ticketNumber, setTicketNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // ==============================
  // 🔥 SEND OTP
  // ==============================
  const handleSendOTP = async () => {

    if (!ticketNumber || !email) {
      setMessage("Enter ticket number & email ❌");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");

    try {

      const res = await fetch(`${API}/guest/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketNumber, email }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setMessage(data.message || "Failed ❌");
        setIsError(true);
        return;
      }

      setMessage("OTP sent successfully ✅");
      setIsError(false);
      setStep(2);

    } catch {
      setLoading(false);
      setMessage("Server error ❌");
      setIsError(true);
    }
  };

  // ==============================
  // 🔥 VERIFY + CANCEL
  // ==============================
  const handleCancel = async () => {

    if (!otp) {
      setMessage("Enter OTP ❌");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");

    try {

      const res = await fetch(`${API}/guest/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketNumber, otp }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setMessage(data.message || "Cancel failed ❌");
        setIsError(true);
        return;
      }

      setMessage("Booking cancelled successfully ✅");
      setIsError(false);
      setStep(3);

    } catch {
      setLoading(false);
      setMessage("Server error ❌");
      setIsError(true);
    }
  };

  // ==============================
  // 🔄 RESET
  // ==============================
  const resetForm = () => {
    setTicketNumber("");
    setEmail("");
    setOtp("");
    setStep(1);
    setMessage("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md space-y-5">

        <h2 className="text-2xl font-bold text-center">
          Cancel Ticket 🎟️
        </h2>

        {/* MESSAGE */}
        {message && (
          <div className={`text-center text-sm ${
            isError ? "text-red-500" : "text-green-600"
          }`}>
            {message}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="Ticket Number"
              className="w-full p-3 border rounded"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
            />

            <input
              type="email"
              placeholder="Registered Email"
              className="w-full p-3 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={handleSendOTP}
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
              className="w-full p-3 border rounded"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full bg-red-500 text-white py-3 rounded"
            >
              {loading ? "Cancelling..." : "Confirm Cancel"}
            </button>

            {/* 🔁 RESEND */}
            <button
              onClick={handleSendOTP}
              className="text-sm text-violet-600 underline w-full"
            >
              Resend OTP
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="text-center space-y-3">

            <p className="text-green-600 font-semibold">
              Ticket Cancelled Successfully ✅
            </p>

            <button
              onClick={resetForm}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel Another
            </button>

            <a
              href="/"
              className="inline-block bg-violet-600 text-white px-4 py-2 rounded"
            >
              Go Home
            </a>

          </div>
        )}

      </div>

    </div>
  );
};

export default CancelTicket;