import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaBus, FaTicketAlt, FaUser } from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";

const Navbar = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const adminToken = localStorage.getItem("token");
  const passengerToken = localStorage.getItem("passengerToken");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("passengerToken");
    navigate("/");
    window.location.reload();
  };

  const isActive = (path) =>
    location.pathname === path ? "text-violet-600" : "text-gray-500";

  return (
    <>
      {/* ==============================
          🔝 TOP NAVBAR (DESKTOP)
      ============================== */}
      <header className="
        hidden md:flex
        w-full h-[8ch]
        bg-white shadow
        fixed top-0 z-50
        items-center px-6
      ">

        <Link to="/" className="mr-10 font-bold text-xl text-violet-600">
          BusBooking
        </Link>

        <nav className="flex flex-1 items-center justify-between">

          <ul className="flex gap-x-6 text-base text-neutral-700 font-medium">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/bus">Bus</Link></li>
            <li><Link to="/bookings">Bookings</Link></li>
          </ul>

          <div className="flex items-center gap-4">

            {!passengerToken ? (
              <Link className="px-4 py-2 bg-violet-600 text-white rounded text-sm" to="/login">
                Login
              </Link>
            ) : (
              <button
                onClick={() => navigate("/passenger")}
                className="px-4 py-2 bg-green-600 text-white rounded text-sm"
              >
                Dashboard
              </button>
            )}

            {!adminToken ? (
              <Link className="px-4 py-2 bg-black text-white rounded text-sm" to="/admin/login">
                Admin
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded text-sm"
              >
                Logout
              </button>
            )}

            <div className="bg-violet-600 px-4 py-2 rounded text-white flex items-center gap-2 text-sm">
              <FaPhone />
              <span>+91 1234567890</span>
            </div>

          </div>
        </nav>
      </header>

      {/* ==============================
          📱 MOBILE TOP (MINIMAL)
      ============================== */}
      <div className="
        md:hidden
        fixed top-0 left-0 right-0 z-50
        bg-white shadow
        flex items-center justify-center
        h-[60px]
      ">
        <h1 className="text-lg font-bold text-violet-600">
          BusBooking
        </h1>
      </div>

      {/* ==============================
          📱 BOTTOM TAB BAR (APP STYLE)
      ============================== */}
      <div className="
        md:hidden
        fixed bottom-0 left-0 right-0 z-50
        bg-white border-t
        flex justify-around items-center
        h-[65px]
      ">

        <Link to="/" className={`flex flex-col items-center text-xs ${isActive("/")}`}>
          <FaHome size={18} />
          Home
        </Link>

        <Link to="/bus" className={`flex flex-col items-center text-xs ${isActive("/bus")}`}>
          <FaBus size={18} />
          Bus
        </Link>

        <Link to="/bookings" className={`flex flex-col items-center text-xs ${isActive("/bookings")}`}>
          <FaTicketAlt size={18} />
          Bookings
        </Link>

        <button
          onClick={() => navigate(passengerToken ? "/passenger" : "/login")}
          className="flex flex-col items-center text-xs text-gray-500"
        >
          <FaUser size={18} />
          Account
        </button>

      </div>
    </>
  );
};

export default Navbar;