import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { QuranPage } from './components/QuranPage';
import { TafseerPage } from './components/TafseerPage';
import { HadithPage } from './components/HadithPage';
import { AzkarPage } from './components/AzkarPage';
import { TasawwufPage } from './components/TasawwufPage';
import { DonatePage } from './components/DonatePage';
import { MissionPage } from './components/MissionPage';
import { AIChatGuide } from './components/AIChatGuide';
import { HalalStocksPage } from './components/finance/HalalStocksPage';
import { ZakatCalculatorPage } from './components/finance/ZakatCalculatorPage';
import { InvestmentGuidePage } from './components/finance/InvestmentGuidePage';
import { QAPage } from './components/community/QAPage';
import { QADetailPage } from './components/community/QADetailPage';
import { AnonymousPage } from './components/community/AnonymousPage';
import { AdminAnonymousPage } from './components/community/AdminAnonymousPage';
import { GroupsPage } from './components/community/GroupsPage';
import { GroupDetailPage } from './components/community/GroupDetailPage';
import { SpiritualDashboard } from './components/SpiritualDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Moon, Star, Heart, BookOpen, Shield, LogOut, Settings, User as UserIcon, Twitter, Facebook, Instagram, Youtube, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { db, doc, getDoc, collection, query, where, getDocs } from './lib/firebase';
import { BismillahHeader } from './components/BismillahHeader';
import { HijriCalendar } from './components/HijriCalendar';
import { SearchBar } from './components/SearchBar';
import { TasbeehCounter } from './components/TasbeehCounter';
import SplashPage from './components/SplashPage';
import AppBackground from './components/AppBackground';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div id="home-page" className="p-4 md:p-8 max-w-6xl mx-auto pb-32 md:pb-8 animate-fade-up">
      <BismillahHeader />
      <HijriCalendar />
      <div id="home-search-container" className="my-8">
        <SearchBar />
      </div>
      
      <div id="home-dashboard-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div id="home-dashboard-main" className="lg:col-span-2">
          <SpiritualDashboard />
        </div>
        <div id="home-dashboard-sidebar" className="space-y-8">
          <TasbeehCounter />
        </div>
      </div>

      {/* Features Grid */}
      <div id="home-features-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { id: 'quranic-study', icon: BookOpen, title: 'Quranic Study', desc: 'Read and listen to the Holy Quran with translations.', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', to: '/quran' },
          { id: 'tasawwuf', icon: Heart, title: 'Tasawwuf', desc: 'Explore the spiritual path and purification of the soul.', color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400', to: '/tasawwuf' },
          { id: 'daily-azkar', icon: Moon, title: 'Daily Azkar', desc: 'Keep your tongue moist with the remembrance of Allah.', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400', to: '/azkar' },
          { id: 'hadith', icon: Shield, title: 'Hadith', desc: 'Authentic traditions and sayings of the Prophet (PBUH).', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400', to: '/hadith' },
        ].map((f, i) => (
          <motion.div 
            key={i}
            id={`home-feature-${f.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(f.to)}
            className="p-8 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 hover:shadow-xl transition-all group islamic-pattern cursor-pointer"
          >
            <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <f.icon size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white group-hover:text-gold transition-colors">{f.title}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Quote Section */}
      <div id="home-quote-section" className="text-center py-16 border-t border-zinc-100 dark:border-zinc-800">
        <p id="home-quote-arabic" className="text-3xl font-arabic text-emerald-700 dark:text-emerald-400 mb-6 leading-relaxed">
          "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ"
        </p>
        <p id="home-quote-translation" className="text-zinc-500 italic">"Verily, in the remembrance of Allah do hearts find rest." (Quran 13:28)</p>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<any>(null);
  const [stats, setStats] = React.useState({ azkar: 0, quran: 0 });
  const [bookmarks, setBookmarks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  React.useEffect(() => {
    if (user) {
      fetchProfileAndStats();
    }
  }, [user]);

  const fetchProfileAndStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // Fetch profile and stats from the same user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfile({
          full_name: data.displayName,
          ...data
        });
        setStats({
          azkar: data.stats?.tasbeehCount || 0,
          quran: data.stats?.versesRead || 0
        });
      }

      // Fetch bookmarks
      const bq = query(collection(db, 'bookmarks'), where('user_id', '==', user.uid));
      const bSnap = await getDocs(bq);
      setBookmarks(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div id="profile-signin-prompt" className="p-8 max-w-4xl mx-auto text-center py-24">
        <div id="profile-signin-icon" className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserIcon className="text-zinc-400" size={32} />
        </div>
        <h1 id="profile-signin-title" className="text-3xl font-bold mb-4">Sign in to view your profile</h1>
        <p id="profile-signin-desc" className="text-zinc-500 mb-8">Track your spiritual progress and save your favorite content.</p>
      </div>
    );
  }

  return (
    <div id="profile-page" className="p-8 max-w-4xl mx-auto">
      <div id="profile-header" className="flex items-center justify-between mb-8">
        <h1 id="profile-title" className="text-3xl font-bold">Your Spiritual Profile</h1>
        <button
          id="profile-sign-out"
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <div className="grid gap-6">
        <div id="profile-main-card" className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
          <div className="flex items-center gap-6 mb-8">
            <div id="profile-avatar" className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 text-4xl font-bold border-4 border-white dark:border-zinc-800 shadow-lg">
              {user.email?.[0].toUpperCase()}
            </div>
            <div>
              <h2 id="profile-display-name" className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {profile?.full_name || user.displayName || 'Spiritual Seeker'}
              </h2>
              <p id="profile-email-display" className="text-zinc-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span id="profile-badge-active" className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">
                  Active Seeker
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div id="profile-stats-azkar" className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-center border border-zinc-100 dark:border-zinc-800">
              <p id="profile-stats-azkar-value" className="text-3xl font-bold text-emerald-600 mb-1">{stats.azkar}</p>
              <p id="profile-stats-azkar-label" className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Azkar Done</p>
            </div>
            <div id="profile-stats-quran" className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-center border border-zinc-100 dark:border-zinc-800">
              <p id="profile-stats-quran-value" className="text-3xl font-bold text-emerald-600 mb-1">{stats.quran}</p>
              <p id="profile-stats-quran-label" className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Ayahs Read</p>
            </div>
            <div id="profile-stats-plan" className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-center border border-zinc-100 dark:border-zinc-800">
              <p id="profile-stats-plan-value" className="text-3xl font-bold text-emerald-600 mb-1">{profile?.is_pro ? 'Pro' : 'Free'}</p>
              <p id="profile-stats-plan-label" className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Plan</p>
            </div>
          </div>
        </div>

        <div id="profile-bookmarks-card" className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
          <h3 id="profile-bookmarks-title" className="text-xl font-bold mb-6 flex items-center gap-2">
            <Heart size={20} className="text-emerald-600" />
            Your Bookmarks
          </h3>
          {bookmarks.length > 0 ? (
            <div id="profile-bookmarks-list" className="space-y-4">
              {bookmarks.map((b) => (
                <div key={b.id} id={`profile-bookmark-${b.id}`} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span id={`profile-bookmark-type-${b.id}`} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-widest">
                      {b.type}
                    </span>
                    <span id={`profile-bookmark-date-${b.id}`} className="text-[10px] text-zinc-400">{new Date(b.created_at).toLocaleDateString()}</span>
                  </div>
                  <p id={`profile-bookmark-text-${b.id}`} className="text-sm font-medium dark:text-zinc-200 line-clamp-2">
                    {b.metadata?.text || 'No preview available'}
                  </p>
                  <p id={`profile-bookmark-meta-${b.id}`} className="text-[10px] text-emerald-600 mt-2 font-bold uppercase tracking-widest">
                    {b.type === 'quran' ? `${b.metadata?.surahName} - Ayah ${b.metadata?.ayahNumber}` : `${b.metadata?.book} - Hadith ${b.metadata?.hadithNumber}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p id="profile-bookmarks-empty" className="text-zinc-500 text-sm italic">You haven't bookmarked anything yet.</p>
          )}
        </div>

        <div id="profile-settings-card" className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
          <div className="space-y-4">
            <div id="profile-setting-notifications" className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
              <div>
                <p id="profile-setting-notifications-title" className="font-bold">Email Notifications</p>
                <p id="profile-setting-notifications-desc" className="text-xs text-zinc-500">Daily reminders and spiritual insights</p>
              </div>
              <div id="profile-setting-notifications-toggle" className="w-12 h-6 bg-emerald-600 rounded-full relative">
                <div id="profile-setting-notifications-knob" className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer id="app-footer" className="bg-white dark:bg-zinc-900 border-t border-emerald-100 dark:border-emerald-900/30 py-12 px-8">
    <div id="footer-content" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div id="footer-brand-section" className="col-span-1 md:col-span-2">
        <div id="footer-logo" className="flex items-center gap-3 mb-6">
          <div id="footer-logo-icon" className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Star size={24} fill="currentColor" className="text-gold" />
          </div>
          <span id="footer-logo-text" className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Nurul Quran</span>
        </div>
        <p id="footer-description" className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-md">
          Spreading the light of Quranic wisdom and spiritual guidance. Join our journey towards inner peace and divine connection.
        </p>
      </div>
      
      <div id="footer-links-section">
        <h4 id="footer-links-title" className="font-bold text-zinc-900 dark:text-zinc-100 mb-6 uppercase tracking-widest text-xs">Quick Links</h4>
        <ul id="footer-links-list" className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
          <li><Link id="footer-link-quran" to="/quran" className="hover:text-emerald-600 transition-colors">Holy Quran</Link></li>
          <li><Link id="footer-link-hadith" to="/hadith" className="hover:text-emerald-600 transition-colors">Hadith Library</Link></li>
          <li><Link id="footer-link-halal-stocks" to="/finance/halal-stocks" className="hover:text-emerald-600 transition-colors">Halal Stocks</Link></li>
          <li><Link id="footer-link-community" to="/community/qa" className="hover:text-emerald-600 transition-colors">Community Board</Link></li>
          <li><Link id="footer-link-about" to="/mission" className="hover:text-emerald-600 transition-colors">About Us</Link></li>
          <li><Link id="footer-link-contact" to="/mission" className="hover:text-emerald-600 transition-colors">Contact</Link></li>
          <li><Link id="footer-link-privacy" to="/mission" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
          <li><Link id="footer-link-donate" to="/donate" className="hover:text-emerald-600 transition-colors">Support Us</Link></li>
        </ul>
      </div>

      <div id="footer-social-section">
        <h4 id="footer-social-title" className="font-bold text-zinc-900 dark:text-zinc-100 mb-6 uppercase tracking-widest text-xs">Connect With Us</h4>
        <div id="footer-social-links" className="flex gap-4 mb-6">
          <a id="footer-social-twitter" href="#" className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
            <Twitter size={18} />
          </a>
          <a id="footer-social-facebook" href="#" className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
            <Facebook size={18} />
          </a>
          <a id="footer-social-instagram" href="#" className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
            <Instagram size={18} />
          </a>
          <a id="footer-social-youtube" href="#" className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
            <Youtube size={18} />
          </a>
        </div>
        <div id="footer-contact-info" className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Mail id="footer-contact-icon" size={16} />
          <span id="footer-contact-email">contact@nurulquran.com</span>
        </div>
      </div>
    </div>
    <div id="footer-bottom" className="max-w-6xl mx-auto mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400">
      <p id="footer-copyright">© {new Date().getFullYear()} Nurul Quran. All rights reserved. Made with ❤️ for the Ummah.</p>
    </div>
  </footer>
);

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);
  const [showWelcome, setShowWelcome] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(true);

  // Optimize: Only show splash once per session
  React.useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('has_seen_splash');
    if (hasSeenSplash) {
      setShowSplash(false);
    } else {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('has_seen_splash', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnter = () => {
    setShowSplash(false);
    sessionStorage.setItem('has_seen_splash', 'true');
  };

  React.useEffect(() => {
    const hasVisited = localStorage.getItem('has_visited');
    if (!hasVisited) {
      setShowWelcome(true);
    }
  }, []);

  const closeWelcome = () => {
    localStorage.setItem('has_visited', 'true');
    setShowWelcome(false);
  };

  React.useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Home | Nurul Quran',
      '/quran': 'Holy Quran | Nurul Quran',
      '/tafseer': 'Tafseer Ibn Katheer | Nurul Quran',
      '/hadith': 'Hadith Library | Nurul Quran',
      '/azkar': 'Daily Azkar | Nurul Quran',
      '/tasawwuf': 'Tasawwuf | Nurul Quran',
      '/donate': 'Donate | Nurul Quran',
      '/profile': 'My Profile | Nurul Quran',
      '/mission': 'Mission & Privacy | Nurul Quran',
      '/finance/halal-stocks': 'Halal Stocks | Nurul Quran',
      '/finance/zakat-calculator': 'Zakat Calculator | Nurul Quran',
      '/finance/investment-guide': 'Investment Guide | Nurul Quran',
    };
    
    // Only set static titles if not on a dynamic route that handles its own SEO
    if (!location.pathname.startsWith('/quran/')) {
      document.title = titles[location.pathname] || 'Nurul Quran';
    }
  }, [location]);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const routes = ['/', '/quran', '/hadith', '/azkar', '/tasawwuf', '/donate', '/profile', '/finance/halal-stocks', '/finance/zakat-calculator', '/finance/investment-guide'];
    const currentPath = window.location.pathname;
    const currentIndex = routes.indexOf(currentPath);

    if (isLeftSwipe && currentIndex < routes.length - 1) {
      navigate(routes[currentIndex + 1]);
    }
    if (isRightSwipe && currentIndex > 0) {
      navigate(routes[currentIndex - 1]);
    }
  };

  return (
    <>
      <AppBackground />
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[9999]"
          >
            <SplashPage onEnter={handleEnter} />
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        id="app-root"
        className="min-h-screen text-white/90 font-sans"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
      <Navbar />
      <main id="main-content" className="min-h-screen pt-[70px]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quran" element={<QuranPage />} />
          <Route path="/quran/:surahSlug" element={<QuranPage />} />
          <Route path="/tafseer" element={<TafseerPage />} />
          <Route path="/tafseer/:surahNumber/:ayahNumber" element={<TafseerPage />} />
          <Route path="/hadith" element={<HadithPage />} />
          <Route path="/azkar" element={<AzkarPage />} />
          <Route path="/tasawwuf" element={<TasawwufPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<ProfilePage />} />
          <Route path="/mission" element={<MissionPage />} />
          <Route path="/finance/halal-stocks" element={<HalalStocksPage />} />
          <Route path="/finance/zakat-calculator" element={<ZakatCalculatorPage />} />
          <Route path="/finance/investment-guide" element={<InvestmentGuidePage />} />
          
          {/* Community Routes */}
          <Route path="/community/qa" element={<QAPage />} />
          <Route path="/community/qa/:questionId" element={<QADetailPage />} />
          <Route path="/community/anonymous" element={<AnonymousPage />} />
          <Route path="/admin/anonymous" element={<AdminAnonymousPage />} />
          <Route path="/community/groups" element={<GroupsPage />} />
          <Route path="/community/groups/:groupId" element={<GroupDetailPage />} />
        </Routes>
        <Footer />
      </main>
      <AIChatGuide />

      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            id="welcome-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md"
          >
            <motion.div
              id="welcome-modal-content"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 md:p-12 max-w-lg w-full shadow-2xl border border-emerald-100 dark:border-emerald-900/30 text-center relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />

              <div id="welcome-modal-icon" className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-emerald-900/20">
                <Star size={40} fill="currentColor" className="text-gold" />
              </div>

              <h2 id="welcome-modal-title" className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">Welcome to Nurul Quran</h2>
              <p id="welcome-modal-description" className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                Spreading the light of Quranic wisdom and spiritual guidance. We're honored to have you join our community.
              </p>

              <div className="space-y-4">
                <button
                  id="welcome-modal-start"
                  onClick={closeWelcome}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/20"
                >
                  Start Your Journey
                </button>
                <p id="welcome-modal-footer-text" className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
                  Spiritual Guidance for the Modern World
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}
