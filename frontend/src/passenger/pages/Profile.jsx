import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const Profile = () => {

  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // ==============================
  // 🔥 FETCH PROFILE
  // ==============================
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("passengerToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`${API}/passengers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      });

    } catch (error) {
      console.log("Profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ==============================
  // 🔥 HANDLE CHANGE
  // ==============================
  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // ==============================
  // 💾 UPDATE PROFILE
  // ==============================
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("passengerToken");

      const res = await fetch(`${API}/passengers/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message);
      }

      alert("Profile updated ✅");
      setEditing(false);

    } catch (error) {
      console.log(error);
      alert("Update failed ❌");
    }
  };

  // ==============================
  // 🔐 LOGOUT
  // ==============================
  const handleLogout = () => {
    localStorage.removeItem("passengerToken");
    localStorage.removeItem("passenger");
    navigate("/login");
  };

  if (loading) {
    return (
      <p className="text-center mt-20 text-gray-500">
        Loading profile...
      </p>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-6 rounded-xl shadow">
        <h2 className="text-xl sm:text-2xl font-bold">
          My Profile 👤
        </h2>
        <p className="text-sm mt-1">
          Manage your account details
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white p-6 rounded-xl shadow max-w-xl space-y-6">

        {/* AVATAR */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-violet-500 flex items-center justify-center text-white text-xl font-bold">
            {profile?.name?.charAt(0)?.toUpperCase() || "P"}
          </div>

          <div>
            <p className="text-lg font-semibold">
              {profile.name || "Passenger"}
            </p>
            <p className="text-sm text-gray-500">
              {profile.email || "No email"}
            </p>
          </div>
        </div>

        {/* DETAILS / EDIT FORM */}
        <div className="space-y-3 text-sm">

          <div>
            <label>Name</label>
            <input
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!editing}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label>Email</label>
            <input
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!editing}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label>Phone</label>
            <input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!editing}
              className="w-full p-2 border rounded"
            />
          </div>

        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-3">

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-500 text-white py-3 rounded-lg"
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white py-3 rounded-lg"
              >
                💾 Save Changes
              </button>

              <button
                onClick={() => setEditing(false)}
                className="bg-gray-300 py-3 rounded-lg"
              >
                Cancel
              </button>
            </>
          )}

          <button
            onClick={() => navigate("/passenger/my-bookings")}
            className="bg-violet-600 text-white py-3 rounded-lg"
          >
            🎟 My Bookings
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-3 rounded-lg"
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
};

export default Profile;