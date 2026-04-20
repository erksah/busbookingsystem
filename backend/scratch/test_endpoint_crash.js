import fetch from "node-fetch";

async function testChatEndpoint() {
  try {
    console.log("SENDING REQUEST...");
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "hi" }]
      })
    });
    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", data);
  } catch(e) {
    console.log("ERROR:", e);
  }
}

testChatEndpoint();
