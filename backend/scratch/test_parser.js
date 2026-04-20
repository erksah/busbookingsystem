const botText = `Execute Cancel:\n\n\`\`\`sql\nverifyAndCancelTicket{"ticketNumber":"TKT-1776230824393-138", "otp":"963681"}\n\`\`\``;
const toolMatch = botText.match(/(searchBuses|checkTicket|bookTicket|sendCancellationOtp|verifyAndCancelTicket)[^\{]*(\{[^}]*\}?)/s);

let cleanText = botText.replace(/Execute (Search|Status|OTP|Cancel):\s*/gi, "");
cleanText = cleanText.replace(toolMatch[0], "");
cleanText = cleanText.replace(/```[a-z]*\s*```/gi, "").trim();

console.log("CLEAN:", cleanText);
