
import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CurtainProps {
  isOpen: boolean;
  children: ReactNode;
}

export const Curtain: React.FC<CurtainProps> = ({ isOpen, children }) => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020617]">
      {/* Celebration Content (Background Layer) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.4 }}
            className="absolute inset-0 z-0 flex flex-col items-center justify-center"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Reveal Flash */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0 z-30 bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Left Curtain */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? '-100%' : '0%' }}
        transition={{ duration: 2.2, ease: [0.7, 0, 0.3, 1] }}
        className="absolute top-0 left-0 w-1/2 h-full z-20 bg-gradient-to-r from-[#020617] via-[#0f172a] to-[#1e293b] border-r border-[#d4af37]/30 shadow-2xl flex items-center justify-end overflow-hidden"
      >
        <div className="absolute inset-y-0 right-0 w-[4px] bg-gradient-to-b from-transparent via-[#d4af37]/60 to-transparent shadow-[0_0_20px_#d4af37]" />
        {!isOpen && (
          <motion.div 
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-32 h-screen bg-[#d4af37]/5 blur-[120px] rounded-full translate-x-1/2" 
          />
        )}
      </motion.div>

      {/* Right Curtain */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? '100%' : '0%' }}
        transition={{ duration: 2.2, ease: [0.7, 0, 0.3, 1] }}
        className="absolute top-0 right-0 w-1/2 h-full z-20 bg-gradient-to-l from-[#020617] via-[#0f172a] to-[#1e293b] border-l border-[#d4af37]/30 shadow-2xl flex items-center justify-start overflow-hidden"
      >
        <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-b from-transparent via-[#d4af37]/60 to-transparent shadow-[0_0_20px_#d4af37]" />
        {!isOpen && (
          <motion.div 
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 4, delay: 1 }}
            className="w-32 h-screen bg-[#d4af37]/5 blur-[120px] rounded-full -translate-x-1/2" 
          />
        )}
      </motion.div>
    </div>
  );
};
