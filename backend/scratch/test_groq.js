import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Explain the importance of fast language models",
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    console.log("SUCCESS:", chatCompletion.choices[0]?.message?.content || "");
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

test();
