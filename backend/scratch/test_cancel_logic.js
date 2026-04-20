import { getCancellationStatus } from "../utils/cancellationLogic.js";
import { setOTP, verifyOTP } from "../utils/otpStore.js";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

async function testCancel() {
  await mongoose.connect(process.env.MONGO_URI);
  
  try {
    const ticketNumber = "TKT-1776220712353-773";
    const otp = "652314";
    
    // forcefully set OTP so verify works
    setOTP(ticketNumber, otp);
    
    const isValid = verifyOTP(ticketNumber, otp);
    console.log("OTP IS VALID:", isValid);
    
    const booking = await Booking.findOne({ ticketNumber }).populate("busId");
    console.log("BOOKING:", booking ? booking._id : "NOT FOUND");
    
    if (booking) {
      const { canCancel, isRefundable, message } = getCancellationStatus(
        booking.journeyDate,
        booking.departureTime
      );
      
      console.log("CAN CANCEL:", canCancel, message);
    }
  } catch (err) {
    console.log("ERROR:", err);
  } finally {
    mongoose.disconnect();
  }
}

testCancel();
