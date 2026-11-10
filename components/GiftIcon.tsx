'use client';

import { useState } from 'react';
import { Gift } from 'lucide-react';
import TriviaModal from './TriviaModal';
import { getRandomQuestions } from '@/lib/trivia-questions';
import { useAuth } from '@/lib/hooks/useAuth';

export default function GiftIcon() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canPlay, setCanPlay] = useState(true);
  const [questions, setQuestions] = useState(getRandomQuestions(10));

  const handleGameComplete = async (result: {
    correct: number;
    total: number;
    points: number;
    streak: number;
  }) => {
    try {
      // Submit results to API
      const response = await fetch('/api/trivia/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        console.error('Failed to submit trivia results');
        return;
      }

      const data = await response.json();
      console.log('Points saved:', data);
      setCanPlay(false); // Disable until next day
    } catch (error) {
      console.error('Error submitting trivia results:', error);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => {
          if (canPlay) {
            setQuestions(getRandomQuestions(10));
            setIsModalOpen(true);
          }
        }}
        disabled={!canPlay}
        className={`relative inline-flex items-center justify-center rounded-2xl p-3 transition-all duration-300 ${
          canPlay
            ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]'
            : 'bg-gradient-to-br from-gray-400 to-gray-500 text-gray-300 cursor-not-allowed'
        }`}
        title={canPlay ? 'Play English Trivia' : 'Come back tomorrow!'}
      >
        <Gift className="h-6 w-6" />
        {canPlay && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
            !
          </span>
        )}
      </button>

      <TriviaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        questions={questions}
        onComplete={handleGameComplete}
      />
    </>
  );
}
