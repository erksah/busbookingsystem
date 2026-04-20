import Groq from "groq-sdk";
import Bus from "../../models/Bus.js";
import Booking from "../../models/Booking.js";
import BusAvailability from "../../models/BusAvailability.js";
import ChatSession from "../../models/ChatSession.js";
import { applyDefaultCategories } from "../bus/seatGenerator.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { setOTP, verifyOTP, deleteOTP } from "../../utils/otpStore.js";
import { cancelTemplate } from "../../utils/cancelTemplate.js";
import { getCancellationStatus } from "../../utils/cancellationLogic.js";
import { sendNotification } from "../../utils/notificationService.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * 🤖 GROQ SETUP (Llama 3 Engine)
 */
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || "" 
});

/**
 * 🛠️ SEARCH BUSES TOOL
 */
const performBusSearch = async (from, to, date) => {
  try {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const buses = await Bus.find({
      from: { $regex: `^${from}$`, $options: "i" },
      to: { $regex: `^${to}$`, $options: "i" },
    });

    const results = [];
    for (let bus of buses) {
      const availability = await BusAvailability.findOne({
        busId: bus._id,
        date: { $gte: start, $lte: end },
      });
      if (availability && !availability.isActive) continue;

      const bookings = await Booking.find({
        busId: bus._id,
        journeyDate: { $gte: start, $lte: end },
        bookingStatus: { $in: ["reserved", "confirmed"] },
      });

      const bookedSeats = bookings.flatMap((b) =>
        (b.passengers || []).filter(p => p.status !== "cancelled").map(p => p.seat)
      );

      let layout = bus.seatLayout;
      if (!bus.isCustomLayout) layout = applyDefaultCategories(layout);

      results.push({
        id: bus._id,
        name: bus.name,
        type: bus.busType,
        departure: bus.departureTime,
        arrival: bus.arrivalTime,
        price: availability?.priceOverride || bus.price,
        availableSeats: layout.length - bookedSeats.length,
        totalSeats: layout.length,
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80" // Placeholder
      });
    }
    return results.length > 0 ? results : { message: "No buses found for this route/date 🚌" };
  } catch (error) {
    return { error: "Failed to search buses ❌" };
  }
};

/**
 * 🛠️ CHECK TICKET TOOL
 */
const performTicketCheck = async (ticketId) => {
  try {
    const booking = await Booking.findOne({ ticketNumber: ticketId }).populate("busId");
    if (!booking) return { message: "Booking not found ❌" };

    return {
      ticketNumber: booking.ticketNumber,
      bus: booking.busId.name,
      from: booking.from,
      to: booking.to,
      date: booking.journeyDate.toDateString(),
      departureTime: booking.departureTime || booking.busId.departureTime || "TBD",
      status: booking.bookingStatus || "confirmed",
      seats: booking.seats.join(", "),
      total: booking.total
    };
  } catch (error) {
    return { error: "Failed to fetch booking ❌" };
  }
};

/**
 * 🛠️ SEND CANCELLATION OTP TOOL
 */
