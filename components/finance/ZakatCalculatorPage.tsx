"use client";

import React, { useState, useEffect } from 'react';
import { Calculator, Info, IndianRupee, TrendingUp, Heart, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

interface ZakatSection {
  id: string;
  label: string;
  description: string;
  value: number;
}

export const ZakatCalculatorPage = () => {
  const [goldPrice, setGoldPrice] = useState(6200); // Per gram
  const [silverPrice, setSilverPrice] = useState(75); // Per gram
  const [currency, setCurrency] = useState('INR');
  
  const [assets, setAssets] = useState<ZakatSection[]>([
    { id: 'cash', label: 'Cash & Bank Balance', description: 'Total cash on hand and in bank accounts', value: 0 },
    { id: 'gold', label: 'Gold (grams)', description: 'Weight of gold jewelry or coins', value: 0 },
    { id: 'silver', label: 'Silver (grams)', description: 'Weight of silver jewelry or coins', value: 0 },
    { id: 'investments', label: 'Investments', description: 'Stocks, mutual funds, and other investments', value: 0 },
    { id: 'business', label: 'Business Assets', description: 'Value of inventory and business cash', value: 0 },
    { id: 'receivables', label: 'Money Owed to You', description: 'Loans given that are likely to be repaid', value: 0 },
  ]);

  const [liabilities, setLiabilities] = useState<ZakatSection[]>([
    { id: 'debts', label: 'Short-term Debts', description: 'Loans or bills due immediately', value: 0 },
    { id: 'expenses', label: 'Business Expenses', description: 'Pending business bills and salaries', value: 0 },
  ]);

  const nisabGold = 87.48 * goldPrice;
  const nisabSilver = 612.36 * silverPrice;
  const currentNisab = Math.min(nisabGold, nisabSilver);

  const totalAssets = assets.reduce((acc, curr) => {
    if (curr.id === 'gold') return acc + (curr.value * goldPrice);
    if (curr.id === 'silver') return acc + (curr.value * silverPrice);
    return acc + curr.value;
  }, 0);

  const totalLiabilities = liabilities.reduce((acc, curr) => acc + curr.value, 0);
  const netWealth = Math.max(0, totalAssets - totalLiabilities);
  const isEligible = netWealth >= currentNisab;
  const zakatDue = isEligible ? netWealth * 0.025 : 0;

  const handleAssetChange = (id: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setAssets(prev => prev.map(a => a.id === id ? { ...a, value: numValue } : a));
  };

  const handleLiabilityChange = (id: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setLiabilities(prev => prev.map(l => l.id === id ? { ...l, value: numValue } : l));
  };

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <div className="relative h-[300px] flex items-center justify-center overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/charity/1920/1080')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 to-emerald-900" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800/50 backdrop-blur-md rounded-full text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-700/50">
            <Calculator size={14} />
            Purify Your Wealth
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Zakat <span className="text-emerald-400">Calculator</span>
          </h1>
          <p className="text-emerald-100/80 max-w-2xl mx-auto text-lg leading-relaxed">
            Calculate your Zakat accurately according to Shariah principles.
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Inputs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Assets Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 shadow-xl border border-emerald-100 dark:border-emerald-900/20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                  <TrendingUp size={20} />
                </div>
                <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Your Assets</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assets.map((asset) => (
                  <div key={asset.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{asset.label}</label>
                      <div className="group relative">
                        <Info size={14} className="text-zinc-400 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-zinc-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {asset.description}
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">
                        {asset.id === 'gold' || asset.id === 'silver' ? 'g' : currency}
                      </div>
                      <input
                        type="number"
                        value={asset.value || ''}
                        onChange={(e) => handleAssetChange(asset.id, e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-zinc-900 dark:text-zinc-100 font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Liabilities Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 shadow-xl border border-emerald-100 dark:border-emerald-900/20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600">
                  <AlertCircle size={20} />
                </div>
                <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Liabilities & Debts</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {liabilities.map((liability) => (
                  <div key={liability.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{liability.label}</label>
                      <div className="group relative">
                        <Info size={14} className="text-zinc-400 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-zinc-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {liability.description}
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">
                        {currency}
                      </div>
                      <input
                        type="number"
                        value={liability.value || ''}
                        onChange={(e) => handleLiabilityChange(liability.id, e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 transition-all outline-none text-zinc-900 dark:text-zinc-100 font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Sidebar */}
          <div className="space-y-8">
            <div className="bg-emerald-900 dark:bg-emerald-950 rounded-[40px] p-8 text-white shadow-2xl sticky top-24">
              <div className="flex items-center gap-2 mb-8">
                <Heart size={20} className="text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">Zakat Summary</span>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/60 text-sm">Total Assets</span>
                  <span className="font-bold">{currency} {totalAssets.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/60 text-sm">Total Liabilities</span>
                  <span className="font-bold text-rose-400">-{currency} {totalLiabilities.toLocaleString()}</span>
                </div>
                <div className="h-px bg-emerald-800" />
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/60 text-sm">Net Zakatable Wealth</span>
                  <span className="text-2xl font-bold">{currency} {netWealth.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-emerald-800/50 rounded-3xl p-6 mb-8 border border-emerald-700/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Nisab Threshold</span>
                  <span className="text-xs font-bold">{currency} {currentNisab.toLocaleString()}</span>
                </div>
                {isEligible ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                    <CheckCircle2 size={16} />
                    <span>You are eligible for Zakat</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                    <AlertCircle size={16} />
                    <span>Below Nisab threshold</span>
                  </div>
                )}
              </div>

              <div className="text-center p-8 bg-white rounded-[32px] text-emerald-900 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Total Zakat Due</p>
                <h3 className="text-4xl font-bold mb-6">
                  {currency} {zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <Link
                  href="/donate"
                  className="block w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                >
                  Pay Zakat Now
                </Link>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[32px] p-6 border border-zinc-100 dark:border-zinc-800">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-100 mb-4 flex items-center gap-2">
                <Info size={16} />
                Zakat Rules
              </h4>
              <ul className="space-y-3">
                {[
                  "Zakat is 2.5% of your net zakatable wealth.",
                  "It is only due if your wealth exceeds the Nisab threshold.",
                  "Nisab is based on the current price of 87.48g of gold or 612.36g of silver.",
                  "Wealth must be held for one lunar year (Hawl)."
                ].map((rule, i) => (
                  <li key={i} className="text-xs text-zinc-500 flex gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
