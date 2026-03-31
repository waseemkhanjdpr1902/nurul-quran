"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db, doc, updateDoc, increment as firestoreIncrement } from '@/lib/firebase';

interface Counts {
  SubhanAllah: number;
  Alhamdulillah: number;
  AllahuAkbar: number;
}

export const TasbeehCounter = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Counts>(() => {
    if (typeof window === 'undefined') return { SubhanAllah: 0, Alhamdulillah: 0, AllahuAkbar: 0 };
    const saved = localStorage.getItem('tasbeeh_counts');
    return saved ? JSON.parse(saved) : { SubhanAllah: 0, Alhamdulillah: 0, AllahuAkbar: 0 };
  });

  const targets = {
    SubhanAllah: 33,
    Alhamdulillah: 33,
    AllahuAkbar: 34
  };

  useEffect(() => {
    localStorage.setItem('tasbeeh_counts', JSON.stringify(counts));
  }, [counts]);

  const increment = async (type: keyof typeof targets) => {
    if (counts[type] < targets[type]) {
      setCounts((prev: Counts) => ({ ...prev, [type]: prev[type] + 1 }));
      
      if (user?.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            'stats.tasbeehCount': firestoreIncrement(1)
          });
        } catch (err) {
          console.error('Error updating tasbeeh count in Firestore:', err);
        }
      }

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  const reset = () => {
    setCounts({ SubhanAllah: 0, Alhamdulillah: 0, AllahuAkbar: 0 });
  };

  return (
    <div className="p-8 bg-white dark:bg-zinc-900 rounded-[40px] border border-emerald-100 dark:border-emerald-900/30 shadow-xl animate-fade-up relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gold/5 rounded-full blur-3xl" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
            <Zap size={24} />
          </div>
          <div>
            <h3 id="tasbeeh-title" className="font-bold text-xl text-zinc-900 dark:text-zinc-100">Digital Tasbeeh</h3>
            <p id="tasbeeh-subtitle" className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Spiritual Counter</p>
          </div>
        </div>
        <button 
          id="tasbeeh-reset-btn"
          onClick={reset}
          className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all active:scale-90"
          title="Reset All"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {Object.entries(targets).map(([name, target]) => {
          const count = counts[name as keyof typeof targets];
          const progress = (count / target) * 100;
          const isCompleted = count === target;

          return (
            <div key={name} id={`tasbeeh-item-${name.toLowerCase()}`} className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 group">
                {/* Progress Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-zinc-100 dark:text-zinc-800"
                  />
                  <motion.circle
                    initial={{ strokeDashoffset: 364 }}
                    animate={{ strokeDashoffset: 364 - (364 * progress) / 100 }}
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray="364"
                    fill="transparent"
                    className={`${isCompleted ? 'text-gold' : 'text-emerald-600'} transition-colors duration-500`}
                  />
                </svg>
                
                {/* Counter Button */}
                <button
                  id={`tasbeeh-btn-${name.toLowerCase()}`}
                  onClick={() => increment(name as keyof typeof targets)}
                  className={`absolute inset-2 rounded-full flex flex-col items-center justify-center transition-all active:scale-95 ${
                    isCompleted 
                      ? 'bg-gold/10 text-gold' 
                      : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  <span id={`tasbeeh-count-${name.toLowerCase()}`} className="text-2xl font-bold font-mono">{count}</span>
                  <span className="text-[8px] uppercase font-bold tracking-tighter opacity-60">/{target}</span>
                </button>
              </div>
              
              <div className="text-center">
                <p id={`tasbeeh-label-${name.toLowerCase()}`} className={`text-xs font-bold uppercase tracking-widest ${isCompleted ? 'text-gold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {name}
                </p>
                {isCompleted && (
                  <motion.p 
                    id={`tasbeeh-success-${name.toLowerCase()}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] text-emerald-600 font-bold mt-1"
                  >
                    MashaAllah!
                  </motion.p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
