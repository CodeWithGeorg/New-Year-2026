
import React from 'react';
import { TimeLeft } from '../types';

interface CountdownTimerProps {
  timeLeft: TimeLeft;
}

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center px-4 md:px-8">
    <span className="text-4xl md:text-7xl font-cinzel font-bold text-[#d4af37] tabular-nums">
      {value.toString().padStart(2, '0')}
    </span>
    <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#d4af37]/60 mt-2">
      {label}
    </span>
  </div>
);

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ timeLeft }) => {
  return (
    <div className="flex flex-wrap justify-center items-center divide-x divide-[#d4af37]/20">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Minutes" />
      <TimeUnit value={timeLeft.seconds} label="Seconds" />
    </div>
  );
};
