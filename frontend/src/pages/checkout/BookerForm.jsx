const BookerForm = ({ booker, setBooker, error }) => {

  const token = localStorage.getItem("passengerToken");

  return (
    <>
      <h2 className="text-2xl font-semibold">Booker Details 👤</h2>

      {token && (
        <p className="text-green-600 text-sm">
          Logged in user auto-filled ✅
        </p>
      )}

      {error && (
        <div className="bg-red-100 text-red-600 p-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* NAME */}
      <input
        placeholder="Name"
        className={`w-full p-3 border rounded ${
          token ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        value={booker.name}
        disabled={!!token} // 🔥 LOGIN → DISABLE
        onChange={(e) =>
          setBooker({ ...booker, name: e.target.value })
        }
      />

      {/* EMAIL */}
      <input
        placeholder="Email"
        className={`w-full p-3 border rounded ${
          token ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        value={booker.email}
        disabled={!!token} // 🔥 LOGIN → DISABLE
        onChange={(e) =>
          setBooker({ ...booker, email: e.target.value })
        }
      />

      {/* PHONE */}
      <input
        placeholder="Phone"
        className="w-full p-3 border rounded"
        value={booker.phone}
        onChange={(e) =>
          setBooker({ ...booker, phone: e.target.value })
        }
      />


<p className="text-xs text-gray-500">
  Booking details will be sent via SMS & WhatsApp 📲
</p>
    </>
  );
};

export default BookerForm;