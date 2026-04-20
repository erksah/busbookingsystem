const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function test() {
  try {
    const sessionId = "guest_12345test";
    
    // Send a message
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sessionId,
        messages: [{ role: "user", content: "Show buses to Vijayawada" }] 
      })
    });
    const data = await response.json();
    console.log("CHAT RESPONSE:");
    console.dir(data, { depth: null });
    
    // Fetch History
    const hRes = await fetch(`http://localhost:5000/api/chat/${sessionId}`);
    const hData = await hRes.json();
    console.log("HISTORY:");
    console.dir(hData, { depth: null });
    
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
test();
