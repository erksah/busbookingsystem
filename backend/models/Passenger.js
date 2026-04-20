import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema(
  {
    // 👤 NAME
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // 📧 EMAIL
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // 🔐 PASSWORD
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // 📱 PHONE
    phone: {
      type: String,
      default: "",
    },

    // 🎭 ROLE
    role: {
      type: String,
      enum: ["passenger"],
      default: "passenger",
    },

    // ✅ ACTIVE / BLOCKED
    isActive: {
      type: Boolean,
      default: true,
    },

    // ==============================
    // 🔥 OTP SYSTEM (NEW ADD)
    // ==============================
    otp: {
      type: String,
      default: null,
    },

    otpExpires: {
      type: Date,
      default: null,
    },

  },
  { timestamps: true }
);

export default mongoose.model("Passenger", passengerSchema);