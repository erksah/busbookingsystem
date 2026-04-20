import dotenv from "dotenv";
dotenv.config({ path: "d:\\major-project\\backend\\.env" });

import Groq from "groq-sdk";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || "" 
});

async function run() {
  const tools = [
    {
      type: "function",
      function: {
        name: "verifyAndCancelTicket",
        description: "Verifies the OTP and permanently cancels the ticket.",
        parameters: {
          type: "object",
          properties: {
            ticketNumber: { type: "string", description: "Ticket ID to cancel" },
            otp: { type: "string", description: "The 6-digit OTP provided by the user" }
          },
          required: ["ticketNumber", "otp"]
        }
      }
    }
  ];

  let messages = [
    { role: "system", content: "You are a helpful assistant. Use proper JSON tools." },
    { role: "user", content: "I want to cancel my ticket. TKT-1776220712353-773 shahhraahul@gmail.com" },
    { role: "assistant", content: "The OTP has been sent to your registered email shahhraahul@gmail.com. Please provide the OTP so we can proceed with the cancellation! 💻" },
    { role: "user", content: "652314" }
  ];

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messages,
      tools: tools,
      tool_choice: "auto",
    });

    const responseMessage = response.choices[0].message;
    console.log("TOOL CALLSRAW:", responseMessage.tool_calls);
    
    if (responseMessage.tool_calls) {
        console.log("ARGS STRING:", responseMessage.tool_calls[0].function.arguments);
        const parsed = JSON.parse(responseMessage.tool_calls[0].function.arguments);
        console.log("PARSED SUCCESSFULLY:", parsed);
    } else {
        console.log("NO TOOL CALL! Model responded:", responseMessage.content);
    }
  } catch (err) {
    console.error("ERROR CAUGHT:", err.message);
  }
}

run();
