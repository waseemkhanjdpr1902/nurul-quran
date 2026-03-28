import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { db, doc, setDoc, collection, addDoc } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export const AIChatGuide = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('English');
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Assalamu Alaikum. I am your Nurul Quran AI Spiritual Guide. I can answer your questions about Islam, Quran, Hadith, and spiritual purification in detail. Which language would you like to communicate in?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-ai-chat', handleOpen);
    return () => window.removeEventListener('open-ai-chat', handleOpen);
  }, []);

  const languages = [
    'English', 'Arabic', 'Urdu', 'Hindi', 'Bengali', 'Turkish', 'Indonesian', 'Malay', 'French', 'Spanish'
  ];

  useEffect(() => {
    if (user && isOpen && messages.length > 1) {
      saveChatHistory();
    }
  }, [messages, user, isOpen]);

  const saveChatHistory = async () => {
    if (!user) return;
    try {
      const chatData = {
        user_id: user.uid,
        messages: messages,
        title: messages[1]?.text?.substring(0, 50) || 'New Conversation',
        created_at: new Date().toISOString()
      };

      if (chatId) {
        await setDoc(doc(db, 'chat_history', chatId), chatData, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, 'chat_history'), chatData);
        setChatId(docRef.id);
      }
    } catch (err) {
      console.error('Error saving chat history:', err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: newMessages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: `You are a highly knowledgeable, wise, and compassionate Islamic Scholar and Spiritual Guide (Murshid). 
          Your goal is to provide detailed, accurate, and spiritually enriching answers to Islamic questions.
          
          Key Instructions:
          1. Provide answers in ${language} unless the user asks in another language, in which case respond in the user's language.
          2. Support multiple languages including English, Arabic, Urdu, Hindi, Bengali, and others.
          3. Always provide detailed explanations with references to the Holy Quran (Surah and Ayah number) and Sahih Hadith.
          4. Include teachings from classical scholars like Imam al-Ghazali, Imam Nawawi, and others where relevant.
          5. Focus on Tazkiyah (purification of the soul), Ihsan (spiritual excellence), and practical guidance for daily life.
          6. Be gentle, encouraging, and non-judgmental. 
          7. If a question is about a complex legal (Fiqh) matter, provide the general consensus and advise consulting a local qualified Mufti for specific rulings.
          8. Use Markdown for clear formatting (bolding, lists, etc.).`,
        }
      });

      const aiText = response.text || "I apologize, I am unable to respond at the moment.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMsg = "I encountered an error. Please try again later.";
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl shadow-2xl w-[350px] sm:w-[450px] h-[600px] flex flex-col mb-4 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-emerald-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-medium">Nurul Quran AI Guide</span>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-emerald-700 text-xs border-none rounded-lg px-2 py-1 outline-none text-white cursor-pointer"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <button 
                  onClick={() => {
                    setMessages([{ role: 'model', text: 'Assalamu Alaikum. How can I help you today?' }]);
                    setChatId(null);
                  }}
                  className="text-[10px] bg-emerald-700 hover:bg-emerald-800 px-2 py-1 rounded-lg transition-colors uppercase font-bold tracking-wider"
                >
                  Clear
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="hover:bg-emerald-700 p-1 rounded-full transition-colors flex items-center gap-1 group"
                >
                  <span className="text-xs font-medium hidden sm:inline group-hover:inline">Close</span>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-emerald-50/30 dark:bg-zinc-950">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-zinc-800 border border-emerald-100 dark:border-emerald-900/30 rounded-tl-none'
                  }`}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <Markdown>
                        {msg.text}
                      </Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-zinc-800 border border-emerald-100 dark:border-emerald-900/30 p-3 rounded-2xl rounded-tl-none animate-pulse">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-emerald-100 dark:border-emerald-900/30 bg-white dark:bg-zinc-900 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask any Islamic question..."
                  className="flex-1 bg-emerald-50 dark:bg-zinc-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-2 text-xs text-zinc-400 hover:text-emerald-600 transition-colors font-medium border-t border-zinc-50 dark:border-zinc-800 pt-2"
              >
                Close Chat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-all hover:scale-110 active:scale-95"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};
