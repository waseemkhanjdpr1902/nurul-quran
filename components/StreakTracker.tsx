"use client";

import React from 'react';
import { Flame } from 'lucide-react';

export const StreakTracker = () => {
  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600">
          <Flame size={20} fill="currentColor" />
        </div>
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Daily Streak</h3>
          <p className="text-xs text-zinc-500">Keep up the consistency!</p>
        </div>
      </div>
      <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">0 Days</div>
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
        <div className="bg-orange-500 h-full w-0 transition-all duration-500"></div>
      </div>
    </div>
  );
};
