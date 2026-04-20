import express from "express";

import {
  getBuses,
  getBusById,
  searchBuses,
  getLocations,
  getDepartureTimes,
  getBusAvailability
} from "../../controllers/bus/index.js";

const router = express.Router();

// ==============================
// 🔍 SEARCH (USER)
// ==============================
router.get("/search", searchBuses);

// ==============================
// 📊 META (FILTER DATA)
// ==============================
router.get("/meta/locations", getLocations);
router.get("/meta/times", getDepartureTimes);

// ==============================
// 🌐 PUBLIC BUS DATA
// ==============================
router.get("/", getBuses);
router.get("/:id", getBusById);

// ==============================
// 📅 AVAILABILITY (USER VIEW)
// ==============================
router.get("/availability/:busId", getBusAvailability);

// ==============================
// ✅ EXPORT
// ==============================
export default router;