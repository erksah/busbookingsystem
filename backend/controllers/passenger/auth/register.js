import Passenger from "../../../models/Passenger.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ==============================
// 🔐 TOKEN GENERATE
// ==============================
const generateToken = (id) => {
  return jwt.sign(
    { id, role: "passenger" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ==============================
// 🔥 REGISTER PASSENGER
// ==============================
export const registerPassenger = async (req, res) => {
  try {

    const { name, email, password, phone } = req.body;

    // ==============================
    // ❌ VALIDATION
    // ==============================
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields required ❌",
      });
    }

    if (password.length < 5) {
      return res.status(400).json({
        message: "Password must be at least 5 characters 🔐",
      });
    }

    // ==============================
    // 🔍 CHECK EXISTING
    // ==============================
    const exists = await Passenger.findOne({ email });

    if (exists) {
      return res.status(400).json({
        message: "Passenger already exists ❌",
      });
    }

    // ==============================
    // 🔐 HASH PASSWORD
    // ==============================
    const hashedPassword = await bcrypt.hash(password, 10);

    // ==============================
    // 🔥 CREATE PASSENGER
    // ==============================
    const passenger = await Passenger.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
    });

    // ==============================
    // ✅ RESPONSE (FINAL 🔥)
    // ==============================
    res.status(201).json({
      message: "Registration successful ✅",
      token: generateToken(passenger._id),
      role: "passenger",
      passenger: {
        id: passenger._id,
        name: passenger.name,
        email: passenger.email,
      },
    });

  } catch (error) {
    console.log("🔥 REGISTER ERROR:", error);

    res.status(500).json({
      message: "Register failed ❌",
    });
  }
};