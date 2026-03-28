import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, MessageSquare, Clock, User, Reply, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, updateDoc, increment, where } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface GroupPost {
  id: string;
  body: string;
  author: string;
  author_name: string;
  timestamp: any;
  replyCount: number;
}

interface GroupReply {
  id: string;
  body: string;
  author: string;
  author_name: string;
  timestamp: any;
}

const GROUPS_DATA: Record<string, { name: string, icon: string }> = {
  'quran-study': { name: 'Quran Study', icon: '📖' },
  'daily-dhikr': { name: 'Daily Dhikr', icon: '🕌' },
  'halal-finance': { name: 'Halal Finance', icon: '💰' },
  'ramadan-prep': { name: 'Ramadan Prep', icon: '🌙' },
  'family-parenting': { name: 'Family & Parenting', icon: '👨‍👩‍👧' },
  'new-muslims': { name: 'New Muslims', icon: '🎓' },
};

export const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [replies, setReplies] = useState<Record<string, GroupReply[]>>({});
  const [newPost, setNewPost] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [showReplyInput, setShowReplyInput] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const groupInfo = groupId ? GROUPS_DATA[groupId] : null;

  useEffect(() => {
    if (!groupId || !groupInfo) {
      navigate('/community/groups');
      return;
    }

    const q = query(collection(db, 'groups', groupId, 'posts'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ps = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GroupPost));
      setPosts(ps);
      setLoading(false);
      
      // Auto scroll to bottom on new post
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });

    return () => unsubscribe();
  }, [groupId, navigate, groupInfo]);

  // Fetch replies for each post
  useEffect(() => {
    if (!groupId || posts.length === 0) return;

    const unsubscribes = posts.map(post => {
      const rq = query(collection(db, 'groups', groupId, 'posts', post.id, 'replies'), orderBy('timestamp', 'asc'));
      return onSnapshot(rq, (snapshot) => {
        const rs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GroupReply));
        setReplies(prev => ({ ...prev, [post.id]: rs }));
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [groupId, posts]);

  const getGuestName = () => {
    let guest = localStorage.getItem('guest_name');
    if (!guest) {
      guest = `Guest${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem('guest_name', guest);
    }
    return guest;
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost || !groupId) return;

    try {
      await addDoc(collection(db, 'groups', groupId, 'posts'), {
        body: newPost,
        author: user?.uid || 'guest',
        author_name: user?.displayName || getGuestName(),
        timestamp: new Date().toISOString(),
        replyCount: 0
      });
      setNewPost('');
    } catch (err) {
      console.error('Error posting in group:', err);
    }
  };

  const handleReply = async (postId: string) => {
    const replyText = replyInputs[postId];
    if (!replyText || !groupId) return;

    try {
      await addDoc(collection(db, 'groups', groupId, 'posts', postId, 'replies'), {
        body: replyText,
        author: user?.uid || 'guest',
        author_name: user?.displayName || getGuestName(),
        timestamp: new Date().toISOString()
      });
      
      await updateDoc(doc(db, 'groups', groupId, 'posts', postId), {
        replyCount: increment(1)
      });

      setReplyInputs(prev => ({ ...prev, [postId]: '' }));
      setShowReplyInput(prev => ({ ...prev, [postId]: false }));
    } catch (err) {
      console.error('Error replying to post:', err);
    }
  };

  if (!groupInfo) return null;

  const memberCount = new Set(posts.map(p => p.author)).size;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen animate-fade-up">
      {/* Header */}
      <div className="p-4 md:p-6 bg-white dark:bg-zinc-900 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/community/groups')}
            className="p-2 text-zinc-400 hover:text-emerald-600 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{groupInfo.icon}</div>
            <div>
              <h1 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{groupInfo.name}</h1>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {memberCount} Active
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Live Chat
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar bg-zinc-50 dark:bg-zinc-950"
      >
        {loading ? (
          <div className="p-12 text-center text-zinc-500">Loading discussion...</div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="max-w-3xl mx-auto space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-emerald-900/20">
                  {post.author_name[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="bg-white dark:bg-zinc-900 p-5 rounded-[24px] rounded-tl-none border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{post.author_name}</span>
                      <span className="text-[10px] text-zinc-400">{new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{post.body}</p>
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        onClick={() => setShowReplyInput(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-emerald-600 transition-all"
                      >
                        <Reply size={12} />
                        Reply
                      </button>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        <MessageSquare size={12} />
                        {post.replyCount} Replies
                      </span>
                    </div>
                  </div>

                  {/* Replies */}
                  <div className="mt-4 ml-4 md:ml-8 space-y-4">
                    {replies[post.id]?.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 text-[10px] font-bold shrink-0">
                          {reply.author_name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-[20px] rounded-tl-none border border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-emerald-600">{reply.author_name}</span>
                            <span className="text-[10px] text-zinc-400">{new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{reply.body}</p>
                        </div>
                      </div>
                    ))}

                    <AnimatePresence>
                      {showReplyInput[post.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-3 overflow-hidden"
                        >
                          <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 text-[10px] font-bold shrink-0">
                            You
                          </div>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              placeholder="Type your reply..."
                              className="flex-1 px-4 py-2 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 transition-all"
                              value={replyInputs[post.id] || ''}
                              onChange={(e) => setReplyInputs({ ...replyInputs, [post.id]: e.target.value })}
                              onKeyPress={(e) => e.key === 'Enter' && handleReply(post.id)}
                            />
                            <button
                              onClick={() => handleReply(post.id)}
                              className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-zinc-500 italic flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300">
              <MessageSquare size={32} />
            </div>
            No posts in this group yet. Start the conversation!
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-white dark:bg-zinc-900 border-t border-emerald-100 dark:border-emerald-900/30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <form onSubmit={handlePost} className="max-w-3xl mx-auto flex gap-4">
          <div className="flex-1 relative">
            <textarea
              rows={1}
              placeholder={`Message ${groupInfo.name}...`}
              className="w-full pl-4 pr-12 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all resize-none text-sm"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handlePost(e);
                }
              }}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        <p className="text-[10px] text-center text-zinc-400 mt-4 uppercase tracking-widest font-bold">
          Posting as <span className="text-emerald-600">{user?.displayName || getGuestName()}</span>
        </p>
      </div>
    </div>
  );
};
