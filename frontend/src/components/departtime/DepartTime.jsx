import React, { useEffect, useState } from "react";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

const DepartTime = ({ value, onChange }) => {

  const [times, setTimes] = useState([]);

  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const res = await fetch(`${API}/buses/meta/times`);
        const data = await res.json();

        setTimes(Array.isArray(data) ? data : []);

      } catch (err) {
        console.log(err);
      }
    };

    fetchTimes();
  }, []);

  return (
    <div className="space-y-2">

      <label className="text-sm font-semibold">
        Departure Time ⏰
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 border rounded px-2"
      >
        <option value="">All</option>

        {times.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

    </div>
  );
};

export default DepartTime;