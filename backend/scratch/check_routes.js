const mongoose = require('mongoose');
const Bus = require('./models/Bus');
require('dotenv').config();

async function checkBuses() {
  await mongoose.connect(process.env.MONGO_URI);
  const buses = await Bus.find({}, { from: 1, to: 1, _id: 0 }).lean();
  console.log("All unique routes in DB:");
  const routes = new Set(buses.map(b => `${b.from} -> ${b.to}`));
  routes.forEach(r => console.log(r));
  process.exit(0);
}

checkBuses();
