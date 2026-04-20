import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    const formattedMessages = [
      { role: "system", content: "You are an AI." },
      { role: "user", content: "Cancel my ticket with email shahhraahul@gmail.com" }
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
