import mongoose from "mongoose";
import dotenv from "dotenv";
import Booking from "../models/Booking.js";

dotenv.config({ path: "backend/.env" });

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const bookings = await Booking.find({}).limit(5).sort({ createdAt: -1 });
    console.log("RECENT BOOKINGS:");
    bookings.forEach(b => {
      console.log(`Ticket: ${b.ticketNumber}, Email: ${b.email}, Status: ${b.bookingStatus}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
