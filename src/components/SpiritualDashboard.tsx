import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, BookOpen, Star, ChevronRight, Zap, Share2, Download, Copy, MessageCircle, Twitter, Facebook, Loader2, Search } from 'lucide-react';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes, SunnahTimes } from 'adhan';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, getDoc } from '../lib/firebase';
import { StreakTracker } from './StreakTracker';

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export const SpiritualDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [location, setLocation] = useState<string>(localStorage.getItem('user_city') || 'Detecting...');
  const [isDetecting, setIsDetecting] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [dailyVerse, setDailyVerse] = useState<{ text: string; translation: string; surah: string } | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [stats, setStats] = useState({ azkar: 0, quran: 0 });
  const [showShare, setShowShare] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedCoords = localStorage.getItem('user_coords');
    if (savedCoords) {
      const { lat, lon } = JSON.parse(savedCoords);
      calculatePrayers(lat, lon);
      if (!localStorage.getItem('user_city')) {
        reverseGeocode(lat, lon);
      }
    } else {
      detectLocation();
    }
    fetchDailyVerse();
    if (user) fetchStats();
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (nextPrayer) {
        updateCountdown();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nextPrayer]);

  const detectLocation = () => {
    setIsDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          localStorage.setItem('user_coords', JSON.stringify({ lat: latitude, lon: longitude }));
          calculatePrayers(latitude, longitude);
          await reverseGeocode(latitude, longitude);
          setIsDetecting(false);
        },
        () => {
          setIsDetecting(false);
          setShowManualInput(true);
        }
      );
    } else {
      setIsDetecting(false);
      setShowManualInput(true);
    }
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const city = res.data.address.city || res.data.address.town || res.data.address.state || 'Unknown City';
      const country = res.data.address.country || '';
      const fullLocation = `${city}${country ? ', ' + country : ''}`;
      setLocation(fullLocation);
      localStorage.setItem('user_city', fullLocation);
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    }
  };

  const calculatePrayers = (lat: number, lon: number) => {
    const coords = new Coordinates(lat, lon);
    const params = CalculationMethod.MuslimWorldLeague();
    const date = new Date();
    const adhanTimes = new AdhanPrayerTimes(coords, date, params);

    const formatTime = (time: Date) => {
      return time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    };

    const timings = {
      Fajr: formatTime(adhanTimes.fajr),
      Dhuhr: formatTime(adhanTimes.dhuhr),
      Asr: formatTime(adhanTimes.asr),
      Maghrib: formatTime(adhanTimes.maghrib),
      Isha: formatTime(adhanTimes.isha),
    };

    setPrayerTimes(timings);
    calculateNextPrayer(timings);
  };

  const handleManualSearch = async () => {
    if (!manualCity) return;
    setIsDetecting(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualCity)}&limit=1`);
      if (res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        localStorage.setItem('user_coords', JSON.stringify({ lat: latitude, lon: longitude }));
        localStorage.setItem('user_city', display_name.split(',')[0]);
        setLocation(display_name.split(',')[0]);
        calculatePrayers(latitude, longitude);
        setShowManualInput(false);
      }
    } catch (err) {
      console.error('Manual search error:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  const updateCountdown = () => {
    if (!nextPrayer) return;
    const now = new Date();
    const [hours, minutes] = nextPrayer.time.split(':').map(Number);
    const target = new Date();
    target.setHours(hours, minutes, 0);
    
    if (target < now) {
      target.setDate(target.getDate() + 1);
    }

    const diff = target.getTime() - now.getTime();
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
  };

  const fetchStats = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        const azkar = data.stats?.tasbeehCount || 0;
        const quran = data.stats?.versesRead || 0;
        setStats({ azkar, quran });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const calculateNextPrayer = (timings: any) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { name: 'Fajr', time: timings.Fajr },
      { name: 'Dhuhr', time: timings.Dhuhr },
      { name: 'Asr', time: timings.Asr },
      { name: 'Maghrib', time: timings.Maghrib },
      { name: 'Isha', time: timings.Isha },
    ];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      if (prayerMinutes > currentTime) {
        setNextPrayer(prayer);
        return;
      }
    }
    setNextPrayer({ name: 'Fajr', time: timings.Fajr });
  };

  const fetchDailyVerse = async () => {
    try {
      const randomAyah = Math.floor(Math.random() * 6236) + 1;
      const [arabic, english] = await Promise.all([
        axios.get(`https://api.alquran.cloud/v1/ayah/${randomAyah}`),
        axios.get(`https://api.alquran.cloud/v1/ayah/${randomAyah}/en.sahih`)
      ]);
      setDailyVerse({
        text: arabic.data.data.text,
        translation: english.data.data.text,
        surah: arabic.data.data.surah.englishName
      });
    } catch (err) {
      console.error('Error fetching daily verse:', err);
    }
  };

  const handleShare = (platform: string) => {
    if (!dailyVerse) return;
    const text = `"${dailyVerse.text}" - ${dailyVerse.translation} (Surah ${dailyVerse.surah})`;
    const url = window.location.href;

    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(text);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
    }
    setShowShare(false);
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current || !dailyVerse) return;
    
    try {
      setIsDownloading(true);
      setShowShare(false);
      
      // Small delay to ensure share menu is closed
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#064e3b', // emerald-900
        style: {
          borderRadius: '0', // Remove border radius for the download
        }
      });
      
      const link = document.createElement('a');
      link.download = `Ayah-${dailyVerse.surah}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error downloading image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      {/* Main Hero Card */}
      <motion.div 
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2 relative rounded-[40px] overflow-hidden bg-emerald-900 text-white p-8 md:p-12 shadow-2xl shadow-emerald-900/20 islamic-pattern"
      >
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current scale-150 translate-x-1/4 translate-y-1/4">
            <path d="M50 0 L100 50 L50 100 L0 50 Z" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-800/50 rounded-xl flex items-center justify-center">
                <Star className="text-gold" size={20} fill="currentColor" />
              </div>
              <span className="text-emerald-300 font-bold uppercase tracking-widest text-xs">Daily Inspiration</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowShare(!showShare)}
                className="flex items-center gap-2 px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold rounded-xl transition-all text-xs font-bold border border-gold/20"
              >
                <Share2 size={14} />
                Share Ayah
              </button>
              
              {showShare && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-emerald-100 dark:border-emerald-900/30 p-2 z-50 overflow-hidden"
                >
                  <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 transition-colors">
                    <Copy size={14} /> Copy Link
                  </button>
                  <button onClick={() => handleShare('whatsapp')} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 transition-colors">
                    <MessageCircle size={14} /> WhatsApp
                  </button>
                  <button onClick={() => handleShare('twitter')} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 transition-colors">
                    <Twitter size={14} /> Twitter
                  </button>
                  <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 transition-colors">
                    <Facebook size={14} /> Facebook
                  </button>
                  <button 
                    onClick={handleDownloadImage}
                    disabled={isDownloading}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl text-xs font-medium text-gold transition-colors border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-3 disabled:opacity-50"
                  >
                    {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    {isDownloading ? 'Generating...' : 'Download Image'}
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {dailyVerse ? (
            <div className="mb-8">
              <p className="text-3xl md:text-5xl font-quran leading-relaxed mb-6 text-emerald-50 text-center md:text-right">
                {dailyVerse.text}
              </p>
              <p className="text-emerald-100/70 text-lg italic mb-2 leading-relaxed">
                "{dailyVerse.translation}"
              </p>
              <p className="text-gold font-bold text-sm uppercase tracking-wider">
                — Surah {dailyVerse.surah}
              </p>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-pulse text-gold">Loading daily wisdom...</div>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/quran')}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 group shadow-lg shadow-emerald-950/20"
            >
              Continue Journey
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Sidebar Widgets */}
      <div className="space-y-6">
        {/* Prayer Times Widget */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-[32px] p-6 shadow-sm border-gold/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Prayer Times</h3>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">
                  <MapPin size={10} />
                  {isDetecting ? (
                    <span className="flex items-center gap-1">
                      <Loader2 size={8} className="animate-spin" />
                      Detecting...
                    </span>
                  ) : location}
                </div>
              </div>
            </div>
            {nextPrayer && (
              <div className="text-right">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Next: {nextPrayer.name}</p>
                <p className="text-sm font-mono font-bold text-gold">{countdown}</p>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showManualInput && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter city manually..."
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs border border-emerald-100 dark:border-emerald-900/30 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button 
                    onClick={handleManualSearch}
                    className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    <Search size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {prayerTimes ? (
              Object.entries(prayerTimes).map(([name, time]) => (
                <div 
                  key={name}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                    nextPrayer?.name === name 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 scale-[1.02] border border-gold/30' 
                      : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <span className="font-bold text-sm">{name}</span>
                  <span className="font-mono text-sm">{time}</span>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setShowManualInput(!showManualInput)}
            className="w-full mt-4 text-[10px] text-zinc-400 hover:text-emerald-600 transition-colors font-bold uppercase tracking-widest"
          >
            {showManualInput ? 'Cancel' : 'Change City'}
          </button>
        </motion.div>

        {/* Progress Widget */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-[32px] p-6 shadow-xl border-gold/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Spiritual Progress</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-2xl font-bold mb-1 text-emerald-700 dark:text-emerald-400">{stats.quran}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Ayahs</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-2xl font-bold mb-1 text-emerald-700 dark:text-emerald-400">{stats.azkar}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Azkar</p>
            </div>
          </div>
          
          {!user && (
            <p className="text-[10px] mt-4 text-zinc-400 text-center italic">
              Sign in to track your progress
            </p>
          )}
        </motion.div>

        {/* Streak Tracker Widget */}
        <StreakTracker />
      </div>
    </div>
  );
};
