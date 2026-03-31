"use client";

import React, { useState } from 'react';
import { Sparkles, BookOpen, Heart, Wind, Shield, Star, ChevronRight, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  icon: React.ReactNode;
  color: string;
}

export const TasawwufPage = () => {
  const [activeTab, setActiveTab] = useState('All');

  const articles: Article[] = [
    {
      id: 1,
      title: "The Path of Tazkiyah",
      excerpt: "Understanding the science of purifying the heart and soul in Islamic tradition.",
      category: "Basics",
      readTime: "8 min",
      icon: <Wind className="text-blue-500" />,
      color: "blue"
    },
    {
      id: 2,
      title: "Stations of the Soul",
      excerpt: "Exploring the various maqamat (stations) a seeker passes through on the way to Allah.",
      category: "Advanced",
      readTime: "12 min",
      icon: <Star className="text-amber-500" />,
      color: "amber"
    },
    {
      id: 3,
      title: "The Importance of Dhikr",
      excerpt: "How constant remembrance of Allah transforms the inner state and brings tranquility.",
      category: "Practice",
      readTime: "6 min",
      icon: <Heart className="text-red-500" />,
      color: "red"
    },
    {
      id: 4,
      title: "Adab with the Creator",
      excerpt: "The spiritual etiquette required when standing before the Divine in prayer and life.",
      category: "Etiquette",
      readTime: "10 min",
      icon: <Shield className="text-emerald-500" />,
      color: "emerald"
    }
  ];

  const categories = ['All', 'Basics', 'Practice', 'Etiquette', 'Advanced'];
  const filteredArticles = activeTab === 'All' ? articles : articles.filter(a => a.category === activeTab);

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <div className="relative h-[400px] flex items-center justify-center overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/spirit/1920/1080')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 to-emerald-900" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800/50 backdrop-blur-md rounded-full text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-700/50">
            <Sparkles size={14} />
            The Inner Dimension
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Tasawwuf & <span className="text-emerald-400">Spirituality</span>
          </h1>
          <p className="text-emerald-100/80 max-w-2xl mx-auto text-lg leading-relaxed">
            Journey into the heart of Islam. Discover the path of purification, 
            divine love, and the pursuit of spiritual excellence (Ihsan).
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-6 -mt-12 relative z-20">
        {/* Quick Stats/Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { title: "Tazkiyah", desc: "Purification of the heart from spiritual diseases.", icon: <Wind /> },
            { title: "Ihsan", desc: "Worshipping Allah as if you see Him.", icon: <Star /> },
            { title: "Mahabbah", desc: "Developing deep, transformative love for the Divine.", icon: <Heart /> }
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] shadow-xl border border-emerald-100 dark:border-emerald-900/20 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">{item.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Content Section */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">Spiritual Insights</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === cat 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              {filteredArticles.map((article) => (
                <motion.div
                  layout
                  key={article.id}
                  className="group bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-emerald-50 dark:border-emerald-900/10 hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-all flex flex-col md:flex-row gap-6"
                >
                  <div className={`w-full md:w-48 h-48 rounded-2xl bg-${article.color}-50 dark:bg-${article.color}-900/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    {React.cloneElement(article.icon as React.ReactElement, { size: 48 })}
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 bg-${article.color}-50 dark:bg-${article.color}-900/20 text-${article.color}-600 text-[10px] font-bold rounded-full uppercase tracking-widest`}>
                        {article.category}
                      </span>
                      <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{article.readTime} read</span>
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-3 group-hover:text-emerald-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                      {article.excerpt}
                    </p>
                    <button className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:gap-3 transition-all">
                      Read Article <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-8">
            {/* Daily Quote */}
            <div className="bg-emerald-900 text-white p-8 rounded-[40px] relative overflow-hidden">
              <Sparkles className="absolute -top-4 -right-4 text-emerald-800 w-24 h-24" />
              <h3 className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-6">Wisdom of the Day</h3>
              <p className="text-xl font-serif italic mb-6 leading-relaxed relative z-10">
                "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it."
              </p>
              <p className="text-emerald-300 text-sm font-bold">— Jalaluddin Rumi</p>
            </div>

            {/* Recommended Practices */}
            <div className="bg-zinc-50 dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-emerald-900 dark:text-emerald-100 font-bold mb-6 flex items-center gap-2">
                <Wind size={18} className="text-emerald-600" />
                Spiritual Exercises
              </h3>
              <div className="space-y-4">
                {[
                  { title: "Muraqabah", desc: "10 mins of silent meditation on the Divine presence." },
                  { title: "Muhasabah", desc: "Nightly self-accounting of one's deeds and intentions." },
                  { title: "Dhikr al-Qalb", desc: "Constant remembrance of Allah within the heart." }
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                    <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 mb-1">{item.title}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Video */}
            <div className="group relative rounded-[40px] overflow-hidden aspect-video cursor-pointer">
              <img src="https://picsum.photos/seed/meditation/400/225" alt="Featured Video" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <PlayCircle size={32} />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-xs font-bold bg-emerald-600/80 backdrop-blur-sm inline-block px-2 py-1 rounded mb-1">New Lesson</p>
                <p className="text-white font-bold text-sm">Introduction to Spiritual Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
