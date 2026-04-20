import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    const formattedMessages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "hi" }
    ];
    console.log("Sending Groq request...");
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: formattedMessages,
    });
    console.log("SUCCESS:", response.choices[0].message.content);
  } catch (error) {
    console.error("GROQ ERROR:", error.message);
  }
}

test();
