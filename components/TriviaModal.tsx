'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Clock, CheckCircle2, XCircle, Star, Trophy,
  SkipForward, Heart, ArrowRight, Gamepad2, ArrowLeft, Crown,
} from 'lucide-react';

export interface TriviaQuestion {
  id: string;
  referenceId?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: 'grammar' | 'vocabulary' | 'reading' | 'idioms' | 'common-mistakes';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  explanation?: string;
}

interface TriviaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  questions: TriviaQuestion[];
  isLoading?: boolean;
  userTotalPoints: number;
  currentLevel: number;
  levelUnlocked?: boolean;
  newLevel?: number;
  isMaxLevel?: boolean;
  onComplete: (result: {
    correct: number;
    total: number;
    points: number;
    streak: number;
    answers: Array<{ questionId: string; userAnswer: number; isCorrect: boolean }>;
  }) => void;
}

interface GameState {
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  isAnswered: boolean;
  attempts: number;
  correct: number;
  streak: number;
  maxStreak: number;
  timeLeft: number;
  showResult: boolean;
  showExplanation: boolean;
  showMoreGames: boolean;
  skipped: number;
  points: number;
  feedback: string | null;
  feedbackType: 'success' | 'error' | null;
  lastPointsEarned: number;
  shakeKey: number;
  answers: Array<{ questionId: string; userAnswer: number; isCorrect: boolean }>;
  showPointsPopup: boolean;
}

const MAX_ATTEMPTS = 3;
const TIME_PER_QUESTION = 30;
const MAX_LEVEL = 10;

const makeInitialState = (): GameState => ({
  currentQuestionIndex: 0,
  selectedAnswer: null,
  isAnswered: false,
  attempts: 0,
  correct: 0,
  streak: 0,
  maxStreak: 0,
  timeLeft: TIME_PER_QUESTION,
  showResult: false,
  showExplanation: false,
  showMoreGames: false,
  skipped: 0,
  points: 0,
  feedback: null,
  feedbackType: null,
  lastPointsEarned: 0,
  shakeKey: 0,
  answers: [],
  showPointsPopup: false,
});