const performSendCancellationOtp = async (ticketNumber, email) => {
  try {
    const booking = await Booking.findOne({ ticketNumber, email }).populate("busId");
    if (!booking) return { message: "❌ Booking not found with this Ticket Number and Email combination." };
    if (booking.bookingStatus === "cancelled") return { message: "❌ This booking is already cancelled." };

    const { canCancel, message: cancelMessage } = getCancellationStatus(
      booking.journeyDate,
      booking.departureTime
    );

    if (!canCancel) {
      return { message: `❌ ${cancelMessage}` };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setOTP(ticketNumber, otp);

    await sendEmail({
      to: email,
      subject: `OTP for Ticket Cancellation - ${ticketNumber}`,
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2 style="color:red;">Ticket Cancellation Request</h2>
          <p>You requested to cancel ticket <b>${ticketNumber}</b>.</p>
          <p>Your OTP is: <h3 style="background:#eee; padding:10px; display:inline-block;">${otp}</h3></p>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `
    });

    return { message: "✅ OTP sent successfully to the registered email. Please ask the user to provide the OTP." };
  } catch (error) {
    return { error: "Failed to send OTP ❌" };
  }
};

/**
 * 🛠️ VERIFY AND CANCEL TICKET TOOL
 */
const performVerifyAndCancel = async (ticketNumber, otp) => {
  try {
    const isValid = verifyOTP(ticketNumber, otp);
    if (!isValid) return { message: "❌ Invalid or expired OTP." };

    const booking = await Booking.findOne({ ticketNumber }).populate("busId");
    if (!booking) return { message: "❌ Booking not found." };

    const { canCancel, isRefundable, message: cancelMessage } = getCancellationStatus(
      booking.journeyDate,
      booking.departureTime
    );

    if (!canCancel) return { message: `❌ ${cancelMessage}` };

    // Update Status
    booking.bookingStatus = "cancelled";
    
    if (booking.paymentStatus === "paid" && isRefundable) {
      booking.paymentStatus = "refunded";
    }
    
    // Mark passengers as cancelled
    booking.passengers = booking.passengers.map(p => ({
      ...(p._doc || p),
      status: "cancelled"
    }));

    await booking.save();
    deleteOTP(ticketNumber);

    // Send Cancellation Confirmation Email
    if (booking.email) {
      await sendEmail({
        to: booking.email,
        subject: `🚨 Booking Cancelled - ${booking.ticketNumber}`,
        html: cancelTemplate(booking)
      });
    }

    // Send SMS Notification
    const phone = booking.phone ? `+91${booking.phone.replace(/\D/g, "").slice(-10)}` : "";
    if (phone) {
      await sendNotification(
        phone,
        `❌ Booking Cancelled\n👤 Name: ${booking.name}\n🚌 Route: ${booking.from} → ${booking.to}\n📅 Date: ${new Date(booking.journeyDate).toLocaleDateString()}\n🎫 Ticket: ${booking.ticketNumber}\nSorry for inconvenience 🙏`
      );
    }

    return { 
      message: `✅ ${cancelMessage}`,
      ticketStatus: "Cancelled",
      ticketNumber: booking.ticketNumber
    };
  } catch (error) {
    return { error: "Failed to process cancellation ❌" };
  }
};

/**
 * GET CHAT HISTORY
 */
export const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    let chatSession = await ChatSession.findOne({ sessionId });
    
    if (!chatSession) {
      return res.json({ history: [] });
    }

    // Return format expected by frontend
    const history = chatSession.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat history." });
  }
};

/**
 * CLEAR CHAT HISTORY
 */
export const clearChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await ChatSession.findOneAndDelete({ sessionId });
    res.json({ success: true, message: "Chat cleared successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear chat history." });
  }
};

/**
 * Main Chat Handler
 */
export const handleChat = async (req, res) => {
  const { messages, sessionId, userId } = req.body;

  // Extract the latest message text
  const message = messages[messages.length - 1]?.content || "";
  const history = messages.slice(0, -1);

  // Load/Create Session
  let chatSession;
  if (sessionId) {
    chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      chatSession = new ChatSession({ sessionId, userId: userId || null, messages: [] });
    }
    // Append the user's latest message to DB
    chatSession.messages.push({ role: "user", content: message });
    await chatSession.save();
  }

  // FALLBACK: Smart Mock Mode if key is missing or invalid
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes("your_generated_key")) {
    return runMockMode(message, res, chatSession);
  }

  try {
    // 1. Prepare Tools for Groq / OpenAI Format
    const tools = [
      {
        type: "function",
        function: {
          name: "searchBuses",
          description: "Search for available buses based on source, destination, and date.",
          parameters: {
            type: "object",
            properties: {
              from: { type: "string", description: "Source city" },
              to: { type: "string", description: "Destination city" },
              date: { type: "string", description: "Travel date (YYYY-MM-DD)" },
            },
            required: ["from", "to", "date"],
          },
        }
      },
      {
        type: "function",
        function: {
          name: "checkTicket",
          description: "Retrieve booking details using a Ticket ID.",
          parameters: {
            type: "object",
            properties: {
              ticketId: { type: "string", description: "The unique Ticket ID / ID of the booking" },
            },
            required: ["ticketId"],
          },
        }
      },
      {
        type: "function",
        function: {
          name: "bookTicket",
          description: "Used ONLY when user loosely asks to book a ticket without searching buses first.",
          parameters: {
            type: "object",
            properties: {},
          },
        }
      },
      {
        type: "function",
        function: {
          name: "sendCancellationOtp",
          description: "Sends an OTP to the user's email to verify ticket cancellation.",
          parameters: {
            type: "object",
            properties: {
              ticketNumber: { type: "string", description: "Ticket ID to cancel" },
              email: { type: "string", description: "Email registered with the booking" }
            },
            required: ["ticketNumber", "email"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "verifyAndCancelTicket",
          description: "Verifies the OTP and permanently cancels the ticket.",
          parameters: {
            type: "object",
            properties: {
              ticketNumber: { type: "string", description: "Ticket ID to cancel" },
              otp: { type: "string", description: "The 6-digit OTP provided by the user" }
            },
            required: ["ticketNumber", "otp"]
          }
        }
      }
    ];

    const todayStr = new Date().toLocaleDateString('en-CA');
    const systemInstruction = `You are a super friendly, warm, and highly capable Bus Booking Assistant! 🚌✨
    Today's Date is: ${todayStr} (YYYY-MM-DD). If a user gives a relative date like "17" or "tomorrow", silently parse it to YYYY-MM-DD. DO NOT explain your date math to the user, just seamlessly use it!
    
    You have direct access to database functions. To execute a function, YOU MUST type exactly the command block below into the chat. DO NOT ask the user to type these commands. YOU are the one controlling them!
    
    COMMANDS TO EXECUTE:
    - Execute Search: searchBuses{"from":"A", "to":"B", "date":"YYYY-MM-DD"}
    - Execute Status: checkTicket{"ticketId":"TKT-123"}
    - Execute OTP: sendCancellationOtp{"ticketNumber":"TKT-123", "email":"user@a.com"}
    - Execute Cancel: verifyAndCancelTicket{"ticketNumber":"TKT-123", "otp":"123456"}
    
    CRITICAL CONVERSATIONAL RULES (MUST READ):
    1. STRICT BOUNDARIES: You are exclusively a Bus Ticket Booking AI for this specific website. You have limited general knowledge. If the user asks for generic advice (e.g., "what is a good place to visit", "how is Bangalore", or random chat), POLITELY tell them you have limited information, remind them you are a booking AI, and steer the conversation back to booking a bus ticket!
    2. NEVER execute a command if parameters are missing!
    3. If a user simply says "book a ticket" or "I want to travel", DO NOT refuse them! Instead, cheerfully say: "I would love to help you book a ticket! 🚌 Where are you traveling from, and what is your destination?"
    4. NEVER guess parameters for search. DO NOT assume the user wants to travel "today" unless they actually type the word "today". You MUST verbally ask: "What date will you be traveling?" if they haven't explicitly mentioned a day or date!
    5. SILENT SPELLING AUTOCORRECT: If the user misspells a common city name, SILENTLY fix it inside the JSON command. (Examples: always use "Hyderabad", use "Bangalore" never "Bengaluru", use "Vijayawada"). DO NOT tell the user you are correcting their spelling. MENTION NOTHING about spelling or the database! Just naturally act like they spelled it correctly.
    6. If a user asks to cancel, DO NOT execute sendCancellationOtp until you have BOTH the Ticket ID and Email.
    7. Once you have all required parameters, do not speak, do not summarize, do not confirm. JUST type the exact command.
    
    FEW-SHOT EXAMPLES:
    User: which place is good for visit
    Assistant: I have limited information on general travel recommendations, as I am exclusively your Bus Booking AI! 🚌 However, if you have a destination in mind, I would love to help you book the perfect bus!
    User: how is bangalore
    Assistant: Bangalore is great, but as a Bus Booking AI, my main job is getting you there! 😉 Do you want me to search for buses to Bangalore? If so, where are you traveling from and on what date?
    User: Book a ticket
    Assistant: I would love to help you book a ticket! 🚌 Where are you traveling from, and what is your destination?
    User: Search buses from Delhi to Jaipur
    Assistant: I can definitely help with that! What date will you be traveling?
    User: 17
    Assistant: searchBuses{"from":"Delhi", "to":"Jaipur", "date":"2026-04-17"}
    User: Cancel my ticket
    Assistant: I can definitely help with that! What is your Ticket Number and Email ID?
    User: TKT-123 and email@a.com
    Assistant: sendCancellationOtp{"ticketNumber":"TKT-123", "email":"email@a.com"}`;

    // 2. Format History for Groq (System -> User -> Assistant -> User)
    const formattedMessages = [
      { role: "system", content: systemInstruction },
      ...(history || [])
        .filter(msg => msg.role !== 'system' && !msg.content.includes("Smart Offline Mode"))
        .map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
      { role: "user", content: message }
    ];

    // 3. Make Prediction (Bypassing native tool execution layer to prevent 400 crashes)
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: formattedMessages
    });

    const responseMessage = response.choices[0].message;
    let botText = responseMessage.content || "";
    let injectedUIPayload = null;

    // 🔥 INTERCEPT TEXT-BASED TOOL CALLS (Now immune to missing closing brackets!)
    const toolMatch = botText.match(/(searchBuses|checkTicket|bookTicket|sendCancellationOtp|verifyAndCancelTicket)[^\{]*(\{[^}]*\}?)/s);
    if (toolMatch) {
      const name = toolMatch[1];
      let rawArgs = toolMatch[2];
      
      // Auto-fix if Llama 3 hallucinates and forgets the closing bracket
      if (!rawArgs.endsWith("}")) rawArgs += "}";

      try {
        const args = new Function("return " + rawArgs)();
        let toolData;
        
        if (name === "searchBuses") {
          toolData = await performBusSearch(args.from, args.to, args.date);
          if (Array.isArray(toolData)) injectedUIPayload = { type: "BUS_LIST", searchDate: args.date, data: toolData };
        } else if (name === "checkTicket") {
          toolData = await performTicketCheck(args.ticketId);
          if (toolData && !toolData.error && toolData.ticketNumber) {
              injectedUIPayload = { type: "TICKET_DETAILS", data: toolData };
              toolData.message = "Here are your booking details! 🎫";
          }
        } else if (name === "bookTicket") {
          toolData = { message: "Please provide your destination (e.g. 'To Goa') and Travel Date so I can search for buses first."};
        } else if (name === "sendCancellationOtp") {
          toolData = await performSendCancellationOtp(args.ticketNumber, args.email);
          // Override backend message to be conversational for the user
          if (toolData && toolData.message && toolData.message.includes("Please ask the user")) {
             toolData.message = "✅ I've sent a 6-digit OTP to your registered email! Please type the OTP here to finalize your cancellation. ✉️";
          }
        } else if (name === "verifyAndCancelTicket") {
          toolData = await performVerifyAndCancel(args.ticketNumber, args.otp);
          if (toolData && !toolData.error && toolData.ticketStatus === "Cancelled") {
              injectedUIPayload = { type: "CANCEL_RECEIPT", data: toolData };
              toolData.message = "✅ Ticket successfully cancelled! Your refund has been initiated.";
          }
        }
        
        // Remove the "Execute Search:" prefix if it hallucinates it
        botText = botText.replace(/Execute (Search|Status|OTP|Cancel):\s*/gi, "");
        
        // Remove the raw tool string itself
        botText = botText.replace(toolMatch[0], "").trim();
        
        // Remove any duplicated message texts
        botText = botText.replace(toolData?.message || toolData?.error || "", "").trim();
        
        // Scrub any leftover empty markdown blocks (e.g. ```sql or ```json)
        botText = botText.replace(/```[a-z]*\s*```/gi, "").trim();
        
        if (botText === "") {
            botText = toolData?.message || toolData?.error || "Done! ✨";
        } else {
            const prefix = botText.endsWith("\n") ? "" : "\n\n";
            botText = botText + prefix + (toolData?.message || toolData?.error || "");
            botText = botText.trim();
        }

      } catch (e) {
        console.error("🔥 Intercept parse error:", e.message);
      }
    }

    // 🧹 Clean up any accidental Llama 3 tool-call syntax leaks
    if (botText) {
      botText = botText.replace(/```?function[\s\S]*?(```|>)/g, "").replace(/<function=.*?>[\s\S]*?<\/function>/g, "").trim();
    }
    
    // 🧱 Append strictly validated backend payload
    if (injectedUIPayload) {
      botText += `\n\n\`\`\`json\n${JSON.stringify(injectedUIPayload, null, 2)}\n\`\`\``;
    }

    // Save Bot Response to DB if session exists
    if (chatSession) {
      chatSession.messages.push({ role: "assistant", content: botText });
      await chatSession.save();
    }

    return res.json({
      role: "assistant",
      content: botText
    });

  } catch (error) {
    console.error("🔥 CHAT ERROR:", error.message);
    const errStr = error.message.toLowerCase();
    
    // Auto-fallback if AI fails
    if (errStr.includes("not_found") || errStr.includes("api key") || errStr.includes("high demand") || errStr.includes("unavailable") || errStr.includes("quota") || errStr.includes("request failed") || errStr.includes("rate limit") || errStr.includes("tokens") || errStr.includes("429") || errStr.includes("400") || errStr.includes("tool call validation failed")) {
      return runMockMode(message, res, chatSession, "⚠️ The AI service has reached its API token limits today or has suffered a tool parsing error. Don't worry! I've switched to Smart Offline Mode for you.");
    }
    
    res.status(500).json({ role: "assistant", content: `AI Assistant is resting. 😴 (Error: I'm currently unable to connect due to high api demand. Please try again later)` });
  }
};

/**
 * Fallback Smart Mock Mode
 */
const runMockMode = async (message, res, chatSession, prefix = "") => {
  const userMessage = message.toLowerCase();
  let content = prefix ? prefix + "\n\n" : "";

  if (userMessage.includes("bus") || userMessage.includes("from") || userMessage.includes("to") || userMessage.includes("route")) {
    // Attempt local search
    const results = await performBusSearch("Delhi", "Jaipur", "2026-04-15");
    if (Array.isArray(results)) {
      content += `Here are some popular upcoming routes I found locally since my AI brain is sleeping!\n\`\`\`json\n{ "type": "BUS_LIST", "data": ${JSON.stringify(results)} }\n\`\`\``;
    } else {
      content += "🚌 I can find buses! Just say 'Delhi to Jaipur on 2026-04-15'. (Full AI Mode requires a valid Groq Key).";
    }
  } else if (userMessage.includes("cancel") && userMessage.includes("ord-")) {
    content += "✅ I see you want to cancel. In full AI mode, I would send an email OTP right now!";
  } else if (userMessage.includes("ticket") || userMessage.includes("booking")) {
    content += "🎫 Tell me your Ticket ID to check status. (Full AI Mode requires a valid Groq Key).";
  } else {
    content += "👋 Hi! I'm your Bus Booking Assistant. Due to high demand on the AI API, I'm running in local Smart Mode. You can still ask me to show buses! 🚌";
  }

  // Save Mock Bot Response to DB if session exists
  if (chatSession) {
    chatSession.messages.push({ role: "assistant", content: content });
    await chatSession.save();
  }

  res.json({
    role: "assistant",
    content: content
  });
};
