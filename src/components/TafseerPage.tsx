import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Book, Share2, Loader2, Search, Languages, ArrowLeft, ArrowRight, AlertCircle, RefreshCw, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Surah } from '../types';

interface TafseerData {
  resource_id: number;
  text: string;
}

export const TafseerPage = () => {
  const { surahNumber, ayahNumber } = useParams();
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tafseer, setTafseer] = useState<TafseerData | null>(null);
  const [ayahText, setAyahText] = useState<string>('');
  const [translationText, setTranslationText] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem('tafseerLanguage') || 'english'
  );
  const [fontSize, setFontSize] = useState(
    parseInt(localStorage.getItem('tafseerFontSize') || '16')
  );
  const [arabicFontSize, setArabicFontSize] = useState(
    parseInt(localStorage.getItem('arabicFontSize') || '36')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<number>(surahNumber ? parseInt(surahNumber) : 1);
  const [selectedAyah, setSelectedAyah] = useState<number>(ayahNumber ? parseInt(ayahNumber) : 1);
  const ayahCache = React.useRef<Map<string, { ayah: string; translation: string; tafseer: string }>>(new Map());

  const LANGUAGES = [
    { id: 'english', name: 'English', flag: '🇬🇧', dir: 'ltr', api: 'en-tafisr-ibn-kathir' },
    { id: 'urdu', name: 'Urdu', flag: '🇵🇰', dir: 'rtl', api: 'ur-tafseer-ibn-e-kaseer' },
    { id: 'arabic', name: 'Arabic', flag: '🇸🇦', dir: 'rtl', api: 'ar-tafsir-al-tabari' },
    { id: 'hindi', name: 'Hindi', flag: '🇮🇳', dir: 'ltr', api: 'hi.farooq' },
    { id: 'french', name: 'French', flag: '🇫🇷', dir: 'ltr', api: 'fr-tafsir-ibn-kathir' },
    { id: 'indonesian', name: 'Indonesian', flag: '🇮🇩', dir: 'ltr', api: 'id-tafsir-jalalayn' },
  ];

  const currentLang = LANGUAGES.find(l => l.id === selectedLanguage) || LANGUAGES[0];

  useEffect(() => {
    fetchSurahs();
  }, []);

  useEffect(() => {
    if (surahNumber && ayahNumber) {
      const s = parseInt(surahNumber);
      const a = parseInt(ayahNumber);
      setSelectedSurah(s);
      setSelectedAyah(a);
      fetchTafseer(s, a, selectedLanguage);
    } else if (surahs.length > 0) {
      setLoading(false);
    }
  }, [surahNumber, ayahNumber, selectedLanguage, surahs]);

  useEffect(() => {
    localStorage.setItem('tafseerLanguage', selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    localStorage.setItem('tafseerFontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('arabicFontSize', arabicFontSize.toString());
  }, [arabicFontSize]);

  const minFont = 12;
  const maxFont = 32;
  const tafseerStep = 2;

  const minArabicFont = 24;
  const maxArabicFont = 48;
  const arabicStep = 4;

  const increaseTafseer = () => setFontSize(f => Math.min(f + tafseerStep, maxFont));
  const decreaseTafseer = () => setFontSize(f => Math.max(f - tafseerStep, minFont));
  const resetTafseer = () => setFontSize(16);

  const increaseArabic = () => setArabicFontSize(f => Math.min(f + arabicStep, maxArabicFont));
  const decreaseArabic = () => setArabicFontSize(f => Math.max(f - arabicStep, minArabicFont));
  const resetArabic = () => setArabicFontSize(36);

  const fetchSurahs = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await axios.get('https://api.alquran.cloud/v1/surah', { signal: controller.signal });
      clearTimeout(timeoutId);
      setSurahs(res.data.data);
    } catch (err) {
      console.error("Error fetching surahs:", err);
      setError("Tafseer temporarily unavailable. Please check your internet connection.");
    }
  };

  const fetchTafseer = async (sNum: number, aNum: number, langId: string, retryCount = 0) => {
    const s = parseInt(sNum.toString());
    const a = parseInt(aNum.toString());
    
    if (isNaN(s) || isNaN(a) || s < 1 || s > 114 || a < 1) return;

    // Set loading and clear content on first attempt
    if (retryCount === 0) {
      setLoading(true);
      setError(null);
      setAyahText('');
      setTranslationText('');
      setTafseer(null);
    }

    const cacheKey = `${s}:${a}-${langId}`;
    if (ayahCache.current.has(cacheKey)) {
      const cached = ayahCache.current.get(cacheKey)!;
      setAyahText(cached.ayah);
      setTranslationText(cached.translation);
      setTafseer({ resource_id: 169, text: cached.tafseer });
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      // 1. Fetch Arabic and Translation from Al-Quran Cloud
      const alquranUrl = `https://api.alquran.cloud/v1/ayah/${s}:${a}/editions/quran-uthmani,en.pickthall`;
      const alquranRes = await axios.get(alquranUrl, { signal: controller.signal });
      
      let currentAyah = '';
      let currentTranslation = '';

      if (alquranRes.data.data) {
        const arabic = alquranRes.data.data.find((e: any) => e.edition.identifier === 'quran-uthmani');
        const translation = alquranRes.data.data.find((e: any) => e.edition.identifier === 'en.pickthall');
        
        if (arabic) {
          currentAyah = arabic.text;
          setAyahText(arabic.text);
        }
        if (translation) {
          currentTranslation = translation.text;
          setTranslationText(translation.text);
        }
      }

      // 2. Fetch Tafseer based on language
      let tafsirContent = '';
      const langConfig = LANGUAGES.find(l => l.id === langId) || LANGUAGES[0];

      try {
        if (langId === 'hindi') {
          const hindiUrl = `https://api.alquran.cloud/v1/ayah/${s}:${a}/hi.farooq`;
          const hindiRes = await axios.get(hindiUrl, { signal: controller.signal });
          tafsirContent = hindiRes.data.data.text;
        } else if (langId === 'english') {
          // Try HTML first for English
          try {
            const tafsirHtmlUrl = `https://islamicstudies.info/tafsir.php?q=${s}_${a}&sr=2`;
            const response = await fetch(tafsirHtmlUrl, { mode: 'cors', signal: controller.signal });
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const tafsirElement = doc.querySelector('.tafsirtext');
            if (tafsirElement) {
              tafsirContent = tafsirElement.innerHTML;
            } else {
              throw new Error("Tafsir element not found");
            }
          } catch (e) {
            // Fallback to GitHub JSON for English
            const fallbackUrl = `https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/en-tafisr-ibn-kathir/${s}/${a}.json`;
            const fallbackRes = await axios.get(fallbackUrl, { signal: controller.signal });
            tafsirContent = fallbackRes.data.text;
          }
        } else {
          // Other languages from GitHub
          const url = `https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/${langConfig.api}/${s}/${a}.json`;
          const res = await axios.get(url, { signal: controller.signal });
          tafsirContent = res.data.text;
        }
      } catch (langErr) {
        console.warn(`Tafseer fetch failed for ${langId}, falling back to English`, langErr);
        if (langId !== 'english') {
          setError(`Tafseer in this language is not available for this Ayah. Showing English instead.`);
          // Wait a bit to show the message then fetch English
          setTimeout(() => {
            fetchTafseer(s, a, 'english');
          }, 2000);
          return;
        } else {
          throw langErr;
        }
      }

      clearTimeout(timeoutId);
      
      if (tafsirContent) {
        setTafseer({ resource_id: 169, text: tafsirContent });
        ayahCache.current.set(cacheKey, {
          ayah: currentAyah,
          translation: currentTranslation,
          tafseer: tafsirContent
        });
        setLoading(false);
      } else {
        throw new Error("Tafseer not found");
      }
    } catch (err: any) {
      console.error("Error fetching tafseer:", err);
      if (retryCount < 1) {
        console.log("Retrying in 2 seconds...");
        setTimeout(() => fetchTafseer(s, a, langId, retryCount + 1), 2000);
      } else {
        setError("Tafseer temporarily unavailable. Please check your internet connection.");
        setLoading(false);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple search: if it's "surah:ayah" format
    if (searchQuery.includes(':')) {
      const [s, a] = searchQuery.split(':');
      const sNum = parseInt(s);
      const aNum = parseInt(a);
      if (!isNaN(sNum) && !isNaN(aNum)) {
        navigate(`/tafseer/${sNum}/${aNum}`);
        return;
      }
    }
    
    // Otherwise try to find surah by name
    const surah = surahs.find(s => 
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString() === searchQuery
    );
    if (surah) {
      navigate(`/tafseer/${surah.number}/1`);
    }
  };

  const shareTafseer = () => {
    if (!tafseer || !surahNumber || !ayahNumber) return;
    const surah = surahs.find(s => s.number === parseInt(surahNumber));
    const text = `Tafseer Ibn Katheer - Surah ${surah?.englishName} (${surahNumber}:${ayahNumber})\n\n${ayahText}\n\nRead more at: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Tafseer Surah ${surah?.englishName} ${surahNumber}:${ayahNumber}`,
        text: text,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert("Tafseer link and text copied to clipboard!");
    }
  };

  const currentSurah = surahs.find(s => s.number === selectedSurah);

  const navigateAyah = (direction: 'next' | 'prev') => {
    if (!currentSurah) return;
    let nextAyah = selectedAyah;
    let nextSurah = selectedSurah;

    if (direction === 'next') {
      if (selectedAyah < currentSurah.numberOfAyahs) {
        nextAyah++;
      } else if (selectedSurah < 114) {
        nextSurah++;
        nextAyah = 1;
      }
    } else {
      if (selectedAyah > 1) {
        nextAyah--;
      } else if (selectedSurah > 1) {
        nextSurah--;
        const prevSurah = surahs.find(s => s.number === nextSurah);
        nextAyah = prevSurah?.numberOfAyahs || 1;
      }
    }

    navigate(`/tafseer/${nextSurah}/${nextAyah}`);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-3">
          <Book className="text-emerald-600" />
          Tafseer Ibn Katheer
        </h1>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search Surah or 2:255..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
          />
        </form>
      </div>

      {/* Breadcrumbs & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <nav className="flex items-center gap-2 text-sm text-zinc-500">
          <Link to="/tafseer" className="hover:text-emerald-600 transition-colors">Tafseer</Link>
          {currentSurah && (
            <>
              <ChevronRight size={14} />
              <span className="font-medium text-emerald-700 dark:text-emerald-400">{currentSurah.englishName}</span>
              <ChevronRight size={14} />
              <span className="font-medium">Ayah {selectedAyah}</span>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-sm font-medium hover:border-emerald-400 transition-all"
            >
              <Languages size={16} className="text-emerald-600" />
              <span>{currentLang.flag} {currentLang.name}</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors ${selectedLanguage === lang.id ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-bold' : 'text-zinc-600 dark:text-zinc-400'}`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={shareTafseer}
            className="p-2 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-xl hover:border-emerald-400 transition-all text-zinc-500 hover:text-emerald-600"
            title="Share Tafseer"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <Loader2 size={48} className="text-emerald-600 animate-spin mb-4" />
            <p className="text-zinc-500 font-medium">Fetching Tafseer data...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-[32px] p-12 text-center"
          >
            <AlertCircle size={48} className="text-rose-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-rose-900 dark:text-rose-100 mb-2">Oops! Something went wrong</h3>
            <p className="text-rose-700 dark:text-rose-400 mb-8 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => fetchTafseer(selectedSurah, selectedAyah, selectedLanguage)}
              className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all mx-auto"
            >
              <RefreshCw size={18} />
              Retry
            </button>
          </motion.div>
        ) : !surahNumber ? (
          <motion.div
            key="index"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {surahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => navigate(`/tafseer/${surah.number}/1`)}
                className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl hover:border-emerald-400 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                    {surah.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{surah.englishName}</h3>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest text-[10px]">{surah.revelationType}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-zinc-300 group-hover:text-emerald-600 transition-colors" />
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Ayah Card */}
            <div className="bg-emerald-600 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-emerald-900/20">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Book size={120} />
              </div>
              <div className="relative z-10 text-center">
                <div className="flex justify-center mb-4">
                  <div className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-xl p-1 border border-white/10">
                    <button
                      onClick={decreaseArabic}
                      disabled={arabicFontSize <= minArabicFont}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 disabled:opacity-30 transition-all font-bold"
                      title="Decrease font size"
                    >
                      A-
                    </button>
                    <button
                      onClick={resetArabic}
                      className="px-3 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-all text-xs font-bold"
                      title="Reset font size"
                    >
                      A {arabicFontSize}
                    </button>
                    <button
                      onClick={increaseArabic}
                      disabled={arabicFontSize >= maxArabicFont}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 disabled:opacity-30 transition-all font-bold"
                      title="Increase font size"
                    >
                      A+
                    </button>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                  <Star size={12} fill="currentColor" className="text-gold" />
                  Surah {currentSurah?.englishName} • Ayah {selectedAyah}
                </div>
                <p 
                  className="font-quran leading-loose mb-8 transition-all duration-200"
                  style={{ fontSize: `${arabicFontSize}px` }}
                >
                  {ayahText}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => navigate(`/quran/${selectedSurah}-${currentSurah?.englishName.toLowerCase().replace(/\s+/g, '-')}`)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-lg"
                  >
                    <ArrowLeft size={18} />
                    Back to Quran
                  </button>
                </div>
              </div>
            </div>

            {/* Translation Card */}
            {translationText && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Translation (Pickthall)</h4>
                <p className="text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                  {translationText}
                </p>
              </div>
            )}

            {/* Tafseer Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-emerald-50 dark:border-emerald-900/10 flex items-center justify-between bg-emerald-50/30 dark:bg-emerald-900/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                    <Book size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-100">Tafseer Ibn Katheer — Full Commentary</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Ibn Katheer</span>
                      <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Authentic Source</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-emerald-100/50 dark:bg-emerald-900/20 rounded-xl p-1 border border-emerald-200/50 dark:border-emerald-800/30">
                    <button
                      onClick={decreaseTafseer}
                      disabled={fontSize <= minFont}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 disabled:opacity-30 transition-all font-bold text-emerald-700 dark:text-emerald-400"
                      title="Decrease font size"
                    >
                      A-
                    </button>
                    <button
                      onClick={resetTafseer}
                      className="px-3 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 transition-all text-xs font-bold text-emerald-700 dark:text-emerald-400"
                      title="Reset font size"
                    >
                      A {fontSize}
                    </button>
                    <button
                      onClick={increaseTafseer}
                      disabled={fontSize >= maxFont}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 disabled:opacity-30 transition-all font-bold text-emerald-700 dark:text-emerald-400"
                      title="Increase font size"
                    >
                      A+
                    </button>
                  </div>
                  <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-widest">
                    {currentLang.name}
                  </div>
                </div>
              </div>
              <div className="p-8 md:p-12">
                <div 
                  className={`prose prose-emerald dark:prose-invert max-w-none leading-relaxed overflow-y-auto max-h-[600px] transition-all duration-200 ${currentLang.dir === 'rtl' ? 'font-urdu text-right' : ''}`}
                  dir={currentLang.dir}
                  style={{ 
                    fontSize: `${currentLang.dir === 'rtl' ? fontSize * 1.2 : fontSize}px`,
                    lineHeight: '1.8'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: (tafseer?.text || '').includes('<') 
                      ? (tafseer?.text || '') 
                      : (tafseer?.text || '').replace(/\n/g, '<br/>') 
                  }}
                />
              </div>
              
              {/* Pagination */}
              <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-emerald-50 dark:border-emerald-900/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {selectedAyah > 1 ? (
                    <button
                      onClick={() => navigateAyah('prev')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                    >
                      <ArrowLeft size={18} />
                      Previous Ayah
                    </button>
                  ) : selectedSurah > 1 ? (
                    <button
                      onClick={() => {
                        const prevSurah = surahs.find(s => s.number === selectedSurah - 1);
                        if (prevSurah) navigate(`/tafseer/${selectedSurah - 1}/${prevSurah.numberOfAyahs}`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                    >
                      <ArrowLeft size={18} />
                      Previous Surah
                    </button>
                  ) : null}
                </div>

                <div className="hidden md:flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    {selectedSurah}:{selectedAyah}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {currentSurah && selectedAyah < currentSurah.numberOfAyahs ? (
                    <button
                      onClick={() => navigateAyah('next')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                    >
                      Next Ayah
                      <ArrowRight size={18} />
                    </button>
                  ) : selectedSurah < 114 ? (
                    <button
                      onClick={() => navigate(`/tafseer/${selectedSurah + 1}/1`)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                    >
                      Next Surah
                      <ArrowRight size={18} />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
