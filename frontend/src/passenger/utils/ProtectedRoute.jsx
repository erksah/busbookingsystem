import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {

  const token = localStorage.getItem("passengerToken");
  const location = useLocation();

  // ==============================
  // ❌ NOT LOGGED IN
  // ==============================
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          redirect: location.pathname + location.search,
        }}
      />
    );
  }

  // ==============================
  // ✅ LOGGED IN
  // ==============================
  return children;
};

export default ProtectedRoute;