export default function TriviaModal({
  isOpen,
  onClose,
  onContinue,
  questions,
  isLoading = false,
  userTotalPoints,
  currentLevel,
  levelUnlocked = false,
  newLevel,
  isMaxLevel = false,
  onComplete,
}: TriviaModalProps) {
  const [gameState, setGameState] = useState<GameState>(makeInitialState());

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isOpenRef = useRef(isOpen);

  const currentQuestion = questions[gameState.currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion =
    totalQuestions === 0 || gameState.currentQuestionIndex >= totalQuestions - 1;
  const attemptsLeft = MAX_ATTEMPTS - gameState.attempts;
  const isUrgent = gameState.timeLeft <= 10;

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // ─── Timer ─────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (
          !isOpenRef.current ||
          prev.isAnswered ||
          prev.showResult ||
          prev.showExplanation ||
          prev.showMoreGames
        ) {
          return prev;
        }

        if (prev.timeLeft <= 1) {
          return {
            ...prev,
            timeLeft: 0,
            isAnswered: true,
            showExplanation: true,
            selectedAnswer: null,
            streak: 0,
            attempts: MAX_ATTEMPTS,
            feedback: 'Time expired!',
            feedbackType: 'error',
          };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ─── Reset when questions change or modal opens ────────────────
  useEffect(() => {
    if (isOpen) {
      setGameState(makeInitialState());
    }
  }, [isOpen, questions]); // Reset when new questions arrive

  // ─── Escape to close ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // ─── Answer handler ────────────────────────────────────────────
  const handleAnswer = useCallback(
    (answerIndex: number) => {
      if (gameState.isAnswered || gameState.showExplanation || gameState.showMoreGames) return;
      if (!currentQuestion) return;

      const isCorrect = answerIndex === currentQuestion.correctAnswer;
      const newAttempts = gameState.attempts + 1;
      const attemptsLeftNow = MAX_ATTEMPTS - newAttempts;

      if (isCorrect) {
        const newStreak = gameState.streak + 1;
        const newMaxStreak = Math.max(gameState.maxStreak, newStreak);
        const newCorrect = gameState.correct + 1;
        const pointsEarned = 10 + (newStreak >= 3 ? 5 : 0);

        const newAnswer = {
          questionId: currentQuestion.id,
          userAnswer: answerIndex,
          isCorrect: true,
        };

        setGameState((prev) => ({
          ...prev,
          selectedAnswer: answerIndex,
          isAnswered: true,
          correct: newCorrect,
          streak: newStreak,
          maxStreak: newMaxStreak,
          attempts: newAttempts,
          points: prev.points + pointsEarned,
          showExplanation: true,
          feedback: currentQuestion.explanation || 'Correct!',
          feedbackType: 'success',
          lastPointsEarned: pointsEarned,
          showPointsPopup: true,
          answers: [...prev.answers, newAnswer],
        }));

        setTimeout(() => {
          setGameState((prev) => ({ ...prev, showPointsPopup: false }));
        }, 2000);
      } else if (newAttempts >= MAX_ATTEMPTS) {
        const newAnswer = {
          questionId: currentQuestion.id,
          userAnswer: answerIndex,
          isCorrect: false,
        };

        setGameState((prev) => ({
          ...prev,
          selectedAnswer: answerIndex,
          isAnswered: true,
          showExplanation: true,
          attempts: newAttempts,
          streak: 0,
          feedback: 'Incorrect. The correct option is highlighted.',
          feedbackType: 'error',
          shakeKey: prev.shakeKey + 1,
          answers: [...prev.answers, newAnswer],
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          selectedAnswer: answerIndex,
          attempts: newAttempts,
          streak: 0,
          feedback:
            attemptsLeftNow === 1
              ? 'Incorrect! 1 chance remaining'
              : `Incorrect! ${attemptsLeftNow} chances remaining`,
          feedbackType: 'error',
          shakeKey: prev.shakeKey + 1,
        }));

        setTimeout(() => {
          setGameState((prev) => ({
            ...prev,
            selectedAnswer: null,
            feedback: null,
            feedbackType: null,
          }));
        }, 1200);
      }
    },
    [
      gameState.isAnswered,
      gameState.showExplanation,
      gameState.showMoreGames,
      gameState.attempts,
      currentQuestion,
      gameState.streak,
      gameState.correct,
      gameState.maxStreak,
    ],
  );

  const handleSkip = useCallback(() => {
    if (!currentQuestion) return;
    const newAnswer = {
      questionId: currentQuestion.id,
      userAnswer: -1,
      isCorrect: false,
    };

    setGameState((prev) => ({
      ...prev,
      skipped: prev.skipped + 1,
      streak: 0,
      showExplanation: true,
      isAnswered: true,
      attempts: MAX_ATTEMPTS,
      feedback: 'Question skipped.',
      feedbackType: 'error',
      answers: [...prev.answers, newAnswer],
    }));
  }, [currentQuestion]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      const basePoints = gameState.correct * 10;
      const streakBonus = gameState.maxStreak * 2;
      const skipPenalty = gameState.skipped * 2;
      const totalPoints = Math.max(0, basePoints + streakBonus - skipPenalty);

      onComplete({
        correct: gameState.correct,
        total: totalQuestions,
        points: totalPoints,
        streak: gameState.maxStreak,
        answers: gameState.answers,
      });

      setGameState((prev) => ({ ...prev, showResult: true }));
    } else {
      setGameState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        isAnswered: false,
        attempts: 0,
        timeLeft: TIME_PER_QUESTION,
        showExplanation: false,
        feedback: null,
        feedbackType: null,
        lastPointsEarned: 0,
      }));
    }
  }, [
    isLastQuestion,
    gameState.correct,
    gameState.maxStreak,
    gameState.skipped,
    gameState.answers,
    totalQuestions,
    onComplete,
  ]);

  const toggleMoreGames = useCallback(() => {
    setGameState((prev) => ({ ...prev, showMoreGames: !prev.showMoreGames }));
  }, []);

  const calculatePoints = () => {
    const basePoints = gameState.correct * 10;
    const streakBonus = gameState.maxStreak * 2;
    const skipPenalty = gameState.skipped * 2;
    return Math.max(0, basePoints + streakBonus - skipPenalty);
  };

  if (!isOpen) return null;

  // ─── SKELETON / EMPTY STATE ────────────────────────────────────
  if (totalQuestions === 0) {
    if (!isLoading) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200/50"
          >
            <div className="flex items-center justify-between border-b border-slate-100/80 px-4 py-3">
              <h2 className="text-sm font-bold text-slate-900">Trivia</h2>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm font-semibold text-slate-700">No questions available</p>
              <p className="mt-1 text-xs text-slate-500">
                Try again in a moment — new questions are on the way.
              </p>
              <button
                onClick={onClose}
                className="mt-4 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200/50 flex flex-col"
        >
          <div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-slate-100 overflow-hidden">
            <motion.div
              className="h-full w-1/3 bg-gradient-to-r from-slate-900 to-slate-700"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <div className="flex items-center justify-between border-b border-slate-100/80 px-4 py-3">
            <div className="h-4 w-14 rounded bg-slate-200/70 animate-pulse" />
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-16 rounded-md bg-slate-200/70 animate-pulse" />
              <div className="h-4 w-10 rounded bg-slate-200/70 animate-pulse" />
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="bg-slate-900/5 border-b border-slate-200/60 px-4 py-2 flex items-center justify-between">
            <div className="h-3 w-10 rounded bg-slate-200/70 animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-10 rounded bg-slate-200/70 animate-pulse" />
              <div className="h-4 w-6 rounded-sm bg-slate-200/70 animate-pulse" />
            </div>
          </div>
          <div className="relative p-4 space-y-4 min-h-[280px] flex-1">
            <div className="space-y-2">
              <div className="h-3.5 w-full rounded bg-slate-200/70 animate-pulse" />
              <div className="h-3.5 w-3/4 rounded bg-slate-200/70 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 min-h-[3rem]"
                >
                  <div className="h-5 w-5 shrink-0 rounded-md bg-slate-200/70 animate-pulse" />
                  <div className="flex-1 space-y-1.5 pt-0.5">
                    <div className="h-3 w-full rounded bg-slate-200/70 animate-pulse" />
                    <div className="h-3 w-2/3 rounded bg-slate-200/70 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-3 w-24 rounded bg-slate-200/50 animate-pulse" />
          </div>
          <div className="flex items-center justify-between border-t border-slate-100/80 px-4 py-2.5 bg-slate-50/30">
            <div className="h-3.5 w-14 rounded bg-slate-200/70 animate-pulse" />
            <div className="h-6 w-16 rounded-md bg-slate-200/70 animate-pulse" />
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── RESULTS SCREEN ────────────────────────────────────────────
  if (gameState.showResult) {
    const accuracy = Math.round((gameState.correct / totalQuestions) * 100);
    const points = calculatePoints();
    const completedAllLevels = isMaxLevel && !levelUnlocked;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200/50"
        >
          <div className="flex items-center justify-between border-b border-slate-100/80 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Results</h2>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div className="text-center">
              <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-amber-400">
                {completedAllLevels ? <Crown className="h-5 w-5" /> : <Trophy className="h-5 w-5" />}
              </div>
              <p className="text-xs font-medium text-slate-500">Points Earned</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">+{points}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Total: {userTotalPoints + points}
              </p>
            </div>

            {levelUnlocked && newLevel && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-emerald-50 p-3 border border-emerald-200 text-center"
              >
                <p className="text-xs font-semibold text-emerald-800">
                  🎉 Level {newLevel} unlocked!
                </p>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  Keep the streak alive with 10 new questions.
                </p>
              </motion.div>
            )}

            {completedAllLevels && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-amber-50 p-3 border border-amber-200 text-center"
              >
                <p className="text-xs font-semibold text-amber-800">
                  👑 All {MAX_LEVEL} levels complete!
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  You&apos;ve mastered every level. Replay any level to sharpen your skills.
                </p>
              </motion.div>
            )}

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-600">
                  Level {currentLevel}
                </span>
                <span className="text-[10px] text-slate-500">
                  {currentLevel >= MAX_LEVEL ? 'Max' : `${MAX_LEVEL - currentLevel} to go`}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-slate-900 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(currentLevel / MAX_LEVEL) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-slate-50 p-2.5 text-center border border-slate-200/60">
                <p className="text-base font-bold text-slate-800">
                  {gameState.correct}/{totalQuestions}
                </p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Correct</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 text-center border border-slate-200/60">
                <p className="text-base font-bold text-slate-800">{accuracy}%</p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Accuracy</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 text-center border border-slate-200/60">
                <p className="text-base font-bold text-slate-800">{gameState.maxStreak}</p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Streak</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {levelUnlocked && onContinue ? (
                <button
                  onClick={onContinue}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Continue to Level {newLevel} →
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {completedAllLevels ? 'Finish' : 'Done'}
                </button>
              )}
              
              {levelUnlocked && onContinue && (
                <button
                  onClick={onClose}
                  className="w-full py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  Maybe later
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── GAMEPLAY SCREEN ──────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200/50 flex flex-col"
      >
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-slate-100">
          <motion.div
            className="h-full bg-gradient-to-r from-slate-900 to-slate-700"
            animate={{
              width: `${((gameState.currentQuestionIndex + 1) / totalQuestions) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />
        </div>

        <div className="flex items-center justify-between border-b border-slate-100/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Trivia</h2>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center gap-1.5 rounded-md bg-slate-900 px-2 py-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold text-white">
                {userTotalPoints + gameState.points}
              </span>
              <AnimatePresence>
                {gameState.lastPointsEarned > 0 && gameState.feedbackType === 'success' && (
                  <motion.span
                    initial={{ opacity: 0, y: 0, scale: 0.8 }}
                    animate={{ opacity: 1, y: -16, scale: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="pointer-events-none absolute -top-1 right-0 text-[10px] font-bold text-emerald-400"
                  >
                    +{gameState.lastPointsEarned}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div
              className={`flex items-center gap-1 text-[11px] font-semibold ${
                isUrgent ? 'text-rose-600' : 'text-slate-600'
              }`}
            >
              <Clock className="h-3 w-3" />
              <span>{gameState.timeLeft}s</span>
            </div>

            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {gameState.showPointsPopup && gameState.lastPointsEarned > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -50 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute top-20 left-1/2 -translate-x-1/2 z-20"
            >
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg">
                <Star className="h-5 w-5 fill-white" />
                <span className="text-sm font-bold">+{gameState.lastPointsEarned} points!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-slate-900/5 border-b border-slate-200/60 px-4 py-2 flex items-center justify-between text-[11px] font-semibold text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">{gameState.currentQuestionIndex + 1}</span>
            <span className="text-slate-300 font-light">/</span>
            <span className="text-slate-500">{totalQuestions}</span>
          </div>

          <div className="flex items-center gap-2">
            {!gameState.isAnswered && !gameState.showExplanation && !gameState.showMoreGames && (
              <div className="flex items-center gap-0.5">
                {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`h-2.5 w-2.5 transition-colors ${
                      i < attemptsLeft ? 'fill-rose-500 text-rose-500' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
            )}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={gameState.currentQuestionIndex}
              className="rounded-sm bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white tracking-wide"
            >
              L{currentLevel}
            </motion.div>
          </div>
        </div>

        <div className="relative p-4 space-y-3 min-h-[280px] flex-1">
          <AnimatePresence mode="wait">
            {gameState.showMoreGames ? (
              <motion.div
                key="more-games-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center text-center space-y-4 py-8"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Gamepad2 className="h-7 w-7" />
                </div>

                <div className="space-y-1 max-w-xs">
                  <h4 className="text-base font-bold text-slate-900">More Games Coming Soon</h4>
                  <p className="text-xs leading-relaxed text-slate-500">
                    More games are under development — they will appear here automatically as soon
                    as they are ready to play!
                  </p>
                </div>

                <button
                  onClick={toggleMoreGames}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Trivia
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="question-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <motion.div
                  key={gameState.shakeKey}
                  animate={
                    gameState.feedbackType === 'error' && !gameState.showExplanation
                      ? { x: [0, -4, 4, -4, 4, 0] }
                      : {}
                  }
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-sm font-semibold leading-snug text-slate-900">
                    {currentQuestion?.question}
                  </h3>
                </motion.div>

                <div className="space-y-1.5">
                  {currentQuestion?.options.map((option, index) => {
                    let buttonStyle =
                      'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';

                    if (gameState.isAnswered || gameState.showExplanation) {
                      if (index === currentQuestion.correctAnswer) {
                        buttonStyle =
                          'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-medium';
                      } else if (
                        index === gameState.selectedAnswer &&
                        index !== currentQuestion.correctAnswer
                      ) {
                        buttonStyle =
                          'border-rose-500 bg-rose-50/50 text-rose-900 font-medium';
                      } else {
                        buttonStyle =
                          'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60';
                      }
                    } else if (index === gameState.selectedAnswer) {
                      buttonStyle =
                        'border-indigo-500 bg-indigo-50/50 text-indigo-900';
                    }

                    const showCorrectIcon =
                      (gameState.isAnswered || gameState.showExplanation) &&
                      index === currentQuestion.correctAnswer;

                    return (
                      <motion.button
                        key={index}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleAnswer(index)}
                        disabled={gameState.isAnswered || gameState.showExplanation}
                        className={`flex w-full items-start justify-between rounded-lg border px-3 py-2.5 text-left text-[13px] transition-all min-h-[3rem] ${
                          gameState.isAnswered || gameState.showExplanation
                            ? 'cursor-default'
                            : 'cursor-pointer'
                        } ${buttonStyle}`}
                      >
                        <div className="flex items-start gap-2.5 flex-1">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-current text-[10px] font-semibold mt-0.5">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="leading-relaxed break-words whitespace-normal flex-1">
                            {option}
                          </span>
                        </div>

                        <AnimatePresence>
                          {showCorrectIcon && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="shrink-0 ml-2"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            </motion.div>
                          )}
                          {gameState.isAnswered &&
                            index === gameState.selectedAnswer &&
                            index !== currentQuestion.correctAnswer && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="shrink-0 ml-2"
                              >
                                <XCircle className="h-3.5 w-3.5 text-rose-600" />
                              </motion.div>
                            )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="min-h-[1.25rem] flex items-center">
                  <AnimatePresence mode="wait">
                    {gameState.feedback && (
                      <motion.p
                        key={gameState.feedback}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={`text-[11px] font-medium leading-relaxed ${
                          gameState.feedbackType === 'success'
                            ? 'text-emerald-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {gameState.feedback}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100/80 px-4 py-2.5 bg-slate-50/30">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMoreGames}
              className={`flex items-center gap-1 text-[11px] font-semibold transition ${
                gameState.showMoreGames
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>Games</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!gameState.showMoreGames &&
              !gameState.isAnswered &&
              !gameState.showExplanation && (
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-2 py-1"
                >
                  <SkipForward className="h-3 w-3" />
                  Skip
                </button>
              )}

            {!gameState.showMoreGames &&
              (gameState.isAnswered || gameState.showExplanation) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleNext}
                  className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {isLastQuestion ? (
                    <>
                      <Trophy className="h-3 w-3" />
                      Finish
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </motion.button>
              )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}