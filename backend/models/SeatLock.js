import mongoose from "mongoose";

const seatLockSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },
    journeyDate: {
      type: Date,
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "reserved", "booked"],
      default: "available",
    },
    reservedBy: {
      type: String, // can be passengerId or sessionId
      required: true,
    },
    holdExpiry: {
      type: Date, // when the temporary lock expires
      default: null,
    },
  },
  { timestamps: true }
);

// ATOMIC GUARANTEE: Only one active record can strictly exist per bus, date, and seat.
seatLockSchema.index({ busId: 1, journeyDate: 1, seatNumber: 1 }, { unique: true });

// Optional: Automatically delete expired locks from the database after a few minutes to keep it clean.
// This is natively supported by MongoDB TTL indexes.
// seatLockSchema.index({ holdExpiry: 1 }, { expireAfterSeconds: 0 }); // Deletes doc when holdExpiry is reached

export default mongoose.model("SeatLock", seatLockSchema);
