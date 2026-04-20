import React from "react";
import { MdOutlineChair } from "react-icons/md";

const SeatBox = ({
  seat,
  seatData = [],
  selectedSeats = [],
  onClick
}) => {

  const seatStr = String(seat.seatNumber);

  // ==============================
  // 🔥 FIND STATUS
  // ==============================
  const statusObj = seatData.find(s => String(s.seat) === seatStr);

  const status = statusObj?.status || null;
  const reservedBy = statusObj?.reservedBy || null;

  let currentSessionId = localStorage.getItem("bookingSessionId");
  if (!currentSessionId) {
    currentSessionId = "session_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("bookingSessionId", currentSessionId);
  }

  // ==============================
  // 🔒 DISABLE LOGIC
  // ==============================
  const isSelfReserved = status === "reserved" && reservedBy === currentSessionId;

  const isDisabled =
    seat.isBlocked ||
    status === "confirmed" ||
    (status === "reserved" && !isSelfReserved);

  const isSelected = selectedSeats.includes(seatStr);

  // ==============================
  // 🎨 COLOR SYSTEM (FINAL)
  // ==============================
  let color = "text-green-500"; // 🟢 available
  let tooltip = `Seat ${seatStr}`;

  if (seat.isBlocked) {
    color = "text-black";
    tooltip = "Blocked by Operator";
  }
  else if (status === "confirmed") {
    color = "text-red-500";
    tooltip = "Booked by another person";
  }
  else if (status === "reserved" && !isSelfReserved) {
    color = "text-yellow-500";
    tooltip = "Reserved by another person";
  }
  else if (isSelected && seat.category === "ladies") {
    color = "text-purple-700";
  }
  else if (isSelected && seat.category === "elderly") {
    color = "text-blue-700";
  }
  else if (isSelected) {
    color = "text-violet-600";
  }
  else if (seat.category === "ladies") {
    color = "text-pink-400";
  }
  else if (seat.category === "elderly") {
    color = "text-blue-400";
  }

  // ==============================
  // 🎯 CLICK
  // ==============================
  const handleClick = () => {
    if (isDisabled) return;
    onClick(seat);
  };

  return (
    <div
      onClick={handleClick}
      title={tooltip}
      className={`
        flex flex-col items-center
        ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
        transition duration-200
        ${!isDisabled && "hover:scale-110 hover:drop-shadow-md"}
      `}
    >

      {/* 🪑 SEAT */}
      <MdOutlineChair
        className={`
          text-3xl ${color}
          ${isSelected ? "scale-110" : ""}
          transition
        `}
      />

      {/* 🔢 NUMBER */}
      <span className="text-xs mt-1 font-medium">
        {seatStr}
      </span>

      {/* 🏷️ TYPE */}
      {seat.category === "ladies" && (
        <span className="text-[10px] text-pink-500">
          👩
        </span>
      )}

      {seat.category === "elderly" && (
        <span className="text-[10px] text-blue-500">
          👴
        </span>
      )}

    </div>
  );
};

export default SeatBox;