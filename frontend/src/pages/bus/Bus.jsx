import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
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


// Images
import Bus1 from "../../assets/images/bus1.png";
import Bus2 from "../../assets/images/bus2.png";
import Bus3 from "../../assets/images/bus3.png";
import Bus4 from "../../assets/images/bus4.png";
import Bus5 from "../../assets/images/bus5.png";
import Bus6 from "../../assets/images/bus6.png";
import Bus7 from "../../assets/images/bus7.png";
import Bus8 from "../../assets/images/bus8.png";
import Bus9 from "../../assets/images/bus9.png";
import Bus10 from "../../assets/images/bus10.png";

const busImages = [
  Bus1, Bus2, Bus3, Bus4, Bus5,
  Bus6, Bus7, Bus8, Bus9, Bus10,
];

const Bus = () => {

  const [buses, setBuses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSearchedDate, setLastSearchedDate] = useState("");

  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
  });

  const [locations, setLocations] = useState([]);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);

  const fromQuery = query.get("from") || "";
  const toQuery = query.get("to") || "";
  const dateQuery = query.get("date") || "";

  // ==============================
  // INIT FORM
  // ==============================
  useEffect(() => {
    setForm({
      from: fromQuery,
      to: toQuery,
      date: dateQuery,
    });
  }, [fromQuery, toQuery, dateQuery]);

  // ==============================
  // FETCH LOCATIONS
  // ==============================
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch(`${API}/buses/meta/locations`);
        const data = await res.json();
        const all = [...new Set([...(data.from || []), ...(data.to || [])].map(loc => loc.trim()))];
        setLocations(all);
      } catch (err) {
        console.log(err);
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
  // FETCH BUSES
  // ==============================
  useEffect(() => {

    if (!fromQuery || !toQuery || !dateQuery) {
      setBuses([]);
      return;
    }

    const fetchBuses = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API}/buses/search?from=${fromQuery}&to=${toQuery}&date=${dateQuery}`
        );

        const data = await res.json();

        setBuses(res.ok ? data : []);
        setLastSearchedDate(dateQuery); // 🔥 SAVE DATE BELONGING TO THESE RESULTS

      } catch {
        setBuses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, [fromQuery, toQuery, dateQuery]);



  // ==============================
  // FILTER CITIES
  // ==============================
  const filterCities = (value) => {
    return locations.filter(c =>
      c.toLowerCase().includes(value.toLowerCase())
    );
  };

  // ==============================
  // SWAP
  // ==============================
  const handleSwap = () => {
    setForm({
      ...form,
      from: form.to,
      to: form.from,
    });
  };

  // ==============================
  // SEARCH
  // ==============================
  const handleSearch = () => {

    if (!form.from || !form.to || !form.date) {
      return alert("Fill all fields ❌");
    }

    if (form.from === form.to) {
      return alert("From & To cannot be same ❌");
    }

    navigate(`/bus?from=${form.from}&to=${form.to}&date=${form.date}`);
  };

  // ==============================
  // FILTER BUSES
  // ==============================
  const filteredBuses = buses.filter((bus) =>
    bus.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full lg:px-28 md:px-16 sm:px-7 px-4 mt-[13ch] mb-[10ch] space-y-6">

      {/* 🔥 TOP SEARCH */}
      <div className="bg-white shadow-lg rounded-2xl p-5 flex flex-col md:flex-row gap-3 md:items-center">

        {/* FROM */}
        <div className="w-full">
          <AsyncCreatableSelect
            defaultOptions={defaultDropdownOptions}
            loadOptions={loadOptions}
            placeholder="From (Type or Select)"
            onChange={(selected) => setForm({ ...form, from: selected ? selected.value : "" })}
            value={form.from ? { label: form.from, value: form.from } : null}
            styles={{ control: (base) => ({ ...base, height: "56px", borderRadius: "0.5rem" }) }}
            formatCreateLabel={(inputValue) => `Use custom manually: "${inputValue}"`}
            isClearable
          />
        </div>

        {/* SWAP */}
        <button
          onClick={handleSwap}
          className="h-14 px-4 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          🔄
        </button>

        {/* TO */}
        <div className="w-full">
          <AsyncCreatableSelect
            defaultOptions={defaultDropdownOptions}
            loadOptions={loadOptions}
            placeholder="To (Type or Select)"
            onChange={(selected) => setForm({ ...form, to: selected ? selected.value : "" })}
            value={form.to ? { label: form.to, value: form.to } : null}
            styles={{ control: (base) => ({ ...base, height: "56px", borderRadius: "0.5rem" }) }}
            formatCreateLabel={(inputValue) => `Use custom manually: "${inputValue}"`}
            isClearable
          />
        </div>

        {/* DATE */}
        <input
          type="date"
          value={form.date}
          min={new Date().toLocaleDateString("en-CA")}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
          className="h-14 px-4 text-lg border rounded-lg w-full"
        />

        {/* BUTTON */}
        <button
          onClick={handleSearch}
          className="h-14 px-6 text-lg bg-violet-600 text-white rounded-lg hover:bg-violet-700"
        >
          🔍 Search
        </button>

      </div>

      {/* TITLE */}
      <h1 className="text-3xl font-bold text-center">
        Available Buses 🚌
      </h1>

      {/* FILTER */}
      <div className="max-w-2xl mx-auto space-y-2">

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search bus name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-neutral-200"
          />

          <button className="bg-violet-600 text-white px-5 rounded-lg">
            <FaSearch />
          </button>
        </div>

        {(fromQuery || toQuery || dateQuery) && (
          <p className="text-center text-sm text-gray-500">
            {fromQuery} → {toQuery} | 📅{" "}
            {new Date(dateQuery).toLocaleDateString()}
          </p>
        )}

      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-lg animate-pulse">
          🔄 Searching buses...
        </p>
      )}

      {/* LIST */}
      {!loading && (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">

          {filteredBuses.length > 0 ? (
            filteredBuses.map((bus, index) => {
              
              const scheduleStatus = getBusStatus(bus.departureTime, bus.arrivalTime, bus.journeyDays, lastSearchedDate || dateQuery);
              const isBookingDisabled = bus.isFull || scheduleStatus !== "OPEN";

              const card = (
                <>
                  <img
                    src={busImages[index % busImages.length]}
                    alt={bus.name}
                    className="w-full h-48 object-cover"
                  />

                  <div className="p-4 space-y-2">

                    <div className="flex justify-between items-start">
                       <h2 className="text-xl font-bold">{bus.name}</h2>
                       {scheduleStatus === "CLOSING" && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold">Closed</span>}
                       {scheduleStatus === "ON_THE_WAY" && <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded font-bold">On the Way</span>}
                       {scheduleStatus === "REACHED" && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold">Reached</span>}
                    </div>

                    <p className="text-gray-600">
                      {bus.from} → {bus.to}
                    </p>

                    <p className="text-sm text-gray-800">
                      🕒 {bus.departureTime} - {formatArrivalLabel(bus.arrivalTime, bus.journeyDays)}
                    </p>

                    <p className="text-xs font-semibold text-violet-600">
                      ⏱ Duration: {calculateDuration(bus.departureTime, bus.arrivalTime, bus.journeyDays)}
                    </p>

                    {bus.distanceKm > 0 && (
                      <p className="text-xs text-gray-500">
                        🛣 Distance: {bus.distanceKm} km
                      </p>
                    )}

                    <div className="pt-2">
                      {bus.isFull && scheduleStatus === "OPEN" ? (
                        <span className="text-red-500 font-semibold text-sm">❌ Full</span>
                      ) : scheduleStatus === "OPEN" ? (
                        <span className="text-green-600 font-semibold text-sm">{bus.availableSeats} seats left</span>
                      ) : null}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-semibold text-violet-600">
                        ₹{bus.priceOverride || bus.price}
                      </span>

                      <button disabled={isBookingDisabled} className={`px-3 py-1 rounded font-semibold text-xs text-white ${isBookingDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-violet-600"}`}>
                        {scheduleStatus === "CLOSING" ? "Booking Closed 🔒" : scheduleStatus === "ON_THE_WAY" ? "Bus On the Way 🚌" : scheduleStatus === "REACHED" ? "Completed ✅" : "View Seats →"}
                      </button>
                    </div>

                  </div>
                </>
              );

              return isBookingDisabled ? (
                <div key={bus._id} className="bg-white rounded-xl shadow opacity-60">
                  {card}
                </div>
              ) : (
                <Link
                  key={bus._id}
                  to={`/bus/${bus._id}?date=${lastSearchedDate || dateQuery}`}
                  className="bg-white rounded-xl shadow hover:shadow-xl transition"
                >
                  {card}
                </Link>
              );

            })
          ) : (
            <div className="col-span-full text-center space-y-3">

              <p className="text-lg text-gray-500">
                🚫 No buses found
              </p>

              <Link to="/" className="text-violet-600 underline">
                Try another search
              </Link>

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default Bus;