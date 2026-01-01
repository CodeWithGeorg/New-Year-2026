
import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { text } from 'stream/consumers';

export const ShareButton: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'Happy New Year!',
      // text: `Let's welcome ${new Date().getFullYear() - 1} together with hope and joy! Check out this beautiful New Year countdown.`,
      text: `Let's welcome 2026 together with hope and joy! Check out this beautiful New Year countdown.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
      className="flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-[#020617] rounded-full font-semibold transition-colors hover:bg-[#fde047] focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 focus:ring-offset-[#020617]"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <Check size={18} />
            <span>Link Copied!</span>
          </motion.div>
        ) : (
          <motion.div
            key="share"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <Share2 size={18} />
            <span>Share the Magic</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
