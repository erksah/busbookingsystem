import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY
  });
  try {
    const models = await ai.models.list();
    console.log("✅ RAW LIST RESPONSE:");
    console.log(models);
  } catch (error) {
    console.log("❌ ERROR LISTING MODELS:", error.message);
  }
}

test();
