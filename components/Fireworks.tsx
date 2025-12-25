
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Burst {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

const FireworkBurst: React.FC<Burst> = ({ x, y, color, size }) => {
  const particleCount = 18;
  
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i * 360) / particleCount;
        const radius = size + Math.random() * 50;
        const velocityX = Math.cos(angle * (Math.PI / 180)) * radius;
        const velocityY = Math.sin(angle * (Math.PI / 180)) * radius;

        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: velocityX,
              y: velocityY + 20, // Add a bit of gravity
              opacity: 0,
              scale: 0.2
            }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute rounded-full blur-[1px]"
            style={{ 
              backgroundColor: color,
              width: Math.random() * 3 + 2 + 'px',
              height: Math.random() * 3 + 2 + 'px',
              boxShadow: `0 0 10px ${color}`
            }}
          />
        );
      })}
      
      {/* Central flash */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full blur-md"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

export const Fireworks: React.FC = () => {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const colors = ['#fde047', '#d4af37', '#ffffff', '#fb7185', '#2dd4bf', '#fda4af'];

  useEffect(() => {
    const interval = setInterval(() => {
      const newBurst: Burst = {
        id: Date.now() + Math.random(),
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 80 + Math.random() * 100
      };
      
      setBursts(prev => [...prev.slice(-8), newBurst]);
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <AnimatePresence>
        {bursts.map(burst => (
          <FireworkBurst key={burst.id} {...burst} />
        ))}
      </AnimatePresence>
    </div>
  );
};
