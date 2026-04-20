import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY
  });
  try {
    const models = await ai.models.list();
    let found = false;
    for await (const model of models) {
      if (model.name.includes("gemini-1.5-flash")) {
        console.log("✅ FOUND:", model.name);
        found = true;
      }
    }
    if (!found) {
      console.log("❌ NOT FOUND in the list.");
      console.log("Try listing first 5 for sample:");
      const firstModels = await ai.models.list();
      let count = 0;
      for await (const model of firstModels) {
        if (count < 5) console.log(model.name);
        count++;
      }
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
}

test();
