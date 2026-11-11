'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gift } from 'lucide-react';
import TriviaModal from './TriviaModal';
import { useAuth } from '@/lib/hooks/useAuth';
import { getApiErrorMessage, isJsonObject } from '@/lib/api-response';
import type { TriviaQuestion } from './TriviaModal';

const MAX_LEVEL = 10;

export default function GiftIcon() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionLoadError, setQuestionLoadError] = useState<string | null>(null);
  const [userTotalPoints, setUserTotalPoints] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelUnlocked, setLevelUnlocked] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [triviaLockedUntil, setTriviaLockedUntil] = useState<string | null>(null);
  const [dailyHeartsRemaining, setDailyHeartsRemaining] = useState(3);

  const fetchQuestions = useCallback(async (level: number) => {
    setIsLoading(true);
    setQuestionLoadError(null);
    try {
      const response = await fetch(`/api/trivia/questions?count=10&level=${level}`);
      const data: unknown = await response.json();

      if (
        response.ok &&
        isJsonObject(data) &&
        data.success === true &&
        Array.isArray(data.questions)
      ) {
        setQuestions(data.questions as TriviaQuestion[]);
        if (typeof data.dailyHeartsRemaining === 'number') {
          setDailyHeartsRemaining(data.dailyHeartsRemaining);
        }
        if (data.questions.length === 0) {
          setQuestionLoadError(`No questions are currently available for Level ${level}.`);
        }
      } else {
        if (
          response.status === 423 &&
          isJsonObject(data) &&
          typeof data.triviaLockedUntil === 'string'
        ) {
          setTriviaLockedUntil(data.triviaLockedUntil);
          setDailyHeartsRemaining(0);
        }
        setQuestions([]);
        setQuestionLoadError(
          getApiErrorMessage(data, 'Could not load trivia questions.'),
        );
      }
    } catch (error) {
      console.error('Error fetching trivia questions:', error);
      setQuestions([]);
      setQuestionLoadError(
        error instanceof Error
          ? error.message
          : 'Could not load trivia questions. Check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserPoints = useCallback(async (): Promise<{
    level: number | null;
    lockedUntil: string | null;
    heartsRemaining: number;
  }> => {
    try {
      const response = await fetch('/api/user/trivia-points');
      const data: unknown = await response.json();

      if (!isJsonObject(data) || data.success !== true) {
        return { level: null, lockedUntil: null, heartsRemaining: 3 };
      }

      if (typeof data.triviaPoints === 'number') {
        setUserTotalPoints(data.triviaPoints);
      }

      const lockedUntil =
        typeof data.triviaLockedUntil === 'string' &&
        Date.parse(data.triviaLockedUntil) > Date.now()
          ? data.triviaLockedUntil
          : null;
      setTriviaLockedUntil(lockedUntil);
      const heartsRemaining =
        typeof data.dailyHeartsRemaining === 'number'
          ? data.dailyHeartsRemaining
          : 3;
      setDailyHeartsRemaining(heartsRemaining);

      if (typeof data.currentLevel === 'number') {
        setCurrentLevel(data.currentLevel);
        return { level: data.currentLevel, lockedUntil, heartsRemaining };
      }

      return { level: null, lockedUntil, heartsRemaining };
    } catch (error) {
      console.error('Error fetching user trivia points:', error);
      return { level: null, lockedUntil: null, heartsRemaining: 3 };
    }
  }, []);

  useEffect(() => {
    (async () => {
      const status = await fetchUserPoints();
      if (!status.lockedUntil) {
        await fetchQuestions(status.level ?? 1);
      } else {
        setIsLoading(false);
      }
    })();
  }, [fetchUserPoints, fetchQuestions]);

  const handleOpen = async () => {
    setLevelUnlocked(false);
    setIsModalOpen(true);
    setQuestions([]);
    setQuestionLoadError(null);
    setIsLoading(true);

    const status = await fetchUserPoints();
    if (!status.lockedUntil) {
      await fetchQuestions(status.level ?? currentLevel);
    } else {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setLevelUnlocked(false);
  };

  const handleGameComplete = async (result: {
    correct: number;
    total: number;
    points: number;
    streak: number;
    answers?: Array<{ questionId: string; userAnswer: number; isCorrect: boolean }>;
  }) => {
    const response = await fetch('/api/trivia/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    });
    const data: unknown = await response.json();

    if (!response.ok || !isJsonObject(data) || data.success !== true) {
      if (
        isJsonObject(data) &&
        typeof data.triviaLockedUntil === 'string'
      ) {
        setTriviaLockedUntil(data.triviaLockedUntil);
      }
      throw new Error(getApiErrorMessage(data, 'Failed to save trivia results'));
    }

    if (data.levelUnlocked === true) {
      setLevelUnlocked(true);
      setNewLevel(
        typeof data.newLevel === 'number' ? data.newLevel : currentLevel + 1,
      );
    } else {
      setLevelUnlocked(false);
      setNewLevel(currentLevel);
    }

    await fetchUserPoints();
  };

  const handleQuestionFailed = useCallback(async (questionId: string, failureId: string) => {
    const response = await fetch('/api/trivia/daily-lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, failureId }),
    });
    const data: unknown = await response.json();

    if (
      !response.ok ||
      !isJsonObject(data) ||
      data.success !== true ||
      typeof data.dailyHeartsRemaining !== 'number'
    ) {
      throw new Error(getApiErrorMessage(data, 'Failed to record failed question'));
    }

    setDailyHeartsRemaining(data.dailyHeartsRemaining);
    const lockedUntil =
      typeof data.triviaLockedUntil === 'string' ? data.triviaLockedUntil : null;
    setTriviaLockedUntil(lockedUntil);
    return {
      heartsRemaining: data.dailyHeartsRemaining,
      lockedUntil,
    };
  }, []);

  const handleContinueToNextLevel = async () => {
    const nextLevel = newLevel;
    
    // Close and immediately re-open to force TriviaModal to reset its state
    setIsModalOpen(false);
    
    setTimeout(async () => {
      setLevelUnlocked(false);
      setIsModalOpen(true);
      setQuestions([]); // Triggers the skeleton loader
      
      await fetchQuestions(nextLevel);
      setCurrentLevel(nextLevel); // Update UI badges
    }, 50);
  };

  if (!user) return null;

  const isMaxLevel = currentLevel >= MAX_LEVEL;

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={isLoading}
        className="relative inline-flex items-center justify-center rounded-2xl p-3 transition-all duration-300 bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 text-white hover:scale-110 hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] hover:shadow-red-500/50"
        title={
          isMaxLevel
            ? 'Play English Trivia (Max Level)'
            : `Play English Trivia — Level ${currentLevel}`
        }
      >
        <Gift className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-[10px] font-bold text-white shadow-lg animate-pulse ring-2 ring-white ring-offset-2 ring-offset-transparent">
          {currentLevel}
        </span>
      </button>

      <TriviaModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onContinue={handleContinueToNextLevel}
        questions={questions}
        isLoading={isLoading}
        questionLoadError={questionLoadError}
        onRetryQuestions={() => fetchQuestions(currentLevel)}
        userTotalPoints={userTotalPoints}
        currentLevel={currentLevel}
        levelUnlocked={levelUnlocked}
        newLevel={newLevel}
        isMaxLevel={isMaxLevel}
        onComplete={handleGameComplete}
        dailyLockedUntil={triviaLockedUntil}
        dailyHeartsRemaining={dailyHeartsRemaining}
        onQuestionFailed={handleQuestionFailed}
      />
    </>
  );
}