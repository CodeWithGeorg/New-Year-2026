
import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CurtainProps {
  isOpen: boolean;
  children: ReactNode;
}

export const Curtain: React.FC<CurtainProps> = ({ isOpen, children }) => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020617]">
      {/* Celebration Content (revealed from behind) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(30px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="absolute inset-0 z-0 flex flex-col items-center justify-center"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Reveal Light Burst */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0.8 }}
            animate={{ scaleX: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-30 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Left Curtain */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? '-100%' : '0%' }}
        transition={{ duration: 2.8, ease: [0.85, 0, 0.15, 1] }}
        className="absolute top-0 left-0 w-1/2 h-full z-20 bg-gradient-to-r from-[#020617] via-[#0f172a] to-[#1e293b] border-r border-[#d4af37]/20 shadow-[20px_0_50px_rgba(0,0,0,0.8)] flex items-center justify-end overflow-hidden"
      >
        <div className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-[#d4af37]/40 to-transparent shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
        {!isOpen && (
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="w-48 h-screen bg-[#d4af37]/5 blur-[150px] rounded-full translate-x-1/2" 
          />
        )}
      </motion.div>

      {/* Right Curtain */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? '100%' : '0%' }}
        transition={{ duration: 2.8, ease: [0.85, 0, 0.15, 1] }}
        className="absolute top-0 right-0 w-1/2 h-full z-20 bg-gradient-to-l from-[#020617] via-[#0f172a] to-[#1e293b] border-l border-[#d4af37]/20 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] flex items-center justify-start overflow-hidden"
      >
        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-[#d4af37]/40 to-transparent shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
        {!isOpen && (
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 5, delay: 1 }}
            className="w-48 h-screen bg-[#d4af37]/5 blur-[150px] rounded-full -translate-x-1/2" 
          />
        )}
      </motion.div>
    </div>
  );
};
