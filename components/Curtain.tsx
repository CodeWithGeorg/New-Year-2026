
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            className="absolute inset-0 z-0 flex flex-col items-center justify-center p-6"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Curtain */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? '-100%' : '0%' }}
        transition={{ duration: 2, ease: [0.77, 0, 0.175, 1] }}
        className="absolute top-0 left-0 w-1/2 h-full z-20 bg-gradient-to-r from-[#020617] via-[#0f172a] to-[#1e293b] border-r border-[#d4af37]/20 shadow-2xl flex items-center justify-end overflow-hidden"
      >
        <div className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-[#d4af37]/40 to-transparent" />
        {!isOpen && (
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-16 h-1/2 bg-[#d4af37]/5 blur-3xl rounded-full translate-x-1/2" 
          />
        )}
      </motion.div>

      {/* Right Curtain */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? '100%' : '0%' }}
        transition={{ duration: 2, ease: [0.77, 0, 0.175, 1] }}
        className="absolute top-0 right-0 w-1/2 h-full z-20 bg-gradient-to-l from-[#020617] via-[#0f172a] to-[#1e293b] border-l border-[#d4af37]/20 shadow-2xl flex items-center justify-start overflow-hidden"
      >
        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-[#d4af37]/40 to-transparent" />
        {!isOpen && (
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 3, delay: 1 }}
            className="w-16 h-1/2 bg-[#d4af37]/5 blur-3xl rounded-full -translate-x-1/2" 
          />
        )}
      </motion.div>
    </div>
  );
};
