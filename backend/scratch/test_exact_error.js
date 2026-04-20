import { handleChat } from "../controllers/common/chatController.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const req = {
    body: {
      sessionId: "test-session-12345",
      userId: null,
      messages: [
        { role: "user", content: "I want to cancel my ticket." },
        { role: "assistant", content: "Please provide your ticket number and email." },
        { role: "user", content: "TKT-1776220712353-773 shahhraahul@gmail.com" },
        { role: "assistant", content: "OTP has been sent" },
        { role: "user", content: "652314" }
      ]
    }
  };

  const res = {
    json: (data) => console.log("RES JSON:", data),
    status: (code) => ({
      json: (data) => console.log(`RES STATUS ${code} JSON:`, data)
    })
  };

  try {
    // Override console.error temporarily to get the exact message
    const orig = console.error;
    console.error = (...args) => {
      console.log("INTERCEPTED ERROR:", ...args);
      orig(...args);
    };

    await handleChat(req, res);
  } catch (err) {
    console.log("UNCAUGHT ERROR:", err);
  } finally {
    mongoose.disconnect();
  }
}

runTest();
