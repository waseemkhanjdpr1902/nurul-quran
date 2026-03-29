import React from 'react';
import { motion } from 'motion/react';

export const BismillahHeader = () => {
  return (
    <div id="bismillah-header-container" className="text-center py-8 animate-fade-up">
      <motion.div
        id="bismillah-header-content"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative inline-block px-12 py-6"
      >
        {/* Decorative Borders */}
        <div id="bismillah-border-tl" className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/40 rounded-tl-2xl" />
        <div id="bismillah-border-tr" className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold/40 rounded-tr-2xl" />
        <div id="bismillah-border-bl" className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold/40 rounded-bl-2xl" />
        <div id="bismillah-border-br" className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/40 rounded-br-2xl" />
        
        <p id="bismillah-text-arabic" className="text-4xl md:text-5xl font-arabic text-emerald-800 dark:text-emerald-400 mb-2">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <div id="bismillah-divider" className="h-px w-32 md:w-48 mx-auto bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
      </motion.div>
    </div>
  );
};
