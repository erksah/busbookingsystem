import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// ==============================
// 🔥 LOAD ENV
// ==============================
dotenv.config();

const app = express();

// ==============================
// 🔥 MIDDLEWARE
// ==============================
// 1. Manual CORS (Ultra-Robust for Render/Vercel)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  // Handle Preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// 🧪 NORMALIZATION (handle potential double slashes from deployment URLs)
app.use((req, res, next) => {
  req.url = req.url.replace(/\/+/g, '/');
  next();
});

// ⚡️ DEDICATED PING ROUTE
app.get("/api/ping", (req, res) => {
  res.status(200).json({ status: "alive", timestamp: new Date() });
});


// 🔥 REQUEST LOGGER
app.use((req, res, next) => {
  console.log(`📌 ${req.method} ${req.url}`);
  next();
});


// ==============================
// 🔥 ROUTES IMPORT
// ==============================
import adminRoutes from "./routes/admin/authRoutes.js";
import passengerRoutes from "./routes/passenger/passengerRoutes.js";
import busRoutes from "./routes/bus/busRoutes.js";
import guestRoutes from "./routes/guest/guestRoutes.js";
import bookingRoutes from "./routes/common/bookingRoutes.js";

// 🔥 NEW (PAYMENT)
import paymentRoutes from "./routes/payment/paymentRoutes.js";

// 🔥 CHATBOT (NEW)
import chatRoutes from "./routes/common/chatRoutes.js";

// ==============================
// 🔗 ROUTES CONNECT
// ==============================
app.use("/api/admin", adminRoutes);
app.use("/api/passengers", passengerRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/guest", guestRoutes);
app.use("/api/bookings", bookingRoutes);

// 🔥 PAYMENT ROUTE
app.use("/api/payment", paymentRoutes);

// 🔥 CHAT ROUTE
app.use("/api/chat", chatRoutes);

// ==============================
// 🧪 HEALTH CHECK
// ==============================
app.get("/", (req, res) => {
  res.send("🚀 Bus Booking API Running...");
});


// ==============================
// ❌ 404 HANDLER
// ==============================
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found ❌",
  });
});

console.log("SID:", process.env.TWILIO_SID);
console.log("AUTH:", process.env.TWILIO_AUTH);

// ==============================
// 🔥 GLOBAL ERROR HANDLER
// ==============================
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);

  res.status(err.status || 500).json({
    message: err.message || "Server error ❌",
  });
});

// ==============================
// 🔌 DB CONNECT + SERVER START
// ==============================
const PORT = process.env.PORT || 5000;

const mongoUri = process.env.MONGO_URI || "mongodb+srv://busdb:IqYfwLZ0POb3oXWC@cluster0.q3nvzez.mongodb.net/busDB";

// 🔥 START SERVER IMMEDIATELY (Render compatibility)
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // 🔌 CONNECT DB IN BACKGROUND
  mongoose.connect(mongoUri)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));
});