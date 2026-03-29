import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, ThumbsUp, Flag, Plus, ChevronRight, Filter, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { db, collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, increment, where } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface Question {
  id: string;
  title: string;
  body: string;
  category: string;
  author: string;
  author_name: string;
  timestamp: any;
  upvotes: number;
  answer_count: number;
  reports: number;
}

const CATEGORIES = ['All', 'Quran', 'Hadith', 'Fiqh', 'Daily Life', 'Finance'];

export const QAPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', body: '', category: 'Quran' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'questions'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const qs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Question));
      setQuestions(qs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching questions:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.title || !newQuestion.body) return;

    try {
      await addDoc(collection(db, 'questions'), {
        ...newQuestion,
        author: user?.uid || 'anonymous',
        author_name: user?.displayName || 'Anonymous',
        timestamp: new Date().toISOString(),
        upvotes: 0,
        answer_count: 0,
        reports: 0
      });
      setIsModalOpen(false);
      setNewQuestion({ title: '', body: '', category: 'Quran' });
    } catch (err) {
      console.error('Error adding question:', err);
    }
  };

  const handleUpvote = async (e: React.MouseEvent, qId: string) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'questions', qId), {
        upvotes: increment(1)
      });
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  const handleReport = async (e: React.MouseEvent, qId: string) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'questions', qId), {
        reports: increment(1)
      });
      alert('Question reported. Thank you for helping keep the community safe.');
    } catch (err) {
      console.error('Error reporting:', err);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         q.body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || q.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Quran': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Hadith': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
      case 'Fiqh': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Daily Life': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Finance': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-32 md:pb-8 animate-fade-up">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Q&A Board</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Ask and answer questions about Islam and daily life.</p>
        </div>
        <button
          id="qa-ask-question-trigger"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
        >
          <Plus size={20} />
          Ask a Question
        </button>
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex gap-4 mb-8">
        <Info className="text-amber-600 shrink-0" size={24} />
        <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
          <span className="font-bold">Disclaimer:</span> Answers are from community members, not certified scholars. For fatwas, consult a qualified Islamic authority.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
              id="qa-search-input"
              type="text"
              placeholder="Search questions..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                id={`qa-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeFilter === cat
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {loading ? (
            <div className="p-12 text-center text-zinc-500">Loading questions...</div>
          ) : filteredQuestions.length > 0 ? (
            filteredQuestions.map((q) => (
              <div 
                key={q.id} 
                id={`qa-question-${q.id}`}
                onClick={() => navigate(`/community/qa/${q.id}`)}
                className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 group-hover:text-emerald-600 transition-colors">
                    {q.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${getCategoryColor(q.category)}`}>
                    {q.category}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm line-clamp-2 mb-4">{q.body}</p>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium">
                    <span className="flex items-center gap-1">
                      Asked by <span className="text-emerald-600">{q.author_name}</span>
                    </span>
                    <span>•</span>
                    <span>{new Date(q.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500 text-xs font-bold">
                      <MessageSquare size={14} />
                      {q.answer_count}
                    </div>
                    <button
                      id={`qa-upvote-${q.id}`}
                      onClick={(e) => handleUpvote(e, q.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
                    >
                      <ThumbsUp size={14} />
                      {q.upvotes}
                    </button>
                    <button
                      id={`qa-report-${q.id}`}
                      onClick={(e) => handleReport(e, q.id)}
                      className="p-1.5 text-zinc-300 hover:text-rose-500 transition-all"
                      title="Report"
                    >
                      <Flag size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-zinc-500 italic">No questions found. Be the first to ask!</div>
          )}
        </div>
      </div>

      <div className="p-6 bg-emerald-900 text-white rounded-[32px] text-center">
        <p className="text-sm font-medium opacity-80">"Be respectful. This is an Islamic space. Offensive content will be removed."</p>
      </div>

      {/* Ask Question Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="qa-modal-overlay"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              id="qa-modal-content"
              className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 max-w-lg w-full shadow-2xl border border-emerald-100 dark:border-emerald-900/30"
            >
              <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-6">Ask a Question</h2>
              <form onSubmit={handleAskQuestion} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Title</label>
                  <input
                    id="qa-new-title"
                    type="text"
                    required
                    placeholder="e.g. How to improve concentration in Salah?"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Category</label>
                  <select
                    id="qa-new-category"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Details</label>
                  <textarea
                    id="qa-new-body"
                    required
                    rows={4}
                    placeholder="Provide more context for your question..."
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                    value={newQuestion.body}
                    onChange={(e) => setNewQuestion({ ...newQuestion, body: e.target.value })}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    id="qa-modal-cancel"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    id="qa-modal-submit"
                    type="submit"
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    Post Question
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
