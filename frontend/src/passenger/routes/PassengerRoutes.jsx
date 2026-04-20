import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PassengerLayout from "../layout/PassengerLayout";
import ProtectedRoute from "../utils/ProtectedRoute";

// Pages
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import MyBookings from "../pages/MyBookings";

const PassengerRoutes = () => {
  return (
    <Routes>

      {/* 🔐 PROTECTED LAYOUT */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PassengerLayout />
          </ProtectedRoute>
        }
      >

        {/* ✅ DEFAULT */}
        <Route index element={<Dashboard />} />

        {/* ✅ ROUTES */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="my-bookings" element={<MyBookings />} />

        {/* ❌ INVALID */}
        <Route path="*" element={<Navigate to="/passenger" />} />

      </Route>

    </Routes>
  );
};

export default PassengerRoutes;