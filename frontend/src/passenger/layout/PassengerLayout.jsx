import React, { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

// 🔥 NEW
import BottomNavbar from "../components/BottomNavbar";

const PassengerLayout = () => {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);

  const sidebarRef = useRef();

  const expanded = sidebarOpen || sidebarHover;

  // 🔥 OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ================= SIDEBAR ================= */}
      <div ref={sidebarRef}>
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarHover={sidebarHover}
          setSidebarHover={setSidebarHover}
        />
      </div>

      {/* ================= MAIN ================= */}
      <div
        className={`
          flex-1 flex flex-col transition-all duration-300
          ${expanded ? "ml-64" : "ml-16"}
        `}
      >

        {/* 🔝 TOPBAR */}
        <div className="sticky top-0 z-30 bg-white shadow">
          <Topbar />
        </div>

        {/* 📄 CONTENT */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 pb-20">
          <Outlet />
        </div>

      </div>

      {/* 🔥 GLOBAL TASKBAR */}
      <BottomNavbar />

    </div>
  );
};

export default PassengerLayout;