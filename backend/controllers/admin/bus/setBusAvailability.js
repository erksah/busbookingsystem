import BusAvailability from "../../../models/BusAvailability.js";

export const setBusAvailability = async (req, res) => {
  try {

    const { busId, startDate, endDate, isActive, price } = req.body;

    // ==============================
    // ❌ VALIDATION
    // ==============================
    if (!busId || !startDate || !endDate) {
      return res.status(400).json({
        message: "All fields required ❌",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    let current = new Date(start);

    // ==============================
    // 🔥 LOOP EACH DATE
    // ==============================
    while (current <= end) {

      // 🔥 IMPORTANT → ALWAYS DATE OBJECT
      const dateObj = new Date(current);
      dateObj.setHours(0, 0, 0, 0);

      await BusAvailability.findOneAndUpdate(
        {
          busId,
          date: dateObj,
        },
        {
          busId,
          date: dateObj,
          isActive, // ✅ FIXED
          priceOverride: price ? Number(price) : null, // ✅ FIXED
        },
        {
          upsert: true,
          new: true,
        }
      );

      current.setDate(current.getDate() + 1);
    }

    res.json({
      message: "Availability saved successfully ✅",
    });

  } catch (error) {
    console.log("🔥 AVAILABILITY ERROR:", error);
    res.status(500).json({
      message: "Failed ❌",
    });
  }
};