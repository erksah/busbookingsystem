import Bus from "../../../models/Bus.js";

export const deleteBus = async (req, res) => {
  try {

    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found ❌",
      });
    }

    await bus.deleteOne();

    res.json({
      message: "Bus deleted successfully ✅",
    });

  } catch (error) {
    res.status(500).json({
      message: "Delete failed ❌",
    });
  }
};