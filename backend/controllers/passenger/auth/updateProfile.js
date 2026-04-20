import Passenger from "../../../models/Passenger.js";

export const updateProfile = async (req, res) => {
  try {

    // 🔐 AUTH CHECK
    if (!req.passenger?.id) {
      return res.status(401).json({
        message: "Unauthorized ❌",
      });
    }

    const { name, phone, email } = req.body;

    // 🔍 FIND USER
    const user = await Passenger.findById(req.passenger.id);

    if (!user) {
      return res.status(404).json({
        message: "Passenger not found ❌",
      });
    }

    // 🔥 UPDATE FIELDS
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email) user.email = email;

    await user.save();

    res.json({
      message: "Profile updated successfully ✅",
      user,
    });

  } catch (error) {
    console.log("🔥 UPDATE PROFILE ERROR:", error);

    res.status(500).json({
      message: "Update failed ❌",
    });
  }
};