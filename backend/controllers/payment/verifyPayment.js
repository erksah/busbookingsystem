import crypto from "crypto";

// ==============================
// 🔐 VERIFY PAYMENT
// ==============================
export const verifyPayment = async (req, res) => {
  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ❌ VALIDATION
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details missing ❌",
      });
    }

    // 🔥 GENERATE SIGNATURE
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    // 🔍 VERIFY
    if (expectedSignature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        message: "Payment verified ✅",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ❌",
      });
    }

  } catch (error) {
    console.log("🔥 VERIFY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Verification failed ❌",
    });
  }
};