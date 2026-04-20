import express from "express";

// 🔐 AUTH
import { loginAdmin } from "../../controllers/admin/auth/index.js";

// 📊 DASHBOARD
import { getDashboardStats } from "../../controllers/admin/dashboard/index.js";

// 🪑 BOOKING CONTROL
import {
  reserveSeats,
  confirmBooking,
  releaseSeat,
  getAllBookings
} from "../../controllers/admin/booking/index.js";

import { protectAdmin } from "../../middleware/adminAuth.js";

const router = express.Router();

// ==============================
// 🔐 LOGIN
// ==============================
router.post("/login", loginAdmin);

// ==============================
// 📊 DASHBOARD
// ==============================
router.get("/dashboard", protectAdmin, getDashboardStats);

// ==============================
// 📋 ALL BOOKINGS (ADMIN)
// ==============================
router.get("/bookings", protectAdmin, getAllBookings);

// ==============================
// 🪑 SEAT CONTROL
// ==============================
router.post("/reserve", protectAdmin, reserveSeats);
router.put("/confirm/:bookingId", protectAdmin, confirmBooking);
router.put("/release/:bookingId", protectAdmin, releaseSeat);

export default router;