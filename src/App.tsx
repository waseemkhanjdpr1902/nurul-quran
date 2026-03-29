import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-32 md:pb-8 animate-fade-up">
      <BismillahHeader />
      <HijriCalendar />
      <div className="my-8">
        <SearchBar />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <SpiritualDashboard />
        </div>
        <div className="space-y-8">
          <TasbeehCounter />
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { icon: BookOpen, title: 'Quranic Study', desc: 'Read and listen to the Holy Quran with translations.', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', to: '/quran' },
          { icon: Heart, title: 'Tasawwuf', desc: 'Explore the spiritual path and purification of the soul.', color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400', to: '/tasawwuf' },
          { icon: Moon, title: 'Daily Azkar', desc: 'Keep your tongue moist with the remembrance of Allah.', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400', to: '/azkar' },
          { icon: Shield, title: 'Hadith', desc: 'Authentic traditions and sayings of the Prophet (PBUH).', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400', to: '/hadith' },
        ].map((f, i) => (
          <motion.div 
            key={i}
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
      <div className="text-center py-16 border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-3xl font-arabic text-emerald-700 dark:text-emerald-400 mb-6 leading-relaxed">
          "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ"
        </p>
        <p className="text-zinc-500 italic">"Verily, in the remembrance of Allah do hearts find rest." (Quran 13:28)</p>
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
      <div className="p-8 max-w-4xl mx-auto text-center py-24">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserIcon className="text-zinc-400" size={32} />
        </div>
        <h1 className="text-3xl font-bold mb-4">Sign in to view your profile</h1>
        <p className="text-zinc-500 mb-8">Track your spiritual progress and save your favorite content.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Spiritual Profile</h1>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <div className="grid gap-6">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 text-4xl font-bold border-4 border-white dark:border-zinc-800 shadow-lg">
              {user.email?.[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {profile?.full_name || user.displayName || 'Spiritual Seeker'}
              </h2>
              <p className="text-zinc-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">
                  Active Seeker
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-center border border-zinc-100 dark:border-zinc-800">
              <p className="text-3xl font-bold text-emerald-600 mb-1">{stats.azkar}</p>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Azkar Done</p>
            </div>
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-center border border-zinc-100 dark:border-zinc-800">
              <p className="text-3xl font-bold text-emerald-600 mb-1">{stats.quran}</p>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Ayahs Read</p>
            </div>
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-center border border-zinc-100 dark:border-zinc-800">
              <p className="text-3xl font-bold text-emerald-600 mb-1">Free</p>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Plan</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Heart size={20} className="text-emerald-600" />
            Your Bookmarks
          </h3>
          {bookmarks.length > 0 ? (
            <div className="space-y-4">
              {bookmarks.map((b) => (
                <div key={b.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-widest">
                      {b.type}
                    </span>
                    <span className="text-[10px] text-zinc-400">{new Date(b.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm font-medium dark:text-zinc-200 line-clamp-2">
                    {b.metadata?.text || 'No preview available'}
                  </p>
                  <p className="text-[10px] text-emerald-600 mt-2 font-bold uppercase tracking-widest">
                    {b.type === 'quran' ? `${b.metadata?.surahName} - Ayah ${b.metadata?.ayahNumber}` : `${b.metadata?.book} - Hadith ${b.metadata?.hadithNumber}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm italic">You haven't bookmarked anything yet.</p>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
              <div>
                <p className="font-bold">Email Notifications</p>
                <p className="text-xs text-zinc-500">Daily reminders and spiritual insights</p>
              </div>
              <div className="w-12 h-6 bg-emerald-600 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-white dark:bg-zinc-900 border-t border-emerald-100 dark:border-emerald-900/30 py-12 px-8">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Star size={24} fill="currentColor" className="text-gold" />
          </div>
          <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Nurul Quran</span>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-md">
          Spreading the light of Quranic wisdom and spiritual guidance. Join our journey towards inner peace and divine connection.
        </p>
      </div>
      
      <div>
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-6 uppercase tracking-widest text-xs">Quick Links</h4>
        <ul className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
          <li><a href="/quran" className="hover:text-emerald-600 transition-colors">Holy Quran</a></li>
          <li><a href="/hadith" className="hover:text-emerald-600 transition-colors">Hadith Library</a></li>
          <li><a href="/about.html" className="hover:text-emerald-600 transition-colors">About Us</a></li>
          <li><a href="/contact.html" className="hover:text-emerald-600 transition-colors">Contact</a></li>
          <li><a href="/privacy-policy.html" className="hover:text-emerald-600 transition-colors">Privacy Policy</a></li>
          <li><a href="/donate" className="hover:text-emerald-600 transition-colors">Support Us</a></li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-6 uppercase tracking-widest text-xs">Connect With Us</h4>
        <div className="flex gap-4 mb-6">
          <a href="#" className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
            <Twitter size={18} />
          </a>
          <a href="#" className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
            <Facebook size={18} />
          </a>
          <a href="#" className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
            <Instagram size={18} />
          </a>
          <a href="#" className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
            <Youtube size={18} />
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Mail size={16} />
          <span>contact@nurulquran.com</span>
        </div>
      </div>
    </div>
    <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400">
      <p>© {new Date().getFullYear()} Nurul Quran. All rights reserved. Made with ❤️ for the Ummah.</p>
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
    <div 
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Navbar />
      <main className="md:ml-64 min-h-screen pt-16 md:pt-0">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 md:p-12 max-w-lg w-full shadow-2xl border border-emerald-100 dark:border-emerald-900/30 text-center relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />

              <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-emerald-900/20">
                <Star size={40} fill="currentColor" className="text-gold" />
              </div>

              <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">Welcome to Nurul Quran</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                Spreading the light of Quranic wisdom and spiritual guidance. We're honored to have you join our community.
              </p>

              <div className="space-y-4">
                <button
                  onClick={closeWelcome}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/20"
                >
                  Start Your Journey
                </button>
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
                  Spiritual Guidance for the Modern World
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
