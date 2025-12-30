
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Gift, Palette, User, Sparkles, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { GEMINI_SYSTEM_PROMPT } from '../constants';

interface GiftCardGeneratorProps {
  initialMessage: string;
  year: number;
  senderName: string;
}

type ThemeKey = 'gold' | 'silver' | 'rose' | 'aurora';

interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  gradient: [string, string, string];
}

const THEMES: Record<ThemeKey, ThemeConfig> = {
  gold: {
    name: 'Classic Gold',
    primary: '#fde047',
    secondary: '#d4af37',
    accent: '#92400e',
    bg: '#020617',
    gradient: ['#fde047', '#d4af37', '#92400e']
  },
  silver: {
    name: 'Celestial Silver',
    primary: '#f8fafc',
    secondary: '#94a3b8',
    accent: '#334155',
    bg: '#0f172a',
    gradient: ['#f8fafc', '#94a3b8', '#475569']
  },
  rose: {
    name: 'Rose Horizon',
    primary: '#fda4af',
    secondary: '#e11d48',
    accent: '#4c0519',
    bg: '#2d0a1a',
    gradient: ['#fda4af', '#fb7185', '#be123c']
  },
  aurora: {
    name: 'Northern Light',
    primary: '#2dd4bf',
    secondary: '#3b82f6',
    accent: '#1e3a8a',
    bg: '#040d1a',
    gradient: ['#2dd4bf', '#06b6d4', '#3b82f6']
  }
};

