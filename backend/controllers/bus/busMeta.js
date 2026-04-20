import Bus from "../../models/Bus.js";

// ==============================
// 🌍 LOCATIONS
// ==============================
export const getLocations = async (req, res) => {
  try {

    const buses = await Bus.find();

    const from = [...new Set(buses.map(b => b.from))];
    const to = [...new Set(buses.map(b => b.to))];

    res.json({ from, to });

  } catch {
    res.status(500).json({
      message: "Failed to fetch locations ❌",
    });
  }
};

// ==============================
// ⏰ TIMES
// ==============================
export const getDepartureTimes = async (req, res) => {
  try {

    const buses = await Bus.find();

    const times = [...new Set(buses.map(b => b.departureTime))];

    res.json(times);

  } catch {
    res.status(500).json({
      message: "Failed to fetch times ❌",
    });
  }
};