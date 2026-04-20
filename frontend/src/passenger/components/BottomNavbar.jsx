import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, Bus, Ticket, User } from "lucide-react";

const BottomNavbar = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("passengerToken");

  const menu = [
    { name: "Home", path: "/", icon: <Home size={22} /> },
    { name: "Bus", path: "/bus", icon: <Bus size={22} /> },
    { name: "Bookings", path: "/passenger/my-bookings", icon: <Ticket size={22} /> },
  ];

  // 🔥 ACCOUNT ACTIVE FIX
  const isAccountActive = location.pathname.startsWith("/passenger");

  const handleAccountClick = () => {
    if (token) navigate("/passenger");
    else navigate("/login");
  };

  return (
    <div className="
      fixed bottom-0 left-0 w-full bg-white border-t shadow-lg
      flex justify-around items-center py-2 z-50
    ">

      {/* ===== NORMAL MENU ===== */}
      {menu.map((item, index) => {

        const active =
          location.pathname === item.path ||
          location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={index}
            to={item.path}
            className="flex flex-col items-center text-xs"
          >
            <div className={active ? "text-violet-600" : "text-gray-500"}>
              {item.icon}
            </div>

            <span className={`
              mt-1
              ${active ? "text-violet-600 font-medium" : "text-gray-500"}
            `}>
              {item.name}
            </span>
          </NavLink>
        );
      })}

      {/* ===== ACCOUNT ===== */}
      <button
        onClick={handleAccountClick}
        className="flex flex-col items-center text-xs"
      >
        <User
          size={22}
          className={isAccountActive ? "text-violet-600" : "text-gray-500"}
        />

        <span className={`
          mt-1
          ${isAccountActive ? "text-violet-600 font-medium" : "text-gray-500"}
        `}>
          Account
        </span>
      </button>

    </div>
  );
};

export default BottomNavbar;