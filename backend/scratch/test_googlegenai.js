import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: "hi" }] }],
    });
    console.log("✅ SUCCESS:", response.candidates?.[0]?.content?.parts?.[0]?.text || "No text");
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
}

test();
