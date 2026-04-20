import React from "react";
import BookingRow from "./BookingRow";

const BookingTable = ({ bookings, markPaid }) => {
  return (
    <div className="overflow-x-auto bg-white shadow rounded-xl">

      <table className="w-full text-sm">

        {/* ================= HEADER ================= */}
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Ticket</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Type</th>
            <th className="p-3 text-left">Route</th>
            <th className="p-3 text-left">Time</th>
            <th className="p-3 text-left">Seats</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Payment</th>
            <th className="p-3 text-left">Contact</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody>

          {bookings.length === 0 ? (
            <tr>
              <td
                colSpan="10"
                className="text-center p-5 text-gray-500"
              >
                No bookings found 🚫
              </td>
            </tr>
          ) : (
            bookings.map((b) => (
              <BookingRow
                key={b.id}
                b={b}
                markPaid={markPaid}
              />
            ))
          )}

        </tbody>

      </table>

    </div>
  );
};

export default BookingTable;