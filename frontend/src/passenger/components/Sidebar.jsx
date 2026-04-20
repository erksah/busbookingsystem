import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Ticket,
  LogOut,
  Menu
} from "lucide-react";

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarHover,
  setSidebarHover
}) => {

  const location = useLocation();

  const expanded = sidebarOpen || sidebarHover;

  const menu = [
    {
      name: "Dashboard",
      path: "/passenger",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "Profile",
      path: "/passenger/profile",
      icon: <User size={18} />,
    },
    {
      name: "My Bookings",
      path: "/passenger/my-bookings",
      icon: <Ticket size={18} />,
    },
  ];

  // 🔐 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("passengerToken");
    localStorage.removeItem("passenger");
    window.location.href = "/login";
  };

  return (
    <aside
      onMouseEnter={() => setSidebarHover(true)}
      onMouseLeave={() => setSidebarHover(false)}
      className={`
        fixed top-0 left-0 h-screen bg-neutral-900 text-white
        transition-all duration-300 ease-in-out z-40
        ${expanded ? "w-64" : "w-16"}
        flex flex-col justify-between shadow-lg
      `}
    >

      {/* ================= HEADER ================= */}
      <div>

        <div className="flex items-center justify-between p-4 border-b border-neutral-700">

          {/* 🍔 HAMBURGER */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`
              p-2 rounded transition-all duration-300
              ${
                sidebarOpen
                  ? "bg-violet-600 text-white rotate-90 scale-110"
                  : "hover:bg-neutral-800"
              }
            `}
          >
            <Menu size={20} />
          </button>

          {/* TITLE */}
          <div
            className={`
              transition-all duration-300 origin-left
              ${expanded ? "opacity-100 scale-100" : "opacity-0 scale-0"}
            `}
          >
            <h1 className="text-lg font-bold text-violet-500">
              Passenger
            </h1>
          </div>

        </div>

        {/* ================= MENU ================= */}
        <nav className="mt-4 space-y-1">

          {menu.map((item, i) => {

            const active =
              item.path === "/passenger"
                ? location.pathname === "/passenger"
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={i}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  relative flex items-center gap-4 px-4 py-3 mx-2 rounded-lg text-sm transition-all duration-200
                  ${
                    active
                      ? "bg-violet-600 text-white shadow-lg scale-[1.03]"
                      : "text-gray-300 hover:bg-neutral-800 hover:text-white"
                  }
                `}
              >

                {/* 🔥 ACTIVE SIDE LINE */}
                {active && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-violet-400 rounded-r"></div>
                )}

                {/* ICON */}
                <div className="w-6 flex justify-center">
                  {item.icon}
                </div>

                {/* TEXT */}
                <span
                  className={`
                    transition-all duration-300 origin-left
                    ${expanded ? "opacity-100 scale-100" : "opacity-0 scale-0"}
                  `}
                >
                  {item.name}
                </span>

              </NavLink>
            );
          })}

        </nav>

      </div>

      {/* ================= LOGOUT ================= */}
      <div className="p-3 border-t border-neutral-700">

        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm transition-all duration-200
            text-red-400 hover:bg-red-500 hover:text-white
          `}
        >
          <LogOut size={18} />

          <span
            className={`
              transition-all duration-300 origin-left
              ${expanded ? "opacity-100 scale-100" : "opacity-0 scale-0"}
            `}
          >
            Logout
          </span>

        </button>

      </div>

    </aside>
  );
};

export default Sidebar;