import Razorpay from "razorpay";

// ==============================
// 💳 CREATE ORDER
// ==============================
export const createOrder = async (req, res) => {
  try {

    // 🔥 INIT HERE (FIX)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    console.log("KEY:", process.env.RAZORPAY_KEY_ID); // 🔍 debug

    const { amount } = req.body;

    // ❌ VALIDATION
    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Invalid amount ❌",
      });
    }

    // 🔥 ORDER OPTIONS
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "order_" + Date.now(),
    };

    // 🔥 CREATE ORDER
    const order = await razorpay.orders.create(options);

    res.status(200).json(order);

  } catch (error) {
    console.log("🔥 CREATE ORDER ERROR:", error);

    res.status(500).json({
      message: "Order creation failed ❌",
    });
  }
};