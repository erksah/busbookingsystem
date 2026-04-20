import Passenger from "../../../models/Passenger.js";

export const getPassengerProfile = async (req, res) => {
  try {

    const passengerId = req.passenger.id;

    const passenger = await Passenger
      .findById(passengerId)
      .select("-password");

    if (!passenger) {
      return res.status(404).json({
        message: "Passenger not found ❌",
      });
    }

    // ✅ DIRECT RETURN (IMPORTANT FIX)
    res.status(200).json(passenger);

  } catch (error) {
    console.log("🔥 PROFILE ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch profile ❌",
    });
  }
};