export const GiftCardGenerator: React.FC<GiftCardGeneratorProps> = ({ initialMessage, year, senderName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [message, setMessage] = useState(initialMessage);
  const [localUserName, setLocalUserName] = useState(senderName || '');
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('gold');
  const svgRef = useRef<SVGSVGElement>(null);

  const theme = THEMES[currentTheme];

  useEffect(() => {
    if (senderName) setLocalUserName(senderName);
  }, [senderName]);

  const refreshMessage = useCallback(async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Give me a unique New Year motivational quote for a surprise gift card.",
        config: {
          systemInstruction: GEMINI_SYSTEM_PROMPT,
          temperature: 1.0,
        },
      });
      if (response.text) {
        setMessage(response.text.trim());
      }
    } catch (error) {
      console.error("Failed to fetch new card message:", error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshMessage();
    }
  }, [isOpen, refreshMessage]);

  const wrapText = (text: string, maxCharsPerLine: number) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      if ((currentLine + word).length > maxCharsPerLine) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });
    lines.push(currentLine.trim());
    return lines;
  };

  const downloadCard = () => {
    if (!svgRef.current) return;
    setIsDownloading(true);

    try {
      const serializer = new XMLSerializer();
      let svgData = serializer.serializeToString(svgRef.current);
      if (!svgData.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgData = svgData.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const base64Data = window.btoa(unescape(encodeURIComponent(svgData)));
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 1200;
      canvas.height = 630;

      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = theme.bg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, 1200, 630);
          
          try {
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `${localUserName || 'Celestial'}-New-Year-${year}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          } catch (err) {
            console.error('Export failed:', err);
            alert('Export failed. Please try a screenshot.');
          }
        }
        setIsDownloading(false);
      };
      img.src = 'data:image/svg+xml;base64,' + base64Data;
    } catch (err) {
      console.error('Serialization failed', err);
      setIsDownloading(false);
    }
  };

  const messageLines = wrapText(`"${message}"`, 42);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${theme.secondary}44` }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 border border-[#d4af37]/50 text-[#d4af37] rounded-full font-cinzel text-sm tracking-widest transition-all hover:bg-[#d4af37]/10"
      >
        <Gift size={18} />
        <span>Create Gift Card</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-2xl overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-xl w-full bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl my-auto text-center"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-8 right-8 p-2 text-white/30 hover:text-white transition-colors"
              >
                <X size={28} />
              </button>

              <div className="space-y-10">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-transparent flex items-center justify-center border border-[#d4af37]/30 mb-6 shadow-lg">
                    <Sparkles className="text-[#d4af37]" size={32} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-cinzel text-white font-bold mb-3 tracking-wide">Celestial Gift Card</h2>
                  <p className="text-white/40 text-sm max-w-sm">Craft a beautiful keepsake with your name and a personalized message.</p>
                </div>

                <div className="space-y-8 text-left">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-cinzel uppercase tracking-[0.3em] text-white/50 px-1">
                      <User size={12} /> Your Name (From)
                    </label>
                    <input 
                      type="text"
                      value={localUserName}
                      onChange={(e) => setLocalUserName(e.target.value)}
                      placeholder="Enter your name..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20 transition-all text-lg"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-cinzel uppercase tracking-[0.3em] text-white/50 px-1">
                      <Palette size={12} /> Design Palette
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {(Object.keys(THEMES) as ThemeKey[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setCurrentTheme(t)}
                          className={`group flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                            currentTheme === t 
                              ? 'bg-white/10 border-[#d4af37]/40 shadow-lg shadow-[#d4af37]/5' 
                              : 'bg-white/5 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div 
                            className="w-8 h-8 rounded-full border border-white/10 transition-transform group-hover:scale-110" 
                            style={{ background: `linear-gradient(135deg, ${THEMES[t].primary}, ${THEMES[t].secondary})` }}
                          />
                          <span className="text-xs text-white/80 font-cinzel tracking-wider uppercase">{THEMES[t].name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={downloadCard}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-[#d4af37] text-[#020617] rounded-2xl font-bold shadow-2xl transition-all hover:bg-[#fde047] disabled:opacity-50"
                  >
                    <AnimatePresence mode="wait">
                      {isDownloading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <RefreshCw size={24} className="animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                          <Download size={24} />
                          <span className="uppercase tracking-[0.2em] text-sm">Download My Card</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>

              {/* Hidden SVG for Export logic */}
              <div className="hidden">
                <svg
                  ref={svgRef}
                  viewBox="0 0 1200 630"
                  width="1200"
                  height="630"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="themeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={theme.primary} />
                      <stop offset="50%" stopColor={theme.secondary} />
                      <stop offset="100%" stopColor={theme.accent} />
                    </linearGradient>
                  </defs>
                  
                  <rect width="1200" height="630" fill={theme.bg} />
                  
                  {[...Array(60)].map((_, i) => (
                    <circle 
                      key={i} 
                      cx={(Math.sin(i * 123) * 0.5 + 0.5) * 1200} 
                      cy={(Math.cos(i * 456) * 0.5 + 0.5) * 630} 
                      r={i % 5 === 0 ? 2 : 0.8} 
                      fill="white" 
                      fillOpacity={i % 3 === 0 ? 0.6 : 0.2}
                    />
                  ))}

                  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="url(#themeGradient)" strokeWidth="1" strokeOpacity="0.4" rx="30" />
                  <rect x="60" y="60" width="1080" height="510" fill="none" stroke="url(#themeGradient)" strokeWidth="2" rx="20" />

                  <text x="600" y="140" fontFamily="Cinzel, serif" fontSize="20" fill={theme.secondary} textAnchor="middle" letterSpacing="10" opacity="0.6">
                    A NEW BEGINNING
                  </text>

                  <text x="600" y="240" fontFamily="Cinzel, serif" fontSize="90" fontWeight="bold" fill="url(#themeGradient)" textAnchor="middle">
                    HAPPY {year}
                  </text>

                  <text 
                    x="600" 
                    y="340" 
                    fontFamily="Inter, sans-serif" 
                    fontSize="32" 
                    fontStyle="italic" 
                    fill="white" 
                    fillOpacity="0.95" 
                    textAnchor="middle"
                  >
                    {messageLines.map((line, idx) => (
                      <tspan key={idx} x="600" dy={idx === 0 ? 0 : "1.4em"}>
                        {line}
                      </tspan>
                    ))}
                  </text>

                  {localUserName && (
                    <text x="600" y="520" fontFamily="Cinzel, serif" fontSize="30" fill={theme.secondary} textAnchor="middle" letterSpacing="4">
                      FROM {localUserName.toUpperCase()}
                    </text>
                  )}

                  {/* Watermark */}
                  <text x="1120" y="580" fontFamily="Cinzel, serif" fontSize="14" fill="white" fillOpacity="0.15" textAnchor="end" letterSpacing="2">
                    GEORGE
                  </text>
                  
                  <text x="600" y="570" fontFamily="Cinzel, serif" fontSize="12" fill={theme.secondary} textAnchor="middle" letterSpacing="6" opacity="0.4">
                    THE HORIZON IS INFINITE
                  </text>
                </svg>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
