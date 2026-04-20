import React from "react";

const Legend = () => {
  return (
    <div className="flex flex-wrap gap-6 text-sm justify-center">

      <LegendItem color="bg-green-500" label="Available" />
      <LegendItem color="bg-violet-600" label="Selected" />
      <LegendItem color="bg-red-500" label="Booked" />
      <LegendItem color="bg-yellow-400" label="Reserved" />
      <LegendItem color="bg-pink-400" label="Ladies" />
      <LegendItem color="bg-blue-400" label="Elderly" />

    </div>
  );
};


// ==============================
// 🔹 SINGLE ITEM
// ==============================
const LegendItem = ({ color, label }) => {
  return (
    <div className="flex items-center gap-2">

      <div className={`w-4 h-4 rounded ${color}`} />

      <span className="text-gray-700 font-medium">
        {label}
      </span>

    </div>
  );
};

export default Legend;