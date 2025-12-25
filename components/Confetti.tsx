
import React from 'react';
import { motion } from 'framer-motion';

export const Confetti: React.FC = () => {
  const particles = Array.from({ length: 50 });
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            top: "100%", 
            left: `${Math.random() * 100}%`,
            opacity: 1,
            scale: Math.random() * 0.5 + 0.5,
            rotate: 0
          }}
          animate={{ 
            top: "-10%",
            left: `${Math.random() * 100}%`,
            opacity: 0,
            rotate: 360
          }}
          transition={{ 
            duration: Math.random() * 2 + 2, 
            ease: "easeOut",
            delay: Math.random() * 0.5 
          }}
          className="absolute w-2 h-2 bg-[#d4af37] rounded-full blur-[1px]"
          style={{
            backgroundColor: i % 3 === 0 ? '#d4af37' : i % 3 === 1 ? '#fde047' : '#ffffff'
          }}
        />
      ))}
    </div>
  );
};
