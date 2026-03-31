"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Send, MessageCircle, AlertCircle, Info, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, increment } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface AnonymousQuestion {
  id: string;
  body: string;
  category: string;
  timestamp: any;
  answer_count: number;
  status: 'pending' | 'answered';
}

export const AnonymousPage = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<AnonymousQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [activeCategory, setActiveCategory] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['General', 'Mental Health', 'Marriage', 'Youth', 'Family', 'Addiction'];

  useEffect(() => {
    const q = query(collection(db, 'anonymous_questions'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const qs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AnonymousQuestion));
      setQuestions(qs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'anonymous_questions'), {
        body: newQuestion,
        category: activeCategory,
        timestamp: new Date().toISOString(),
        answer_count: 0,
        status: 'pending'
      });
      setNewQuestion('');
      alert('Your anonymous question has been posted. A qualified counselor or scholar will respond soon.');
    } catch (err) {
      console.error("Error posting anonymous question:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-rose-100 dark:border-rose-900/30">
          <Shield size={14} />
          100% Private & Secure
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-emerald-900 dark:text-emerald-100 mb-6">
          Anonymous <span className="text-rose-500">Support</span>
        </h1>
        <p className="text-zinc-500 max-w-2xl mx-auto leading-relaxed">
          Ask sensitive questions about mental health, family, or personal struggles. 
          Your identity is never revealed. Get guidance from qualified professionals.
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-emerald-900 text-white p-8 rounded-[40px] mb-12 relative overflow-hidden">
        <Lock className="absolute -top-4 -right-4 text-emerald-800 w-24 h-24" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Info className="text-emerald-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">How it works</h3>
            <p className="text-emerald-100/80 text-sm leading-relaxed">
              When you post a question here, your name and profile are completely hidden. 
              Only the content of your question and the category are visible. 
              Our team of scholars and counselors will provide responses to help you navigate your challenges.
            </p>
          </div>
        </div>
      </div>

      {/* Ask Question Form */}
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm mb-16">
        <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-6">Ask Privately</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat 
                    ? 'bg-rose-500 text-white shadow-md' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <textarea
            required
            rows={5}
            placeholder="Describe your situation or question in detail..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-3xl focus:ring-2 focus:ring-rose-500 transition-all resize-none text-zinc-700 dark:text-zinc-300"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              <AlertCircle size={14} className="text-rose-500" />
              Identity is hidden
            </div>
            <button
              type="submit"
              disabled={!newQuestion.trim() || isSubmitting}
              className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Post Anonymously
            </button>
          </div>
        </form>
      </div>

      {/* Recent Questions */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-3">
          <MessageCircle className="text-rose-500" />
          Recent Support Requests
        </h2>

        {loading ? (
          <div className="grid gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-[40px]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {questions.length > 0 ? (
              questions.map((q) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={q.id}
                  className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-emerald-50 dark:border-emerald-900/10 hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
                      {q.category}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                      {new Date(q.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6 line-clamp-3">
                    {q.body}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-zinc-50 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <MessageCircle size={16} />
                      <span className="text-xs font-bold">{q.answer_count} Answers</span>
                    </div>
                    <button className="flex items-center gap-2 text-zinc-400 font-bold text-xs hover:text-emerald-600 transition-all">
                      View Details <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/30 rounded-[40px] border border-dashed border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-500">No anonymous questions yet. Be the first to reach out.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
