// timeCalc.js

/**
 * Calculates duration given strict "HH:MM" format and journey days.
 * @param {string} depart - "HH:MM" (e.g. "06:00" or "22:30")
 * @param {string} arrive - "HH:MM"
 * @param {number} journeyDays - 0 for same day, 1 for next day, etc.
 * @returns {string} e.g. "8 hrs 30 mins"
 */
export const calculateDuration = (depart, arrive, journeyDays = 0) => {
  if (!depart || !arrive) return "N/A";

  try {
    const [dHours, dMins] = depart.split(":").map(Number);
    const [aHours, aMins] = arrive.split(":").map(Number);

    // Convert to strict minutes from start of day
    const departTotalMins = dHours * 60 + dMins;
    const arriveTotalMins = aHours * 60 + aMins;

    // Add 24 hours (1440 mins) for each additional journey day
    const explicitArriveMins = arriveTotalMins + (journeyDays * 1440);

    let diffMins = explicitArriveMins - departTotalMins;

    // Handle edge case where it crosses midnight but admin didn't mark journeyDays = 1.
    if (diffMins < 0) {
      diffMins += 1440; // Assume next day automatically if arrival is physically earlier than departure
    }

    const durationHours = Math.floor(diffMins / 60);
    const durationMins = diffMins % 60;

    return `${durationHours} hrs ${durationMins > 0 ? durationMins + ' mins' : ''}`.trim();

  } catch (error) {
    return "N/A";
  }
};

/**
 * Formats Arrival label based on Journey Days
 */
export const formatArrivalLabel = (arrive, journeyDays = 0) => {
  if (!arrive) return "-";
  
  if (journeyDays === 1) return `${arrive} (Next Day)`;
  if (journeyDays === 2) return `${arrive} (+2 Days)`;
  
  return arrive;
};

/**
 * 🚦 REAL-TIME BUS TICKET WINDOW EVALUATOR
 * Compares current clock against Scheduled metrics for a specific targeted date
 */
export const getBusStatus = (depart, arrive, journeyDays = 0, queryDateStr) => {
  if (!depart || !arrive || !queryDateStr) return "OPEN";

  const now = new Date();
  
  // Create localized YYYY-MM-DD
  const todayStr = now.toLocaleDateString('en-CA');
  
  // If the trip date is strictly in the future, bookings are fully OPEN
  if (queryDateStr > todayStr) return "OPEN";
  
  // If the trip date is strictly in the past, it's definitively CLOSED
  if (queryDateStr < todayStr) return "CLOSED";

  // IT IS TODAY. Evaluate the minute clock!
  const currentMins = now.getHours() * 60 + now.getMinutes();
  
  try {
    const [dHours, dMins] = depart.split(":").map(Number);
    const departMins = dHours * 60 + dMins;
    
    const [aHours, aMins] = arrive.split(":").map(Number);
    const arriveMins = aHours * 60 + aMins;

    // 1. Booking Window Open (More than 30 mins remaining)
    if (currentMins < departMins - 30) {
       return "OPEN";
    }
    
    // 2. Booking Cut-Off Locked! (Within 30 mins of Departure)
    if (currentMins >= departMins - 30 && currentMins < departMins) {
       return "CLOSING";
    }
    
    // 3. Post-Departure states
    if (currentMins >= departMins) {
       if (journeyDays === 0) {
          // It arrives today
          if (currentMins >= arriveMins) return "REACHED";
          return "ON_THE_WAY";
       } else {
          // It arrives tomorrow or later.
          // Since today is explicitly the Departure query date, it can only ever be "On the Way" for the rest of today!
          return "ON_THE_WAY";
       }
    }

  } catch(e) {
    return "OPEN"; // generic fallback
  }

  return "OPEN";
};
