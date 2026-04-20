import express from "express";
import { getBookedSeats } from "../../controllers/common/booking/getBookedSeats.js";
import { getBookingById } from "../../controllers/common/booking/getBookingById.js";
import { lockSeatsForPayment } from "../../controllers/booking/lockSeats.js";
import { unlockSeats } from "../../controllers/booking/unlockSeats.js";

const router = express.Router();

// 🪑 GET SEATS
router.get("/seats/:busId", getBookedSeats);

// 🎟 GET BOOKING BY ID (🔥 NEW)
router.get("/:id", getBookingById);

// 🔒 ATOMIC SEAT LOCK (🔥 NEW)
router.post("/lock", lockSeatsForPayment);
router.post("/unlock", unlockSeats);

export default router;