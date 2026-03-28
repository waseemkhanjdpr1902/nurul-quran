import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';

function gregorianToHijri(date: Date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  let jd = Math.floor((14 - month) / 12);
  let y = year + 4800 - jd;
  let m = month + 12 * jd - 3;

  let julianDay = day + 
    Math.floor((153 * m + 2) / 5) + 
    365 * y + 
    Math.floor(y / 4) - 
    Math.floor(y / 100) + 
    Math.floor(y / 400) - 32045;

  let l = julianDay - 1948440 + 10632;
  let n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;

  let j = Math.floor((10985 - l) / 5316) * 
    Math.floor((50 * l) / 17719) + 
    Math.floor(l / 5670) * 
    Math.floor((43 * l) / 15238);

  l = l - Math.floor((30 - j) / 15) * 
    Math.floor((17719 * j) / 50) - 
    Math.floor(j / 16) * 
    Math.floor((15238 * j) / 43) + 29;

  let hijriMonth = Math.floor((24 * l) / 709);
  let hijriDay = l - Math.floor((709 * hijriMonth) / 24);
  let hijriYear = 30 * n + j - 30;

  const hijriMonthNames = [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
    "Jumada al-Ula", "Jumada al-Akhira", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
  ];

  return {
    day: hijriDay,
    month: hijriMonthNames[hijriMonth - 1],
    year: hijriYear,
    formatted: `${hijriDay} ${hijriMonthNames[hijriMonth - 1]} ${hijriYear} AH`
  };
}

export const HijriCalendar = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const today = new Date();
      if (today.getDate() !== now.getDate()) {
        setNow(today);
      }
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [now]);

  const hijri = useMemo(() => gregorianToHijri(now), [now]);
  
  const gregorianDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(now);
  }, [now]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-4 px-8 py-4 bg-emerald-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gold/20 mx-auto w-fit mb-8 animate-fade-up"
    >
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg md:text-xl text-gold">{hijri.formatted}</span>
      </div>
      <div className="w-px h-6 bg-white/20" />
      <span className="text-base md:text-lg text-white font-medium">{gregorianDate}</span>
    </motion.div>
  );
};
