import mongoose from "mongoose";

// ==============================
// 👥 PASSENGER SCHEMA
// ==============================
const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, default: 25 },
  gender: { type: String, default: "M" },
  seat: { type: String, required: true },
  seatCategory: { type: String, default: "normal" },

  status: {
    type: String,
    enum: ["reserved", "confirmed", "cancelled"],
    default: "reserved",
  },
});

// ==============================
// 🎟 BOOKING SCHEMA
// ==============================
const bookingSchema = new mongoose.Schema(
  {
    // 👤 USER INFO
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },

    // 🚌 BUS
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },

    from: { type: String, required: true },
    to: { type: String, required: true },

    // 🕒 TIME (🔥 NEW)
    departureTime: {
      type: String,
      default: "",
    },

    arrivalTime: {
      type: String,
      default: "",
    },

    // 🛣 LOGISTICS (🔥 NEW)
    distanceKm: {
      type: Number,
      default: 0,
    },
    
    journeyDays: {
      type: Number,
      default: 0,
    },

    // 📅 DATE
    journeyDate: {
      type: Date,
      required: true,
    },

    // 💺 SEATS
    seats: {
      type: [String],
      required: true,
    },

    passengers: [passengerSchema],

    // 💰 PRICE
    total: {
      type: Number,
      default: 0,
    },

    // 🔐 USER LINK
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Passenger",
      default: null,
    },

    // 📌 STATUS
    bookingStatus: {
      type: String,
      enum: ["reserved", "confirmed", "cancelled"],
      default: "reserved",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },

    // ⏳ HOLD (optional)
    holdExpiry: {
      type: Date,
      default: null,
    },

    // 👥 GROUP BOOKING
    groupId: {
      type: String,
      default: null,
    },

    // 👨‍💼 WHO BOOKED
    bookedBy: {
      type: String,
      enum: ["guest", "passenger", "admin"],
      default: "guest",
    },

    // 🎫 TICKET
    ticketNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    // 🔐 OTP
    otp: {
      type: String,
      default: null,
    },

    otpExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // 🔥 createdAt, updatedAt auto
  }
);

export default mongoose.model("Booking", bookingSchema);