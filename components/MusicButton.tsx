// components/MusicButton.tsx
'use client';

import { useState } from 'react';
import { Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MusicPlayer from './MusicPlayer';

export default function MusicButton() {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsPlayerOpen(true)}
        className="global-music-button fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center gap-2 shadow-lg group cursor-pointer px-4 py-3"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
        >
          <Headphones className="w-6 h-6 text-white" />
        </motion.div>
        <span className="text-white font-bold text-sm hidden sm:block">Play Music</span>
      </motion.button>

      <AnimatePresence mode="wait">
        {isPlayerOpen && (
          <MusicPlayer isOpen={isPlayerOpen} onClose={() => setIsPlayerOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}