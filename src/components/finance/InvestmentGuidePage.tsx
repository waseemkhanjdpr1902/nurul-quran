import React from 'react';
import { BookOpen, CheckCircle2, XCircle, Info, TrendingUp, ShieldCheck, HelpCircle, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export const InvestmentGuidePage: React.FC = () => {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-32 md:pb-8 animate-fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Islamic Investment Guidance</h1>
        <p className="text-zinc-500 dark:text-zinc-400">A clean, readable guide to Shariah-compliant investing in India.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {/* Section 1: What is Halal investing? */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                <HelpCircle size={20} />
              </div>
              <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">What is Halal investing?</h2>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Halal investing is a Shariah-compliant approach to building wealth that aligns with Islamic principles. It involves investing in businesses that are ethical, socially responsible, and avoid prohibited activities like interest (Riba) and gambling (Maysir).
            </p>
          </section>

          {/* Section 2: Core Shariah principles */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Core Shariah Principles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Avoid Riba', desc: 'Interest is strictly prohibited. This includes both paying and receiving interest.' },
                { title: 'Avoid Gharar', desc: 'Excessive uncertainty or ambiguity in contracts and transactions is forbidden.' },
                { title: 'Avoid Maysir', desc: 'Speculation and gambling-like activities are prohibited in investment.' },
              ].map((p, i) => (
                <div key={i} className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
                  <h3 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-widest text-xs">{p.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Halal investment options available in India */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
              <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Halal Investment Options in India</h2>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Islamic Mutual Funds (e.g., Tata Ethical Fund)',
                'Direct Equity in Screened Stocks',
                'Physical Gold and Silver',
                'Real Estate and Land',
                'Sukuk (Islamic Bonds) if available',
                'Shariah-Compliant ETFs',
              ].map((opt, i) => (
                <li key={i} className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-emerald-800 dark:text-emerald-200 font-medium">
                  <TrendingUp size={18} className="text-emerald-600" />
                  {opt}
                </li>
              ))}
            </ul>
          </section>

          {/* Section 4: What to avoid */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600">
                <XCircle size={20} />
              </div>
              <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">What to Avoid</h2>
            </div>
            <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20">
              <ul className="space-y-3">
                {[
                  'Conventional Bank Fixed Deposits (FDs)',
                  'Regular Government or Corporate Bonds',
                  'Options and Futures Trading (Speculative)',
                  'Crypto with high speculation (Gharar)',
                  'Stocks of companies in prohibited sectors',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-rose-800 dark:text-rose-200 text-sm font-medium">
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 5: How to screen a stock yourself */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                <BookOpen size={20} />
              </div>
              <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">How to Screen a Stock Yourself</h2>
            </div>
            <div className="space-y-6">
              {[
                { step: 1, title: 'Check Business Activity', desc: 'Ensure the company is not involved in Riba (banking), alcohol, tobacco, gambling, weapons, or adult entertainment.' },
                { step: 2, title: 'Check Debt Ratio', desc: 'The company\'s total debt divided by its market capitalization should be less than 33%.' },
                { step: 3, title: 'Check Interest Income Ratio', desc: 'The company\'s interest income should be less than 5% of its total revenue.' },
              ].map((s, i) => (
                <div key={i} className="flex gap-6 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">{s.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6: Recommended resources */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Recommended Resources</h2>
            <div className="flex flex-wrap gap-3">
              {['IslamicFinanceGuru', 'Zoya App', 'AAOIFI Standards', 'Musaffa'].map((res, i) => (
                <span key={i} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-bold rounded-xl border border-zinc-200 dark:border-zinc-700">
                  {res}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Sticky Sidebar Reference Card */}
        <div className="space-y-6">
          <div className="bg-emerald-600 p-8 rounded-[32px] text-white shadow-xl shadow-emerald-900/20 sticky top-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldCheck size={24} />
              Quick Reference
            </h3>
            <p className="text-emerald-100 text-sm mb-8">Shariah Screening Ratios (AAOIFI Standards)</p>
            
            <div className="space-y-6">
              {[
                { label: 'Debt to Market Cap', value: '< 33%', color: 'bg-emerald-500' },
                { label: 'Interest Income', value: '< 5%', color: 'bg-emerald-500' },
                { label: 'Liquid Assets', value: '< 70%', color: 'bg-emerald-500' },
              ].map((r, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-80">
                    <span>{r.label}</span>
                    <span>{r.value}</span>
                  </div>
                  <div className="h-2 w-full bg-emerald-700 rounded-full overflow-hidden">
                    <div className={`${r.color} h-full`} style={{ width: r.value.replace('< ', '') }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-emerald-500/30">
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-2">Prohibited Sectors</p>
              <div className="flex flex-wrap gap-2">
                {['Banking', 'Tobacco', 'Alcohol', 'Gambling', 'Pork'].map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-emerald-700/50 rounded-lg text-[10px] font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
