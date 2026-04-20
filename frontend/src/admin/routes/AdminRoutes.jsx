import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 🔥 LAYOUT
import AdminLayout from "../components/AdminLayout";

// 📄 PAGES
import Dashboard from "../pages/Dashboard";
import AddBus from "../pages/AddBus";
import ManageBus from "../pages/ManageBus";
import EditBus from "../pages/EditBus";
import SeatControl from "../pages/SeatControl";
import BusAvailability from "../pages/BusAvailability";
import AdminBusAvailabilityTable from "../pages/AdminBusAvailabilityTable";
import Bookings from "../pages/Bookings";
import NewBookings from "../pages/NewBookings"; // 🔥 NEW

// 🔐 AUTH
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";

const AdminRoutes = () => {
  return (
    <Routes>

      {/* ================= LOGIN ================= */}
      <Route path="login" element={<Login />} />

      {/* ================= PROTECTED ================= */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        {/* DEFAULT */}
        <Route index element={<Navigate to="dashboard" />} />

        {/* ================= DASHBOARD ================= */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* ================= BUS ================= */}
        <Route path="add-bus" element={<AddBus />} />
        <Route path="manage-bus" element={<ManageBus />} />
        <Route path="edit-bus/:id" element={<EditBus />} />

        {/* ================= SEAT ================= */}
        <Route path="seat/:id" element={<SeatControl />} />

        {/* ================= AVAILABILITY ================= */}

        {/* 👉 ALL BUSES TABLE */}
        <Route
          path="availability"
          element={<AdminBusAvailabilityTable />}
        />

        {/* 👉 EDIT PAGE */}
        <Route
          path="availability/:busId"
          element={<BusAvailability />}
        />

        {/* ================= BOOKINGS ================= */}
        <Route path="bookings" element={<Bookings />} />

        {/* 🔥 NEW BOOKINGS PAGE */}
        <Route path="new-bookings" element={<NewBookings />} />

      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/admin/login" />} />

    </Routes>
  );
};

export default AdminRoutes;