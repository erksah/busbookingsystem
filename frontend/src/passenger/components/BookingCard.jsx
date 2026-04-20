import React from "react";

const BookingCard = ({ booking, onCancel }) => {

  return (
    <div className="bg-white p-5 rounded-xl shadow flex flex-col md:flex-row justify-between gap-4">

      {/* LEFT */}
      <div className="space-y-2">

        <h3 className="text-lg font-semibold">
          {booking.from} → {booking.to}
        </h3>

        <p className="text-sm text-gray-500">
          Seats: {booking.seats?.join(", ")}
        </p>

        <p className="text-sm text-gray-500">
          Booking ID: {booking._id}
        </p>

      </div>

      {/* RIGHT */}
      <div className="flex flex-col justify-between items-end gap-3">

        <div className="text-xl font-bold text-violet-600">
          ₹{booking.total}
        </div>

        {onCancel && (
          <button
            onClick={() => onCancel(booking._id)}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Cancel
          </button>
        )}

      </div>

    </div>
  );
};

export default BookingCard;