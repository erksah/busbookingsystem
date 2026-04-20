import mongoose from "mongoose";
import dotenv from "dotenv";
import Bus from "./models/Bus.js";
import { applyDefaultCategories } from "./controllers/bus/seatGenerator.js";

dotenv.config();

const runMigration = async () => {
  try {
    console.log("🚀 Starting Seat Classification Migration...");
    
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not defined in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("📡 Connected to MongoDB");

    const buses = await Bus.find();
    console.log(`🚌 Found ${buses.length} buses to check.`);

    let updatedCount = 0;

    for (let bus of buses) {
      if (!bus.isCustomLayout) {
        const original = JSON.stringify(bus.seatLayout);
        bus.seatLayout = applyDefaultCategories(bus.seatLayout);

        if (JSON.stringify(bus.seatLayout) !== original) {
          bus.markModified("seatLayout");
          await bus.save();
          updatedCount++;
          console.log(`✅ Updated: ${bus.name} (${bus.from} -> ${bus.to})`);
        }
      }
    }

    console.log(`\n🎉 Migration finished!`);
    console.log(`📊 Updated ${updatedCount} buses out of ${buses.length}.`);
    
    process.exit(0);

  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

runMigration();
