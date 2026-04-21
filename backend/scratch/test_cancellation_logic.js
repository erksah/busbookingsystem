import { getCancellationStatus } from "../utils/cancellationLogic.js";

const tests = [
  {
    name: "Past ticket (yesterday)",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    time: "10:00 AM",
  },
  {
    name: "Future ticket (tomorrow)",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    time: "10:00 AM",
  },
  {
    name: "Same day, > 1hr before (e.g., 5 hours from now)",
    date: new Date().toISOString(),
    time: new Date(Date.now() + 5 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
  },
  {
    name: "Same day, < 1hr before (e.g., 30 mins from now)",
    date: new Date().toISOString(),
    time: new Date(Date.now() + 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
  },
  {
    name: "Already past today (e.g., 1 hour ago)",
    date: new Date().toISOString(),
    time: new Date(Date.now() - 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
  }
];

console.log("=== CANCELLATION LOGIC TEST ===\n");

tests.forEach(t => {
  const result = getCancellationStatus(t.date, t.time);
  console.log(`Test: ${t.name}`);
  console.log(`Date: ${new Date(t.date).toDateString()}, Time: ${t.time}`);
  console.log(`Can Cancel: ${result.canCancel}`);
  console.log(`Is Refundable: ${result.isRefundable}`);
  console.log(`Status: ${result.status}`);
  console.log(`Message: ${result.message}`);
  console.log("----------------------------\n");
});
