import React, { useState, useEffect } from 'react';
import { AZKAR_DATA } from '../constants';
import { CheckCircle2, RotateCcw, Sun, Moon, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { db, doc, updateDoc, increment as firestoreIncrement, collection, query, where, getDocs, setDoc } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export const AzkarPage = () => {
  const { user } = useAuth();
  const categories = Object.keys(AZKAR_DATA) as (keyof typeof AZKAR_DATA)[];
  const [activeTab, setActiveTab] = useState<keyof typeof AZKAR_DATA>('morning');
  const [counts, setCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user, activeTab]);

  const fetchProgress = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'user_progress'),
        where('user_id', '==', user.uid),
        where('type', '==', 'azkar')
      );
      const querySnapshot = await getDocs(q);
      
      const newCounts: Record<number, number> = {};
      querySnapshot.forEach((doc) => {
        const p = doc.data();
        if (p.content_id) {
          newCounts[parseInt(p.content_id)] = p.count;
        }
      });
      setCounts(newCounts);
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  const handleIncrement = async (id: number, max: number) => {
    const newCount = Math.min((counts[id] || 0) + 1, max);
    setCounts(prev => ({
      ...prev,
      [id]: newCount
    }));

    if (user) {
      try {
        const progressId = `${user.uid}_azkar_${id}`;
        const progressRef = doc(db, 'user_progress', progressId);
        await setDoc(progressRef, {
          user_id: user.uid,
          type: 'azkar',
          content_id: id.toString(),
          count: newCount,
          last_activity: new Date().toISOString()
        }, { merge: true });

        // Also update aggregate tasbeehCount in user profile
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'stats.tasbeehCount': firestoreIncrement(1),
          'lastActive': new Date().toISOString()
        });
      } catch (err) {
        console.error('Error saving progress:', err);
      }
    }
  };

  const handleReset = async (id: number) => {
    setCounts(prev => ({ ...prev, [id]: 0 }));

    if (user) {
      try {
        const progressId = `${user.uid}_azkar_${id}`;
        const progressRef = doc(db, 'user_progress', progressId);
        await setDoc(progressRef, {
          user_id: user.uid,
          type: 'azkar',
          content_id: id.toString(),
          count: 0,
          last_activity: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error('Error resetting progress:', err);
      }
    }
  };

  const items = AZKAR_DATA[activeTab];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Daily Azkar & Wird</h1>
          <p className="text-sm text-zinc-500">Nourish your soul with daily remembrance and specific supplications.</p>
        </div>

        <div className="relative w-full md:w-64">
          <select
            id="azkar-category-select"
            value={activeTab}
            onChange={(e) => {
              setActiveTab(e.target.value as keyof typeof AZKAR_DATA);
              setCounts({});
            }}
            className="appearance-none w-full bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl px-6 py-3 pr-12 font-bold text-emerald-700 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600">
            <Moon size={20} className="rotate-90" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {items.map((item: any) => {
          const count = counts[item.id] || 0;
          const isDone = count >= item.count;

          return (
            <motion.div
              layout
              key={item.id}
              id={`azkar-item-${item.id}`}
              className={`p-6 rounded-3xl border transition-all ${
                isDone 
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30' 
                  : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'
              }`}
            >
              <p className="text-2xl text-right font-arabic leading-loose mb-4 dark:text-zinc-100">
                {item.text}
              </p>
              <p className="text-zinc-500 text-sm mb-4 leading-relaxed">
                {item.translation}
              </p>

              {item.benefit && (
                <div className="mb-6 p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20">
                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">Benefit</p>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">{item.benefit}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    id={`azkar-increment-${item.id}`}
                    onClick={() => handleIncrement(item.id, item.count)}
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-90 ${
                      isDone 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none' 
                        : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                    }`}
                  >
                    <span id={`azkar-count-${item.id}`} className="text-xl font-bold">{count}</span>
                    <span className="text-[10px] uppercase font-bold opacity-60">/{item.count}</span>
                  </button>
                  {isDone && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 className="text-emerald-600" size={24} />
                    </motion.div>
                  )}
                </div>
                
                <button
                  id={`azkar-reset-${item.id}`}
                  onClick={() => handleReset(item.id)}
                  className="p-2 text-zinc-400 hover:text-emerald-600 transition-colors"
                  title="Reset counter"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
