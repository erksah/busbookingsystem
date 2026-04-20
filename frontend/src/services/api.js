const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;


// 🔥 GENERIC API CALL
export const apiRequest = async (endpoint, method = "GET", body = null, token = null) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : null,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Something went wrong ❌");
    }

    return data;

  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
};