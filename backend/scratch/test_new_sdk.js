import { createClient } from "@google/genai/node";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  const client = createClient({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: "hi" }] }],
    });
    console.log("✅ SUCCESS:", response.text());
  } catch (error) {
    console.error("❌ ERROR:", error.message);
  }
}

test();
