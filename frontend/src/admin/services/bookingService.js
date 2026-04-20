const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

// ==============================
// 📄 GET ALL BOOKINGS
// ==============================
export const fetchAllBookings = async (
  token,
  type = "",
  status = "",
  filter = "today" // 🔥 DEFAULT TODAY
) => {
  try {

    let url = `${API}/admin/bookings?`;

    if (type) url += `type=${type}&`;
    if (status) url += `status=${status}&`;
    if (filter) url += `filter=${filter}`; // 🔥 IMPORTANT

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await res.json();

  } catch (error) {
    console.log("Fetch Bookings Error:", error);
    return { bookings: [] };
  }
};


// ==============================
// 💰 MARK AS PAID
// ==============================
export const markBookingPaid = async (token, id) => {
  try {

    const res = await fetch(`${API}/admin/payment/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await res.json();

  } catch (error) {
    console.log("Mark Paid Error:", error);
    return { success: false };
  }
};


// ==============================
// 🔥 GET NEW BOOKINGS
// ==============================
export const fetchNewBookings = async (token) => {
  try {

    const res = await fetch(`${API}/admin/bookings/new`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await res.json();

  } catch (error) {
    console.log("New Bookings Error:", error);
    return { count: 0, bookings: [] };
  }
};