import express from "express";
import { createOrder } from "../../controllers/payment/createOrder.js";
import { verifyPayment } from "../../controllers/payment/verifyPayment.js";

const router = express.Router();

// ==============================
// 💳 CREATE ORDER
// ==============================
router.post("/create-order", createOrder);

// ==============================
// 🔐 VERIFY PAYMENT
// ==============================
router.post("/verify", verifyPayment);

export default router;