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
  resetBusSeats,
  getAvailability
} from "../../controllers/admin/bus/index.js";

// 🪑 BOOKING CONTROL
import {
  reserveSeats,
  confirmBooking,
  releaseSeat,
  getAllBookings,
  cancelBooking,
  markAsPaid,
  getNewBookings   // 🔥 NEW ADD
} from "../../controllers/admin/booking/index.js";

// 🔐 MIDDLEWARE
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


// ==============================
// 📅 AVAILABILITY
// ==============================
router.post("/availability", protectAdmin, setBusAvailability);
router.get("/availability/:busId", protectAdmin, getAvailability);


// ==============================
// 🪑 SEAT SETTINGS
// ==============================
router.put("/seat/block", protectAdmin, toggleSeatBlock);
router.put("/seat/classification", protectAdmin, updateSeatCategory);
router.post("/seat/reset", protectAdmin, resetBusSeats);


// ==============================
// 🎟 BOOKING CONTROL (ADMIN)
// ==============================

// 🔥 ALL BOOKINGS
router.get("/bookings", protectAdmin, getAllBookings);

// 🔥 NEW BOOKINGS (LAST 24H)
router.get("/bookings/new", protectAdmin, getNewBookings);

// 🎟 RESERVE
router.post("/reserve", protectAdmin, reserveSeats);

// ✅ CONFIRM
router.put("/confirm/:bookingId", protectAdmin, confirmBooking);

// 🔓 RELEASE
router.put("/release/:bookingId", protectAdmin, releaseSeat);

// 💰 PAYMENT
router.put("/payment/:bookingId", protectAdmin, markAsPaid);

// ❌ CANCEL
router.delete("/cancel/:bookingId", protectAdmin, cancelBooking);


// ==============================
// ✅ EXPORT
// ==============================
export default router;