// ==============================
// 🛠 APPLY DEFAULTS (HELPER)
// ==============================
export const applyDefaultCategories = (layout) => {
  if (!Array.isArray(layout)) return layout;

  return layout.map((seat, index) => {
    const i = index + 1;
    let defaultCat = "normal";

    // 🎯 MINIMAL DEFAULTS (Realistic)
    if (i === 1 || i === 2) defaultCat = "elderly";
    else if (i === 3 || i === 4 || i === 5) defaultCat = "ladies";

    // 🔥 STRICT REPAIR: If not custom, force defaults. 
    // Seats 1-5 get defaults, ALL OTHERS MUST BE NORMAL.
    const finalCategory = (i <= 5) ? defaultCat : "normal";

    return { ...seat, category: finalCategory };
  });
};

export const generateSeats = (totalSeats, seatType = "Seater") => {

  let seats = [];

  // ==============================
  // 🪑 SEATER
  // ==============================
  if (seatType === "Seater") {
    for (let i = 1; i <= totalSeats; i++) {
      let category = "normal";
      if (i === 1 || i === 2) category = "elderly";
      else if (i === 3 || i === 4 || i === 5) category = "ladies";

      seats.push({
        seatNumber: `${i}`,
        type: "seater",
        deck: "lower",
        category,
        isBlocked: false,
      });
    }
  }

  // ==============================
  // 🛏️ SLEEPER
  // ==============================
  else if (seatType === "Sleeper") {

    const half = Math.ceil(totalSeats / 2);

    // LOWER
    for (let i = 1; i <= half; i++) {
      let category = "normal";
      if (i === 1 || i === 2) category = "elderly";
      else if (i === 3 || i === 4 || i === 5) category = "ladies";

      seats.push({
        seatNumber: `L${i}`,
        type: "sleeper",
        deck: "lower",
        category,
        isBlocked: false,
      });
    }

    // UPPER
    for (let i = 1; i <= totalSeats - half; i++) {
      seats.push({
        seatNumber: `U${i}`,
        type: "sleeper",
        deck: "upper",
        category: "normal",
        isBlocked: false,
      });
    }
  }

  return seats;
};