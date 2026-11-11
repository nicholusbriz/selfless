'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Clock, CheckCircle2, XCircle, Star, Trophy,
  SkipForward, Heart, Flame, ArrowRight, Gamepad2, ArrowLeft
} from 'lucide-react';
import type { TriviaQuestion } from '@/lib/trivia-questions';

interface TriviaModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: TriviaQuestion[];
  onComplete: (result: {
    correct: number;
    total: number;
    points: number;
    streak: number;
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
}

const MAX_ATTEMPTS = 3;
const TIME_PER_QUESTION = 30;

export default function TriviaModal({ isOpen, onClose, questions, onComplete }: TriviaModalProps) {
  const [gameState, setGameState] = useState<GameState>({
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
  });

  const prevPointsRef = useRef(0);
  const currentQuestion = questions[gameState.currentQuestionIndex];
  const isLastQuestion = gameState.currentQuestionIndex === questions.length - 1;
  const attemptsLeft = MAX_ATTEMPTS - gameState.attempts;
  const isUrgent = gameState.timeLeft <= 10;

  // Timer effect
  useEffect(() => {
    if (!isOpen || gameState.isAnswered || gameState.showResult || gameState.showExplanation || gameState.showMoreGames) return;

    const timer = setInterval(() => {
      setGameState(prev => {
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

    return () => clearInterval(timer);
  }, [isOpen, gameState.isAnswered, gameState.showResult, gameState.showExplanation, gameState.showMoreGames]);

  // Reset game when modal opens
  useEffect(() => {
    if (isOpen) {
      prevPointsRef.current = 0;
      setGameState({
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
      });
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (gameState.isAnswered || gameState.showExplanation || gameState.showMoreGames) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const newAttempts = gameState.attempts + 1;
    const attemptsLeftNow = MAX_ATTEMPTS - newAttempts;

    if (isCorrect) {
      const newStreak = gameState.streak + 1;
      const newMaxStreak = Math.max(gameState.maxStreak, newStreak);
      const newCorrect = gameState.correct + 1;
      const pointsEarned = 10 + (newStreak >= 3 ? 5 : 0);
      const newPoints = gameState.points + pointsEarned;

      prevPointsRef.current = gameState.points;

      setGameState(prev => ({
        ...prev,
        selectedAnswer: answerIndex,
        isAnswered: true,
        correct: newCorrect,
        streak: newStreak,
        maxStreak: newMaxStreak,
        attempts: newAttempts,
        points: newPoints,
        showExplanation: true,
        feedback: currentQuestion.explanation || 'Correct!',
        feedbackType: 'success',
        lastPointsEarned: pointsEarned,
      }));
    } else if (newAttempts >= MAX_ATTEMPTS) {
      setGameState(prev => ({
        ...prev,
        selectedAnswer: answerIndex,
        isAnswered: true,
        showExplanation: true,
        attempts: newAttempts,
        streak: 0,
        feedback: 'Incorrect. The correct option is highlighted.',
        feedbackType: 'error',
        shakeKey: prev.shakeKey + 1,
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        selectedAnswer: answerIndex,
        attempts: newAttempts,
        streak: 0,
        feedback: attemptsLeftNow === 1 ? 'Incorrect! 1 chance remaining' : `Incorrect! ${attemptsLeftNow} chances remaining`,
        feedbackType: 'error',
        shakeKey: prev.shakeKey + 1,
      }));

      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          selectedAnswer: null,
          feedback: null,
          feedbackType: null,
        }));
      }, 1200);
    }
  }, [gameState.isAnswered, gameState.showExplanation, gameState.showMoreGames, gameState.attempts, currentQuestion?.correctAnswer, currentQuestion?.explanation, gameState.streak, gameState.correct, gameState.maxStreak, gameState.points]);

  const handleSkip = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      skipped: prev.skipped + 1,
      streak: 0,
      showExplanation: true,
      isAnswered: true,
      attempts: MAX_ATTEMPTS,
      feedback: 'Question skipped.',
      feedbackType: 'error',
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      const basePoints = gameState.correct * 10;
      const streakBonus = gameState.maxStreak * 2;
      const skipPenalty = gameState.skipped * 2;
      const totalPoints = Math.max(0, basePoints + streakBonus - skipPenalty);

      onComplete({
        correct: gameState.correct,
        total: questions.length,
        points: totalPoints,
        streak: gameState.maxStreak,
      });
      onClose();
    } else {
      setGameState(prev => ({
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
  }, [isLastQuestion, gameState.correct, gameState.maxStreak, gameState.skipped, questions.length, onComplete, onClose]);

  const toggleMoreGames = useCallback(() => {
    setGameState(prev => ({ ...prev, showMoreGames: !prev.showMoreGames }));
  }, []);

  const calculatePoints = () => {
    const basePoints = gameState.correct * 10;
    const streakBonus = gameState.maxStreak * 2;
    const skipPenalty = gameState.skipped * 2;
    return Math.max(0, basePoints + streakBonus - skipPenalty);
  };

  if (!isOpen) return null;

  // ─── RESULTS SCREEN ───────────────────────────────────────────────
  if (gameState.showResult) {
    const accuracy = Math.round((gameState.correct / questions.length) * 100);
    const points = calculatePoints();

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-100"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Trivia</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Trophy className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Total Points Earned</p>
              <p className="text-3xl font-bold tracking-tight text-slate-900 mt-1">+{points}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                <p className="text-lg font-bold text-slate-800">
                  {gameState.correct}/{questions.length}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Correct</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                <p className="text-lg font-bold text-slate-800">{accuracy}%</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Accuracy</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                <p className="text-lg font-bold text-slate-800">{gameState.maxStreak}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Max Streak</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── GAMEPLAY SCREEN ──────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-100 flex flex-col"
      >
        {/* Progress bar */}
        <div className="absolute inset-x-0 top-0 z-10 h-1 bg-slate-100">
          <motion.div
            className="h-full bg-indigo-600"
            animate={{
              width: `${((gameState.currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 25 }}
          />
        </div>

        {/* Header - Title with "New day, new challenge!" in code font */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-slate-900">Trivia</h2>
            <span className="text-[11px] font-mono font-semibold text-indigo-600 tracking-tight">
              New day, new challenge!
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 border border-amber-100/50">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span className="text-xs font-bold text-amber-700">
                {gameState.points}
              </span>
              <AnimatePresence>
                {gameState.lastPointsEarned > 0 && gameState.feedbackType === 'success' && (
                  <motion.span
                    initial={{ opacity: 0, y: 0, scale: 0.8 }}
                    animate={{ opacity: 1, y: -20, scale: 1 }}
                    exit={{ opacity: 0, y: -28 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="pointer-events-none absolute -top-1 right-0 text-[11px] font-bold text-emerald-600"
                  >
                    +{gameState.lastPointsEarned}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className={`flex items-center gap-1 text-xs font-semibold ${isUrgent ? 'text-rose-600' : 'text-slate-600'}`}>
              <Clock className="h-3.5 w-3.5" />
              <span>{gameState.timeLeft}s</span>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Level/Progress Bar with reduced padding (py-1.5 px-5) */}
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-1.5 flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Question</span>
            <span className="font-bold text-indigo-600">{gameState.currentQuestionIndex + 1}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">{questions.length}</span>
          </div>

          <div className="flex items-center gap-2">
            {!gameState.isAnswered && !gameState.showExplanation && !gameState.showMoreGames && (
              <div className="flex items-center gap-1">
                {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`h-3 w-3 transition-colors ${
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
              className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-100"
            >
              Level {Math.floor(gameState.currentQuestionIndex / 3) + 1}
            </motion.div>
          </div>
        </div>

        {/* Content Body Area */}
        <div className="relative p-5 space-y-4 min-h-[320px] flex-1">
          <AnimatePresence mode="wait">
            {gameState.showMoreGames ? (
              /* ─── MORE GAMES SLIDE PANEL ─── */
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
                    More games are under development — they will appear here automatically as soon as they are ready to play!
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
              /* ─── TRIVIA QUESTION PANEL ─── */
              <motion.div
                key="question-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Question Box */}
                <motion.div
                  key={gameState.shakeKey}
                  animate={
                    gameState.feedbackType === 'error' && !gameState.showExplanation
                      ? { x: [0, -4, 4, -4, 4, 0] }
                      : {}
                  }
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-base font-semibold leading-snug text-slate-900">
                    {currentQuestion.question}
                  </h3>
                </motion.div>

                {/* Options List */}
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => {
                    let buttonStyle = 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';

                    if (gameState.isAnswered || gameState.showExplanation) {
                      if (index === currentQuestion.correctAnswer) {
                        buttonStyle = 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-medium';
                      } else if (index === gameState.selectedAnswer && index !== currentQuestion.correctAnswer) {
                        buttonStyle = 'border-rose-500 bg-rose-50/50 text-rose-900 font-medium';
                      } else {
                        buttonStyle = 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60';
                      }
                    } else if (index === gameState.selectedAnswer) {
                      buttonStyle = 'border-indigo-500 bg-indigo-50/50 text-indigo-900';
                    }

                    const isCorrect = (gameState.isAnswered || gameState.showExplanation) && index === currentQuestion.correctAnswer;

                    return (
                      <motion.button
                        key={index}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleAnswer(index)}
                        disabled={gameState.isAnswered || gameState.showExplanation}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                          gameState.isAnswered || gameState.showExplanation ? 'cursor-default' : 'cursor-pointer'
                        } ${buttonStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-current text-[11px] font-semibold">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="leading-normal">{option}</span>
                        </div>

                        <AnimatePresence>
                          {isCorrect && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            </motion.div>
                          )}
                          {gameState.isAnswered && index === gameState.selectedAnswer && index !== currentQuestion.correctAnswer && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Feedback Section */}
                <div className="min-h-[1.5rem] flex items-center">
                  <AnimatePresence mode="wait">
                    {gameState.feedback && (
                      <motion.p
                        key={gameState.feedback}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={`text-xs font-medium leading-relaxed ${
                          gameState.feedbackType === 'success' ? 'text-emerald-700' : 'text-rose-600'
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

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-3 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMoreGames}
                className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                  gameState.showMoreGames ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Gamepad2 className="h-4 w-4" />
                <span>More Games</span>
              </button>

              <div className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 border border-orange-100">
                <Flame className="h-3 w-3 fill-orange-500 text-orange-500 animate-pulse" />
                <span className="text-[11px] font-bold text-orange-700">3 streak active</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!gameState.showMoreGames && !gameState.isAnswered && !gameState.showExplanation && (
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  Skip
                </button>
              )}

              {!gameState.showMoreGames && (gameState.isAnswered || gameState.showExplanation) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleNext}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  {isLastQuestion ? (
                    <>
                      <Trophy className="h-3.5 w-3.5" />
                      Finish
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* ✅ Powered by English Hub branding added at the very bottom */}
          <div className="text-center pt-1 border-t border-slate-200/40">
            <span className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
              Powered by English Hub
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}