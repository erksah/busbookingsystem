import BusAvailability from "../../../models/BusAvailability.js";

export const getAvailability = async (req, res) => {
  try {

    const { busId } = req.params;

    if (!busId) {
      return res.status(400).json({
        message: "Bus ID required ❌",
      });
    }

    // 🔥 FETCH ALL DATES FOR THIS BUS
    const availability = await BusAvailability.find({ busId })
      .sort({ date: 1 });

    res.json(availability);

  } catch (error) {
    console.log("GET AVAILABILITY ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch availability ❌",
    });
  }
};