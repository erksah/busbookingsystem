import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY
  });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: "hi" }] }],
    });
    console.log("✅ SUCCESS (2.0-flash):", response.text);
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
}

test();
