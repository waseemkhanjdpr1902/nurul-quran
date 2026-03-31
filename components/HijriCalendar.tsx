"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

const GREGORIAN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const HijriCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hijriDate, setHijriDate] = useState<{ day: number, month: number, year: number } | null>(null);

  useEffect(() => {
    // Simple Hijri conversion logic (Approximate)
    const convertToHijri = (date: Date) => {
      const jd = Math.floor(date.getTime() / 86400000) + 2440588;
      const l = jd - 1948440 + 10632;
      const n = Math.floor((l - 1) / 10631);
      const l2 = l - 10631 * n + 354;
      const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2 + 2450) / 17719)) +
                (Math.floor(l2 / 5670)) * (Math.floor((43 * l2 + 2423) / 15342));
      const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j + 17658) / 50)) -
                 (Math.floor(j / 16)) * (Math.floor((15342 * j + 22528) / 43)) + 285;
      const j2 = Math.floor((20 * l3 + 2846) / 591);
      const d = l3 - Math.floor((591 * j2 + 2523) / 20);
      const m = j2;
      const y = 30 * n + j - 30;
      return { day: d, month: m, year: y };
    };

    setHijriDate(convertToHijri(currentDate));
  }, [currentDate]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const today = new Date();

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[40px] border border-emerald-100 dark:border-emerald-900/30 shadow-xl overflow-hidden animate-fade-up">
      {/* Header */}
      <div className="bg-emerald-900 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-800 rounded-2xl flex items-center justify-center text-emerald-300">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{GREGORIAN_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              {hijriDate && (
                <p className="text-emerald-300 font-bold uppercase tracking-widest text-[10px] mt-1">
                  {HIJRI_MONTHS[hijriDate.month - 1]} {hijriDate.year} AH
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-emerald-800 rounded-xl transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 rounded-xl text-xs font-bold transition-colors">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-emerald-800 rounded-xl transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-8">
        <div className="grid grid-cols-7 mb-4">
          {DAYS.map(day => (
            <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = today.getDate() === day && 
                           today.getMonth() === currentDate.getMonth() && 
                           today.getFullYear() === currentDate.getFullYear();
            
            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.05 }}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative cursor-pointer transition-all ${
                  isToday 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                    : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span className="text-sm font-bold">{day}</span>
                {/* Small Hijri Day Indicator */}
                <span className={`text-[8px] mt-1 ${isToday ? 'text-emerald-100' : 'text-zinc-400'}`}>
                  {/* This is a simplified calculation for each day */}
                  {((day + (hijriDate?.day || 0) - currentDate.getDate() + 30) % 30) || 30}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-emerald-100 dark:border-emerald-900/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Clock size={14} className="text-emerald-600" />
          <span>Current Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <div className="w-2 h-2 bg-emerald-600 rounded-full" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <div className="w-2 h-2 bg-gold rounded-full" />
            <span>Islamic Event</span>
          </div>
        </div>
      </div>
    </div>
  );
};
