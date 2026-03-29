import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

const STARS_COUNT = 40;
const STATIC_STARS = Array.from({ length: STARS_COUNT }).map((_, i) => ({
  id: i,
  top: `${(i * 137.5) % 100}%`,
  left: `${(i * 151.1) % 100}%`,
  delay: (i * 0.7) % 5,
  size: (i % 3) + 1,
}));

const AppBackground: React.FC = () => {
  return (
    <div 
      id="app-background-root"
      className="fixed inset-0 z-[-1] bg-[#0f1628] overflow-hidden pointer-events-none"
    >
      {/* 8-pointed geometric star pattern overlay */}
      <div 
        id="app-background-pattern"
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
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
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{
            duration: 4 + (star.id % 3),
            repeat: Infinity,
            delay: star.delay,
          }}
          className="absolute bg-white rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.6)',
          }}
        />
      ))}

      {/* Subtle Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent via-[#c9a84c]/5 to-transparent pointer-events-none" />
      
      {/* Corner Ornaments (Subtle) */}
      <CornerOrnament position="top-left" />
      <CornerOrnament position="top-right" />
      <CornerOrnament position="bottom-left" />
      <CornerOrnament position="bottom-right" />
    </div>
  );
};

const CornerOrnament: React.FC<{ position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }> = ({ position }) => {
  const classes = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 rotate-90',
    'bottom-left': 'bottom-0 left-0 -rotate-90',
    'bottom-right': 'bottom-0 right-0 rotate-180',
  };

  return (
    <div className={`absolute ${classes[position]} p-4 opacity-10 pointer-events-none`}>
      <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0C50 0 100 50 100 100M0 20C40 20 80 60 80 100M0 40C30 40 60 70 60 100" stroke="#c9a84c" strokeWidth="0.5" />
      </svg>
    </div>
  );
};

export default AppBackground;
