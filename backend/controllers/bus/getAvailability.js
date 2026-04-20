import BusAvailability from "../../models/BusAvailability.js";

export const getBusAvailability = async (req, res) => {
  try {

    const { busId } = req.params;

    const data = await BusAvailability.find({ busId })
      .sort({ date: 1 });

    res.json(data);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed ❌",
    });
  }
};