import Setting from "../../../models/Setting.js";
import Bus from "../../../models/Bus.js";

// ==============================
// 🔥 GET ALL SETTINGS
// ==============================
export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.find();
    // Convert to key-value object map
    const formattedSettings = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    // Provide default fallback if doesn't exist
    if (formattedSettings["basePricePerKm"] === undefined) {
       formattedSettings["basePricePerKm"] = 2.0; // Default
    }

    res.status(200).json(formattedSettings);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching settings ❌" });
  }
};

// ==============================
// 🔥 UPDATE MULTIPLE SETTINGS
// ==============================
export const updateSettings = async (req, res) => {
  try {
    const updates = req.body; // e.g. { basePricePerKm: 2.5 }
    
    for (const [key, value] of Object.entries(updates)) {
      await Setting.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    }

    // Return the fresh settings
    const settings = await Setting.find();
    const formattedSettings = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    res.status(200).json({ message: "Settings updated successfully ✅", settings: formattedSettings });
  } catch (error) {
    res.status(500).json({ message: "Server error updating settings ❌" });
  }
};

// ==============================
// 🔥 BULK APPLY BASE PRICE TO ALL BUSES
// ==============================
export const applyGlobalPrice = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: "basePricePerKm" });
    const basePrice = setting ? Number(setting.value) : 2.0;

    const buses = await Bus.find();
    
    let updatedCount = 0;
    for (let bus of buses) {
      if (bus.distanceKm > 0) {
         bus.price = Math.round(bus.distanceKm * basePrice);
         await bus.save();
         updatedCount++;
      }
    }

    res.status(200).json({ message: `Successfully updated pricing for ${updatedCount} buses ✅` });
  } catch (error) {
    res.status(500).json({ message: "Failed to broadcast prices ❌" });
  }
};
