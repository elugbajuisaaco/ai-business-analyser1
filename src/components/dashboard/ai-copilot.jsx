"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Send } from "lucide-react";
import { sendCopilotPrompt } from "@/services/api";

export function AiCopilot({ aiSummary }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (aiSummary) {
      setMessages([
        {
          role: "assistant",
          text: `👋 ${aiSummary.insightText} Ask me questions like "What is our highest channel?" or "How can we optimize revenue?"`,
        },
      ]);
    }
  }, [aiSummary]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isThinking) return;

    const userPrompt = inputValue;
    setInputValue("");

    // Append user message immediately
    setMessages((prev) => [...prev, { role: "user", text: userPrompt }]);
    setIsThinking(true);

    try {
      // Dispatch prompt and summary context to the backend API endpoint
      const result = await sendCopilotPrompt(userPrompt, aiSummary);

      const botReply =
        result.response ||
        result.data?.response ||
        "I've analyzed the request, but couldn't retrieve a specific answer.";

      setMessages((prev) => [...prev, { role: "assistant", text: botReply }]);
    } catch (error) {
      console.error("Copilot request error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I am having trouble connecting to the backend AI server right now.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col justify-between shrink-0 shadow-sm z-20">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-800">AI Copilot</span>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[92%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none font-medium"
                  : "bg-slate-100 border border-slate-200/60 text-slate-800 rounded-tl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex flex-col items-start">
            <div className="bg-slate-100 border border-slate-200/60 text-slate-500 rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="p-4 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask AI about sales..."
          disabled={isThinking}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 text-slate-800 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isThinking || !inputValue.trim()}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shrink-0 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </aside>
  );
}