import Admin from "../../../models/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// 🔥 Generate Token
const generateToken = (id) => {
  return jwt.sign(
    { id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// 🔥 ADMIN LOGIN
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required ❌",
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({
        message: "Admin not found ❌",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password ❌",
      });
    }

    res.json({
      message: "Login successful ✅",
      token: generateToken(admin._id),
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error ❌",
    });
  }
};