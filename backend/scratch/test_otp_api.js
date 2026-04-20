import axios from "axios";

async function testChat() {
  try {
    const res = await axios.post("http://localhost:5000/api/chat", {
      sessionId: "test-session-123",
      messages: [
        { role: "user", content: "I want to cancel my ticket." },
        { role: "assistant", content: "Please provide your ticket number and email." },
        { role: "user", content: "TKT-1776218819759-52 shahhraahul@gmail.com" }
      ]
    });
    console.log("RESPONSE:", res.data);
  } catch (err) {
    if (err.response) {
      console.log("ERROR DATA:", err.response.data);
    } else {
      console.log("ERROR MESSAGE:", err.message);
    }
  }
}

testChat();
