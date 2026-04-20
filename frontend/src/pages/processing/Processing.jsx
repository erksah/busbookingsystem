import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Processing = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;

  // ==============================
  // 🔥 AUTO REDIRECT
  // ==============================
  useEffect(() => {

    if (!booking) {
      return navigate("/");
    }

    const timer = setTimeout(() => {
      navigate("/receipt", {
        state: { booking }
      });
    }, 2000); // ⏳ 2 sec

    return () => clearTimeout(timer);

  }, []);

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-white">

      {/* Spinner */}
      <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>

      <h2 className="mt-6 text-xl font-semibold">
        Processing your booking...
      </h2>

      <p className="text-gray-500 mt-2">
        Please wait, do not refresh 🔄
      </p>

    </div>
  );
};

export default Processing;