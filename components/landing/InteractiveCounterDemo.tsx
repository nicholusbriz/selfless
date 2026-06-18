'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, RotateCcw, Zap } from 'lucide-react';

export default function InteractiveCounterDemo() {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  const increment = () => {
    const newValue = count + 1;
    setCount(newValue);
    setHistory(prev => [newValue, ...prev].slice(0, 5));
  };

  const decrement = () => {
    const newValue = count - 1;
    setCount(newValue);
    setHistory(prev => [newValue, ...prev].slice(0, 5));
  };

  const reset = () => {
    setCount(0);
    setHistory([]);
  };

  return (
    <div className="space-y-6">
      {/* Counter Display */}
      <div className="flex items-center justify-center gap-8">
        <motion.button
          onClick={decrement}
          className="w-14 h-14 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Minus className="w-6 h-6" />
        </motion.button>

        <motion.div
          key={count}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-7xl font-bold text-white min-w-[120px] text-center"
        >
          {count}
        </motion.div>

        <motion.button
          onClick={increment}
          className="w-14 h-14 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Reset Button */}
      <div className="flex justify-center">
        <motion.button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </motion.button>
      </div>

      {/* History */}
      <div className="space-y-2">
        <p className="text-gray-400 text-sm flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Recent Actions
        </p>
        <div className="flex gap-2 flex-wrap">
          <AnimatePresence mode="popLayout">
            {history.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500 text-sm"
              >
                No actions yet
              </motion.p>
            ) : (
              history.map((value, index) => (
                <motion.div
                  key={`${value}-${index}`}
                  initial={{ scale: 0, x: -20 }}
                  animate={{ scale: 1, x: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    value > count ? 'bg-green-500/20 text-green-400' : 
                    value < count ? 'bg-red-500/20 text-red-400' : 
                    'bg-purple-500/20 text-purple-400'
                  }`}
                >
                  {value}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{count}</p>
          <p className="text-gray-400 text-xs">Current</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{history.length}</p>
          <p className="text-gray-400 text-xs">Actions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{Math.max(...history, 0)}</p>
          <p className="text-gray-400 text-xs">Peak</p>
        </div>
      </div>
    </div>
  );
}
