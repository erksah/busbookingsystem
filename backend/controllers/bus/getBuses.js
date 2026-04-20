import Bus from "../../models/Bus.js";

export const getBuses = async (req, res) => {
  try {

    const buses = await Bus.find().sort({ createdAt: -1 });

    res.json(buses);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch buses ❌",
    });
  }
};