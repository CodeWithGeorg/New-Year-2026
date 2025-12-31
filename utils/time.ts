
import { TimeLeft } from '../types';

export const isNewYearsDay = (): boolean => {
  const now = new Date();
  // Returns true if today is January 1st
  return now.getMonth() === 0 && now.getDate() === 1;
};

export const calculateTimeLeft = (targetDate: Date): TimeLeft => {
  const difference = targetDate.getTime() - new Date().getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference
  };
};

export const getNextNewYear = (): Date => {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // If we are currently in Jan 1st, the target for the "countdown" logic (if we were to show one) 
  // is actually the one that just passed or the next one.
  // But conceptually, the countdown always targets the upcoming Jan 1st.
  return new Date(currentYear + 1, 0, 1, 0, 0, 0);
};
