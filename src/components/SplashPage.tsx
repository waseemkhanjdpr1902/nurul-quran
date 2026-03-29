import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Star, ChevronRight } from 'lucide-react';

interface SplashPageProps {
  onEnter: () => void;
}

const STARS_COUNT = 40;
const STATIC_STARS = Array.from({ length: STARS_COUNT }).map((_, i) => ({
  id: i,
  top: `${(i * 137.5) % 100}%`,
  left: `${(i * 151.1) % 100}%`,
  delay: (i * 0.7) % 5,
  size: (i % 3) + 1,
}));

const SplashPage: React.FC<SplashPageProps> = ({ onEnter }) => {
  return (
    <div 
      id="splash-root"
      className="fixed inset-0 z-[9999] bg-[#0f1628] overflow-hidden flex flex-col items-center justify-center p-6 text-center"
    >
      {/* 8-pointed geometric star pattern overlay */}
      <div 
        id="splash-pattern-overlay"
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l3.5 10.5L44 14l-10.5 3.5L30 28l-3.5-10.5L16 14l10.5-3.5zM0 30l3.5 10.5L14 44l-10.5 3.5L0 58l-3.5-10.5L-14 44l10.5-3.5zM60 30l3.5 10.5L74 44l-10.5 3.5L60 58l-3.5-10.5L46 44l10.5-3.5z' fill='%23c9a84c' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }}
      />

      {/* Twinkling Stars */}
      {STATIC_STARS.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{
            duration: 3 + (star.id % 2),
            repeat: Infinity,
            delay: star.delay,
          }}
          className="absolute bg-white rounded-full pointer-events-none"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: '0 0 5px rgba(255, 255, 255, 0.8)',
          }}
        />
      ))}

      {/* Crescent Moon Top Right */}
      <motion.div 
        id="splash-crescent"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 0.4, x: 0 }}
        transition={{ duration: 1.5 }}
        className="absolute top-10 right-10 text-[#c9a84c]"
      >
        <Moon size={120} strokeWidth={0.5} fill="currentColor" className="rotate-[-15deg]" />
      </motion.div>

      {/* Hanging Lanterns */}
      <div className="absolute top-0 left-1/4 flex gap-20 pointer-events-none">
        <Lantern delay={0} height={180} />
        <Lantern delay={0.5} height={120} />
      </div>
      <div className="absolute top-0 right-1/4 flex gap-20 pointer-events-none">
        <Lantern delay={0.8} height={150} />
        <Lantern delay={0.3} height={200} />
      </div>

      {/* Corner Ornaments */}
      <CornerOrnament position="top-left" />
      <CornerOrnament position="top-right" />
      <CornerOrnament position="bottom-left" />
      <CornerOrnament position="bottom-right" />

      {/* Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c9a84c]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 max-w-2xl w-full"
      >
        {/* Bismillah Calligraphy */}
        <div id="splash-bismillah" className="mb-8">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Bismillah.svg/1200px-Bismillah.svg.png" 
            alt="Bismillah" 
            className="h-16 md:h-20 mx-auto invert opacity-80"
            style={{ filter: 'invert(75%) sepia(21%) saturate(954%) hue-rotate(11deg) brightness(92%) contrast(85%)' }}
          />
        </div>

        {/* App Name */}
        <h1 id="splash-app-name" className="text-4xl md:text-6xl font-light tracking-[0.3em] text-[#c9a84c] mb-2">
          NURUL QURAN
        </h1>
        <p id="splash-subtitle" className="text-xl md:text-2xl text-[#c9a84c]/80 font-amiri mb-8">
          نور القرآن · Light of the Quran
        </p>

        {/* Gold Divider */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-[#c9a84c]/50" />
          <div className="w-3 h-3 rotate-45 border border-[#c9a84c] bg-[#c9a84c]/20" />
          <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-[#c9a84c]/50" />
        </div>

        {/* Daily Ayah Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="bg-[#c9a84c]/5 border border-[#c9a84c]/20 rounded-[32px] p-8 md:p-10 mb-12 backdrop-blur-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c9a84c]/30 to-transparent" />
          
          <p className="text-2xl md:text-3xl text-white font-amiri leading-relaxed mb-6 text-right dir-rtl">
            إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ وَيُبَشِّرُ الْمُؤْمِنِينَ
          </p>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed italic">
            "Indeed, this Qur'an guides to that which is most suitable and gives good tidings to the believers."
          </p>
          <div className="mt-4 text-[10px] font-bold text-[#c9a84c] uppercase tracking-widest">
            Surah Al-Isra 17:9
          </div>
        </motion.div>

        {/* Enter Button */}
        <motion.button
          id="splash-enter-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEnter}
          className="group relative px-12 py-4 bg-[#c9a84c] text-[#0f1628] font-bold rounded-full overflow-hidden transition-all shadow-2xl shadow-[#c9a84c]/20"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative flex items-center gap-2 text-lg">
            ENTER
            <ChevronRight size={20} />
          </span>
        </motion.button>
      </motion.div>

      {/* Footer Attribution */}
      <div className="absolute bottom-8 text-[#c9a84c]/40 text-[10px] font-bold uppercase tracking-[0.2em]">
        Est. 2026 · Guided by Light
      </div>
    </div>
  );
};

const Lantern: React.FC<{ delay: number; height: number }> = ({ delay, height }) => (
  <motion.div
    initial={{ y: -height }}
    animate={{ y: 0, rotate: [-2, 2, -2] }}
    transition={{
      y: { duration: 1.5, delay },
      rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }}
    className="flex flex-col items-center origin-top"
  >
    <div className="w-[1px] bg-[#c9a84c]/40" style={{ height: `${height}px` }} />
    <div className="relative w-12 h-16">
      <div className="absolute inset-0 bg-[#c9a84c]/20 border border-[#c9a84c]/40 rounded-lg rotate-45" />
      <div className="absolute inset-2 bg-[#c9a84c]/40 rounded-full blur-md animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-[#c9a84c] rounded-full shadow-[0_0_15px_#c9a84c]" />
      </div>
    </div>
  </motion.div>
);

const CornerOrnament: React.FC<{ position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }> = ({ position }) => {
  const classes = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 rotate-90',
    'bottom-left': 'bottom-0 left-0 -rotate-90',
    'bottom-right': 'bottom-0 right-0 rotate-180',
  };

  return (
    <div className={`absolute ${classes[position]} p-4 opacity-20 pointer-events-none`}>
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0C50 0 100 50 100 100M0 20C40 20 80 60 80 100M0 40C30 40 60 70 60 100" stroke="#c9a84c" strokeWidth="1" />
        <circle cx="10" cy="10" r="2" fill="#c9a84c" />
        <circle cx="30" cy="30" r="1.5" fill="#c9a84c" />
      </svg>
    </div>
  );
};

export default SplashPage;
