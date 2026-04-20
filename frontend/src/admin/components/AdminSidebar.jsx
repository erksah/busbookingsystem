import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bus,
  Calendar,
  ClipboardList,
  PlusCircle,
  Menu
} from "lucide-react";

const AdminSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarHover,
  setSidebarHover
}) => {

  const location = useLocation();

  const expanded = sidebarOpen || sidebarHover;

  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin/dashboard" },
    { name: "Add Bus", icon: <PlusCircle size={20} />, path: "/admin/add-bus" },
    { name: "Manage Bus", icon: <Bus size={20} />, path: "/admin/manage-bus" },
    { name: "Availability", icon: <Calendar size={20} />, path: "/admin/availability" },
    { name: "Bookings", icon: <ClipboardList size={20} />, path: "/admin/bookings" }
  ];

  return (
    <aside
      onMouseEnter={() => setSidebarHover(true)}
      onMouseLeave={() => setSidebarHover(false)}
      className={`
        fixed top-0 left-0 h-screen bg-slate-900 text-white
        transition-all duration-300 ease-in-out z-40
        ${expanded ? "w-64" : "w-16"}
        flex flex-col shadow-lg
      `}
    >

      {/* ================= HEADER ================= */}
      <div className="p-3 border-b border-slate-700 flex items-center justify-between">

        {/* 🍔 HAMBURGER */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`
            p-2 rounded transition-all duration-300
            ${
              sidebarOpen
                ? "bg-violet-600 text-white rotate-90 scale-110"
                : "hover:bg-slate-700"
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
          <h1 className="text-lg font-bold text-violet-500 whitespace-nowrap">
            Admin Panel
          </h1>
        </div>

      </div>

      {/* ================= MENU ================= */}
      <nav className="mt-3 flex flex-col gap-1">

        {menu.map((item, index) => {

          const active = location.pathname.startsWith(item.path);

          return (
            <Link
              key={index}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`
                relative flex items-center px-3 py-2 mx-2 rounded-lg
                transition-all duration-200
                ${expanded ? "gap-3 justify-start" : "justify-center"}
                ${
                  active
                    ? "bg-violet-600 text-white shadow-lg scale-[1.03]"
                    : "hover:bg-slate-700 text-gray-300"
                }
              `}
            >

              {/* 🔥 ACTIVE LINE */}
              {active && expanded && (
                <div className="absolute left-0 top-1 bottom-1 w-1 bg-violet-400 rounded-r"></div>
              )}

              {/* ICON */}
              <div className="flex justify-center items-center w-8 h-8">
                {item.icon}
              </div>

              {/* TEXT */}
              {expanded && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.name}
                </span>
              )}

            </Link>
          );
        })}

      </nav>

      {/* ================= FOOTER ================= */}
      <div
        className={`
          p-3 border-t border-slate-700 text-xs text-gray-400 text-center
          transition-all duration-300
          ${expanded ? "opacity-100" : "opacity-0"}
        `}
      >
        Bus Booking Admin
      </div>

    </aside>
  );
};

export default AdminSidebar;