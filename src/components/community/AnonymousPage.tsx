import React, { useState, useEffect } from 'react';
import { Shield, Send, ThumbsUp, Info, HelpCircle, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { db, collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, increment, limit, where } from '../../lib/firebase';

interface AnonymousQuestion {
  id: string;
  body: string;
  category: string;
  timestamp: any;
  status: 'pending' | 'answered';
  answer?: string;
  answerTimestamp?: any;
  upvotes: number;
}

const CATEGORIES = ['Quran', 'Hadith', 'Fiqh', 'Marriage & Family', 'Finance', 'Other'];

export const AnonymousPage: React.FC = () => {
  const [questions, setQuestions] = useState<AnonymousQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState({ body: '', category: 'Other' });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Show the 20 most recently answered questions publicly
    const q = query(
      collection(db, 'anonymous_questions'), 
      where('status', '==', 'answered'),
      orderBy('answerTimestamp', 'desc'), 
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const qs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AnonymousQuestion));
      setQuestions(qs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching anonymous questions:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.body || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'anonymous_questions'), {
        ...newQuestion,
        timestamp: new Date().toISOString(),
        status: 'pending',
        upvotes: 0
      });
      setNewQuestion({ body: '', category: 'Other' });
      alert('Your question has been submitted anonymously. It will appear here once answered.');
    } catch (err) {
      console.error('Error submitting anonymous question:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (qId: string) => {
    try {
      await updateDoc(doc(db, 'anonymous_questions', qId), {
        upvotes: increment(1)
      });
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-32 md:pb-8 animate-fade-up">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">Anonymous Questions</h1>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400">Ask any Islamic question anonymously. Your identity is never stored.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm p-8 mb-12">
        <form id="anonymous-question-form" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Your Question</label>
            <textarea
              id="anonymous-question-body"
              required
              rows={5}
              placeholder="Type your question here..."
              className="w-full px-4 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all resize-none text-lg"
              value={newQuestion.body}
              onChange={(e) => setNewQuestion({ ...newQuestion, body: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Category</label>
              <select
                id="anonymous-question-category"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                id="anonymous-question-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
              >
                <Send size={20} />
                {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
          <HelpCircle size={24} className="text-emerald-600" />
          Recently Answered
        </h2>

        {loading ? (
          <div className="p-12 text-center text-zinc-500">Loading questions...</div>
        ) : questions.length > 0 ? (
          <div className="space-y-6">
            {questions.map((q) => (
              <motion.div
                key={q.id}
                id={`anonymous-question-card-${q.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {q.category}
                    </span>
                    <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      <CheckCircle2 size={12} />
                      Answered
                    </span>
                  </div>
                  <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-6 leading-relaxed italic">
                    "{q.body}"
                  </p>
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                    <p className="text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed whitespace-pre-wrap">
                      {q.answer}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Clock size={12} />
                        Answered on {new Date(q.answerTimestamp).toLocaleDateString()}
                      </span>
                      <button
                        id={`anonymous-question-upvote-${q.id}`}
                        onClick={() => handleUpvote(q.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
                      >
                        <ThumbsUp size={14} />
                        {q.upvotes}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-500 italic bg-zinc-50 dark:bg-zinc-800/30 rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-700">
            No answered questions yet. Your question will appear here once it's reviewed.
          </div>
        )}
      </div>

      <div className="mt-12 p-6 bg-zinc-900 text-white rounded-[32px] text-center">
        <p className="text-sm font-medium opacity-80">"Be respectful. This is an Islamic space. Offensive content will be removed."</p>
      </div>
    </div>
  );
};
