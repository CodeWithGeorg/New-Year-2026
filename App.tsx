
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { CountdownTimer } from './components/CountdownTimer';
import { Curtain } from './components/Curtain';
import { ShareButton } from './components/ShareButton';
import { Fireworks } from './components/Fireworks';
import { GiftCardGenerator } from './components/GiftCardGenerator';
import { calculateTimeLeft, getNextNewYear } from './utils/time';
import { GEMINI_SYSTEM_PROMPT, THEME } from './constants';
import { PageState, TimeLeft } from './types';

const App: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(getNextNewYear()));
  const [pageState, setPageState] = useState<PageState>(PageState.COUNTDOWN);
  const [isRevealing, setIsRevealing] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>("The magic in new beginnings is truly the most powerful of them all.");
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchNewMessage = useCallback(async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Give me a New Year motivational quote.",
        config: {
          systemInstruction: GEMINI_SYSTEM_PROMPT,
          temperature: 0.9,
        },
      });
      if (response.text) {
        setAiMessage(response.text.trim());
      }
    } catch (error) {
      console.error("Failed to fetch AI message:", error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextTime = calculateTimeLeft(getNextNewYear());
      setTimeLeft(nextTime);
      
      if (nextTime.total <= 0 && pageState === PageState.COUNTDOWN) {
        handleReveal();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [pageState]);

  const handleReveal = async () => {
    setIsRevealing(true);
    // Allow the "cool effect" animation to play before switching state
    setTimeout(() => {
      setPageState(PageState.CELEBRATION);
      fetchNewMessage();
    }, 1200);
  };

  const currentYear = useMemo(() => {
    const now = new Date();
    const nextYear = now.getFullYear() + 1;
    return now.getMonth() === 0 && now.getDate() === 1 ? now.getFullYear() : nextYear;
  }, []);

  return (
    <main className={`min-h-screen ${THEME.midnight} text-[#f8fafc] flex flex-col items-center justify-center relative overflow-hidden`}>
      {/* Starry Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.1 }}
            animate={{ opacity: [0.1, 0.6, 0.1] }}
            transition={{ duration: 3 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5 }}
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          >
            <Star className="text-white/40" size={Math.random() * 2 + 1} />
          </motion.div>
        ))}
      </div>

      <Curtain isOpen={pageState === PageState.CELEBRATION}>
        <Fireworks />
        
        <div className="max-w-4xl w-full text-center space-y-12 relative z-10 px-4">
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
            className="space-y-4"
          >
            <span className="text-[#d4af37] font-cinzel text-sm md:text-xl tracking-[0.8em] uppercase block">A New Horizon Awaits</span>
            <h1 className="text-6xl md:text-[10rem] font-cinzel font-bold bg-gradient-to-b from-[#fde047] via-[#d4af37] to-[#92400e] bg-clip-text text-transparent drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)] leading-none">
              {currentYear}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, filter: 'blur(20px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, delay: 1.5 }}
            className="relative"
          >
            <div className="bg-white/5 backdrop-blur-3xl p-8 md:p-14 rounded-[3rem] border border-white/10 shadow-[0_0_80px_rgba(212,175,55,0.15)] group">
              <Sparkles className="absolute -top-4 -left-4 text-[#d4af37] animate-pulse" size={32} />
              <Sparkles className="absolute -bottom-4 -right-4 text-[#d4af37] animate-pulse" size={32} />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={aiMessage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.8 }}
                >
                  <p className="text-2xl md:text-4xl font-light italic text-white/95 leading-relaxed font-cinzel tracking-wider">
                    &ldquo;{aiMessage}&rdquo;
                  </p>
                </motion.div>
              </AnimatePresence>
              
              <motion.button
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                onClick={fetchNewMessage}
                disabled={isGenerating}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 p-4 bg-[#1e293b] border border-[#d4af37]/40 rounded-full text-[#d4af37] hover:bg-[#334155] transition-all disabled:opacity-50 shadow-2xl"
              >
                <RefreshCw size={24} className={isGenerating ? "animate-spin" : ""} />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 2.2 }}
            className="flex flex-col items-center gap-10 pt-8"
          >
            <div className="flex flex-wrap justify-center gap-6">
              <ShareButton />
              <GiftCardGenerator initialMessage={aiMessage} year={currentYear} />
            </div>
          </motion.div>
        </div>
      </Curtain>

      <AnimatePresence>
        {pageState === PageState.COUNTDOWN && (
          <motion.div
            animate={isRevealing ? { scale: 1.5, filter: 'blur(20px)', opacity: 0 } : {}}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center p-6 bg-[#020617]"
          >
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-12 max-w-4xl"
            >
              <div className="space-y-4">
                <motion.div
                  animate={{ letterSpacing: ["0.6em", "0.8em", "0.6em"] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="text-[#d4af37] font-cinzel text-sm md:text-base tracking-[0.6em] uppercase"
                >
                  The Celestial Alignment Begins
                </motion.div>
                <h1 className="text-5xl md:text-8xl font-cinzel font-light text-white tracking-tighter">
                  Eternity is <span className="text-[#d4af37] font-bold">Calling</span>
                </h1>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-[#d4af37]/5 blur-[100px] rounded-full scale-125 transition-transform duration-1000" />
                <div className="relative py-16 px-10 md:px-20 bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(212,175,55,0.05)]">
                  <CountdownTimer timeLeft={timeLeft} />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05, letterSpacing: "0.5em" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReveal}
                className="px-14 py-5 rounded-full bg-gradient-to-r from-[#92400e] via-[#d4af37] to-[#92400e] text-[#020617] font-cinzel font-bold text-sm tracking-[0.4em] transition-all shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.5)]"
              >
                UNVEIL THE NEW YEAR
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default App;
