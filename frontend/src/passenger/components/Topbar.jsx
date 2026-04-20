import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Topbar = () => {

  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef();

  // ✅ SAFE USER FETCH
  let user = null;

  try {
    const stored = localStorage.getItem("passenger");
    if (stored && stored !== "undefined") {
      user = JSON.parse(stored);
    }
  } catch {
    user = null;
  }

  // 🔥 OUTSIDE CLICK CLOSE
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔥 ESC CLOSE
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowMenu(false);
    };

    window.addEventListener("keydown", handleEsc);
    return () =>
      window.removeEventListener("keydown", handleEsc);
  }, []);

  // 🔐 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("passengerToken");
    localStorage.removeItem("passenger");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex justify-between items-center bg-white px-4 sm:px-6 py-3 shadow">

      {/* ================= LEFT ================= */}
      <h2 className="font-semibold text-base sm:text-lg">
        Passenger Dashboard
      </h2>

      {/* ================= RIGHT ================= */}
      <div className="relative flex items-center gap-3" ref={menuRef}>

        {/* 👤 USER */}
        <div
          onClick={() => setShowMenu(prev => !prev)}
          className="flex items-center gap-2 cursor-pointer bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
        >
          <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || "P"}
          </div>

          <span className="text-sm hidden sm:block">
            {user?.name || "Passenger"}
          </span>

          <ChevronDown size={16} />
        </div>

        {/* 🔽 DROPDOWN */}
        {showMenu && (
          <div className="absolute right-0 top-12 w-44 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">

            <button
              onClick={() => {
                navigate("/passenger/profile");
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              👤 Profile
            </button>

            <button
              onClick={() => {
                navigate("/passenger/my-bookings");
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              🎟 My Bookings
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>

          </div>
        )}

      </div>

    </div>
  );
};

export default Topbar;