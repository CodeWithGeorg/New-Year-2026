
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { CountdownTimer } from './components/CountdownTimer';
import { Curtain } from './components/Curtain';
import { ShareButton } from './components/ShareButton';
import { RealisticFireworks } from './components/Fireworks';
import { GiftCardGenerator } from './components/GiftCardGenerator';
import { calculateTimeLeft, getNextNewYear } from './utils/time';
import { GEMINI_SYSTEM_PROMPT, THEME } from './constants';
import { PageState, TimeLeft } from './types';

const App: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(getNextNewYear()));
  const [pageState, setPageState] = useState<PageState>(PageState.COUNTDOWN);
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

  // Sync countdown
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
    setPageState(PageState.CELEBRATION);
    await fetchNewMessage();
  };

  const simulateMidnight = () => {
    handleReveal();
  };

  const currentYear = useMemo(() => {
    const now = new Date();
    const nextYear = now.getFullYear() + 1;
    // If it's already Jan 1st, show current year, otherwise show next year
    return now.getMonth() === 0 && now.getDate() === 1 ? now.getFullYear() : nextYear;
  }, []);

  return (
    <main className={`min-h-screen ${THEME.midnight} text-[#f8fafc] flex flex-col items-center justify-center relative overflow-hidden`}>
      {/* Background Ambience (Stars) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.1, scale: 0.5 }}
            animate={{ 
              opacity: [0.1, 0.5, 0.1],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          >
            <Star className="text-yellow-500/40" size={Math.random() * 3 + 1} />
          </motion.div>
        ))}
      </div>

      <Curtain isOpen={pageState === PageState.CELEBRATION}>
        {/* Fireworks are now the background for the celebration content */}
        <RealisticFireworks />
        
        <div className="max-w-4xl w-full text-center space-y-12 relative z-10 px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
            className="space-y-4"
          >
            <span className="text-[#d4af37] font-cinzel text-sm md:text-xl tracking-[0.5em] uppercase block">A New Chapter Unfolds</span>
            <h1 className="text-6xl md:text-9xl font-cinzel font-bold bg-gradient-to-b from-[#fde047] via-[#d4af37] to-[#92400e] bg-clip-text text-transparent drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              Happy {currentYear}
            </h1>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.2 }}
            className="relative"
          >
            <div className="bg-white/5 backdrop-blur-xl p-8 md:p-14 rounded-[2rem] border border-[#d4af37]/20 shadow-[0_0_50px_rgba(212,175,55,0.1)] group">
              <Sparkles className="absolute top-6 left-6 text-[#d4af37]/30 group-hover:text-[#d4af37]/60 transition-colors" size={28} />
              <Sparkles className="absolute bottom-6 right-6 text-[#d4af37]/30 group-hover:text-[#d4af37]/60 transition-colors" size={28} />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={aiMessage}
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(10px)' }}
                  transition={{ duration: 0.8 }}
                >
                  <p className="text-2xl md:text-4xl font-light italic text-white/90 leading-relaxed font-cinzel tracking-wide">
                    &ldquo;{aiMessage}&rdquo;
                  </p>
                </motion.div>
              </AnimatePresence>
              
              <motion.button
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.6 }}
                onClick={fetchNewMessage}
                disabled={isGenerating}
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 p-3 bg-[#1e293b] border border-[#d4af37]/30 rounded-full text-[#d4af37] hover:bg-[#334155] transition-all disabled:opacity-50"
                title="Generate new wisdom"
              >
                <RefreshCw size={20} className={isGenerating ? "animate-spin" : ""} />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="flex flex-col items-center gap-8 pt-4"
          >
            <div className="flex flex-wrap justify-center gap-4">
              <ShareButton />
              <GiftCardGenerator initialMessage={aiMessage} year={currentYear} />
            </div>
            
            <div className="flex items-center gap-4 opacity-40">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#d4af37]" />
              <p className="text-[10px] uppercase tracking-[0.4em] font-cinzel">Infinite Possibilities</p>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#d4af37]" />
            </div>
          </motion.div>
        </div>
      </Curtain>

      {/* Persistent UI */}
      <div className="absolute top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-50">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-transparent flex items-center justify-center border border-[#d4af37]/30 shadow-inner">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            >
              <Star size={18} className="text-[#d4af37]" fill="#d4af37" fillOpacity={0.2} />
            </motion.div>
          </div>
          <div className="hidden sm:block">
            <h3 className="font-cinzel text-xs tracking-[0.3em] text-[#d4af37] font-bold">CELESTIAL</h3>
            <p className="text-[9px] text-white/30 tracking-[0.2em] uppercase">Gateway 1.0</p>
          </div>
        </motion.div>
      </div>

      {/* Countdown Overlay */}
      <AnimatePresence>
        {pageState === PageState.COUNTDOWN && (
          <motion.div
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.2, ease: "circIn" }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center p-6"
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-10 max-w-3xl"
            >
              <div className="space-y-4">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-[#d4af37] font-cinzel text-sm md:text-base tracking-[0.6em] uppercase"
                >
                  A New Dawn Approaches
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-cinzel font-light text-white tracking-tight leading-tight">
                  The New Year is <span className="text-[#d4af37]">Almost Here</span>
                </h1>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-[#d4af37]/5 blur-3xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-1000" />
                <div className="relative py-14 px-8 md:px-12 bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl">
                  <CountdownTimer timeLeft={timeLeft} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-6">
                 <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(212, 175, 55, 0.15)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={simulateMidnight}
                  className="px-10 py-4 rounded-full border border-[#d4af37]/40 text-[#d4af37] font-cinzel text-xs tracking-[0.4em] transition-all"
                >
                  REVEAL MAGIC
                </motion.button>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">Auto-unlock at the stroke of midnight</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none z-10" />
    </main>
  );
};

export default App;
