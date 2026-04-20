import Booking from "../../../models/Booking.js";
import Bus from "../../../models/Bus.js";
import { v4 as uuidv4 } from "uuid";

export const reserveSeats = async (req, res) => {
  try {

    const { busId, seats, journeyDate, name = "Admin", phone = "" } = req.body;

    if (!busId || !seats || seats.length === 0 || !journeyDate) {
      return res.status(400).json({
        message: "Bus, seats & date required ❌"
      });
    }

    // 🚌 GET BUS (🔥 REQUIRED)
    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found ❌"
      });
    }

    const groupId = uuidv4();

    const bookings = seats.map(seat => ({
      name,
      email: "",
      phone,

      busId,
      from: bus.from,   // 🔥 FIX
      to: bus.to,       // 🔥 FIX

      journeyDate: new Date(journeyDate),

      seats: [seat],

      passengers: [
        {
          name: "Admin Hold",
          age: 0,
          gender: "M",
          seat,
          status: "reserved"
        }
      ],

      total: 0,

      bookingStatus: "reserved",
      paymentStatus: "pending",

      bookedBy: "admin",
      groupId
    }));

    await Booking.insertMany(bookings);

    res.json({
      message: "Seats reserved successfully ✅",
      groupId
    });

  } catch (error) {
    console.log("🔥 RESERVE ERROR:", error);

    res.status(500).json({
      message: "Reserve failed ❌"
    });
  }
};