import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const AdminLayout = () => {

  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);

  const sidebarRef = useRef();

  const expanded = sidebarOpen || sidebarHover;

  // 🔐 AUTH
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) navigate("/admin/login");
  }, []);

  // ❌ OUTSIDE CLICK
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
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarHover={sidebarHover}
          setSidebarHover={setSidebarHover}
        />
      </div>

      {/* ================= MAIN ================= */}
      <div
        className={`
          flex-1 transition-all duration-300
          ${expanded ? "ml-64" : "ml-16"}
        `}
      >

        {/* 🔝 NAVBAR */}
        <AdminNavbar />

        {/* 📄 CONTENT */}
        <div className="p-6">
          <Outlet />
        </div>

      </div>

    </div>
  );
};

export default AdminLayout;