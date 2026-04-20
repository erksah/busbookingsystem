const otpStore = {}; // 🔥 temp store

export const setOTP = (ticketNumber, otp) => {
  otpStore[ticketNumber] = {
    otp,
    expires: Date.now() + 5 * 60 * 1000, // 5 min
  };
};

export const verifyOTP = (ticketNumber, otp) => {
  const record = otpStore[ticketNumber];

  if (!record) return false;

  if (record.expires < Date.now()) return false;

  return record.otp === otp;
};

export const deleteOTP = (ticketNumber) => {
  delete otpStore[ticketNumber];
};