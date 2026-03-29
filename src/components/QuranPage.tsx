import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Pause, Search, ChevronRight, Book, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Surah, Ayah } from '../types';
import { formatArabicNumber } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { db, doc, updateDoc, increment as firestoreIncrement, collection, addDoc, query, where, getDocs, deleteDoc } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

export const QuranPage = () => {
  const { user } = useAuth();
  const { surahSlug } = useParams();
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [bookmarkLoading, setBookmarkLoading] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchSurahs();
  }, []);

  useEffect(() => {
    if (surahs.length > 0 && surahSlug) {
      // Try to find by number first (pattern: 1-al-faatiha)
      const surahNumber = parseInt(surahSlug.split('-')[0]);
      let surah = surahs.find(s => s.number === surahNumber);
      
      // If not found by number, try to find by English name or Arabic name in the slug
      if (!surah) {
        const slugLower = surahSlug.toLowerCase();
        surah = surahs.find(s => 
          s.englishName.toLowerCase().replace(/\s+/g, '-') === slugLower ||
          s.name === surahSlug ||
          s.englishName.toLowerCase() === slugLower
        );
      }

      if (surah) {
        setSelectedSurah(surah);
        fetchSurahDetails(surah.number);
      } else {
        // If still not found, redirect to index or show error
        navigate('/quran');
      }
    } else if (!surahSlug) {
      setSelectedSurah(null);
      setAyahs([]);
    }
  }, [surahSlug, surahs]);

  useEffect(() => {
    if (selectedSurah) {
      const title = `Surah ${selectedSurah.englishName} (${selectedSurah.englishNameTranslation}) - ${selectedSurah.numberOfAyahs} Ayahs | Nurul Quran`;
      const description = `Read and listen to Surah ${selectedSurah.englishName} (${selectedSurah.name}) with English translation and Uthmanic script. ${selectedSurah.numberOfAyahs} verses revealed in ${selectedSurah.revelationType}.`;
      const ogImage = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://nurulquran.com/quran/${selectedSurah.number}`; // Placeholder for OG image
      
      document.title = title;
      
      // Update meta tags
      const updateMeta = (name: string, content: string, property = false) => {
        let el = document.querySelector(property ? `meta[property="${name}"]` : `meta[name="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          if (property) el.setAttribute('property', name);
          else el.setAttribute('name', name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      updateMeta('description', description);
      updateMeta('og:title', title, true);
      updateMeta('og:description', description, true);
      updateMeta('og:image', ogImage, true);
      updateMeta('og:type', 'article', true);

      // Structured Data (JSON-LD)
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "image": ogImage,
        "author": {
          "@type": "Organization",
          "name": "Nurul Quran"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Nurul Quran",
          "logo": {
            "@type": "ImageObject",
            "url": "https://nurulquran.com/logo.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": window.location.href
        }
      };

      let scriptEl = document.getElementById('json-ld-quran');
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'json-ld-quran';
        scriptEl.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptEl);
      }
      scriptEl.innerHTML = JSON.stringify(jsonLd);
    } else {
      // Clean up dynamic meta tags when not on a surah page
      const scriptEl = document.getElementById('json-ld-quran');
      if (scriptEl) scriptEl.remove();
    }
  }, [selectedSurah]);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'bookmarks'), where('user_id', '==', user.uid), where('type', '==', 'quran'));
      const querySnapshot = await getDocs(q);
      const bookmarkedIds = querySnapshot.docs.map(doc => doc.data().content_id);
      setBookmarks(bookmarkedIds);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    }
  };

  const toggleBookmark = async (ayah: any) => {
    if (!user) return;
    const contentId = `quran-${ayah.number}`;
    setBookmarkLoading(contentId);
    try {
      if (bookmarks.includes(contentId)) {
        const q = query(collection(db, 'bookmarks'), 
          where('user_id', '==', user.uid), 
          where('type', '==', 'quran'),
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
          type: 'quran',
          content_id: contentId,
          metadata: {
            surahName: selectedSurah?.englishName,
            ayahNumber: ayah.numberInSurah,
            text: ayah.text.substring(0, 100) + '...'
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

  const fetchSurahs = async () => {
    const cached = localStorage.getItem('quran-surahs');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 86400000) { // 24 hours
        setSurahs(data);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await axios.get('https://api.alquran.cloud/v1/surah');
      setSurahs(res.data.data);
      localStorage.setItem('quran-surahs', JSON.stringify({ data: res.data.data, timestamp: Date.now() }));
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSurahDetails = async (number: number, startPlaying = false) => {
    setLoading(true);
    setAyahs([]);
    const cacheKey = `quran-surah-${number}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 86400000) {
        setAyahs(data);
        setLoading(false);
        if (startPlaying && data.length > 0) {
          playAyah(data[0].number);
        }
        return;
      }
    }

    try {
      const [arabicRes, transRes] = await Promise.all([
        axios.get(`https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`),
        axios.get(`https://api.alquran.cloud/v1/surah/${number}/en.sahih`)
      ]);
      
      if (arabicRes.data.data && transRes.data.data) {
        const combined = arabicRes.data.data.ayahs.map((ayah: any, index: number) => ({
          ...ayah,
          translation: transRes.data.data.ayahs[index].text
        }));
        setAyahs(combined);
        localStorage.setItem(cacheKey, JSON.stringify({ data: combined, timestamp: Date.now() }));
        if (startPlaying && combined.length > 0) {
          playAyah(combined[0].number);
        }
      } else {
        throw new Error("Failed to fetch surah content");
      }
    } catch (err) {
      console.error("Quran API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSurahClick = (surah: Surah) => {
    const slug = `${surah.number}-${surah.englishName.toLowerCase().replace(/\s+/g, '-')}`;
    navigate(`/quran/${slug}`);
  };

  const playAyah = async (ayahNumber: number) => {
    if (playingAyah === ayahNumber) {
      audioRef.current?.pause();
      setPlayingAyah(null);
      setAutoPlay(false);
    } else {
      const url = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`;
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setPlayingAyah(ayahNumber);
        setAutoPlay(true);
        
        // Save progress if user is logged in
        if (user) {
          try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              'stats.versesRead': firestoreIncrement(1),
              'lastActivity': new Date().toISOString()
            });
          } catch (err) {
            console.error('Error saving Quran progress:', err);
          }
        }

        // Scroll to the playing Ayah
        setTimeout(() => {
          const element = document.getElementById(`ayah-${ayahNumber}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  };

  const handleAudioEnd = () => {
    if (!autoPlay || !selectedSurah) return;

    const currentIndex = ayahs.findIndex(a => a.number === playingAyah);
    if (currentIndex < ayahs.length - 1) {
      // Play next Ayah in same Surah
      const nextAyah = ayahs[currentIndex + 1];
      playAyah(nextAyah.number);
    } else {
      // Last Ayah of Surah, go to next Surah
      const nextSurahNumber = selectedSurah.number + 1;
      const nextSurah = surahs.find(s => s.number === nextSurahNumber);
      if (nextSurah) {
        const slug = `${nextSurah.number}-${nextSurah.englishName.toLowerCase().replace(/\s+/g, '-')}`;
        navigate(`/quran/${slug}`);
        // fetchSurahDetails will be triggered by useEffect
      } else {
        setPlayingAyah(null);
        setAutoPlay(false);
      }
    }
  };

  const filteredSurahs = surahs.filter(s => 
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    s.name.includes(search)
  );

  if (loading && !surahs.length) return <div className="p-8 text-center">Loading Quran...</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <audio ref={audioRef} onEnded={handleAudioEnd} />
      
      {!selectedSurah ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-3">
              <Book className="text-emerald-600" />
              The Holy Quran
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                id="quran-search-input"
                type="text"
                placeholder="Search Surah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSurahs.map((surah) => (
              <button
                key={surah.number}
                id={`quran-surah-card-${surah.number}`}
                onClick={() => handleSurahClick(surah)}
                className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl hover:border-emerald-400 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                    {surah.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{surah.englishName}</h3>
                    <p className="text-xs text-zinc-500">{surah.englishNameTranslation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-arabic text-emerald-700 dark:text-emerald-400">{surah.name}</p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{surah.numberOfAyahs} Ayahs</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <button 
              id="quran-back-to-index"
              onClick={() => { navigate('/quran'); setAutoPlay(false); setPlayingAyah(null); audioRef.current?.pause(); }}
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
            >
              <ChevronRight className="rotate-180" size={20} />
              Back to Index
            </button>
            {autoPlay && (
              <div id="quran-autoplay-indicator" className="flex items-center gap-2 text-emerald-600 animate-pulse">
                <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                <span className="text-xs font-bold uppercase tracking-widest">Auto-playing</span>
              </div>
            )}
          </div>

          <div id="quran-surah-header" className="bg-emerald-600 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-2">{selectedSurah.englishName}</h2>
              <p className="text-emerald-100 opacity-80">{selectedSurah.englishNameTranslation} • {selectedSurah.revelationType}</p>
            </div>
            <div className="absolute right-[-20px] top-[-20px] text-[120px] text-white/10 font-arabic select-none">
              {selectedSurah.name}
            </div>
          </div>

          <div className="space-y-8">
            {ayahs.map((ayah: any) => (
              <div 
                key={ayah.number} 
                id={`ayah-${ayah.number}`}
                className={`p-6 rounded-3xl border transition-all duration-500 ${
                  playingAyah === ayah.number 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 shadow-lg shadow-emerald-100 dark:shadow-none ring-2 ring-emerald-500/20' 
                    : 'bg-white dark:bg-zinc-900 border-emerald-100 dark:border-emerald-900/30'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-colors ${
                    playingAyah === ayah.number ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-emerald-200 dark:border-emerald-800 text-emerald-600'
                  }`}>
                    {ayah.numberInSurah}
                  </div>
                  <div className="flex items-center gap-2">
                    {user && (
                      <button 
                        id={`quran-bookmark-ayah-${ayah.number}`}
                        onClick={() => toggleBookmark(ayah)}
                        disabled={bookmarkLoading === `quran-${ayah.number}`}
                        className={`p-2 rounded-full transition-all ${
                          bookmarks.includes(`quran-${ayah.number}`)
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                        }`}
                      >
                        {bookmarkLoading === `quran-${ayah.number}` ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : bookmarks.includes(`quran-${ayah.number}`) ? (
                          <BookmarkCheck size={18} />
                        ) : (
                          <Bookmark size={18} />
                        )}
                      </button>
                    )}
                    <button 
                      id={`quran-play-ayah-${ayah.number}`}
                      onClick={() => playAyah(ayah.number)}
                      className={`p-2 rounded-full transition-all ${
                        playingAyah === ayah.number 
                          ? 'bg-emerald-600 text-white scale-110' 
                          : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {playingAyah === ayah.number ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                  </div>
                </div>
                <p className={`text-3xl text-right font-quran leading-loose mb-6 transition-colors ${
                  playingAyah === ayah.number ? 'text-emerald-900 dark:text-emerald-300' : 'dark:text-zinc-100'
                }`}>
                  {ayah.text}
                </p>
                <p className={`leading-relaxed transition-colors ${
                  playingAyah === ayah.number ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-zinc-600 dark:text-zinc-400 italic'
                }`}>
                  {ayah.translation}
                </p>
                <div className="mt-6 pt-6 border-t border-emerald-50 dark:border-emerald-900/20 flex justify-end">
                  <button
                    id={`quran-view-tafseer-${ayah.number}`}
                    onClick={() => navigate(`/tafseer/${selectedSurah.number}/${ayah.numberInSurah}`)}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <Book size={14} />
                    View Tafseer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
