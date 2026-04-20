import express from "express";

// 🔐 AUTH
import {
  registerPassenger,
  loginPassenger,
  getPassengerProfile,
  updateProfile,
  forgotPassword,
  verifyOtp,
  resetPassword
} from "../../controllers/passenger/auth/index.js";

// 🎟 BOOKING
import {
  createPassengerBooking,
  getMyBookings,
  cancelPassengerBooking
} from "../../controllers/passenger/booking/index.js";

// 🔐 MIDDLEWARE
import { protectPassenger } from "../../middleware/passengerAuth.js";

const router = express.Router();

// ==============================
// 🔥 PUBLIC ROUTES
// ==============================

// ✅ REGISTER
router.post("/register", registerPassenger);

// ✅ LOGIN
router.post("/login", loginPassenger);

// 🔥 FORGOT PASSWORD FLOW
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// ==============================
// 🔐 PROTECTED ROUTES
// ==============================

// 👤 GET PROFILE
router.get("/profile", protectPassenger, getPassengerProfile);

// ✏️ UPDATE PROFILE
router.put("/profile", protectPassenger, updateProfile);

// 🎟 CREATE BOOKING
router.post("/booking", protectPassenger, createPassengerBooking);

// 📄 MY BOOKINGS
router.get("/my-bookings", protectPassenger, getMyBookings);

// ❌ CANCEL BOOKING
router.delete("/cancel/:bookingId", protectPassenger, cancelPassengerBooking);

export default router;