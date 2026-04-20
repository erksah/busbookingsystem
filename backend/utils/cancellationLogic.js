export const getCancellationStatus = (journeyDateStr, departureTimeStr) => {
  const now = new Date();
  const departureDate = new Date(journeyDateStr);

  // Parse time (e.g., "10:00 AM" or "02:30 PM")
  if (departureTimeStr) {
    const timeMatch = departureTimeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const mins = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3];
      
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      
      departureDate.setHours(hours, mins, 0, 0);
    }
  } else {
    // If no departure time specified, assume midnight or end of day as safety fallback
    departureDate.setHours(23, 59, 59, 999);
  }

  const msDifference = departureDate.getTime() - now.getTime();
  const hoursDifference = msDifference / (1000 * 60 * 60);

  // 1. Is it historically past departure? (Already traveled / Expired)
  // "past ticket and already travelled ticket should be expired not should able to cancel"
  if (hoursDifference <= 0) {
    return { 
      canCancel: false, 
      isRefundable: false, 
      status: "expired", 
      message: "Ticket has already expired/travelled and cannot be cancelled." 
    };
  }

  // 2. Is it less than 1 hour to departure?
  // "same day ticket before 1 hr able to cancel" -> implicitly inside 1 hour means locked.
  if (hoursDifference < 1) {
    return { 
      canCancel: false, 
      isRefundable: false, 
      status: "locked", 
      message: "Cancellation is locked within 1 hour of departure." 
    };
  }

  // 3. Same Day but > 1hr to departure?
  // "same day ticket before 1 hr able to cancel.. but not refund"
  const isSameDay = now.toDateString() === departureDate.toDateString();
  
  if (isSameDay) {
    return { 
      canCancel: true, 
      isRefundable: false, 
      status: "active", 
      message: "Ticket cancelled successfully. No refund issued for same-day cancellations." 
    };
  }

  // 4. Future ticket, different day, > 1 hour
  return { 
    canCancel: true, 
    isRefundable: true, 
    status: "active", 
    message: "Ticket cancelled successfully and full refund initiated." 
  };
};
