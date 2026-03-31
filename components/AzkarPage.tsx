"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Book, Moon, Sun, Clock, Heart, Share2, Copy, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AzkarItem {
  category: string;
  count: string;
  description: string;
  reference: string;
  zekr: string;
  content?: string; // Some APIs use content instead of zekr
}

export const AzkarPage = () => {
  const [azkar, setAzkar] = useState<Record<string, AzkarItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('أذكار الصباح');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAzkar();
  }, []);

  const fetchAzkar = async () => {
    try {
      const response = await axios.get('https://raw.githubusercontent.com/nawafalbagmi/azkar-api/master/azkar.json');
      setAzkar(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching Azkar:", err);
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = Object.keys(azkar);
  const filteredAzkar = azkar[activeCategory]?.filter(item => 
    item.zekr.includes(search) || item.description.includes(search)
  ) || [];

  const getCategoryIcon = (cat: string) => {
    if (cat.includes('الصباح')) return <Sun className="text-orange-500" size={18} />;
    if (cat.includes('المساء')) return <Moon className="text-indigo-500" size={18} />;
    if (cat.includes('الصلاة')) return <Clock className="text-emerald-500" size={18} />;
    if (cat.includes('النوم')) return <Moon className="text-zinc-500" size={18} />;
    return <Book className="text-emerald-600" size={18} />;
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-3">
            <Heart className="text-emerald-600" />
            Azkar & Supplications
          </h1>
          <p className="text-sm text-zinc-500">Daily remembrances for spiritual protection and peace</p>
        </div>

        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search Azkar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 w-full shadow-sm"
          />
        </div>
      </div>

      {/* Categories Scroll */}
      <div className="flex overflow-x-auto gap-3 mb-10 pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border ${
              activeCategory === cat 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-none' 
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-400'
            }`}
          >
            {getCategoryIcon(cat)}
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-[40px]" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-6"
            >
              {filteredAzkar.length > 0 ? (
                filteredAzkar.map((item, idx) => (
                  <div 
                    key={idx}
                    className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </span>
                        <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold rounded-full uppercase tracking-widest">
                          Repeat: {item.count || '1'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => copyToClipboard(item.zekr, `${activeCategory}-${idx}`)}
                          className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-full transition-all"
                        >
                          {copiedId === `${activeCategory}-${idx}` ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                        <button className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-full transition-all">
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>

                    <p className="text-3xl text-right font-arabic leading-loose mb-6 dark:text-zinc-100">
                      {item.zekr}
                    </p>

                    {item.description && (
                      <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-2xl mb-4">
                        <p className="text-sm text-emerald-800 dark:text-emerald-300 italic">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {item.reference && (
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                        Reference: {item.reference}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-emerald-50/30 dark:bg-zinc-900/30 rounded-[40px] border border-dashed border-emerald-200 dark:border-emerald-900/30">
                  <p className="text-zinc-500">No Azkar found matching your search.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
