// components/MusicButton.tsx
'use client';

import { useState } from 'react';
import { Headphones } from 'lucide-react';
import { motion } from 'framer-motion';
import MusicPlayer from './MusicPlayer';

export default function MusicButton() {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsPlayerOpen(true)}
        className="global-music-button fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
        >
          <Headphones className="w-6 h-6 text-white" />
        </motion.div>
      </motion.button>

      {isPlayerOpen && <MusicPlayer isOpen={isPlayerOpen} onClose={() => setIsPlayerOpen(false)} />}
    </>
  );
}