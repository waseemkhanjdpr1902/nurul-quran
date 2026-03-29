import React, { useState, useEffect } from 'react';
import { IndianRupee, Info, Calculator, TrendingUp, Wallet, Briefcase, Landmark, Coins } from 'lucide-react';
import { motion } from 'motion/react';

export const ZakatCalculatorPage: React.FC = () => {
  const [goldValue, setGoldValue] = useState<number>(0);
  const [silverValue, setSilverValue] = useState<number>(0);
  const [cashBalance, setCashBalance] = useState<number>(0);
  const [inventoryValue, setInventoryValue] = useState<number>(0);
  const [receivables, setReceivables] = useState<number>(0);
  const [investments, setInvestments] = useState<number>(0);
  const [nisabRate, setNisabRate] = useState<number>(6500); // Default gold rate per gram

  const nisabThreshold = 87.48 * nisabRate;
  const totalWealth = goldValue + silverValue + cashBalance + inventoryValue + receivables + investments;
  const isZakatDue = totalWealth >= nisabThreshold;
  const zakatAmount = isZakatDue ? totalWealth * 0.025 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const inputFields = [
    { label: 'Gold Value owned', icon: Coins, value: goldValue, setter: setGoldValue, desc: 'Market value of all gold jewelry, coins, etc.' },
    { label: 'Silver Value owned', icon: TrendingUp, value: silverValue, setter: setSilverValue, desc: 'Market value of all silver items.' },
    { label: 'Cash & Bank Balance', icon: Wallet, value: cashBalance, setter: setCashBalance, desc: 'Total cash on hand and in bank accounts.' },
    { label: 'Business Inventory', icon: Briefcase, value: inventoryValue, setter: setInventoryValue, desc: 'Market value of stock-in-trade for business.' },
    { label: 'Receivables', icon: Landmark, value: receivables, setter: setReceivables, desc: 'Money owed to you that you expect to receive.' },
    { label: 'Investments / Shares', icon: IndianRupee, value: investments, setter: setInvestments, desc: 'Current market value of stocks, mutual funds, etc.' },
  ];

  return (
    <div id="zakat-calculator-page" className="p-4 md:p-8 max-w-6xl mx-auto pb-32 md:pb-8 animate-fade-up">
      <div id="zakat-header" className="mb-8">
        <h1 id="zakat-title" className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Zakat Calculator</h1>
        <p id="zakat-subtitle" className="text-zinc-500 dark:text-zinc-400">Calculate your annual Zakat obligation (2.5% of zakatable wealth).</p>
      </div>

      <div id="zakat-calculator-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div id="zakat-calculator-main" className="lg:col-span-2 space-y-6">
          <div id="zakat-asset-card" className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
            <div id="zakat-asset-header" className="flex items-center gap-3 mb-8">
              <div id="zakat-asset-icon" className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                <Calculator size={24} />
              </div>
              <h2 id="zakat-asset-title" className="text-xl font-bold text-emerald-900 dark:text-emerald-100">Asset Breakdown</h2>
            </div>

            <div id="zakat-asset-inputs" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inputFields.map((field, i) => (
                <div key={i} id={`zakat-input-container-${field.label.toLowerCase().replace(/\s+/g, '-')}`} className="space-y-2">
                  <label id={`zakat-label-${field.label.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
                    <field.icon size={16} className="text-emerald-600" />
                    {field.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
                    <input
                      id={`zakat-input-${field.label.toLowerCase().replace(/\s+/g, '-')}`}
                      type="number"
                      value={field.value || ''}
                      onChange={(e) => field.setter(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                      placeholder="0"
                    />
                  </div>
                  <p id={`zakat-desc-${field.label.toLowerCase().replace(/\s+/g, '-')}`} className="text-[10px] text-zinc-400 italic">{field.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="zakat-info-card" className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex gap-4">
            <Info id="zakat-info-icon" className="text-emerald-600 shrink-0" size={24} />
            <p id="zakat-info-text" className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
              <span className="font-bold">Note:</span> Zakat is calculated on wealth held for one full lunar year (Hawl). The Nisab threshold is the minimum amount of wealth required to be held for a year before Zakat becomes obligatory.
            </p>
          </div>
        </div>

        <div id="zakat-calculator-sidebar" className="space-y-6">
          <div id="zakat-summary-card" className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm sticky top-8">
            <h3 id="zakat-summary-title" className="text-xl font-bold mb-6 text-emerald-900 dark:text-emerald-100">Summary</h3>
            
            <div id="zakat-summary-stats" className="space-y-4 mb-8">
              <div id="zakat-nisab-threshold-card" className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div id="zakat-nisab-threshold-header" className="flex justify-between items-center mb-2">
                  <span id="zakat-nisab-threshold-label" className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nisab Threshold</span>
                  <div id="zakat-nisab-rate-container" className="flex items-center gap-2">
                    <span id="zakat-nisab-rate-label" className="text-[10px] text-zinc-400">Gold Rate: ₹</span>
                    <input 
                      id="zakat-nisab-rate-input"
                      type="number" 
                      value={nisabRate} 
                      onChange={(e) => setNisabRate(Number(e.target.value))}
                      className="w-16 bg-transparent border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
                <p id="zakat-nisab-threshold-display" className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(nisabThreshold)}</p>
                <p id="zakat-nisab-threshold-subtext" className="text-[10px] text-zinc-400 mt-1">(87.48g Gold equivalent)</p>
              </div>

              <div id="zakat-total-wealth-card" className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <span id="zakat-total-wealth-label" className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Zakatable Wealth</span>
                <p id="zakat-total-wealth-display" className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(totalWealth)}</p>
              </div>
            </div>

            <motion.div 
              key={isZakatDue ? 'due' : 'not-due'}
              id="zakat-result-display"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-6 rounded-2xl text-center border-2 ${
                isZakatDue 
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-900/20' 
                  : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
              }`}
            >
              {isZakatDue ? (
                <>
                  <p id="zakat-result-label" className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Zakat Due</p>
                  <p id="zakat-amount-due" className="text-4xl font-bold mb-2">{formatCurrency(zakatAmount)}</p>
                  <p id="zakat-result-subtext" className="text-[10px] opacity-80">2.5% of your total zakatable wealth</p>
                </>
              ) : (
                <>
                  <p id="zakat-result-label" className="text-xs font-bold uppercase tracking-widest mb-2">No Zakat Due</p>
                  <p id="zakat-result-subtext" className="text-sm leading-relaxed">Your wealth is below the Nisab threshold of {formatCurrency(nisabThreshold)}.</p>
                </>
              )}
            </motion.div>

            <div id="zakat-breakdown-section" className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
              <h4 id="zakat-breakdown-title" className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Breakdown</h4>
              <div id="zakat-breakdown-list" className="space-y-2">
                {inputFields.map((field, i) => (
                  <div key={i} id={`zakat-breakdown-item-${field.label.toLowerCase().replace(/\s+/g, '-')}`} className="flex justify-between text-sm">
                    <span id={`zakat-breakdown-label-${field.label.toLowerCase().replace(/\s+/g, '-')}`} className="text-zinc-500">{field.label}</span>
                    <span id={`zakat-breakdown-value-${field.label.toLowerCase().replace(/\s+/g, '-')}`} className="font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(field.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
