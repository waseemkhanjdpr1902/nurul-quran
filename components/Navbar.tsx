"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BookOpen, Quote, Compass, Heart, HeartHandshake, User, LogIn, LogOut, Star, Shield, IndianRupee, Calculator, TrendingUp, Book, Users, MessageSquare, HelpCircle, Lock, Mail, Bot, ChevronDown, LayoutDashboard, Menu, X, Settings, Clock, Calendar, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { DarkModeToggle } from './DarkModeToggle';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  React.useEffect(() => {
    const handleOpenAuth = () => setIsAuthModalOpen(true);
    window.addEventListener('open-auth-modal', handleOpenAuth);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const mainNavItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/quran', icon: BookOpen, label: 'Quran' },
    { to: '/tafseer', icon: Book, label: 'Tafseer' },
    { to: '/hadith', icon: Quote, label: 'Hadith' },
    { to: '/courses', icon: GraduationCap, label: 'Courses' },
    { to: '/azkar', icon: Compass, label: 'Azkar' },
    { to: '/tasawwuf', icon: Heart, label: 'Tasawwuf' },
  ];

  const financeNavItems = [
    { to: '#ai-chat', icon: Bot, label: 'AI Chat', isAction: true },
    { to: '/finance/halal-stocks', icon: TrendingUp, label: 'Halal Stocks' },
    { to: '/finance/zakat-calculator', icon: Calculator, label: 'Zakat Calc' },
    { to: '/finance/investment-guide', icon: Book, label: 'Invest Guide' },
  ];

  const communityNavItems = [
    { to: '/community/qa', icon: MessageSquare, label: 'Q&A Board' },
    { to: '/community/anonymous', icon: Lock, label: 'Anonymous' },
    { to: '/community/groups', icon: Users, label: 'Groups' },
  ];

  const toolsNavItems = [
    { to: '/tools/prayer-times', icon: Clock, label: 'Prayer Times' },
    { to: '/tools/qibla', icon: Compass, label: 'Qibla Finder' },
    { to: '/tools/tasbeeh', icon: LayoutDashboard, label: 'Tasbeeh' },
    { to: '/tools/calendar', icon: Calendar, label: 'Calendar' },
  ];

  const otherNavItems = [
    { to: '/mission', icon: Shield, label: 'About' },
    { to: '/mission', icon: Mail, label: 'Contact' },
    { to: '/mission', icon: Lock, label: 'Privacy' },
    { to: '/donate', icon: HeartHandshake, label: 'Donate' },
  ];

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (path: string) => `
    flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap
    ${isActive(path) 
      ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
      : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400'}
  `;

  const Dropdown = ({ label, items, id }: { label: string, items: any[], id: string }) => (
    <div 
      className="relative group"
      onMouseEnter={() => setActiveDropdown(id)}
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <button 
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 transition-colors"
      >
        {label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === id ? 'rotate-180' : ''}`} />
      </button>
      {activeDropdown === id && (
        <div className="absolute top-full left-0 w-48 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-xl shadow-xl py-2 z-[1001] animate-in fade-in slide-in-from-top-2 duration-200">
          {items.map((item) => (
            item.isAction ? (
              <button
                key={item.label}
                onClick={() => { window.dispatchEvent(new CustomEvent('open-ai-chat')); setActiveDropdown(null); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-colors"
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ) : (
              <Link
                key={item.to}
                href={item.to}
                onClick={() => setActiveDropdown(null)}
                className={`
                  flex items-center gap-3 px-4 py-2 text-sm transition-colors
                  ${isActive(item.to) ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'}
                `}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            )
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <nav id="desktop-navbar" className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-b border-emerald-100 dark:border-emerald-900/30 px-6 items-center justify-between z-[1000]">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 cursor-pointer shrink-0">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Star size={24} fill="currentColor" className="text-gold" />
            </div>
            <span className="text-xl font-bold text-emerald-900 dark:text-emerald-100 hidden lg:block">Nurul Quran</span>
          </Link>

          <div className="flex items-center gap-1">
            {mainNavItems.slice(0, 5).map((item) => (
              <Link key={item.to} href={item.to} className={navLinkClass(item.to)}>
                <item.icon size={18} />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
            <Dropdown label="Finance" items={financeNavItems} id="finance" />
            <Dropdown label="Community" items={communityNavItems} id="community" />
            <Dropdown label="Tools" items={toolsNavItems} id="tools" />
            <Dropdown label="More" items={[...mainNavItems.slice(5), ...otherNavItems]} id="more" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DarkModeToggle />

          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-3 pl-4 border-l border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 font-bold overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100 truncate max-w-[100px]">{user.displayName}</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Member</p>
                </div>
                <ChevronDown size={14} className="text-zinc-400 group-hover:rotate-180 transition-transform" />
              </button>

              {/* User Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-900/30 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Signed in as</p>
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 truncate">{user.email}</p>
                </div>
                <Link 
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-all"
                >
                  <User size={18} />
                  Profile
                </Link>
                <Link 
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-all"
                >
                  <Settings size={18} />
                  Settings
                </Link>
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2 mx-2" />
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all text-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      <div id="mobile-top-bar" className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-b border-emerald-100 dark:border-emerald-900/30 px-4 flex items-center justify-between z-[1000]">
        <Link href="/" className="flex items-center gap-2">
          <Star size={20} className="text-gold" fill="currentColor" />
          <span className="font-bold text-emerald-900 dark:text-emerald-100">Nurul Quran</span>
        </Link>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-emerald-900 dark:text-emerald-100"
          >
            <span className="text-2xl">{isMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div id="mobile-menu-overlay" className="md:hidden fixed top-16 left-0 right-0 bottom-16 bg-white dark:bg-zinc-900 z-[999] overflow-y-auto animate-in slide-in-from-top duration-200">
          <div className="flex flex-col p-4 gap-1 pb-20">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4 mb-2">Main Menu</p>
            {mainNavItems.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive(item.to) ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-400'}
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4 mt-4 mb-2">Tools & Community</p>
            {[...toolsNavItems, ...communityNavItems, ...financeNavItems].map((item) => (
              <Link
                key={item.to}
                href={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive(item.to) ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-400'}
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            
            <div className="mt-8 px-4">
              {!user ? (
                <button
                  onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-900/20"
                >
                  <LogIn size={20} />
                  <span>Sign In</span>
                </button>
              ) : (
                <button
                  onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-red-600 bg-red-50 dark:bg-red-900/10 font-bold"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <nav id="mobile-bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-emerald-100 dark:border-emerald-900/30 px-2 py-2 z-[1000] flex justify-around items-center h-16">
        {[
          { to: '/', icon: Home, label: 'Home' },
          { to: '/quran', icon: BookOpen, label: 'Quran' },
          { to: '#ai-chat', icon: MessageSquare, label: 'AI Chat', isAction: true },
          { to: '/profile', icon: User, label: 'Profile' },
          { to: '/settings', icon: Settings, label: 'Settings' }
        ].map((item) => (
          item.isAction ? (
            <button
              key={item.label}
              onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chat'))}
              className="flex flex-col items-center justify-center gap-1 flex-1 text-zinc-400 hover:text-emerald-600 transition-colors"
            >
              <item.icon size={22} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.to}
              href={item.to}
              className={`
                flex flex-col items-center justify-center gap-1 flex-1 transition-colors
                ${isActive(item.to) ? 'text-emerald-600' : 'text-zinc-400'}
              `}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </Link>
          )
        ))}
      </nav>
    </>
  );
};
