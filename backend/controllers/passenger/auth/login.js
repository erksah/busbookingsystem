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
// 🔥 LOGIN PASSENGER
// ==============================
export const loginPassenger = async (req, res) => {
  try {

    const { email, password } = req.body;

    // ==============================
    // ❌ VALIDATION
    // ==============================
    if (!email || !password) {
      return res.status(400).json({
        message: "Email & password required ❌",
      });
    }

    // ==============================
    // 🔍 FIND USER
    // ==============================
    const passenger = await Passenger.findOne({ email });

    if (!passenger) {
      return res.status(400).json({
        message: "Passenger not found ❌",
      });
    }

    // ==============================
    // 🔐 CHECK PASSWORD
    // ==============================
    const isMatch = await bcrypt.compare(password, passenger.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password ❌",
      });
    }

    // ==============================
    // 🚫 CHECK ACTIVE
    // ==============================
    if (!passenger.isActive) {
      return res.status(403).json({
        message: "Account blocked ❌",
      });
    }

    // ==============================
    // ✅ RESPONSE (FINAL FORMAT 🔥)
    // ==============================
    res.status(200).json({
      message: "Login successful ✅",
      token: generateToken(passenger._id),
      role: "passenger",   // 🔥 future use
      passenger: {
        id: passenger._id,
        name: passenger.name,
        email: passenger.email,
      },
    });

  } catch (error) {
    console.log("🔥 LOGIN ERROR:", error);

    res.status(500).json({
      message: "Login failed ❌",
    });
  }
};