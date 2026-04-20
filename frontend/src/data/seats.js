const seats = [];

// 🔥 40 seats generate
for (let i = 1; i <= 40; i++) {
  seats.push({
    id: i,
    label: `S${i}`,
    status: "available",
    price: 500,

    // random features
    features: [
      i % 2 === 0 ? "window" : "aisle",
      i % 5 === 0 ? "extra-legroom" : null,
    ].filter(Boolean),
  });
}

export default seats;