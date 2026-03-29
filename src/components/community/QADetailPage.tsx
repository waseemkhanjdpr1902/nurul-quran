import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ThumbsUp, Flag, Send, MessageSquare, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { db, doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, updateDoc, increment } from '../../lib/firebase';
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

interface Answer {
  id: string;
  body: string;
  author: string;
  author_name: string;
  timestamp: any;
  upvotes: number;
  reports: number;
}

export const QADetailPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!questionId) return;

    const fetchQuestion = async () => {
      const qSnap = await getDoc(doc(db, 'questions', questionId));
      if (qSnap.exists()) {
        setQuestion({ id: qSnap.id, ...qSnap.data() } as Question);
      } else {
        navigate('/community/qa');
      }
    };

    fetchQuestion();

    const q = query(collection(db, 'questions', questionId, 'answers'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ans = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Answer));
      setAnswers(ans);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [questionId, navigate]);

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer || !questionId) return;

    try {
      await addDoc(collection(db, 'questions', questionId, 'answers'), {
        body: newAnswer,
        author: user?.uid || 'anonymous',
        author_name: user?.displayName || 'Anonymous',
        timestamp: new Date().toISOString(),
        upvotes: 0,
        reports: 0
      });
      
      await updateDoc(doc(db, 'questions', questionId), {
        answer_count: increment(1)
      });

      setNewAnswer('');
    } catch (err) {
      console.error('Error posting answer:', err);
    }
  };

  const handleUpvoteQuestion = async () => {
    if (!questionId) return;
    try {
      await updateDoc(doc(db, 'questions', questionId), {
        upvotes: increment(1)
      });
      setQuestion(prev => prev ? { ...prev, upvotes: prev.upvotes + 1 } : null);
    } catch (err) {
      console.error('Error upvoting question:', err);
    }
  };

  const handleUpvoteAnswer = async (aId: string) => {
    if (!questionId) return;
    try {
      await updateDoc(doc(db, 'questions', questionId, 'answers', aId), {
        upvotes: increment(1)
      });
    } catch (err) {
      console.error('Error upvoting answer:', err);
    }
  };

  const handleReport = async (type: 'question' | 'answer', id: string) => {
    try {
      if (type === 'question') {
        await updateDoc(doc(db, 'questions', id), { reports: increment(1) });
      } else {
        await updateDoc(doc(db, 'questions', questionId!, 'answers', id), { reports: increment(1) });
      }
      alert('Reported successfully.');
    } catch (err) {
      console.error('Error reporting:', err);
    }
  };

  if (loading || !question) {
    return <div className="p-12 text-center text-zinc-500">Loading...</div>;
  }

  return (
    <div id="qa-detail-container" className="p-4 md:p-8 max-w-4xl mx-auto pb-32 md:pb-8 animate-fade-up">
      <button
        id="qa-detail-back-btn"
        onClick={() => navigate('/community/qa')}
        className="flex items-center gap-2 text-zinc-500 hover:text-emerald-600 transition-all mb-8 font-bold uppercase tracking-widest text-xs"
      >
        <ChevronLeft size={16} />
        Back to Q&A Board
      </button>

      <div id="qa-detail-question-card" className="bg-white dark:bg-zinc-900 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm p-8 mb-8">
        <div id="qa-detail-question-header" className="flex items-center gap-3 mb-4">
          <span id="qa-detail-category" className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
            {question.category}
          </span>
          <span id="qa-detail-timestamp" className="text-[10px] text-zinc-400 font-medium">{new Date(question.timestamp).toLocaleDateString()}</span>
        </div>
        <div id="qa-detail-question-content">
          <h1 id="qa-detail-title" className="text-2xl md:text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">{question.title}</h1>
          <p id="qa-detail-body" className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8 whitespace-pre-wrap">{question.body}</p>
        </div>
        
        <div id="qa-detail-author-section" className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div id="qa-detail-author-info" className="flex items-center gap-3">
            <div id="qa-detail-author-avatar" className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 font-bold">
              {question.author_name[0].toUpperCase()}
            </div>
            <div>
              <p id="qa-detail-author-name" className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{question.author_name}</p>
              <p id="qa-detail-author-label" className="text-[10px] text-zinc-400 uppercase tracking-widest">Question Author</p>
            </div>
          </div>
          <div id="qa-detail-question-actions" className="flex items-center gap-4">
            <button
              id="qa-detail-upvote-btn"
              onClick={handleUpvoteQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
            >
              <ThumbsUp size={16} />
              {question.upvotes}
            </button>
            <button
              id="qa-detail-report-btn"
              onClick={() => handleReport('question', question.id)}
              className="p-2 text-zinc-300 hover:text-rose-500 transition-all"
              title="Report"
            >
              <Flag size={16} />
            </button>
          </div>
        </div>
      </div>

      <div id="qa-detail-answers-section" className="mb-8">
        <h2 id="qa-detail-answers-title" className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-6 flex items-center gap-2">
          <MessageSquare size={20} className="text-emerald-600" />
          {answers.length} Answers
        </h2>

        <div id="qa-detail-answers-list" className="space-y-6">
          {answers.map((a) => (
            <motion.div
              key={a.id}
              id={`qa-answer-card-${a.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm"
            >
              <p id={`qa-answer-body-${a.id}`} className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 whitespace-pre-wrap">{a.body}</p>
              <div id={`qa-answer-footer-${a.id}`} className="flex items-center justify-between">
                <div id={`qa-answer-author-info-${a.id}`} className="flex items-center gap-3">
                  <div id={`qa-answer-avatar-${a.id}`} className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 text-xs font-bold">
                    {a.author_name[0].toUpperCase()}
                  </div>
                  <div>
                    <p id={`qa-answer-author-${a.id}`} className="text-xs font-bold text-emerald-900 dark:text-emerald-100">{a.author_name}</p>
                    <p id={`qa-answer-time-${a.id}`} className="text-[10px] text-zinc-400">{new Date(a.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div id={`qa-answer-actions-${a.id}`} className="flex items-center gap-3">
                  <button
                    id={`qa-answer-upvote-btn-${a.id}`}
                    onClick={() => handleUpvoteAnswer(a.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 rounded-lg text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    <ThumbsUp size={14} />
                    {a.upvotes}
                  </button>
                  <button
                    id={`qa-answer-report-btn-${a.id}`}
                    onClick={() => handleReport('answer', a.id)}
                    className="p-1.5 text-zinc-200 hover:text-rose-500 transition-all"
                    title="Report"
                  >
                    <Flag size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {answers.length === 0 && (
            <div id="qa-detail-no-answers" className="p-12 text-center text-zinc-500 italic bg-zinc-50 dark:bg-zinc-800/30 rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-700">
              No answers yet. Share your knowledge!
            </div>
          )}
        </div>
      </div>

      <div id="qa-detail-your-answer-section" className="bg-white dark:bg-zinc-900 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm p-6">
        <h3 id="qa-detail-your-answer-title" className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-4">Your Answer</h3>
        <form id="qa-detail-answer-form" onSubmit={handlePostAnswer} className="space-y-4">
          <textarea
            id="qa-detail-answer-input"
            required
            rows={4}
            placeholder="Write your answer here..."
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
          />
          <div className="flex items-center justify-between gap-4">
            <p id="qa-detail-posting-as" className="text-[10px] text-zinc-400 italic">
              Posting as <span id="qa-detail-posting-as-name" className="text-emerald-600 font-bold">{user?.displayName || 'Anonymous'}</span>
            </p>
            <button
              id="qa-detail-submit-answer-btn"
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
            >
              <Send size={18} />
              Submit Answer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
