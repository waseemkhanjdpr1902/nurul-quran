"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: 'Assalamu Alaikum! I am your Nurul Quran AI assistant. How can I help you today with your spiritual journey?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const model = "gemini-3-flash-preview";
      
      const chat = await ai.models.generateContent({
        model: model,
        contents: messages.concat(userMessage).map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "You are Nurul Quran AI, a knowledgeable and compassionate Islamic assistant. Your goal is to help users with their questions about the Quran, Hadith, spiritual growth (Tasawwuf), and general Islamic knowledge. Always be respectful, provide evidence from Quran and Sunnah where possible, and maintain a moderate, balanced perspective. If a question is too complex or requires a formal fatwa, kindly advise the user to consult a qualified scholar.",
        }
      });

      const modelResponse: Message = {
        role: 'model',
        content: chat.text || "I'm sorry, I couldn't generate a response. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, modelResponse]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        content: "I apologize, but I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-700 transition-colors"
        >
          <MessageSquare size={24} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950 animate-pulse" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '64px' : '600px',
              width: '400px'
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl border border-emerald-100 dark:border-emerald-900/30 overflow-hidden flex flex-col transition-all duration-300`}
          >
            {/* Header */}
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between cursor-pointer" onClick={() => isMinimized && setIsMinimized(false)}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Nurul Quran AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-100">Online & Ready</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}>
                          {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-emerald-600 text-white rounded-tr-none' 
                            : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 rounded-tl-none border border-zinc-100 dark:border-zinc-800'
                        }`}>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                          <span className={`text-[10px] mt-2 block ${msg.role === 'user' ? 'text-emerald-100' : 'text-zinc-400'}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                          <Bot size={16} />
                        </div>
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl rounded-tl-none border border-zinc-100 dark:border-zinc-800">
                          <Loader2 size={16} className="animate-spin text-emerald-600" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="relative flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ask anything about Islam..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      className="flex-grow bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-zinc-400">
                    <Sparkles size={10} className="text-emerald-500" />
                    <span>Powered by Nurul Quran AI</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
