import React, { useState, useEffect } from 'react';
import { Lock, Send, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { db, collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc, where } from '../../lib/firebase';

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

export const AdminAnonymousPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [questions, setQuestions] = useState<AnonymousQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'answered'>('pending');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) return;

    const q = query(
      collection(db, 'anonymous_questions'), 
      where('status', '==', activeTab),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const qs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AnonymousQuestion));
      setQuestions(qs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching questions for admin:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be a server-side check. 
    // For this prompt, we use a hardcoded env variable.
    if (password === (process.env.ADMIN_PASSWORD || 'admin123')) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password.');
    }
  };

  const handleAnswer = async (qId: string) => {
    const answerText = answers[qId];
    if (!answerText) return;

    try {
      await updateDoc(doc(db, 'anonymous_questions', qId), {
        answer: answerText,
        status: 'answered',
        answerTimestamp: new Date().toISOString()
      });
      setAnswers(prev => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });
    } catch (err) {
      console.error('Error answering question:', err);
    }
  };

  const handleDelete = async (qId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteDoc(doc(db, 'anonymous_questions', qId));
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div id="admin-login-container" className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
        <div id="admin-login-card" className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 shadow-2xl max-w-md w-full text-center">
          <div id="admin-login-icon" className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-emerald-900/20">
            <Lock size={32} />
          </div>
          <h1 id="admin-login-title" className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Admin Access</h1>
          <p id="admin-login-subtitle" className="text-zinc-500 dark:text-zinc-400 mb-8">Enter the admin password to manage anonymous questions.</p>
          <form id="admin-login-form" onSubmit={handleLogin} className="space-y-4">
            <input
              id="admin-password-input"
              type="password"
              placeholder="Admin Password"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all text-center font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              id="admin-login-submit-btn"
              type="submit"
              className="w-full px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-container" className="p-4 md:p-8 max-w-6xl mx-auto pb-32 md:pb-8 animate-fade-up">
      <div id="admin-dashboard-header" className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div id="admin-dashboard-title-container">
          <h1 id="admin-dashboard-title" className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Manage Anonymous Questions</h1>
          <p id="admin-dashboard-subtitle" className="text-zinc-500 dark:text-zinc-400">Review and answer sensitive community questions.</p>
        </div>
        <div id="admin-dashboard-tabs" className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
          {(['pending', 'answered'] as const).map((tab) => (
            <button
              key={tab}
              id={`admin-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 shadow-sm'
                  : 'text-zinc-500 hover:text-emerald-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div id="admin-questions-list" className="space-y-6">
        {loading ? (
          <div id="admin-loading-indicator" className="p-12 text-center text-zinc-500">Loading questions...</div>
        ) : questions.length > 0 ? (
          questions.map((q) => (
            <motion.div
              key={q.id}
              id={`admin-question-card-${q.id}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 p-6 md:p-8 shadow-sm"
            >
              <div id={`admin-question-header-${q.id}`} className="flex items-center justify-between mb-4">
                <span id={`admin-question-category-${q.id}`} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {q.category}
                </span>
                <div id={`admin-question-meta-${q.id}`} className="flex items-center gap-4">
                  <span id={`admin-question-timestamp-${q.id}`} className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(q.timestamp).toLocaleString()}
                  </span>
                  <button
                    id={`admin-question-delete-btn-${q.id}`}
                    onClick={() => handleDelete(q.id)}
                    className="p-2 text-zinc-300 hover:text-rose-500 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p id={`admin-question-body-${q.id}`} className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-6 italic">
                "{q.body}"
              </p>

              {activeTab === 'pending' ? (
                <div id={`admin-question-answer-section-${q.id}`} className="space-y-4">
                  <textarea
                    id={`admin-question-answer-input-${q.id}`}
                    rows={4}
                    placeholder="Write your answer here..."
                    className="w-full px-4 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all resize-none text-sm"
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  />
                  <button
                    id={`admin-question-post-answer-btn-${q.id}`}
                    onClick={() => handleAnswer(q.id)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    <Send size={18} />
                    Post Answer
                  </button>
                </div>
              ) : (
                <div id={`admin-question-answer-container-${q.id}`} className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                  <div id={`admin-question-answered-badge-${q.id}`} className="flex items-center gap-2 mb-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                    <CheckCircle2 size={14} />
                    Answered
                  </div>
                  <p id={`admin-question-answer-text-${q.id}`} className="text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed whitespace-pre-wrap">
                    {q.answer}
                  </p>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div id="admin-no-questions-indicator" className="p-12 text-center text-zinc-500 italic bg-zinc-50 dark:bg-zinc-800/30 rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-700">
            No {activeTab} questions found.
          </div>
        )}
      </div>
    </div>
  );
};
