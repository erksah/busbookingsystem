import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY
  });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: "hi, who are you? respond in 5 words." }] }],
    });
    console.log("✅ SUCCESS (2.5-flash):", response.candidates?.[0]?.content?.parts?.[0]?.text || "No text");
  } catch (error) {
    console.log("❌ ERROR (2.5-flash):", error.message);
  }
}

test();
