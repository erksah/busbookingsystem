import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AsyncCreatableSelect from "react-select/async-creatable";
import { calculateDuration, formatArrivalLabel, getBusStatus } from "../../utils/timeCalc";

// ==============================
// 📍 MAJOR CITIES GEOLOCATION LIST
// ==============================
const MAJOR_CITIES_INDIA = [
  { label: "Mumbai, Maharashtra", value: "Mumbai" },
  { label: "New Delhi, Delhi", value: "New Delhi" },
  { label: "Bengaluru, Karnataka", value: "Bengaluru" },
  { label: "Hyderabad, Telangana", value: "Hyderabad" },
  { label: "Chennai, Tamil Nadu", value: "Chennai" },
  { label: "Kolkata, West Bengal", value: "Kolkata" },
  { label: "Pune, Maharashtra", value: "Pune" },
  { label: "Ahmedabad, Gujarat", value: "Ahmedabad" },
  { label: "Jaipur, Rajasthan", value: "Jaipur" },
  { label: "Surat, Gujarat", value: "Surat" },
  { label: "Lucknow, Uttar Pradesh", value: "Lucknow" },
  { label: "Kanpur, Uttar Pradesh", value: "Kanpur" },
  { label: "Nagpur, Maharashtra", value: "Nagpur" },
  { label: "Indore, Madhya Pradesh", value: "Indore" },
  { label: "Bhopal, Madhya Pradesh", value: "Bhopal" },
  { label: "Visakhapatnam, Andhra Pradesh", value: "Visakhapatnam" },
  { label: "Patna, Bihar", value: "Patna" },
  { label: "Vadodara, Gujarat", value: "Vadodara" },
  { label: "Ludhiana, Punjab", value: "Ludhiana" },
  { label: "Agra, Uttar Pradesh", value: "Agra" },
  { label: "Varanasi, Uttar Pradesh", value: "Varanasi" },
  { label: "Ranchi, Jharkhand", value: "Ranchi" },
  { label: "Guwahati, Assam", value: "Guwahati" },
  { label: "Bhubaneswar, Odisha", value: "Bhubaneswar" },
  { label: "Thiruvananthapuram, Kerala", value: "Thiruvananthapuram" },
  { label: "Coimbatore, Tamil Nadu", value: "Coimbatore" },
  { label: "Mangaluru, Karnataka", value: "Mangaluru" }
];

let searchTimeout;

const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;
const API = (API_BASE || "").replace(/\/$/, "");


