import express from "express";

// 🔐 AUTH
import { loginAdmin } from "../../controllers/admin/auth/index.js";

// 📊 DASHBOARD
import { getDashboardStats } from "../../controllers/admin/dashboard/index.js";

// 🚌 BUS CONTROL
import {
  addBus,
  updateBus,
  deleteBus,
  setBusAvailability,
  toggleSeatBlock,
  updateSeatCategory,
  resetBusSeats
} from "../../controllers/admin/bus/index.js";

// 🪑 BOOKING CONTROL
import {
  reserveSeats,
  confirmBooking,
  releaseSeat,
  getAllBookings,
  cancelBooking,   // ✅ NEW
  markAsPaid       // ✅ NEW
} from "../../controllers/admin/booking/index.js";

// ⚙️ SETTINGS CONTROL (NEW)
import { getSettings, updateSettings, applyGlobalPrice } from "../../controllers/admin/settings/index.js";

import { protectAdmin } from "../../middleware/adminAuth.js";

const router = express.Router();

// ==============================
// 🔐 AUTH
// ==============================
router.post("/login", loginAdmin);

// ==============================
// 📊 DASHBOARD
// ==============================
router.get("/dashboard", protectAdmin, getDashboardStats);

// ==============================
// 🚌 BUS MANAGEMENT
// ==============================
router.post("/bus", protectAdmin, addBus);
router.put("/bus/:id", protectAdmin, updateBus);
router.delete("/bus/:id", protectAdmin, deleteBus);

// 📅 AVAILABILITY
router.post("/availability", protectAdmin, setBusAvailability);

// 🪑 SEAT SETTINGS
router.put("/seat/block", protectAdmin, toggleSeatBlock);
router.put("/seat/classification", protectAdmin, updateSeatCategory);
router.post("/seat/reset", protectAdmin, resetBusSeats);

// ==============================
// 🎟 BOOKING CONTROL (ADMIN)
// ==============================

// 🔥 GET ALL BOOKINGS
router.get("/bookings", protectAdmin, getAllBookings);

// 🔥 RESERVE
router.post("/reserve", protectAdmin, reserveSeats);

// 🔥 CONFIRM
router.put("/confirm/:bookingId", protectAdmin, confirmBooking);

// 🔥 RELEASE
router.put("/release/:bookingId", protectAdmin, releaseSeat);

// 🔥 MARK AS PAID
router.put("/payment/:bookingId", protectAdmin, markAsPaid);

// 🔥 CANCEL BOOKING
router.delete("/cancel/:bookingId", protectAdmin, cancelBooking);

// ==============================
// ⚙️ GLOBAL SETTINGS
// ==============================
router.get("/settings", protectAdmin, getSettings);
router.put("/settings", protectAdmin, updateSettings);
router.post("/settings/apply-global-price", protectAdmin, applyGlobalPrice);

export default router;