'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Gift } from 'lucide-react';
import TriviaModal from './TriviaModal';
import { useAuth } from '@/lib/hooks/useAuth';
import { getApiErrorMessage, isJsonObject } from '@/lib/api-response';
import { MAX_DAILY_HEARTS } from '@/lib/trivia/heart-sharing';
import type { TriviaQuestion } from './TriviaModal';

const MAX_LEVEL = 10;

interface DailyGames {
  completed: number;
  limit: number;
  resetAt: string;
}

function readDailyGames(value: unknown): DailyGames | null {
  if (
    isJsonObject(value) &&
    typeof value.completed === 'number' &&
    typeof value.limit === 'number' &&
    typeof value.resetAt === 'string'
  ) {
    return {
      completed: value.completed,
      limit: value.limit,
      resetAt: value.resetAt,
    };
  }
  return null;
}

export default function GiftIcon() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startNextLevelImmediately, setStartNextLevelImmediately] = useState(false);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Getting your game ready…');
  const [questionLoadError, setQuestionLoadError] = useState<string | null>(null);
  const [userTotalPoints, setUserTotalPoints] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelUnlocked, setLevelUnlocked] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [triviaLockedUntil, setTriviaLockedUntil] = useState<string | null>(null);
  const [dailyHeartsRemaining, setDailyHeartsRemaining] = useState(MAX_DAILY_HEARTS);
  const [dailyGames, setDailyGames] = useState<DailyGames | null>(null);

  const fetchQuestions = useCallback(async (level: number) => {
    setIsLoading(true);
    setLoadingMessage('Loading your questions…');
    setQuestionLoadError(null);
    try {
      const response = await fetch(`/api/trivia/questions?count=10&level=${level}`);
      const data: unknown = await response.json();

      if (isJsonObject(data)) {
        const status = readDailyGames(data.dailyGames);
        if (status) setDailyGames(status);
      }

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
    gamesLimited: boolean;
  }> => {
    try {
      const response = await fetch('/api/user/trivia-points');
      const data: unknown = await response.json();

      if (!isJsonObject(data) || data.success !== true) {
        return { level: null, lockedUntil: null, heartsRemaining: MAX_DAILY_HEARTS, gamesLimited: false };
      }

      if (typeof data.credits === 'number') {
        setUserTotalPoints(data.credits);
      } else if (typeof data.triviaPoints === 'number') {
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
          : MAX_DAILY_HEARTS;
      setDailyHeartsRemaining(heartsRemaining);
      const games = readDailyGames(data.dailyGames);
      if (games) setDailyGames(games);
      const gamesLimited = games !== null && games.completed >= games.limit;

      if (typeof data.currentLevel === 'number') {
        setCurrentLevel(data.currentLevel);
        return { level: data.currentLevel, lockedUntil, heartsRemaining, gamesLimited };
      }

      return { level: null, lockedUntil, heartsRemaining, gamesLimited };
    } catch (error) {
      console.error('Error fetching user trivia points:', error);
      return { level: null, lockedUntil: null, heartsRemaining: MAX_DAILY_HEARTS, gamesLimited: false };
    }
  }, []);

  // Refresh displayed credits after a gift purchase
  useEffect(() => {
    const refresh = () => { void fetchUserPoints(); };
    window.addEventListener('trivia-credits-changed', refresh);
    return () => window.removeEventListener('trivia-credits-changed', refresh);
  }, [fetchUserPoints]);


  // Allow other components (e.g. bottom nav) to open the trivia modal
  useEffect(() => {
    const open = () => { void handleOpen(); };
    window.addEventListener('open-trivia-modal', open);
    return () => window.removeEventListener('open-trivia-modal', open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpen = async () => {
    setStartNextLevelImmediately(false);
    setLevelUnlocked(false);
    setIsModalOpen(true);
    setQuestions([]);
    setQuestionLoadError(null);
    setTriviaLockedUntil(null);
    setDailyGames(null);
    setIsLoading(true);
    setLoadingMessage('Checking your level and daily hearts…');

    const status = await fetchUserPoints();
    if (!status.lockedUntil && !status.gamesLimited) {
      await fetchQuestions(status.level ?? currentLevel);
    } else {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setStartNextLevelImmediately(false);
    setLevelUnlocked(false);
  };

  const handleGameComplete = async (result: {
    correct: number;
    total: number;
    points: number;
    streak: number;
    submissionId: string;
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
      if (
        isJsonObject(data) &&
        data.code === 'DAILY_GAME_LIMIT' &&
        typeof data.dailyGamesResetAt === 'string'
      ) {
        setDailyGames({ completed: 10, limit: 10, resetAt: data.dailyGamesResetAt });
      }
      throw new Error(getApiErrorMessage(data, 'Failed to save trivia results'));
    }

    if (
      typeof data.currentLevel !== 'number' ||
      typeof data.newLevel !== 'number' ||
      typeof data.levelUnlocked !== 'boolean'
    ) {
      throw new Error('The saved result did not include confirmed level information.');
    }

    if (data.levelUnlocked === true) {
      setLevelUnlocked(true);
      setNewLevel(data.newLevel);
    } else {
      setLevelUnlocked(false);
      setNewLevel(data.currentLevel);
    }

    const games = readDailyGames(data.dailyGames);
    if (games) setDailyGames(games);
    await fetchUserPoints();
    return {
      currentLevel: data.currentLevel,
      newLevel: data.newLevel,
      levelUnlocked: data.levelUnlocked,
    };
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

  const handleHeartsChanged = useCallback(async () => {
    const wasLocked = Boolean(
      triviaLockedUntil && Date.parse(triviaLockedUntil) > Date.now(),
    ) || dailyHeartsRemaining === 0;
    const status = await fetchUserPoints();
    if (wasLocked && !status.lockedUntil && status.heartsRemaining > 0 && !status.gamesLimited) {
      await fetchQuestions(status.level ?? 1);
    }
  }, [dailyHeartsRemaining, fetchQuestions, fetchUserPoints, triviaLockedUntil]);

  const handleContinueToNextLevel = async () => {
    const nextLevel = newLevel;
    setStartNextLevelImmediately(true);
    setCurrentLevel(nextLevel);
    setLevelUnlocked(false);
    await fetchQuestions(nextLevel);
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

      {typeof document !== 'undefined' && createPortal(
        <TriviaModal
          isOpen={isModalOpen}
          onClose={handleClose}
          onContinue={handleContinueToNextLevel}
          startImmediately={startNextLevelImmediately}
          questions={questions}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
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
          onHeartsChanged={handleHeartsChanged}
          dailyGames={dailyGames}
          onQuestionFailed={handleQuestionFailed}
        />,
        document.body,
      )}
    </>
  );
}