const Search = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
  });

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [lastSearchedDate, setLastSearchedDate] = useState("");

  // ==============================
  // 📍 FETCH LOCATIONS
  // ==============================
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch(`${API}/buses/meta/locations`);
        const data = await res.json();
        const all = [...new Set([...(data.from || []), ...(data.to || [])].map(loc => loc.trim()))];
        setLocations(all);
      } catch (error) {
        console.log("Loc fetch error");
      }
    };
    fetchLocations();
  }, []);

  const defaultDropdownOptions = [
    ...(locations.length > 0 ? [{ label: "🚐 Active Bus Routes", options: locations.map(loc => ({ label: loc, value: loc })) }] : []),
    { label: "📍 Popular Indian Cities", options: MAJOR_CITIES_INDIA.slice(0, 5) }
  ];

  // ==============================
  // 🌍 ASYNC GLOBAL SEARCH
  // ==============================
  const loadOptions = (inputValue) => new Promise((resolve) => {
    if (searchTimeout) clearTimeout(searchTimeout);

    searchTimeout = setTimeout(async () => {
      if (!inputValue) {
        resolve(defaultDropdownOptions);
        return;
      }

      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(inputValue)}&count=10&language=en&format=json`);
        const data = await res.json();

        const indiaOpts = [];
        const globalOpts = [];
        const seen = new Set();

        if (data.results) {
            data.results.forEach((place) => {
               const mainWord = place.name;
               if (!seen.has(mainWord)) {
                   seen.add(mainWord);
                   const isIndia = place.country === "India";
                   if (isIndia) indiaOpts.push({ label: mainWord, value: mainWord });
                   else globalOpts.push({ label: mainWord, value: mainWord });
               }
            });
        }

        resolve([
          ...(indiaOpts.length > 0 ? [{ label: "🇮🇳 Indian Matches", options: indiaOpts }] : []),
          ...(globalOpts.length > 0 ? [{ label: "🌍 Global Matches", options: globalOpts }] : [])
        ]);
      } catch (e) {
        resolve([]);
      }
    }, 450);
  });  // 🔥 default date
  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA");
    setForm(prev => ({ ...prev, date: today }));
    setLastSearchedDate(today); // init with today
  }, []);



  // ==============================
  // 🔍 SEARCH
  // ==============================
  const handleSearch = async () => {

    if (!form.from || !form.to || !form.date) {
      return alert("Fill all fields ❌");
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API}/buses/search?from=${form.from}&to=${form.to}&date=${form.date}`
      );

      const data = await res.json();

      setBuses(data || []);
      setLastSearchedDate(form.date); // 🔥 SAVE SUCCESSFUL SEARCH DATE
      setLoading(false);

    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // 🔄 swap
  const handleSwap = () => {
    setForm({
      ...form,
      from: form.to,
      to: form.from,
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto space-y-6">

      <h2 className="text-xl sm:text-2xl font-bold text-center">
        🔍 Search Buses
      </h2>

      {/* ============================== */}
      {/* 🔥 SEARCH FORM */}
      {/* ============================== */}
      <div className="
        bg-white
        p-4 sm:p-5
        rounded-xl
        shadow
        grid
        grid-cols-1
        sm:grid-cols-2
        md:grid-cols-4
        gap-3 sm:gap-4
        items-center
      ">

        {/* FROM */}
        <div className="w-full">
          <AsyncCreatableSelect
            defaultOptions={defaultDropdownOptions}
            loadOptions={loadOptions}
            placeholder="From (Type or Select)"
            onChange={(selected) => setForm({ ...form, from: selected ? selected.value : "" })}
            value={form.from ? { label: form.from, value: form.from } : null}
            styles={{ control: (base) => ({ ...base, padding: "4px", borderRadius: "0.375rem" }) }}
            formatCreateLabel={(inputValue) => `Use custom manually: "${inputValue}"`}
            isClearable
          />
        </div>

        {/* TO */}
        <div className="w-full">
          <AsyncCreatableSelect
            defaultOptions={defaultDropdownOptions}
            loadOptions={loadOptions}
            placeholder="To (Type or Select)"
            onChange={(selected) => setForm({ ...form, to: selected ? selected.value : "" })}
            value={form.to ? { label: form.to, value: form.to } : null}
            styles={{ control: (base) => ({ ...base, padding: "4px", borderRadius: "0.375rem" }) }}
            formatCreateLabel={(inputValue) => `Use custom manually: "${inputValue}"`}
            isClearable
          />
        </div>

        {/* DATE */}
        <input
          type="date"
          min={new Date().toLocaleDateString("en-CA")}
          className="w-full border p-3 rounded focus:ring-2 focus:ring-violet-500"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
        />

        {/* SWAP */}
        <button
          onClick={handleSwap}
          className="
            w-full md:w-auto
            bg-gray-100
            p-3
            rounded
            hover:bg-gray-200
          "
        >
          🔄 Swap
        </button>

        {/* BUTTON */}
        <button
          onClick={handleSearch}
          className="
            col-span-1 sm:col-span-2 md:col-span-4
            bg-violet-600
            text-white
            py-3
            rounded-lg
            hover:bg-violet-700
          "
        >
          🔍 Search Buses
        </button>

      </div>

      {/* ============================== */}
      {/* 🔥 RESULT */}
      {/* ============================== */}
      {loading ? (
        <p className="text-center">Loading buses...</p>
      ) : buses.length === 0 ? (
        <p className="text-gray-500 text-center">
          No buses found 🚫
        </p>
      ) : (
        <div className="space-y-4">

          {buses.map((bus) => {
            
            const scheduleStatus = getBusStatus(bus.departureTime, bus.arrivalTime, bus.journeyDays, lastSearchedDate || form.date);
            const isBookingDisabled = bus.isFull || scheduleStatus !== "OPEN";

            return (
              <div
                key={bus._id}
                className="
                  bg-white p-4 sm:p-5 rounded-xl shadow flex flex-col md:flex-row md:justify-between md:items-center gap-3
                "
              >

                {/* LEFT */}
                <div>
                  <div className="flex gap-2 items-center">
                    <p className="font-bold text-lg">{bus.name}</p>
                    {scheduleStatus === "CLOSING" && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-semibold">Booking Closed</span>}
                    {scheduleStatus === "ON_THE_WAY" && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded font-semibold">On the Way 🚌</span>}
                    {scheduleStatus === "REACHED" && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-semibold">Reached ✅</span>}
                  </div>

                  <p className="text-gray-600 mt-1">
                    {bus.from} → {bus.to}
                  </p>

                  <p className="text-sm text-gray-800 mt-1">
                    🕒 {bus.departureTime} - {formatArrivalLabel(bus.arrivalTime, bus.journeyDays)}
                  </p>

                  <p className="text-xs font-semibold text-violet-600 mt-1">
                    ⏱ Duration: {calculateDuration(bus.departureTime, bus.arrivalTime, bus.journeyDays)}
                  </p>

                  {bus.distanceKm > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      🛣 Distance: {bus.distanceKm} km
                    </p>
                  )}
                </div>

                {/* RIGHT */}
                <div className="text-left md:text-right space-y-1">

                  <p className="text-xl font-bold text-violet-600">
                    ₹{bus.priceOverride || bus.price}
                  </p>

                  {bus.isFull && scheduleStatus === "OPEN" ? (
                    <p className="text-red-500 text-sm">Bus Full ❌</p>
                  ) : scheduleStatus === "OPEN" ? (
                    <p className="text-green-600 text-sm">{bus.availableSeats} seats left</p>
                  ) : null}

                  <button
                    onClick={() => navigate(`/bus/${bus._id}?date=${lastSearchedDate || form.date}`)}
                    disabled={isBookingDisabled}
                    className={`mt-2 w-full md:w-auto px-4 py-2 rounded text-white font-semibold transition ${
                      isBookingDisabled
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-violet-600 hover:bg-violet-700"
                    }`}
                  >
                    {scheduleStatus === "CLOSING" ? "Booking Closed 🔒" :
                     scheduleStatus === "ON_THE_WAY" ? "Bus On the Way 🚌" :
                     scheduleStatus === "REACHED" ? "Journey Completed ✅" :
                     "View Seats"}
                  </button>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};

export default Search;