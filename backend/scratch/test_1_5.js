import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY
  });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: "hi" }] }],
    });
    console.log("✅ SUCCESS (1.5-flash):", response.text);
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
}

test();
