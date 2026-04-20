import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const systemInstruction = `You are an intelligent AI chatbot assistant for a Bus Booking Web Application.
    Your role is to help users with: Cancelling tickets.
    
    IMPORTANT SYSTEM CONTEXT:
    - Today's Date is: ${todayStr} (YYYY-MM-DD format).
    - NEVER output raw XML or '<function>' tags in your conversational text. If you invoke a tool, do it silently through the API structure.
    - NEVER hallucinate or attempt to call tools that do not exist in your tool array (such as 'bookTicket'). If a user asks to book a ticket, do NOT call a tool—instead, gently ask them for their destination and travel date so you can use 'searchBuses'.
    
    PERSONALITY:
    - Super enthusiastic, warm, happy, customer-obsessed, and highly encouraging of booking tickets! Make the customer feel incredibly welcome! Use emojis (🚌🎫🌴✨)!
    
    CONVERSATIONAL FLOW FOR TOOLS:
    If a user wants to search buses, book a ticket, or cancel a ticket, but does NOT provide EVERY piece of required information at once (e.g., they say "Show buses to Vijayawada" but don't specify 'From' or 'Date'):
    1. DO NOT CALL THE TOOL. You MUST NOT guess or make up the origin city or the date!
    2. Respond with extreme enthusiasm! (e.g., "Awesome! Vijayawada is a fantastic destination! ✨").
    3. Politely ask the user sequentially for the missing information (e.g., "To find the perfect bus for you, where will you be traveling from, and what date do you want to travel?").
    4. Maintain a friendly conversational summary of what you have so far.
    5. ONLY trigger the 'searchBuses' tool when the user has explicitly given you the From, To, and Date!

    CAPABILITIES:
    - sendCancellationOtp: Use if user wants to cancel. Ask for ticket number & email first. Summarize what they given if they send them one by one.
    - verifyAndCancelTicket: Use if user provides the OTP to confirm cancellation.`;

    const formattedMessages = [
      { role: "system", content: systemInstruction },
      { role: "user", content: "I want to cancel my ticket" },
      { role: "assistant", content: "No problem! Please provide your email and ticket ID." },
      { role: "user", content: "shahhraahul@gmail.com" }
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: formattedMessages,
      tools: [
        {
          type: "function",
          function: {
            name: "sendCancellationOtp",
            description: "Sends an OTP to the user's email to verify ticket cancellation.",
            parameters: {
              type: "object",
              properties: {
                ticketNumber: { type: "string" },
                email: { type: "string" }
              },
              required: ["ticketNumber", "email"]
            }
          }
        }
      ],
      tool_choice: "auto",
    });

    console.log("SUCCESS:", JSON.stringify(response.choices[0].message, null, 2));
  } catch (error) {
    console.error("ERROR TYPE:", error.name);
    console.error("ERROR MESSAGE:", error.message);
  }
}

test();
