"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, CheckCircle2, Phone } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  businessName: string;
  businessContext: string;
  suggestedQuestions?: string[];
}

export default function ChatWidget({
  businessName,
  businessContext,
  suggestedQuestions = [
    "What are your working hours?",
    "How much does a consultation cost?",
    "How do I book an appointment?"
  ]
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! Welcome to **${businessName}**. How can I help you today? Feel free to ask about our services, pricing, or appointment availability.`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showLeadForm]);

  async function handleSend(textToSend?: string) {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          systemInstruction: businessContext
        })
      });

      if (!res.ok) throw new Error("Connection failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let stream = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        stream += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: stream } : m))
        );
      }

      const lower = query.toLowerCase();
      if (lower.includes("book") || lower.includes("appointment") || lower.includes("contact") || lower.includes("price") || lower.includes("cost")) {
        setTimeout(() => setShowLeadForm(true), 1200);
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, I am having trouble connecting right now. Please call us directly!" }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!leadPhone.trim()) return;

    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: leadName,
        phone: leadPhone,
        notes: `Inquiry from ${businessName} Assistant`
      })
    });

    setLeadSubmitted(true);
    setTimeout(() => {
      setShowLeadForm(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Thank you, **${leadName || "there"}**! Our team has received your contact number (${leadPhone}). We will reach out shortly!`
        }
      ]);
    }, 1500);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl shadow-emerald-950/40 transition transform hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">Chat with Us</span>
        </button>
      )}

      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[580px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">{businessName}</h3>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Instant Replies 24/7
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role !== "user" && (
                  <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 ${
                    m.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-900 text-zinc-200 border border-zinc-800"
                  }`}
                >
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                {m.role === "user" && (
                  <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-zinc-300" />
                  </div>
                )}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[11px] text-zinc-500 font-medium">Common questions:</p>
                <div className="flex flex-col gap-1.5">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="text-left px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[11px] transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showLeadForm && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Request a Callback / Confirm Booking</span>
                </div>
                {leadSubmitted ? (
                  <div className="flex items-center gap-2 text-emerald-300 py-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved! We will call you soon.</span>
                  </div>
                ) : (
                  <form onSubmit={submitLead} className="space-y-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Your Name (Optional)"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Your Phone Number *"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Connect with Staff
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-30 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
