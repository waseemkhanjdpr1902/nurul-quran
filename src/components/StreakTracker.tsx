import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame, Users, TrendingUp } from 'lucide-react';

export const StreakTracker = () => {
  const [communityCount, setCommunityCount] = useState(1240);

  useEffect(() => {
    const interval = setInterval(() => {
      setCommunityCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Streak Card */}
      <motion.div 
        id="streak-tracker-card"
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[32px] p-6 text-white shadow-xl shadow-emerald-900/20 border border-white/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Flame size={20} className="text-orange-400" fill="currentColor" />
          </div>
          <h3 id="streak-tracker-title" className="font-bold">Spiritual Streak</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p id="streak-current-value" className="text-4xl font-bold mb-1">7 <span className="text-sm font-medium opacity-60">Days</span></p>
              <p id="streak-current-label" className="text-[10px] uppercase font-bold tracking-widest opacity-60">Current Streak</p>
            </div>
            <div className="text-right">
              <p id="streak-best-value" className="text-xl font-bold mb-1">12 <span className="text-xs font-medium opacity-60">Days</span></p>
              <p id="streak-best-label" className="text-[10px] uppercase font-bold tracking-widest opacity-60">Best Streak</p>
            </div>
          </div>

          {/* Activity Mini Chart */}
          <div id="streak-activity-chart" className="flex items-end justify-between h-12 gap-1 pt-2">
            {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
              <motion.div
                key={i}
                id={`streak-activity-bar-${i}`}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className={`flex-1 rounded-t-lg ${i === 6 ? 'bg-gold' : 'bg-white/30'}`}
              />
            ))}
          </div>
          <p id="streak-activity-label" className="text-[10px] text-center uppercase font-bold tracking-widest opacity-60">Last 7 Days Activity</p>
        </div>
      </motion.div>

      {/* Community Stats */}
      <div id="community-stats-container" className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
        <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600">
          <Users size={16} />
        </div>
        <div className="flex-1">
          <p id="community-count-display" className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            🌍 <motion.span
              key={communityCount}
              id="community-count-value"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {communityCount.toLocaleString()}
            </motion.span> Muslims
          </p>
          <p id="community-count-label" className="text-[10px] text-zinc-400 font-medium">read Quran today on Nurul Quran</p>
        </div>
        <TrendingUp size={14} className="text-emerald-500" />
      </div>
    </div>
  );
};
