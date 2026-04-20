import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "d:\\major-project\\backend\\.env" });

const ALL_MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "llama3-70b-8192",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
  "llama-3.2-11b-text-preview",
  "llama-3.2-3b-preview"
];

async function checkModels() {
  console.log("Checking Groq model token limits...");
  for (const model of ALL_MODELS) {
    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: model,
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 10
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      console.log(`✅ ${model} - Success`);
    } catch (err) {
      if (err.response && err.response.data) {
        console.log(`❌ ${model} - Error: ${err.response.data.error.message}`);
      } else {
        console.log(`❌ ${model} - Fatal Error: ${err.message}`);
      }
    }
  }
}

checkModels();
