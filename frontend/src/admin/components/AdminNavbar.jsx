import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

// 🔥 NEW IMPORT
import NotificationBell from "../notification/NotificationBell";

const AdminNavbar = () => {

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  const admin = JSON.parse(localStorage.getItem("admin")) || {
    name: "Admin"
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  return (
    <div className="flex justify-between items-center bg-white p-4 shadow relative">

      {/* LEFT SIDE */}
      <h1 className="font-semibold text-lg">
        Admin Panel
      </h1>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* 🔔 NOTIFICATION */}
        <div
          onClick={() => navigate("/admin/new-bookings")}
          className="cursor-pointer"
        >
          <NotificationBell />
        </div>

        {/* 👤 PROFILE DROPDOWN */}
        <div ref={dropdownRef} className="relative">

          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded hover:bg-gray-200"
          >
            <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">
              {admin.name?.charAt(0).toUpperCase()}
            </div>

            <span className="font-medium">
              {admin.name}
            </span>

            <ChevronDown size={16} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">

              <button
                onClick={() => navigate("/admin/profile")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                👤 Profile
              </button>

              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
              >
                🚪 Logout
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AdminNavbar;