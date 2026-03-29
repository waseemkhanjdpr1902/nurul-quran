import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Quote, Compass, Heart, HeartHandshake, User, LogIn, LogOut, Star, Shield, IndianRupee, Calculator, TrendingUp, Book, Users, MessageSquare, HelpCircle, Lock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { useNavigate } from 'react-router-dom';
import { DarkModeToggle } from './DarkModeToggle';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const mainNavItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/quran', icon: BookOpen, label: 'Quran' },
    { to: '/tafseer', icon: Book, label: 'Tafseer' },
    { to: '/hadith', icon: Quote, label: 'Hadith' },
    { to: '/azkar', icon: Compass, label: 'Azkar' },
    { to: '/tasawwuf', icon: Heart, label: 'Tasawwuf' },
  ];

  const financeNavItems = [
    { to: '#ai-chat', icon: MessageSquare, label: 'AI Chat', isAction: true },
    { to: '/finance/halal-stocks', icon: TrendingUp, label: 'Halal Stocks' },
    { to: '/finance/zakat-calculator', icon: Calculator, label: 'Zakat Calc' },
    { to: '/finance/investment-guide', icon: Book, label: 'Invest Guide' },
  ];

  const communityNavItems = [
    { to: '/community/qa', icon: HelpCircle, label: 'Q&A Board' },
    { to: '/community/anonymous', icon: Lock, label: 'Anonymous' },
    { to: '/community/groups', icon: Users, label: 'Groups' },
  ];

  const otherNavItems = [
    { to: '/about.html', icon: Shield, label: 'About' },
    { to: '/contact.html', icon: Mail, label: 'Contact' },
    { to: '/privacy-policy.html', icon: Lock, label: 'Privacy' },
    { to: '/donate', icon: HeartHandshake, label: 'Donate' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-white dark:bg-zinc-900 border-r border-emerald-100 dark:border-emerald-900/30 h-screen fixed left-0 top-0 p-6 z-50">
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-none">
              <Star size={24} fill="currentColor" className="text-gold" />
            </div>
            <span className="text-xl font-bold text-emerald-900 dark:text-emerald-100">Nurul Quran</span>
          </div>
          <DarkModeToggle />
        </div>
        
        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                    : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'}
                `}
              >
                <item.icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="space-y-1">
            <div className="px-4 mb-2 flex items-center gap-2">
              <IndianRupee size={14} className="text-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Finance</span>
            </div>
            {financeNavItems.map((item) => (
              (item as any).isAction ? (
                <button
                  key={item.label}
                  onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chat'))}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] w-full text-left"
                >
                  <item.icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group
                    ${isActive 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                      : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'}
                  `}
                >
                  <item.icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              )
            ))}
          </div>

          <div className="space-y-1">
            <div className="px-4 mb-2 flex items-center gap-2">
              <Users size={14} className="text-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Community</span>
            </div>
            {communityNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                    : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'}
                `}
              >
                <item.icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="space-y-1">
            {otherNavItems.map((item) => (
              item.to.endsWith('.html') ? (
                <a
                  key={item.to}
                  href={item.to}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  <item.icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm">{item.label}</span>
                </a>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group
                    ${isActive 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                      : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'}
                  `}
                >
                  <item.icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              )
            ))}
          </div>
        </div>

        {!user && (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
          >
            <LogIn size={20} />
            <span>Sign In</span>
          </button>
        )}

        {user && (
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 group relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.email?.[0].toUpperCase()}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 truncate">
                  {user.displayName || 'Seeker'}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-all"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-b border-emerald-100 dark:border-emerald-900/30 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <Star size={20} className="text-gold" fill="currentColor" />
          <span className="font-bold text-emerald-900 dark:text-emerald-100">Nurul Quran</span>
        </div>
        <DarkModeToggle />
      </div>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-emerald-100 dark:border-emerald-900/30 px-2 py-3 z-40 flex justify-around items-center">
        {[...mainNavItems.slice(0, 4), ...financeNavItems.slice(0, 2)].map((item) => (
          (item as any).isAction ? (
            <button
              key={item.label}
              onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chat'))}
              className="flex flex-col items-center gap-1 transition-colors text-zinc-400 hover:text-emerald-600"
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ) : item.to.endsWith('.html') ? (
            <a
              key={item.to}
              href={item.to}
              className="flex flex-col items-center gap-1 transition-colors text-zinc-400 hover:text-emerald-600"
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center gap-1 transition-colors
                ${isActive ? 'text-emerald-600' : 'text-zinc-400'}
              `}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          )
        ))}
      </nav>
    </>
  );
};
