import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {

  const token = localStorage.getItem("adminToken");
  const location = useLocation();

  // ❌ Not logged in
  if (!token) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }} // 🔥 redirect back later (future use)
      />
    );
  }

  // ✅ Logged in
  return children;
};

export default ProtectedRoute;