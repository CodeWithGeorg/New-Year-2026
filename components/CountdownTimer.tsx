
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimeLeft } from '../types';

interface CountdownTimerProps {
  timeLeft: TimeLeft;
  hideOthers?: boolean;
}

const TimeUnit: React.FC<{ value: number; label: string; isBig?: boolean }> = ({ value, label, isBig }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`flex flex-col items-center justify-center ${isBig ? 'px-16 md:px-32' : 'px-4 md:px-8'}`}
  >
    <div className="relative">
      <AnimatePresence mode="popLayout">
        <motion.span 
          key={value}
          initial={{ y: 60, opacity: 0, filter: 'blur(10px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: -60, opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className={`${isBig ? 'text-[12rem] md:text-[24rem]' : 'text-5xl md:text-8xl'} font-cinzel font-bold text-[#d4af37] tabular-nums leading-none block drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]`}
        >
          {value.toString().padStart(2, '0')}
        </motion.span>
      </AnimatePresence>
    </div>
    <motion.span 
      layout
      className={`${isBig ? 'text-sm md:text-2xl' : 'text-[10px] md:text-xs'} uppercase tracking-[0.5em] text-[#d4af37]/60 mt-6 font-cinzel`}
    >
      {label}
    </motion.span>
  </motion.div>
);

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ timeLeft, hideOthers }) => {
  return (
    <div className="flex flex-wrap justify-center items-center overflow-hidden min-h-[120px] md:min-h-[200px]">
      <AnimatePresence mode="wait">
        {!hideOthers ? (
          <motion.div 
            key="full-timer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center divide-x divide-[#d4af37]/10"
          >
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
          </motion.div>
        ) : (
          <motion.div
            key="climax-timer"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center"
          >
            <TimeUnit value={timeLeft.seconds} label="Seconds" isBig />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
