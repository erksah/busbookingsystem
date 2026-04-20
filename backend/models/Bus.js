import mongoose from "mongoose";

const busSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    from: {
      type: String,
      required: true,
      trim: true,
    },

    to: {
      type: String,
      required: true,
      trim: true,
    },

    departureTime: {
      type: String,
      required: true,
    },

    arrivalTime: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    journeyDays: {
      type: Number,
      default: 0, // 0 = Same Day, 1 = Next Day, etc.
    },

    distanceKm: {
      type: Number,
      default: 0,
    },

    basePricePerKm: {
      type: Number,
      default: 2.0,
    },

    averageSpeed: {
      type: Number,
      default: 60,
    },

    fromLat: { type: Number },
    fromLon: { type: Number },
    toLat: { type: Number },
    toLon: { type: Number },

    totalSeats: {
      type: Number,
      default: 40,
    },

    // ==============================
    // 🚌 BUS TYPE (UPGRADED)
    // ==============================
    busCategory: {
      type: String,
      enum: ["AC", "Non-AC"],
      default: "AC",
    },

    seatType: {
      type: String,
      enum: ["Sleeper", "Seater"],
      default: "Seater",
    },

    // ==============================
    // 🪑 DYNAMIC SEAT LAYOUT
    // ==============================
    seatLayout: [
      {
        seatNumber: String,          // S1, L1, U1

        type: {
          type: String,
          enum: ["seater", "sleeper"],
          default: "seater",
        },

        deck: {
          type: String,
          enum: ["lower", "upper"],
          default: "lower",
        },

        isBlocked: {
          type: Boolean,
          default: false,
        },

        category: {
          type: String,
          enum: ["normal", "elderly", "ladies"],
          default: "normal",
        },
      },
    ],

    isCustomLayout: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 4.5,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Bus", busSchema);