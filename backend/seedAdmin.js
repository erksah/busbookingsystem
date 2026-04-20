import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash("123456", 10);

    const admin = new Admin({
      email: "admin@gmail.com",
      password: hashedPassword,
    });

    await admin.save();

    console.log("✅ Admin created successfully");
    process.exit();

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

createAdmin();