import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const systemInstruction = `You are an intelligent AI chatbot assistant for a Bus Booking Web Application.
    Your role is to help users with: Searching buses, Booking tickets, Checking seat availability, Viewing bookings, Cancelling tickets, Travel info, and FAQs.
    
    IMPORTANT SYSTEM CONTEXT:
    - Today's Date is: ${todayStr} (YYYY-MM-DD format).
    - If the user uses relative dates like "tomorrow", "today", "16", "16/04", or "next friday", YOU MUST calculate and parse it perfectly into the YYYY-MM-DD format relative to today's date (${todayStr}) before triggering the 'searchBuses' tool.
    - NEVER output raw XML or '<function>' tags in your conversational text. If you invoke a tool, do it silently through the API structure.
    `;

    const formattedMessages = [
      { role: "system", content: systemInstruction },
      { role: "user", content: "book ticket from hyderabad" }
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: formattedMessages,
      tools: [
        {
          type: "function",
          function: {
            name: "searchBuses",
            description: "Search for available buses based on source, destination, and date.",
            parameters: {
              type: "object",
              properties: {
                from: { type: "string" },
                to: { type: "string" },
                date: { type: "string" },
              },
              required: ["from", "to", "date"],
            },
          }
        }
      ],
      tool_choice: "auto",
    });

    console.log("SUCCESS:", response.choices[0].message);
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

test();
