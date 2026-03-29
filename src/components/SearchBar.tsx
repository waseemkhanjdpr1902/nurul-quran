import React, { useEffect, useRef } from 'react';
import { Search, Command } from 'lucide-react';

export const SearchBar = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div id="search-bar-container" className="relative max-w-2xl mx-auto mb-12 animate-fade-up">
      <div className="relative group">
        <input
          id="search-bar-input"
          ref={inputRef}
          type="text"
          placeholder="Search Quran, Hadith, Duas, Azkar..."
          className="w-full pl-12 pr-24 py-4 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl shadow-sm focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all dark:text-white"
        />
        <Search id="search-bar-icon" className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" size={20} />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <div id="search-bar-shortcut" className="hidden sm:flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] text-zinc-400 font-bold border border-zinc-200 dark:border-zinc-700">
            <Command size={10} />
            <span>K</span>
          </div>
          <button id="search-bar-submit-btn" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
            Search
          </button>
        </div>
      </div>
    </div>
  );
};
