"use client";

import React, { useState } from 'react';
import { Book, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Play, FileText, PieChart, Target, Info, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  content: string[];
}

export const InvestmentGuidePage = () => {
  const [activeSection, setActiveSection] = useState('basics');

  const sections: GuideSection[] = [
    {
      id: 'basics',
      title: 'The Basics of Halal Investing',
      description: 'Understanding the core principles of Shariah-compliant finance.',
      icon: Book,
      content: [
        'Prohibition of Riba (Interest): Money should not generate money without risk.',
        'Prohibition of Gharar (Uncertainty): Contracts must be clear and transparent.',
        'Prohibition of Maysir (Gambling): Speculative behavior is discouraged.',
        'Ethical Screening: Avoiding businesses involved in alcohol, tobacco, gambling, etc.',
        'Risk and Reward Sharing: Both parties should share the outcome of the venture.'
      ]
    },
    {
      id: 'screening',
      title: 'Shariah Screening Process',
      description: 'How companies are evaluated for Shariah compliance.',
      icon: ShieldCheck,
      content: [
        'Business Activity Screening: Ensuring the core business is permissible (Halal).',
        'Financial Ratio Screening: Analyzing debt-to-asset and interest-to-revenue ratios.',
        'Debt Threshold: Total interest-bearing debt should usually be less than 33% of total assets.',
        'Interest Income Threshold: Interest income should usually be less than 5% of total revenue.',
        'Purification: Donating the small portion of non-compliant income to charity.'
      ]
    },
    {
      id: 'asset-classes',
      title: 'Halal Asset Classes',
      description: 'Different ways to grow your wealth permissibly.',
      icon: PieChart,
      content: [
        'Shariah-Compliant Equities: Stocks that pass the screening process.',
        'Sukuk (Islamic Bonds): Certificates representing ownership in tangible assets.',
        'Halal Real Estate: Investing in property through direct ownership or REITs.',
        'Gold and Silver: Traditional stores of value that are inherently Shariah-compliant.',
        'Islamic Mutual Funds & ETFs: Professionally managed portfolios of halal assets.'
      ]
    },
    {
      id: 'strategy',
      title: 'Building Your Portfolio',
      description: 'Practical steps to start your investment journey.',
      icon: Target,
      content: [
        'Define Your Goals: Determine your time horizon and risk tolerance.',
        'Diversification: Spread your investments across different sectors and asset classes.',
        'Regular Rebalancing: Ensure your portfolio stays aligned with your target allocation.',
        'Continuous Learning: Stay informed about market trends and Shariah rulings.',
        'Consult Experts: Seek advice from qualified financial advisors and Shariah scholars.'
      ]
    }
  ];

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <div className="relative h-[400px] flex items-center justify-center overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/finance/1920/1080')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 to-emerald-900" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800/50 backdrop-blur-md rounded-full text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-700/50">
            <TrendingUp size={14} />
            Wealth with Purpose
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Halal <span className="text-emerald-400">Investment Guide</span>
          </h1>
          <p className="text-emerald-100/80 max-w-2xl mx-auto text-lg leading-relaxed">
            Your comprehensive roadmap to building wealth while staying true to your values.
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-4 shadow-xl border border-emerald-100 dark:border-emerald-900/20 sticky top-24">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4 mb-4">Guide Sections</p>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${
                    activeSection === section.id 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'
                  }`}
                >
                  <section.icon size={20} />
                  <span className="font-bold text-sm">{section.title}</span>
                </button>
              ))}
              
              <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                  <Info size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Need Help?</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed mb-4">
                  Ask our AI assistant for specific questions about halal investing.
                </p>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chat'))}
                  className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all"
                >
                  Ask AI Assistant
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            <AnimatePresence mode="wait">
              {sections.map((section) => section.id === activeSection && (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 md:p-12 shadow-xl border border-emerald-100 dark:border-emerald-900/20"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                      <section.icon size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{section.title}</h2>
                      <p className="text-zinc-500">{section.description}</p>
                    </div>
                  </div>

                  <div className="prose prose-emerald dark:prose-invert max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.content.map((item, i) => (
                        <div key={i} className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-all group">
                          <div className="w-8 h-8 bg-white dark:bg-zinc-900 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm mb-4 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            {i + 1}
                          </div>
                          <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-12 p-8 bg-emerald-900 rounded-[32px] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/30 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold mb-2">Ready to start screening?</h3>
                        <p className="text-emerald-100/70 text-sm">Use our Halal Stock Screener to analyze your favorite companies.</p>
                      </div>
                      <Link
                        href="/finance/halal-stocks"
                        className="px-8 py-4 bg-white text-emerald-900 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-xl flex items-center gap-2"
                      >
                        <span>Open Screener</span>
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Resources Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'AAOIFI Standards', icon: FileText, desc: 'Global benchmark for Islamic finance.' },
                { title: 'Purification Guide', icon: Heart, desc: 'How to handle non-halal income.' },
                { title: 'Video Tutorials', icon: Play, desc: 'Visual guides for beginners.' }
              ].map((res, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-emerald-50 dark:border-emerald-900/10 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                    <res.icon size={20} />
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">{res.title}</h4>
                  <p className="text-xs text-zinc-500">{res.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
