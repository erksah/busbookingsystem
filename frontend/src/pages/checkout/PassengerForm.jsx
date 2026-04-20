const PassengerForm = ({ passengers, handlePassengerChange }) => {

  return (
    <>
      <h3 className="text-xl font-semibold mt-6">
        Passenger Details 🎫
      </h3>

      {passengers.map((p, i) => (
        <div key={i} className="border p-3 rounded space-y-2">

          <p className="font-medium">Seat {p.seat}</p>

          <input
            placeholder="Name"
            className="w-full p-2 border rounded"
            onChange={(e) =>
              handlePassengerChange(i, "name", e.target.value)
            }
          />

          <input
            placeholder="Age"
            type="number"
            className="w-full p-2 border rounded"
            onChange={(e) =>
              handlePassengerChange(i, "age", e.target.value)
            }
          />

          <select
            className="w-full p-2 border rounded"
            onChange={(e) =>
              handlePassengerChange(i, "gender", e.target.value)
            }
          >
            <option value="">Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>

        </div>
      ))}
    </>
  );
};

export default PassengerForm;