import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { calculateDistanceKm } from "../../utils/geoCalc";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet Marker Icon mapping organically
let DefaultIcon = L.icon({ 
  iconUrl: markerIcon, 
  shadowUrl: markerShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41] 
});
L.Marker.prototype.options.icon = DefaultIcon;

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;

// ==============================
// 📍 MAJOR CITIES GEOLOCATION LIST
// ==============================
const MAJOR_CITIES_INDIA = [
  { label: "Mumbai, Maharashtra", value: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { label: "New Delhi, Delhi", value: "New Delhi", lat: 28.6139, lon: 77.2090 },
  { label: "Bengaluru, Karnataka", value: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { label: "Hyderabad, Telangana", value: "Hyderabad", lat: 17.3850, lon: 78.4867 },
  { label: "Chennai, Tamil Nadu", value: "Chennai", lat: 13.0827, lon: 80.2707 },
  { label: "Kolkata, West Bengal", value: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { label: "Pune, Maharashtra", value: "Pune", lat: 18.5204, lon: 73.8567 },
  { label: "Ahmedabad, Gujarat", value: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { label: "Jaipur, Rajasthan", value: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { label: "Surat, Gujarat", value: "Surat", lat: 21.1702, lon: 72.8311 },
  { label: "Lucknow, Uttar Pradesh", value: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { label: "Kanpur, Uttar Pradesh", value: "Kanpur", lat: 26.4499, lon: 80.3319 },
  { label: "Nagpur, Maharashtra", value: "Nagpur", lat: 21.1458, lon: 79.0882 },
  { label: "Indore, Madhya Pradesh", value: "Indore", lat: 22.7196, lon: 75.8577 },
  { label: "Bhopal, Madhya Pradesh", value: "Bhopal", lat: 23.2599, lon: 77.4126 },
  { label: "Visakhapatnam, Andhra Pradesh", value: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
  { label: "Patna, Bihar", value: "Patna", lat: 25.5941, lon: 85.1376 },
  { label: "Vadodara, Gujarat", value: "Vadodara", lat: 22.3072, lon: 73.1812 },
  { label: "Ludhiana, Punjab", value: "Ludhiana", lat: 30.9010, lon: 75.8573 },
  { label: "Agra, Uttar Pradesh", value: "Agra", lat: 27.1767, lon: 78.0081 },
  { label: "Varanasi, Uttar Pradesh", value: "Varanasi", lat: 25.3176, lon: 83.0039 },
  { label: "Ranchi, Jharkhand", value: "Ranchi", lat: 23.3441, lon: 85.3096 },
  { label: "Guwahati, Assam", value: "Guwahati", lat: 26.1445, lon: 91.7362 },
  { label: "Bhubaneswar, Odisha", value: "Bhubaneswar", lat: 20.2961, lon: 85.8245 },
  { label: "Thiruvananthapuram, Kerala", value: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366 },
  { label: "Coimbatore, Tamil Nadu", value: "Coimbatore", lat: 11.0168, lon: 76.9558 },
  { label: "Mangaluru, Karnataka", value: "Mangaluru", lat: 12.9141, lon: 74.8560 }
];

// ==============================
// 🗺️ MAP CLICK EVENT HOOK
// ==============================
const MapClickHandler = ({ mapSelectionMode, setMapSelectionMode, setCoords, setForm }) => {
  useMapEvents({
    click: async (e) => {
      if (!mapSelectionMode) return;
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
          headers: { "User-Agent": "BusBookingAppAdmin/1.0" }
        });
        const data = await res.json();
        const detectedName = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

        if (mapSelectionMode === "from") {
          setCoords(prev => ({ ...prev, fromLat: lat, fromLon: lon }));
          setForm(prev => ({ ...prev, from: detectedName }));
        } else if (mapSelectionMode === "to") {
          setCoords(prev => ({ ...prev, toLat: lat, toLon: lon }));
          setForm(prev => ({ ...prev, to: detectedName }));
        }
      } catch(err) {
        console.log("Map Reverse Geocode failed");
      } finally {
        setMapSelectionMode(null); // Reset hook beautifully natively
      }
    }
  });
  return null;
};

// ==============================
// 🎯 FLAWLESS CUSTOM AUTOCOMPLETE (WITH GLOBAL OSM ENGINE)
// ==============================
const CustomAutocomplete = ({ value, onChange, onSelectOpt, defaultOptions, placeholder, restrictionCountry }) => {
  const [open, setOpen] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!value || value.length < 2) {
      setDynamicOptions([]);
      return;
    }
    
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(value)}&count=8&language=en&format=json`);
        const data = await res.json();
        
        const newOpts = [];
        if (data.results) {
           data.results.forEach(place => {
              if (place.name) {
                 // STRICT COUNTRY RESTRICTION ENFORCEMENT
                 if (restrictionCountry && place.country_code && place.country_code.toLowerCase() !== restrictionCountry.toLowerCase()) {
                    return; // Skip silently if it doesn't match the selected country!
                 }

                 const admin = place.admin1 ? `, ${place.admin1}` : "";
                 const country = place.country ? `, ${place.country}` : "";
                 newOpts.push({
                    label: `${place.name}${admin}${country}`,
                    value: place.name,
                    lat: place.latitude,
                    lon: place.longitude
                 });
              }
           });
        }
        setDynamicOptions(newOpts);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(timeout);
  }, [value]);

  // Hide static India list if a different country is enforced!
  const filteredDefaults = (restrictionCountry === 'in' || !restrictionCountry) 
      ? defaultOptions.filter(o => o.label.toLowerCase().includes((value || "").toLowerCase()))
      : [];
      
  const combinedOptions = [...filteredDefaults];
  const seen = new Set(filteredDefaults.map(o => o.value.toLowerCase()));

  dynamicOptions.forEach(opt => {
     const mainName = opt.value.toLowerCase();
     if (!seen.has(mainName)) {
        seen.add(mainName);
        combinedOptions.push(opt);
     }
  });

  return (
    <div className="relative w-full">
      <input 
        type="text" 
        value={value} 
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 250)}
        className="w-full p-2.5 border border-gray-300 rounded focus:outline-violet-500 bg-white"
        placeholder={placeholder}
      />
      {open && (
        <ul className="absolute z-[2000] w-full bg-white border border-gray-300 rounded shadow-xl max-h-56 overflow-y-auto mt-1">
          {combinedOptions.map((o, idx) => (
            <li 
              key={idx} 
              className="p-3 hover:bg-violet-50 hover:text-violet-700 cursor-pointer border-b last:border-b-0 text-gray-800 text-sm font-medium transition"
              onMouseDown={(e) => { e.preventDefault(); onSelectOpt(o); setOpen(false); }}
            >
              {o.label}
            </li>
          ))}
          {loading && (
             <li className="p-3 text-sm text-blue-500 italic font-semibold animate-pulse">🌍 Searching OpenStreetMap globally...</li>
          )}
          {!loading && combinedOptions.length === 0 && (
             <li className="p-3 text-sm text-gray-400 italic">Editing manually. Map coordinates strictly locked.</li>
          )}
        </ul>
      )}
    </div>
  );
};

// ==============================
// 🔥 MAIN COMPONENT
// ==============================
const EditBus = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    from: "",
    to: "",
    departureTime: "",
    arrivalTime: "",
    price: "",
    totalSeats: "",
    distanceKm: "",
    journeyDays: 0,
    basePricePerKm: 2, // ✅ NEW: Local Bus Price
    averageSpeed: 60,  // ✅ NEW: Local Bus Speed
  });

  const [coords, setCoords] = useState({
    fromLat: null, fromLon: null,
    toLat: null, toLon: null
  });

  const [countryOptions, setCountryOptions] = useState([{ label: "India", value: "in" }]);
  const [selectedCountry, setSelectedCountry] = useState({ label: "India", value: "in" });
  
  const [mapSelectionMode, setMapSelectionMode] = useState(null); // 'from' | 'to' | null
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [delayHours, setDelayHours] = useState(0);

  // ==============================
  // 🔥 FETCH GLOBAL COUNTRIES
  // ==============================
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2");
        const data = await res.json();
        const formatted = data
          .map(c => ({ label: c.name.common, value: c.cca2.toLowerCase() }))
          .sort((a,b) => a.label.localeCompare(b.label));
        
        const main = formatted.find(c => c.value === "in") || { label: "India", value: "in" };
        const others = formatted.filter(c => c.value !== "in");
        setCountryOptions([main, ...others]);
      } catch (e) {
        console.log("Failed to load countries");
      }
    };
    fetchCountries();
  }, []);

  // ==============================
  // 🔥 AUTO-DISTANCE HOOK
  // ==============================
  const updateDistance = async (type = "road") => {
    if (!coords.fromLat || !coords.fromLon || !coords.toLat || !coords.toLon) return;

    let dist = 0;
    if (type === "road") {
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords.fromLon},${coords.fromLat};${coords.toLon},${coords.toLat}?overview=false`);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          dist = Math.round(data.routes[0].distance / 1000);
        } else {
          dist = calculateDistanceKm(coords.fromLat, coords.fromLon, coords.toLat, coords.toLon); // fallback safely
        }
      } catch (e) {
        dist = calculateDistanceKm(coords.fromLat, coords.fromLon, coords.toLat, coords.toLon);
      }
    } else {
      dist = Math.round(calculateDistanceKm(coords.fromLat, coords.fromLon, coords.toLat, coords.toLon));
    }
    
    setForm(prev => ({
      ...prev,
      distanceKm: dist,
      price: dist > 0 ? Math.round(dist * prev.basePricePerKm).toString() : prev.price
    }));
  };

  useEffect(() => {
    // Only auto-trigger when coords strictly change from the map picking
    updateDistance("road");
  }, [coords]);

  // ==============================
  // 🔥 SMART ARRIVAL TIME HOOK
  // ==============================
  useEffect(() => {
    if (form.distanceKm > 0 && form.departureTime && form.averageSpeed > 0) {
       const durationHours = form.distanceKm / form.averageSpeed;
       const totalMinutesToAdd = Math.round((durationHours + Number(delayHours)) * 60);

       const [hStr, mStr] = form.departureTime.split(":");
       let totalMins = (parseInt(hStr) * 60) + parseInt(mStr) + totalMinutesToAdd;

       const journeyDaysObj = Math.floor(totalMins / 1440);
       const remainingMins = totalMins % 1440;
       
       const finalH = Math.floor(remainingMins / 60);
       const finalM = remainingMins % 60;
       const HH = String(finalH).padStart(2, "0");
       const MM = String(finalM).padStart(2, "0");

       setForm(prev => ({
         ...prev,
         arrivalTime: `${HH}:${MM}`,
         journeyDays: journeyDaysObj
       }));
    }
  }, [form.distanceKm, form.departureTime, delayHours, form.averageSpeed]);

  const busOptions = [
    { value: "Express Bus", label: "Express Bus" },
    { value: "Super Deluxe", label: "Super Deluxe" },
    { value: "Sleeper AC", label: "Sleeper AC" },
    { value: "Volvo AC", label: "Volvo AC" },
  ];

  const journeyOptions = [
    { value: 0, label: "Same Day (0 Days)" },
    { value: 1, label: "Next Day (+1 Day)" },
    { value: 2, label: "Following Day (+2 Days)" },
  ];

  const format12 = (h, m) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 30) {
        const hour = String(i).padStart(2, "0");
        const min = String(j).padStart(2, "0");
        times.push({ value: `${hour}:${min}`, label: format12(i, min) });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // ==============================
  // 🔥 FETCH EXISTING BUS
  // ==============================
  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await fetch(`${API}/buses/${id}`);
        const data = await res.json();
        setForm({
          name: data.name || "",
          from: data.from || "",
          to: data.to || "",
          departureTime: data.departureTime || "",
          arrivalTime: data.arrivalTime || "",
          price: data.price || "",
          totalSeats: data.totalSeats || "",
          distanceKm: data.distanceKm || "",
          journeyDays: data.journeyDays || 0,
          basePricePerKm: data.basePricePerKm || 2,
          averageSpeed: data.averageSpeed || 60,
        });

        // 🔥 Seamlessly feed the map its native coordinates without text dependencies!
        if (data.fromLat && data.fromLon && data.toLat && data.toLon) {
           setCoords({
             fromLat: data.fromLat,
             fromLon: data.fromLon,
             toLat: data.toLat,
             toLon: data.toLon,
           });
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchBus();
  }, [id]);

  const handleDistanceChange = (e) => {
    const dist = e.target.value;
    const computedPrice = Math.round(dist * form.basePricePerKm);
    setForm({ ...form, distanceKm: dist, price: dist > 0 ? computedPrice.toString() : "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return navigate("/admin/login");

      const res = await fetch(`${API}/admin/bus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          totalSeats: Number(form.totalSeats),
          distanceKm: Number(form.distanceKm || 0),
          journeyDays: Number(form.journeyDays),
          basePricePerKm: Number(form.basePricePerKm),
          averageSpeed: Number(form.averageSpeed),
          fromLat: coords.fromLat,
          fromLon: coords.fromLon,
          toLat: coords.toLat,
          toLon: coords.toLon,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Update failed ❌");
        setLoading(false);
        return;
      }
      setMessage("Bus updated successfully ✅");
      setTimeout(() => navigate("/admin/manage-bus"), 1000);
    } catch {
      setMessage("Server error ❌");
      setLoading(false);
    }
  };

  // Map Centralization Hook seamlessly natively mapping
  const activeLat = coords.toLat || coords.fromLat || 20.5937;
  const activeLon = coords.toLon || coords.fromLon || 78.9629; // Defaults safely to India center securely

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Bus ✏️</h2>

      {message && (
        <div className="bg-gray-100 p-2 text-center text-sm rounded mb-4 shadow">
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* ============================== */}
        {/* LEFT COLUMN: FORMS */}
        {/* ============================== */}
        <form onSubmit={handleUpdate} className="space-y-4">
          
          <Select options={busOptions} placeholder="Select Bus Type" value={busOptions.find(b => b.value === form.name) || null} onChange={(e) => setForm({ ...form, name: e.value })} />

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Search Restriction (Global Country Limits)</label>
            <Select options={countryOptions} value={selectedCountry} onChange={(e) => setSelectedCountry({ label: e.label, value: e.value })} />
          </div>

          {/* FROM LOCATOR */}
          <div className="bg-gray-50 p-3 rounded border space-y-2 relative">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-700">Origin Locator</label>
              <button type="button" onClick={() => setMapSelectionMode(mapSelectionMode === "from" ? null : "from")} className={`text-xs px-2 py-1 rounded ${mapSelectionMode === "from" ? "bg-red-500 text-white" : "bg-violet-100 text-violet-700 hover:bg-violet-200"}`}>
                {mapSelectionMode === "from" ? "Click Map to Select..." : "📍 Select on Map"}
              </button>
            </div>
            <CustomAutocomplete
               value={form.from}
               onChange={(val) => setForm(prev => ({ ...prev, from: val }))}
               onSelectOpt={(opt) => {
                  setForm(prev => ({ ...prev, from: opt.value }));
                  setCoords(prev => ({ ...prev, fromLat: opt.lat, fromLon: opt.lon }));
               }}
               defaultOptions={MAJOR_CITIES_INDIA}
               placeholder="Select from list, map, or freely type..."
               restrictionCountry={selectedCountry?.value}
            />
          </div>

          {/* TO LOCATOR */}
          <div className="bg-gray-50 p-3 rounded border space-y-2 relative">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-700">Destination Locator</label>
              <button type="button" onClick={() => setMapSelectionMode(mapSelectionMode === "to" ? null : "to")} className={`text-xs px-2 py-1 rounded ${mapSelectionMode === "to" ? "bg-red-500 text-white" : "bg-violet-100 text-violet-700 hover:bg-violet-200"}`}>
                {mapSelectionMode === "to" ? "Click Map to Select..." : "📍 Select on Map"}
              </button>
            </div>
            <CustomAutocomplete
               value={form.to}
               onChange={(val) => setForm(prev => ({ ...prev, to: val }))}
               onSelectOpt={(opt) => {
                  setForm(prev => ({ ...prev, to: opt.value }));
                  setCoords(prev => ({ ...prev, toLat: opt.lat, toLon: opt.lon }));
               }}
               defaultOptions={MAJOR_CITIES_INDIA}
               placeholder="Select from list, map, or freely type..."
               restrictionCountry={selectedCountry?.value}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded border border-blue-200">
             <div className="flex justify-between items-center mb-2">
                 <label className="text-xs font-semibold text-blue-700 block">Total Trip Distance (Km)</label>
                 <div className="flex gap-2">
                   <button type="button" onClick={() => updateDistance("road")} className="text-xs bg-white border hover:bg-gray-100 text-gray-800 px-3 py-1 rounded transition">🚗 Calculate by Road</button>
                   <button type="button" onClick={() => updateDistance("air")} className="text-xs bg-white border hover:bg-gray-100 text-gray-800 px-3 py-1 rounded transition">✈️ Calculate by Air</button>
                 </div>
             </div>
             <input type="number" placeholder="Distance in Km (Auto-calculates Arrival & Price!)" className="w-full p-2 border rounded focus:outline-blue-500 bg-white" value={form.distanceKm} onChange={handleDistanceChange} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <Select options={timeOptions} placeholder="Departure" value={timeOptions.find(t => t.value === form.departureTime) || null} onChange={(e) => setForm({ ...form, departureTime: e.value })} />
             <Select options={timeOptions} placeholder="Arrival (Auto-estimated & Editable)" value={timeOptions.find(t => t.value === form.arrivalTime) || null} onChange={(e) => setForm({ ...form, arrivalTime: e.value })} />
             
             <div className="col-span-2">
               <label className="text-xs font-semibold text-gray-500 block mb-1">Traffic / Delay Hours (+Added to Arrival)</label>
               <input type="number" step="0.5" placeholder="0" className="w-full p-2 border rounded focus:outline-violet-500" value={delayHours} onChange={(e) => setDelayHours(e.target.value)} />
             </div>
          </div>
          
          <Select options={journeyOptions} placeholder="How many days does this trip span?" value={journeyOptions.find(j => j.value === form.journeyDays) || null} onChange={(e) => setForm({ ...form, journeyDays: e.value })} />

          <div className="grid grid-cols-2 gap-4 bg-blue-50 p-3 rounded border border-blue-200">
            <div>
              <label className="text-xs font-semibold text-blue-700 block mb-1">Bus Base Price per KM (₹)</label>
              <input 
                 type="number" 
                 step="0.1" 
                 className="w-full p-2 border rounded bg-white" 
                 value={form.basePricePerKm} 
                 onChange={(e) => {
                   const newBasePrice = parseFloat(e.target.value) || 0;
                   setForm(prev => {
                     let newPrice = prev.price;
                     if (prev.distanceKm > 0 && newBasePrice > 0) {
                        newPrice = Math.round(prev.distanceKm * newBasePrice).toString();
                     }
                     return { ...prev, basePricePerKm: e.target.value, price: newPrice };
                   });
                 }} 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-blue-700 block mb-1">Average Bus Speed (km/h)</label>
              <input type="number" className="w-full p-2 border rounded bg-white" value={form.averageSpeed} onChange={(e) => setForm({ ...form, averageSpeed: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Ticket Price (Auto-computed ₹{form.basePricePerKm}/km. Editable override)</label>
            <input type="number" placeholder="Price" className="w-full p-3 border rounded focus:outline-violet-500 bg-yellow-50" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>

          <input type="number" placeholder="Total Seats" className="w-full p-3 border rounded" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} />

          <button disabled={loading} className="w-full bg-violet-600 text-white py-3 rounded hover:bg-violet-700 transition">
            {loading ? "Updating..." : "Update Bus"}
          </button>
        </form>

        {/* ============================== */}
        {/* RIGHT COLUMN: INTERACTIVE MAP */}
        {/* ============================== */}
        <div className="bg-white rounded-xl shadow border h-[600px] overflow-hidden relative">
          {mapSelectionMode && (
            <div className="absolute top-4 left-0 right-0 mx-auto z-[1000] bg-red-500 text-white p-3 rounded-full text-center shadow-lg font-semibold animate-pulse w-3/4">
               Click anywhere on the map to set {mapSelectionMode === "from" ? "Origin" : "Destination"}...
            </div>
          )}
          <MapContainer center={[activeLat, activeLon]} zoom={5} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {coords.fromLat && <Marker position={[coords.fromLat, coords.fromLon]} />}
            {coords.toLat && <Marker position={[coords.toLat, coords.toLon]} />}
            {coords.fromLat && coords.toLat && <Polyline positions={[[coords.fromLat, coords.fromLon], [coords.toLat, coords.toLon]]} color="blue" weight={4} dashArray="10, 10" />}
            <MapClickHandler mapSelectionMode={mapSelectionMode} setMapSelectionMode={setMapSelectionMode} setCoords={setCoords} setForm={setForm} />
          </MapContainer>
        </div>

      </div>
    </div>
  );
};

export default EditBus;