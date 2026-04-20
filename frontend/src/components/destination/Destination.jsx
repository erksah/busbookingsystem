import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AsyncCreatableSelect from "react-select/async-creatable";

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

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

const Destination = () => {

  const navigate = useNavigate();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==============================
  // 📍 FETCH LOCATIONS
  // ==============================
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API}/buses/meta/locations`);
        const data = await res.json();

        // 🔥 UNIQUE + CLEAN
        const all = [
          ...new Set(
            [...(data.from || []), ...(data.to || [])].map(loc => loc.trim())
          ),
        ];

        setLocations(all);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // ==============================
  // 🌍 DYNAMIC GLOBAL SEARCH
  // ==============================
  // ==============================
  // 🌍 BULLETPROOF CONTROLLED DROPDOWN
  // ==============================
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
      // 1. Matches from Active Routes (Database)
      const dbMatches = locations
        .filter(loc => (loc || "").toLowerCase().includes((inputValue || "").toLowerCase()))
        .map(loc => ({ label: loc, value: loc }));

      // 2. Matches from Popular Cities (Static)
      const popularMatches = MAJOR_CITIES_INDIA
        .filter(city => city.label.toLowerCase().includes((inputValue || "").toLowerCase()))
        .slice(0, 3);

      if (!inputValue) {
        resolve(defaultDropdownOptions);
        return;
      }

      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(inputValue)}&count=10&language=en&format=json`);
        const data = await res.json();

        const indiaOpts = [];
        const globalOpts = [];
        const seen = new Set([...dbMatches, ...popularMatches].map(m => (m.value || "").toLowerCase()));

        if (data.results) {
            data.results.forEach((place) => {
               const mainWord = place.name;
               const lower = (mainWord || "").toLowerCase();
               if (mainWord && !seen.has(lower)) {
                   seen.add(lower);
                   const isIndia = place.country === "India";
                   if (isIndia) indiaOpts.push({ label: mainWord, value: mainWord });
                   else globalOpts.push({ label: mainWord, value: mainWord });
               }
            });
        }

        resolve([
          ...(dbMatches.length > 0 ? [{ label: "🚐 Active Bus Routes", options: dbMatches }] : []),
          ...(popularMatches.length > 0 ? [{ label: "📍 Popular Cities", options: popularMatches }] : []),
          ...(indiaOpts.length > 0 ? [{ label: "🇮🇳 Indian Places", options: indiaOpts }] : []),
          ...(globalOpts.length > 0 ? [{ label: "🌍 Global Places", options: globalOpts }] : [])
        ]);

      } catch (e) {
        resolve([
          ...(dbMatches.length > 0 ? [{ label: "🚐 Active Bus Routes", options: dbMatches }] : []),
          ...(popularMatches.length > 0 ? [{ label: "📍 Popular Cities", options: popularMatches }] : [])
        ]);
      }
    }, 450);
  });

  // ==============================
  // 📅 DEFAULT DATE
  // ==============================
  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA");
    setDate(today);
  }, []);



  // ==============================
  // 🔄 SWAP
  // ==============================
  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  // ==============================
  // 🔍 SEARCH
  // ==============================
  const handleSearch = () => {

    if (!from || !to || !date) {
      return alert("Fill all fields ❌");
    }

    if (from === to) {
      return alert("From and To cannot be same ❌");
    }

    navigate(`/bus?from=${from}&to=${to}&date=${date}`);
  };

  // ==============================
  // 📅 TOMORROW
  // ==============================
  const setTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setDate(d.toLocaleDateString("en-CA"));
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-5 sm:p-6 max-w-5xl mx-auto -mt-12 relative z-10">

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center">

        {/* FROM */}
        <div className="w-full">
          <AsyncCreatableSelect
            defaultOptions={defaultDropdownOptions}
            loadOptions={loadOptions}
            placeholder="From"
            onChange={(selected) => setFrom(selected ? selected.value : "")}
            value={from ? { label: from, value: from } : null}
            styles={{ control: (base) => ({ ...base, height: "48px", borderRadius: "0.25rem" }) }}
            formatCreateLabel={(inputValue) => `Use custom manually: "${inputValue}"`}
            isClearable
          />
        </div>

        {/* SWAP */}
        <button
          onClick={handleSwap}
          className="bg-gray-100 hover:bg-gray-200 h-12 rounded"
        >
          🔄
        </button>

        {/* TO */}
        <div className="w-full">
          <AsyncCreatableSelect
            defaultOptions={defaultDropdownOptions}
            loadOptions={loadOptions}
            placeholder="To"
            onChange={(selected) => setTo(selected ? selected.value : "")}
            value={to ? { label: to, value: to } : null}
            styles={{ control: (base) => ({ ...base, height: "48px", borderRadius: "0.25rem" }) }}
            formatCreateLabel={(inputValue) => `Use custom manually: "${inputValue}"`}
            isClearable
          />
        </div>

        {/* DATE */}
        <input
          type="date"
          value={date}
          min={new Date().toLocaleDateString("en-CA")}
          onChange={(e) => setDate(e.target.value)}
          className="h-12 border rounded px-3"
        />

        {/* QUICK BUTTONS */}
        <div className="flex gap-2">
          <button
            onClick={() =>
              setDate(new Date().toLocaleDateString("en-CA"))
            }
            className="border px-3 py-2 rounded w-full"
          >
            Today
          </button>

          <button
            onClick={setTomorrow}
            className="border px-3 py-2 rounded w-full"
          >
            Tomorrow
          </button>
        </div>

      </div>

      {/* SEARCH */}
      <button
        onClick={handleSearch}
        className="w-full mt-5 bg-red-500 text-white py-3 rounded-full text-lg hover:bg-red-600 transition"
      >
        🔍 Search Buses
      </button>

    </div>
  );
};

export default Destination;