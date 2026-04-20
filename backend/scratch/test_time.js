function parseDepartureDateTime(journeyDate, departureTimeStr) {
  // journeyDate is a Date object, e.g.. 2026-04-14T00:00:00.000Z
  const dateObj = new Date(journeyDate);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDate();

  let hours = 0;
  let mins = 0;
  
  if (departureTimeStr) {
    const timeMatch = departureTimeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      mins = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3];
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
    }
  }

  return new Date(year, month, day, hours, mins, 0);
}

const journey = new Date();
journey.setHours(0,0,0,0);
console.log(journey);
console.log(parseDepartureDateTime(journey, "10:00 AM"));
console.log(parseDepartureDateTime(journey, "02:30 PM"));
