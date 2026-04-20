import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    // dynamically import Bus model 
    const Bus = (await import("../models/Bus.js")).default;
    const buses = await Bus.find({});
    console.log("ALL BUSES IN DB:", buses.map(b => b.name));
    process.exit(0);
});
