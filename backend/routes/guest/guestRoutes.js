import express from "express";

import {
  createGuestBooking,
  sendCancelOTP,
  verifyOtpAndCancel
} from "../../controllers/guest/booking/index.js";

const router = express.Router();

router.post("/booking", createGuestBooking);
router.post("/send-otp", sendCancelOTP);
router.post("/cancel", verifyOtpAndCancel);

export default router;