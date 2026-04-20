import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Loader2, ArrowRight, Trash2 } from "lucide-react";
import { apiRequest } from "../../services/api";
import { useNavigate } from "react-router-dom";

const getUserId = () => {
  try {
    const passenger = JSON.parse(localStorage.getItem("passenger"));
    return passenger?._id || null;
  } catch {
    return null;
  }
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your Bus Booking Assistant. How can I help you today? 🚌🎟️",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Dynamic Session ID Determination: User ID takes priority, then fallback to Guest Session
  const determineSession = () => {
    const uId = getUserId();
    if (uId) return uId;

    let sId = localStorage.getItem("chatSessionId");
    if (!sId) {
      sId = "guest_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("chatSessionId", sId);
    }
    return sId;
  };

  // Polling to intercept Logins and Logouts dynamically without a full page refresh
  useEffect(() => {
    setActiveSessionId(determineSession());
    const interval = setInterval(() => {
      const currentSession = determineSession();
      if (currentSession !== activeSessionId) {
        setActiveSessionId(currentSession);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSessionId]);

  // Load chat history securely tied to the newly active user/session
  useEffect(() => {
    if (!activeSessionId) return;

    const fetchHistory = async () => {
      try {
        const response = await apiRequest(`/chat/${activeSessionId}`, "GET");
        if (response.history && response.history.length > 0) {
          setMessages(response.history);
        } else {
          setMessages([
            {
              role: "assistant",
              content: "Hi! I'm your Bus Booking Assistant. How can I help you today? 🚌🎟️",
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load history", error);
      }
    };
    fetchHistory();
  }, [activeSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClearChat = async () => {
    if (!activeSessionId) return;
    setLoading(true);
    try {
      await apiRequest(`/chat/${activeSessionId}`, "DELETE");
      setMessages([
        {
          role: "assistant",
          content: "Chat cleared! Let's start fresh. How can I help you today? 🚌✨",
        },
      ]);
    } catch (e) {
      console.error("Failed to clear chat", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e, textOverride = null) => {
    e?.preventDefault();
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || loading) return;

    const userMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const response = await apiRequest("/chat", "POST", {
        sessionId: activeSessionId,
        userId: getUserId(),
        messages: [...messages, userMessage],
      });

      setMessages((prev) => [...prev, response]);

      // Notify other components (like MyBookings panel) to refresh if cancellation successful
      if (response.content && response.content.includes("CANCEL_RECEIPT")) {
        window.dispatchEvent(new Event("refreshBookings"));
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. ❌",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Book a ticket",
    "Show buses from hyderabad to Vijayawada",
    "Check my booking status",
    "Cancel my ticket",
  ];

  // Helper to safely parse any JSON blocks containing our Rich UI payloads
  const parseRichContent = (content) => {
    const regex = /```json\n([\s\S]*?)\n```/;
    const match = content.match(regex);
    if (!match) return { text: content, uiData: null };

    try {
      const jsonStr = match[1];
      const uiData = JSON.parse(jsonStr);
      const text = content.replace(regex, "").trim();
      return { text, uiData };
    } catch (e) {
      return { text: content, uiData: null };
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-50 flex flex-col items-end w-full max-w-[calc(100vw-3rem)]">
      {/* 🟢 CHAT WINDOW */}
      {isOpen && (
        <div className="w-[400px] md:w-[440px] max-w-full h-[620px] max-h-[85vh] bg-white/80 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 ring-1 ring-black/5">
          {/* HEADER */}
          <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 p-5 flex justify-between items-center text-white shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-inner rotate-3 hover:rotate-0 transition-transform duration-300">
                <Bot size={28} className="text-white drop-shadow-md" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl tracking-tight leading-none">BusBot AI</h3>
                <span className="text-[10px] uppercase tracking-widest text-blue-100 flex items-center gap-1.5 mt-1.5 font-bold">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,1)]"></span>
                  Active Now
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <button
                onClick={handleClearChat}
                disabled={loading}
                title="Clear Chat History"
                className="hover:bg-red-500/90 p-2 rounded-xl transition-all active:scale-90 disabled:opacity-50 group"
              >
                <Trash2 size={20} className="group-hover:rotate-12 transition-transform" />
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-all active:scale-90 shadow-sm border border-transparent hover:border-white/20">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((m, i) => {
              const { text, uiData } = parseRichContent(m.content);

              return (
                <div key={i} className={`flex flex-col gap-2 ${m.role === "assistant" ? "items-start" : "items-end"} animate-in fade-in zoom-in-95 duration-200`}>

                  {/* TEXT BUBBLE */}
                  {text && (
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${m.role === "assistant"
                          ? "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                          : "bg-blue-600 text-white rounded-tr-none px-4"
                        }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
                    </div>
                  )}

                  {/* RICH UI COMPONENTS (Only from Assistant) */}
                  {uiData && (
                    <div className="w-full max-w-[95%] flex flex-col gap-4 mt-1">

                      {/* 🚌 BUS LISTCOMPONENT */}
                      {uiData.type === "BUS_LIST" && uiData.data.map((bus) => (
                        <div key={bus.id} className="bg-white/90 border border-gray-100 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group scale-95 hover:scale-100 duration-300">
                          <div className="h-28 bg-gray-200 relative overflow-hidden">
                            <img src={bus.image} alt="Bus" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute top-3 right-3 bg-indigo-600 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg">
                              ₹{bus.price}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                              <span className="text-white text-[10px] font-bold uppercase tracking-wider">Fastest Route &bull; Luxury Cabin</span>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-black text-gray-900 leading-tight text-base">{bus.name}</h4>
                                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-tighter">{bus.type}</span>
                              </div>
                              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-md border border-green-200 font-bold ring-2 ring-green-50">
                                {bus.availableSeats} SEATS
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">
                              <div className="flex flex-col">
                                <span className="text-gray-400 text-[9px] uppercase">Dep</span>
                                <span className="text-gray-800">{bus.departure}</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="w-12 h-[2px] bg-indigo-200 relative mb-1">
                                  <div className="absolute -right-1 -top-1 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-gray-400 text-[9px] uppercase">Arr</span>
                                <span className="text-gray-800">{bus.arrival}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                const dateParam = uiData.searchDate ? `?date=${uiData.searchDate}` : "";
                                navigate(`/bus/${bus.id}${dateParam}`);
                              }}
                              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95"
                            >
                              Select Seats <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* 🎫 TICKET DETAILS COMPONENT */}
                      {uiData.type === "TICKET_DETAILS" && (
                        <div className="bg-white border border-indigo-100 rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
                          <div className="bg-indigo-600 p-3 text-white flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest">Booking Confirmed</span>
                            <span className="text-xs font-black">{uiData.data.ticketNumber}</span>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                              <div className="text-center">
                                <p className="text-[10px] text-gray-400 uppercase font-bold">From</p>
                                <p className="font-black text-gray-800">{uiData.data.from}</p>
                              </div>
                              <div className="px-2">
                                <ArrowRight className="text-indigo-300" size={16} />
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] text-gray-400 uppercase font-bold">To</p>
                                <p className="font-black text-gray-800">{uiData.data.to}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="text-gray-400 font-bold mb-0.5 uppercase text-[9px]">Date</p>
                                <p className="font-bold text-gray-700">{uiData.data.date}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-400 font-bold mb-0.5 uppercase text-[9px]">Status</p>
                                <p className={`font-bold ${uiData.data.status === 'cancelled' ? 'text-red-500' : 'text-green-500'}`}>{(uiData.data.status || 'CONFIRMED').toUpperCase()}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 font-bold mb-0.5 uppercase text-[9px]">Seats</p>
                                <p className="font-bold text-gray-700">{uiData.data.seats}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-400 font-bold mb-0.5 uppercase text-[9px]">Total</p>
                                <p className="font-bold text-gray-700">₹{uiData.data.total}</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 flex flex-col gap-2 justify-center border-t border-gray-100">
                            {uiData.data.departureTime && uiData.data.departureTime !== "TBD" && (
                              <div className="text-center text-xs font-bold text-gray-700 pb-2 border-b border-gray-200/60 border-dashed">
                                Departure: <span className="text-indigo-600">{uiData.data.departureTime}</span>
                                <span className="block text-[10px] text-gray-500 mt-0.5">Please arrive 30 mins before at the bus stand</span>
                              </div>
                            )}
                            <div className="w-full py-1.5 border-2 border-indigo-600 border-dashed rounded-lg text-center text-[10px] font-black text-indigo-700">
                              VALID TICKET &bull; VERIFIED BY BUS BOT
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ❌ CANCELLATION RECEIPT COMPONENT */}
                      {uiData.type === "CANCEL_RECEIPT" && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 shadow-lg animate-in zoom-in-95 duration-500">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-red-200 shadow-lg">
                              <X size={20} className="stroke-[3px]" />
                            </div>
                            <div>
                              <h4 className="font-black text-red-900 text-sm">Booking Cancelled</h4>
                              <p className="text-[10px] text-red-600 font-bold">Successfully Processed</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-red-100 space-y-2">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-gray-400 font-bold">Ticket ID:</span>
                              <span className="text-gray-800 font-black">{uiData.data?.ticketNumber || "Ticket"}</span>
                            </div>
                            <div className="flex justify-between text-[11px] pb-2 border-b border-gray-50">
                              <span className="text-gray-400 font-bold">Refund Status:</span>
                              <span className="text-blue-600 font-black">Initiated</span>
                            </div>
                            <p className="text-[10px] text-gray-500 leading-relaxed pt-1">
                              The cancellation was successful. You should receive your refund (if applicable) within 5-7 business days.
                            </p>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTIONS */}
          {!loading && messages.length < 5 && (
            <div className="p-2.5 flex gap-2 overflow-x-auto no-scrollbar bg-gray-50/80 border-t border-gray-100 shrink-0">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={(e) => handleSend(e, s)}
                  className="whitespace-nowrap px-3 py-1.5 bg-white text-gray-600 text-[13px] rounded-full border border-gray-200 hover:border-blue-300 hover:text-blue-600 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* INPUT */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything..."
              className="flex-grow px-4 py-2.5 bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-blue-500 rounded-xl text-sm transition-all outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 flex items-center justify-center w-11 h-11 shrink-0"
            >
              <Send size={18} className={inputText.trim() && !loading ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
            </button>
          </form>
        </div>
      )}

      {/* 🔵 FLOATING BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl hover:scale-110 active:scale-90 transition-all duration-300 relative group"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
          </span>
        )}
        {/* TOOLTIP */}
        {!isOpen && (
          <div className="absolute right-16 bg-white text-gray-800 px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-100">
            Need help? Chat with us! 👋
          </div>
        )}
      </button>
    </div>
  );
};

export default Chatbot;
