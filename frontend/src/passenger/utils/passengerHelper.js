// 🔐 Save token
export const setPassengerToken = (token) => {
  localStorage.setItem("passengerToken", token);
};

// 🔐 Get token
export const getPassengerToken = () => {
  return localStorage.getItem("passengerToken");
};

// 🔐 Logout
export const logoutPassenger = () => {
  localStorage.removeItem("passengerToken");
};