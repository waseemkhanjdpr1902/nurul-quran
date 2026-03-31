import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, BookOpen, Filter, ChevronLeft, ChevronRight, Volume2, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Hadith } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, addDoc, query, where, getDocs, deleteDoc, doc } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export const HadithPage = () => {
  const { user } = useAuth();
  const [allHadiths, setAllHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [book, setBook] = useState('bukhari');
  const [activeTopic, setActiveTopic] = useState('All');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [bookmarkLoading, setBookmarkLoading] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 20;

  const topics = [
    'All', 'Faith', 'Prayer', 'Fasting', 'Charity', 'Hajj', 'Character', 'Knowledge', 
    'Family', 'Intention', 'Purity', 'Marriage', 'Business', 'Jihad', 'Paradise', 
    'Hell', 'Judgment Day', 'Prophets', 'Angels', 'Quran', 'Sunnah', 'Repentance',
    'Patience', 'Gratitude', 'Trust', 'Sincerity', 'Modesty', 'Mercy'
  ];

  useEffect(() => {
    fetchHadiths();
  }, [book]);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'bookmarks'), where('user_id', '==', user.uid), where('type', '==', 'hadith'));
      const querySnapshot = await getDocs(q);
      const bookmarkedIds = querySnapshot.docs.map(doc => doc.data().content_id);
      setBookmarks(bookmarkedIds);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    }
  };

  const toggleBookmark = async (hadith: Hadith) => {
    if (!user) return;
    const contentId = `${book}-${hadith.hadithNumber}`;
    setBookmarkLoading(contentId);
    try {
      if (bookmarks.includes(contentId)) {
        const q = query(collection(db, 'bookmarks'), 
          where('user_id', '==', user.uid), 
          where('type', '==', 'hadith'),
          where('content_id', '==', contentId)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (d) => {
          await deleteDoc(doc(db, 'bookmarks', d.id));
        });
        setBookmarks(prev => prev.filter(id => id !== contentId));
      } else {
        await addDoc(collection(db, 'bookmarks'), {
          user_id: user.uid,
          type: 'hadith',
          content_id: contentId,
          metadata: {
            book,
            hadithNumber: hadith.hadithNumber,
            narrator: hadith.englishNarrator,
            text: hadith.hadithEnglish.substring(0, 100) + '...'
          },
          created_at: new Date().toISOString()
        });
        setBookmarks(prev => [...prev, contentId]);
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    } finally {
      setBookmarkLoading(null);
    }
  };

  const playHadith = (hadith: Hadith) => {
    if (typeof window === 'undefined') return;
    
    if (playingId === hadith.id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(hadith.hadithEnglish);
    utterance.onend = () => setPlayingId(null);
    window.speechSynthesis.speak(utterance);
    setPlayingId(hadith.id);
  };

  const fetchHadiths = async () => {
    setLoading(true);
    const cacheKey = `hadiths-full-${book}`;
    const cachedData = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
    
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        // Cache for 24 hours
        if (Date.now() - timestamp < 86400000) {
          setAllHadiths(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }

    try {
      const engUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${book}.min.json`;
      const araUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${book}.min.json`;

      const [engRes, araRes] = await Promise.all([
        axios.get(engUrl),
        axios.get(araUrl)
      ]);
      
      if (engRes.data.hadiths && araRes.data.hadiths) {
        const combined = engRes.data.hadiths.map((h: any, index: number) => ({
          id: index + 1,
          hadithArabic: araRes.data.hadiths[index]?.text || '',
          hadithEnglish: h.text,
          englishNarrator: h.text.split(':')[0] || 'Narrated',
          hadithNumber: h.hadithnumber || (index + 1).toString(),
          status: 'Sahih' // Default for these collections
        }));
        setAllHadiths(combined);
        try {
          if (typeof window !== 'undefined') {
          localStorage.setItem(cacheKey, JSON.stringify({ data: combined, timestamp: Date.now() }));
        }
        } catch (e) {
          console.warn("LocalStorage full, skipping cache for full book");
        }
      } else {
        throw new Error("Invalid API response");
      }
      setLoading(false);
    } catch (err) {
      console.error("Hadith API error, using fallback:", err);
      const fallbacks: Record<string, Hadith[]> = {
        bukhari: [
          {
            id: 1,
            hadithArabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
            hadithEnglish: "I heard Allah's Messenger (ﷺ) saying, 'The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended.'",
            englishNarrator: "Umar bin Al-Khattab",
            hadithNumber: "1",
            status: "Sahih"
          }
        ]
      };
      setAllHadiths(fallbacks[book] || fallbacks['bukhari']);
      setLoading(false);
    }
  };

  const filteredHadiths = allHadiths.filter(h => {
    const matchesSearch = h.hadithEnglish.toLowerCase().includes(search.toLowerCase()) || 
                         h.englishNarrator.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = activeTopic === 'All' || h.hadithEnglish.toLowerCase().includes(activeTopic.toLowerCase());
    return matchesSearch && matchesTopic;
  });

  const paginatedHadiths = filteredHadiths.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-3">
            <BookOpen className="text-emerald-600" />
            Hadith Collection
          </h1>
          <p className="text-sm text-zinc-500">Authentic traditions of the Prophet (PBUH)</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            id="hadith-book-select"
            value={book}
            onChange={(e) => {
              setBook(e.target.value);
              setPage(1);
            }}
            className="bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="bukhari">Sahih Bukhari</option>
            <option value="muslim">Sahih Muslim</option>
            <option value="tirmidhi">Jami at-Tirmidhi</option>
            <option value="abudawud">Sunan Abu Dawud</option>
            <option value="ibnmajah">Sunan Ibn Majah</option>
            <option value="nasai">Sunan an-Nasa'i</option>
          </select>

          <div className="relative">
            <select 
              id="hadith-topic-select"
              value={activeTopic}
              onChange={(e) => {
                setActiveTopic(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl px-4 py-3 pr-10 text-sm font-bold text-emerald-700 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm w-full sm:w-48"
            >
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              id="hadith-search-input"
              type="text"
              placeholder="Search Hadith..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 w-full shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Topics Filter */}
      <div className="flex flex-wrap gap-2 mb-10 p-1.5 bg-emerald-50 dark:bg-zinc-900 rounded-[24px] border border-emerald-100 dark:border-emerald-900/20">
        {topics.map((topic) => (
          <button
            key={topic}
            id={`hadith-topic-filter-${topic.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => {
              setActiveTopic(topic);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTopic === topic 
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm' 
                : 'text-zinc-500 hover:text-emerald-600'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-[40px]" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {paginatedHadiths.length > 0 ? (
            paginatedHadiths.map((h) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={h.id}
                id={`hadith-card-${h.id}`}
                className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
                      {h.status}
                    </span>
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Hadith #{h.hadithNumber}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-emerald-50 dark:border-emerald-900/20 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <BookOpen size={16} />
                    </div>
                    {user && (
                      <button 
                        id={`hadith-bookmark-${book}-${h.hadithNumber}`}
                        onClick={() => toggleBookmark(h)}
                        disabled={bookmarkLoading === `${book}-${h.hadithNumber}`}
                        className={`p-2 rounded-full transition-all ${
                          bookmarks.includes(`${book}-${h.hadithNumber}`)
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                        }`}
                      >
                        {bookmarkLoading === `${book}-${h.hadithNumber}` ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : bookmarks.includes(`${book}-${h.hadithNumber}`) ? (
                          <BookmarkCheck size={18} />
                        ) : (
                          <Bookmark size={18} />
                        )}
                      </button>
                    )}
                    <button 
                      id={`hadith-play-${h.id}`}
                      onClick={() => playHadith(h)}
                      className={`p-2 rounded-full transition-all ${
                        playingId === h.id
                          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 animate-pulse'
                          : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                      }`}
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                </div>
                
                <p className="text-3xl text-right font-arabic leading-loose mb-8 dark:text-zinc-100">
                  {h.hadithArabic}
                </p>
                
                <div className="border-t border-zinc-50 dark:border-zinc-800 pt-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Narrated by {h.englishNarrator}</p>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium italic text-lg">
                    "{h.hadithEnglish}"
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-emerald-50/30 dark:bg-zinc-900/30 rounded-[40px] border border-dashed border-emerald-200 dark:border-emerald-900/30">
              <p className="text-zinc-500">No Hadith found matching your search or selected topic.</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-6 mt-12">
            <button 
              id="hadith-pagination-prev"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 disabled:opacity-30 hover:border-emerald-400 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="px-6 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <span id="hadith-pagination-current" className="font-bold text-emerald-700 dark:text-emerald-400">Page {page}</span>
            </div>
            <button 
              id="hadith-pagination-next"
              onClick={() => setPage(p => p + 1)}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 hover:border-emerald-400 transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
