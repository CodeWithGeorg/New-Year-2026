
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, RefreshCw, UserCircle, PlayCircle } from 'lucide-react';
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
  const [senderName, setSenderName] = useState<string>('');
  const [sharedFrom, setSharedFrom] = useState<string | null>(null);
  const [isDemoActive, setIsDemoActive] = useState(false);

  // Extract name from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    if (from) {
      setSharedFrom(decodeURIComponent(from));
    }
  }, []);

  const shareUrl = useMemo(() => {
    const url = new URL(window.location.href);
    if (senderName) {
      url.searchParams.set('from', encodeURIComponent(senderName));
    } else {
      url.searchParams.delete('from');
    }
    return url.toString();
  }, [senderName]);

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

  const handleReveal = useCallback(async () => {
    if (isRevealing) return;
    setIsRevealing(true);
    
    // Smooth transition sequence
    setTimeout(() => {
      setPageState(PageState.REVEALING);
      fetchNewMessage();
      setTimeout(() => {
        setPageState(PageState.CELEBRATION);
      }, 3500);
    }, 1200);
  }, [isRevealing, fetchNewMessage]);

  useEffect(() => {
    const timer = setInterval(() => {
      // Don't update if we are already celebrating
      if (pageState === PageState.CELEBRATION) return;

      const nextTime = calculateTimeLeft(getNextNewYear());
      
      // If demo is active, we don't overwrite with real time
      if (!isDemoActive) {
        setTimeLeft(nextTime);
        
        // Auto reveal when countdown hits zero
        if (nextTime.total <= 0 && pageState === PageState.COUNTDOWN && !isRevealing) {
          handleReveal();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [pageState, isRevealing, handleReveal, isDemoActive]);

  // const startDemo = () => {
  //   setIsDemoActive(true);
  //   // Jump to last 8 seconds for the climax effect preview
  //   const demoTarget = new Date();
  //   demoTarget.setSeconds(demoTarget.getSeconds() + 8);
    
  //   const tickDemo = setInterval(() => {
  //     const demoTime = calculateTimeLeft(demoTarget);
  //     setTimeLeft(demoTime);
  //     if (demoTime.total <= 0) {
  //       clearInterval(tickDemo);
  //       handleReveal();
  //     }
  //   }, 1000);
  // };

  const currentYear = useMemo(() => {
    const now = new Date();
    const nextYear = now.getFullYear() + 1;
    return now.getMonth() === 0 && now.getDate() === 1 ? now.getFullYear() : nextYear;
  }, []);

  // Climax state: less than or equal to 5 seconds remaining
  const isClimax = timeLeft.total > 0 && timeLeft.total <= 5000;

  return (
    <main className={`min-h-screen ${THEME.midnight} text-[#f8fafc] flex flex-col items-center justify-center relative overflow-hidden`}>
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

      <Curtain isOpen={pageState !== PageState.COUNTDOWN}>
        <Fireworks />
        
        <div className="max-w-4xl w-full text-center space-y-12 relative z-10 px-4 flex flex-col items-center justify-center h-full">
          <AnimatePresence mode="wait">
            {pageState === PageState.REVEALING && (
              <motion.div
                key="splash"
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.2, filter: 'blur(30px)' }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="flex flex-col items-center justify-center"
              >
                {/* <h2 className="text-[#d4af37] font-cinzel text-xl md:text-3xl tracking-[1em] uppercase mb-6 opacity-60"></h2> */}
                <h1 className="text-7xl md:text-[11rem] font-cinzel font-bold bg-gradient-to-b from-[#fde047] via-[#d4af37] to-[#92400e] bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(212,175,55,0.4)] leading-none italic">
                  HAPPY NEW YEAR
                </h1>
                <div className="text-white/40 font-cinzel text-2xl tracking-[0.5em] mt-12">{currentYear}</div>
                {sharedFrom && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-[#d4af37] font-cinzel italic tracking-widest text-xl"
                  >
                    From {sharedFrom}
                  </motion.div>
                )}
              </motion.div>
            )}

            {pageState === PageState.CELEBRATION && (
              <motion.div
                key="main-content"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="space-y-12 w-full pt-12"
              >
                <div className="space-y-4">
                  <span className="text-[#d4af37] font-cinzel text-sm md:text-xl tracking-[0.8em] uppercase block">A New Horizon Awaits</span>
                  <h1 className="text-6xl md:text-[10rem] font-cinzel font-bold bg-gradient-to-b from-[#fde047] via-[#d4af37] to-[#92400e] bg-clip-text text-transparent drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)] leading-none">
                    {currentYear}
                  </h1>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-full max-w-xs group">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37]/50 group-focus-within:text-[#d4af37] transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="Your name..." 
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm font-cinzel tracking-widest focus:outline-none focus:border-[#d4af37]/40 transition-all text-white placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div className="relative">
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
                </div>

                <div className="flex flex-col items-center gap-10 pt-8 pb-20">
                  <div className="flex flex-wrap justify-center gap-6">
                    <ShareButton senderName={senderName} shareUrl={shareUrl} />
                    <GiftCardGenerator initialMessage={aiMessage} year={currentYear} senderName={senderName} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                <AnimatePresence mode="wait">
                  {!isClimax ? (
                    <motion.div
                      key="alignment"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <motion.div
                        animate={{ letterSpacing: ["0.6em", "0.8em", "0.6em"] }}
                        transition={{ duration: 6, repeat: Infinity }}
                        className="text-[#d4af37] font-cinzel text-sm md:text-base tracking-[0.6em] uppercase"
                      >
                        {sharedFrom ? `From ${sharedFrom}` : "The Celestial Alignment Begins"}
                      </motion.div>
                      <h1 className="text-5xl md:text-8xl font-cinzel font-light text-white tracking-tighter">
                        Eternity is <span className="text-[#d4af37] font-bold">Calling</span>
                      </h1>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="climax"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[#d4af37] font-cinzel text-2xl md:text-4xl tracking-[1em] uppercase animate-pulse"
                    >
                      Hold Your Breath
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative group">
                <div className={`absolute inset-0 bg-[#d4af37]/5 blur-[100px] rounded-full scale-125 transition-transform duration-1000 ${isClimax ? 'opacity-100 scale-150' : ''}`} />
                <div className={`relative py-16 px-10 md:px-20 bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(212,175,55,0.05)] transition-all duration-700 ${isClimax ? 'scale-110 border-[#d4af37]/30' : ''}`}>
                  <CountdownTimer timeLeft={timeLeft} hideOthers={isClimax} />
                </div>
              </div>

              {!isClimax && (
                <div className="flex flex-col items-center gap-8">
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="relative w-full max-w-xs group">
                      <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37]/50 group-focus-within:text-[#d4af37] transition-colors" size={20} />
                      <input 
                        type="text" 
                        placeholder="Your name for sharing..." 
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm font-cinzel tracking-widest focus:outline-none focus:border-[#d4af37]/40 transition-all text-white placeholder:text-white/20"
                      />
                    </div>
                    <ShareButton senderName={senderName} shareUrl={shareUrl} />
                  </div>
{/* 
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startDemo}
                    className="flex items-center gap-2 text-[#d4af37]/60 hover:text-[#d4af37] transition-colors font-cinzel text-[10px] tracking-[0.3em] uppercase"
                  >
                    <PlayCircle size={16} />
                    Preview the Countdown
                  </motion.button> */}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    
    </main>
  );
};

export default App;