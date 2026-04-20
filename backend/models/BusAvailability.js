import mongoose from "mongoose";

const busAvailabilitySchema = new mongoose.Schema({

  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bus",
    required: true,
  },

  date: {
    type: Date,
    required: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  // 🔥 OPTIONAL PRICE CHANGE
  priceOverride: {
    type: Number,
    default: null,
  },

}, { timestamps: true });

// 🔥 IMPORTANT: prevent duplicate (same bus + same date)
busAvailabilitySchema.index(
  { busId: 1, date: 1 },
  { unique: true }
);

export default mongoose.model("BusAvailability", busAvailabilitySchema);