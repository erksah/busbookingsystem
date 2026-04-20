import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || "" 
});

async function run() {
  const tools = [
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
  ];

  let messages = [
    { role: "user", content: "Cancel my ticket ORD-123. Email is foo@bar.com" }
  ];

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      tools: tools,
      tool_choice: "auto",
    });

    const responseMessage = response.choices[0].message;
    console.log("TOOL CALL:", JSON.stringify(responseMessage.tool_calls, null, 2));

    messages.push(responseMessage);
    messages.push({
      tool_call_id: responseMessage.tool_calls[0].id,
      role: "tool",
      name: "sendCancellationOtp",
      content: JSON.stringify({ message: "OTP sent" })
    });

    console.log("Sending final request WITH MISSING tools...");
    const finalResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      // Intentionally omitting tools to see if it breaks
    });

    console.log("SUCCESS:", finalResponse.choices[0].message.content);

  } catch (err) {
    console.error("ERROR CAUGHT:", err.message);
  }
}

run();
