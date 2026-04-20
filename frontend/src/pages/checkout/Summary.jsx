const Summary = ({ bus, journeyDate, selectedSeats, loading, handleBooking }) => {

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">

      <h2 className="text-xl font-semibold">Booking Summary 🧾</h2>

      <p><b>Bus:</b> {bus.name}</p>
      <p><b>Route:</b> {bus.from} → {bus.to}</p>
      <p><b>Date:</b> {new Date(journeyDate).toLocaleDateString()}</p>
      <p><b>Departure:</b> {bus.departureTime}</p>
      <p><b>Arrival:</b> {bus.arrivalTime}</p>
      <p><b>Seats:</b> {selectedSeats.join(", ")}</p>

      <div className="text-xl font-bold text-violet-600 mt-2">
        ₹{selectedSeats.length * bus.price}
      </div>

      <button
        onClick={handleBooking}
        disabled={loading}
        className="w-full bg-violet-600 text-white py-3 rounded"
      >
        {loading ? "Processing..." : "Pay & Book"}
      </button>

    </div>
  );
};

export default Summary;