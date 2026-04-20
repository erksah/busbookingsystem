const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function test() {
  try {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] })
    });
    const data = await response.json();
    console.log("RESPONSE:", data);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
test();
