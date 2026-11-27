'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import HeartSharingPanel from './trivia/HeartSharingPanel';
import TriviaAccountPanel from './trivia/TriviaAccountPanel';
import TriviaBottomNavigation, { type TriviaSection } from './trivia/TriviaBottomNavigation';
import TriviaLeaderboardPanel from './trivia/TriviaLeaderboardPanel';
import TriviaMoreGamesPanel from './trivia/TriviaMoreGamesPanel';
import TriviaPartyPanel from './trivia/TriviaPartyPanel';
import { TriviaUserBadge, WelcomeGamePanel } from './trivia/TriviaScreens';
import { useAuth } from '@/lib/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { fetchSpinStudents } from './trivia/TriviaSpinWheel';
import { MAX_DAILY_HEARTS } from '@/lib/trivia/heart-sharing';
import { MIN_ACCURACY_TO_LEVEL_UP } from '@/lib/trivia/levels';
import {
  X, Clock, Check, XCircle, Star, Trophy,
  SkipForward, Heart, ArrowRight, Gamepad2, Crown, RefreshCw, Home,
} from 'lucide-react';

export interface TriviaQuestion {
  id: string;
  referenceId?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  optionIndexes: number[];
  category: 'grammar' | 'vocabulary' | 'reading' | 'idioms' | 'common-mistakes';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  explanation?: string;
}

interface TriviaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  startImmediately?: boolean;
  questions: TriviaQuestion[];
  isLoading?: boolean;
  loadingMessage?: string;
  questionLoadError?: string | null;
  onRetryQuestions: () => void;
  userTotalPoints: number;
  currentLevel: number;
  levelUnlocked?: boolean;
  newLevel?: number;
  isMaxLevel?: boolean;
  dailyLockedUntil?: string | null;
  dailyHeartsRemaining: number;
  onHeartsChanged: () => void;
  dailyGames: { completed: number; limit: number; resetAt: string } | null;
  onQuestionFailed: (questionId: string, failureId: string) => Promise<{
    heartsRemaining: number;
    lockedUntil: string | null;
  }>;
  onComplete: (result: {
    correct: number;
    total: number;
    points: number;
    streak: number;
    submissionId: string;
    answers: Array<{ questionId: string; userAnswer: number; isCorrect: boolean }>;
  }) => Promise<TriviaCompletionResult | void>;
}

interface TriviaCompletionResult {
  currentLevel: number;
  newLevel: number;
  levelUnlocked: boolean;
}

function RefreshQuestionsButton({ onRefresh }: { onRefresh: () => void }) {
  const [spinning, setSpinning] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        if (spinning) return;
        setSpinning(true);
        onRefresh();
        window.setTimeout(() => setSpinning(false), 700);
      }}
      aria-label="Refresh questions"
      title="Refresh questions"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
    >
      <RefreshCw className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
    </button>
  );
}

function TriviaHeartsPanel({
  onHeartsChanged,
  onIncomingCountChange,
}: {
  onHeartsChanged: () => void;
  onIncomingCountChange: (count: number) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
      <div className="space-y-4 p-4">
        <HeartSharingPanel
          mode="incoming"
          isVisible
          showEmptyState
          onHeartsChanged={onHeartsChanged}
          onIncomingCountChange={onIncomingCountChange}
        />
        <HeartSharingPanel mode="request" onHeartsChanged={onHeartsChanged} />
      </div>
    </section>
  );
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
  isSubmitting: boolean;
  submissionError: string | null;
  hasStarted: boolean;
  isDailyLockout: boolean;
  isRecordingFailure: boolean;
  failureError: string | null;
  failedQuestionId: string | null;
  failureId: string | null;
  dailyHeartsRemaining: number;
}

const MAX_ATTEMPTS = 2;
const TIME_PER_QUESTION = 30;
const MAX_LEVEL = 10;
const SCORE_SAVING_MESSAGES = [
  'Saving your score…',
  'Updating your points…',
  'Updating your level…',
  'Finishing up…',
];

const makeInitialState = (dailyHeartsRemaining = MAX_DAILY_HEARTS): GameState => ({
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
  isSubmitting: false,
  submissionError: null,
  hasStarted: false,
  isDailyLockout: false,
  isRecordingFailure: false,
  failureError: null,
  failedQuestionId: null,
  failureId: null,
  dailyHeartsRemaining,
});

export default function TriviaModal({
  isOpen,
  onClose,
  onContinue,
  startImmediately = false,
  questions,
  isLoading = false,
  loadingMessage = 'Getting your game ready…',
  questionLoadError = null,
  onRetryQuestions,
  userTotalPoints,
  currentLevel,
  levelUnlocked = false,
  newLevel,
  dailyLockedUntil = null,
  dailyHeartsRemaining,
  onHeartsChanged,
  dailyGames,
  onQuestionFailed,
  onComplete,
}: TriviaModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.dataset.triviaModal = 'open';
    return () => {
      delete document.body.dataset.triviaModal;
    };
  }, [isOpen]);
  const [gameState, setGameState] = useState<GameState>(() =>
    makeInitialState(dailyHeartsRemaining),
  );
  const [activeSection, setActiveSection] = useState<TriviaSection>('trivia');
  const [incomingHeartRequestCount, setIncomingHeartRequestCount] = useState(0);
  const [completedLevel, setCompletedLevel] = useState<number | null>(null);
  const [completionResult, setCompletionResult] =
    useState<TriviaCompletionResult | null>(null);
  const [savingMessageIndex, setSavingMessageIndex] = useState(0);
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const isDirector = currentUser?.role?.toLowerCase() === 'super_admin' ||
    currentUser?.role?.toLowerCase() === 'superadmin';

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isOpenRef = useRef(isOpen);
  const queryClient = useQueryClient();

  // Prefetch party-game users as soon as the modal opens
  useEffect(() => {
    if (!isOpen || !isDirector) return;
    queryClient.prefetchQuery({
      queryKey: ['trivia-spin-students'],
      queryFn: fetchSpinStudents,
      staleTime: 60 * 1000,
    });
  }, [isOpen, isDirector, queryClient]);

  // Preload the More Games background video as soon as the modal opens
  useEffect(() => {
    if (!isOpen) return;
    const v = document.createElement('video');
    v.src = '/games.mp4';
    v.preload = 'auto';
    v.muted = true;
    v.load();
  }, [isOpen]);
  const gameStateRef = useRef(gameState);
  const dailyHeartsRef = useRef(dailyHeartsRemaining);
  const submissionIdRef = useRef<string | null>(null);
  const submissionInFlightRef = useRef(new Set<string>());
  gameStateRef.current = gameState;
  dailyHeartsRef.current = dailyHeartsRemaining;

  const currentQuestion = questions[gameState.currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion =
    totalQuestions === 0 || gameState.currentQuestionIndex >= totalQuestions - 1;
  const attemptsLeft = MAX_ATTEMPTS - gameState.attempts;
  const isUrgent = gameState.timeLeft <= 10;

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!gameState.isSubmitting) {
      setSavingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setSavingMessageIndex((index) => (index + 1) % SCORE_SAVING_MESSAGES.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [gameState.isSubmitting]);

  const handleQuestionFailure = useCallback(async (
    questionId: string,
    failureId = crypto.randomUUID(),
  ) => {
    const alreadyCounted = gameStateRef.current.failureId === failureId;
    setGameState((prev) => ({
      ...prev,
      isRecordingFailure: true,
      failureError: null,
      failedQuestionId: questionId,
      failureId,
      dailyHeartsRemaining: alreadyCounted
        ? prev.dailyHeartsRemaining
        : Math.max(0, prev.dailyHeartsRemaining - 1),
      isDailyLockout: alreadyCounted
        ? prev.isDailyLockout
        : prev.dailyHeartsRemaining <= 1,
    }));

    try {
      const result = await onQuestionFailed(questionId, failureId);
      setGameState((prev) => ({
        ...prev,
        isRecordingFailure: false,
        dailyHeartsRemaining: result.heartsRemaining,
        isDailyLockout: result.heartsRemaining === 0,
      }));
    } catch (error) {
      console.error('Failed to record failed trivia question:', error);
      setGameState((prev) => ({
        ...prev,
        isRecordingFailure: false,
        dailyHeartsRemaining: alreadyCounted
          ? prev.dailyHeartsRemaining
          : prev.dailyHeartsRemaining + 1,
        isDailyLockout: alreadyCounted ? prev.isDailyLockout : false,
        failureError:
          error instanceof Error
            ? error.message
            : 'Could not record this failed question. Please retry.',
      }));
    }
  }, [onQuestionFailed]);

  // ─── Timer ─────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const current = gameStateRef.current;
      if (
        !isOpenRef.current ||
        !current.hasStarted ||
        current.isAnswered ||
        current.showResult ||
        current.showExplanation ||
        current.showMoreGames ||
        activeSection !== 'trivia'
      ) {
        return;
      }

      if (current.timeLeft <= 1) {
        setGameState((prev) => {
          if (
            prev.isAnswered ||
            !prev.hasStarted ||
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
          return prev;
        });
        if (currentQuestion) {
          setGameState((prev) => ({
            ...prev,
            answers: [
              ...prev.answers,
              {
                questionId: currentQuestion.id,
                userAnswer: -1,
                isCorrect: false,
              },
            ],
          }));
          void handleQuestionFailure(currentQuestion.id);
        }
      } else {
        setGameState((prev) =>
          !prev.hasStarted || prev.isAnswered || prev.showResult || prev.showExplanation
            ? prev
            : { ...prev, timeLeft: prev.timeLeft - 1 },
        );
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSection, currentQuestion, handleQuestionFailure]);

  // ─── Reset when questions change or modal opens ────────────────
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen) {
      const initialState = makeInitialState(dailyHeartsRef.current);
      setGameState(
        startImmediately && questions.length > 0
          ? { ...initialState, hasStarted: true }
          : initialState,
      );
      // Only return to the Trivia tab when the modal (re)opens — not when
      // questions refetch while the user is on another section.
      if (!wasOpenRef.current) {
        setActiveSection('trivia');
      }
      wasOpenRef.current = true;
      setCompletedLevel(null);
      setCompletionResult(null);
      submissionIdRef.current = crypto.randomUUID();
    } else {
      wasOpenRef.current = false;
    }
  }, [isOpen, questions, startImmediately]); // Reset when new questions arrive

  useEffect(() => {
    setGameState((prev) =>
      prev.dailyHeartsRemaining === dailyHeartsRemaining
        ? prev
        : { ...prev, dailyHeartsRemaining },
    );
  }, [dailyHeartsRemaining]);

  // ─── Escape to close ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
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
          userAnswer: currentQuestion.optionIndexes[answerIndex],
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
          userAnswer: currentQuestion.optionIndexes[answerIndex],
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
        void handleQuestionFailure(currentQuestion.id);
      } else {
        setGameState((prev) => ({
          ...prev,
          selectedAnswer: answerIndex,
          attempts: newAttempts,
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
      handleQuestionFailure,
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
    void handleQuestionFailure(currentQuestion.id);
  }, [currentQuestion, handleQuestionFailure]);

  const saveGameResult = useCallback(async (result: {
    correct: number;
    total: number;
    points: number;
    streak: number;
    submissionId: string;
    answers: Array<{ questionId: string; userAnswer: number; isCorrect: boolean }>;
  }) => {
    if (submissionInFlightRef.current.has(result.submissionId)) return;
    submissionInFlightRef.current.add(result.submissionId);
    if (submissionIdRef.current === result.submissionId) {
      setGameState((prev) => ({
        ...prev,
        isSubmitting: true,
        submissionError: null,
      }));
    }

    try {
      const completion = await onComplete(result);
      if (completion) {
        setCompletedLevel(completion.currentLevel);
        setCompletionResult(completion);
      }
      if (submissionIdRef.current === result.submissionId) {
        setGameState((prev) => ({ ...prev, isSubmitting: false }));
      }
    } catch (error) {
      console.error('Failed to save trivia results:', error);
      if (submissionIdRef.current === result.submissionId) {
        setGameState((prev) => ({
          ...prev,
          isSubmitting: false,
          submissionError:
            error instanceof Error
              ? error.message
              : 'Failed to save your score. Please try again.',
        }));
      }
    } finally {
      submissionInFlightRef.current.delete(result.submissionId);
    }
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      setCompletedLevel(currentLevel);
      const basePoints = gameState.correct * 10;
      const streakBonus = gameState.maxStreak * 2;
      const skipPenalty = gameState.skipped * 2;
      const totalPoints = Math.max(0, basePoints + streakBonus - skipPenalty);
      const result = {
        correct: gameState.correct,
        total: totalQuestions,
        points: totalPoints,
        streak: gameState.maxStreak,
        submissionId: submissionIdRef.current ?? crypto.randomUUID(),
        answers: gameState.answers,
      };

      setGameState((prev) => ({ ...prev, showResult: true }));
      void saveGameResult(result);
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
    currentLevel,
    saveGameResult,
  ]);

  const retryGameResult = useCallback(() => {
    const points = Math.max(
      0,
      gameState.correct * 10 +
        gameState.maxStreak * 2 -
        gameState.skipped * 2,
    );
    void saveGameResult({
      correct: gameState.correct,
      total: totalQuestions,
      points,
      streak: gameState.maxStreak,
      submissionId: submissionIdRef.current ?? crypto.randomUUID(),
      answers: gameState.answers,
    });
  }, [
    gameState.correct,
    gameState.maxStreak,
    gameState.skipped,
    gameState.answers,
    totalQuestions,
    saveGameResult,
  ]);

  const selectSection = useCallback((section: TriviaSection) => {
    if (section === 'party' && !isDirector) return;
    setActiveSection(section);
    setGameState((prev) => ({ ...prev, showMoreGames: section === 'more-games' }));
  }, [isDirector]);

  const calculatePoints = () => {
    const basePoints = gameState.correct * 10;
    const streakBonus = gameState.maxStreak * 2;
    const skipPenalty = gameState.skipped * 2;
    return Math.max(0, basePoints + streakBonus - skipPenalty);
  };

  if (!isOpen) return null;

  const reachedGameLimit = dailyGames !== null &&
    dailyGames.completed >= dailyGames.limit &&
    Date.parse(dailyGames.resetAt) > Date.now();
  const isSpecialTriviaScreen =
    reachedGameLimit ||
    Boolean(dailyLockedUntil) ||
    totalQuestions === 0 ||
    (!gameState.hasStarted && !gameState.showResult) ||
    gameState.showResult;
  const isPreGameScreen =
    reachedGameLimit ||
    Boolean(dailyLockedUntil) ||
    totalQuestions === 0 ||
    (!gameState.hasStarted && !gameState.showResult);

  if (activeSection !== 'trivia' && isSpecialTriviaScreen) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative flex h-[min(620px,85dvh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex shrink-0 flex-col gap-1 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><h2 className="text-base font-bold tracking-tight text-slate-900">Trivia</h2></div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  {userTotalPoints + gameState.points}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-rose-600"
                  aria-label={`${gameState.dailyHeartsRemaining} daily hearts remaining`}
                  title={`${gameState.dailyHeartsRemaining} daily hearts remaining`}>
                  <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                  {gameState.dailyHeartsRemaining}
                </span>
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${isUrgent ? 'text-rose-600' : 'text-slate-500'}`}>
                <Clock className="h-3.5 w-3.5" />
                <span>{gameState.timeLeft}s</span>
              </div>
              <TriviaUserBadge user={currentUser} />
                <RefreshQuestionsButton onRefresh={onRetryQuestions} />
<button
                onClick={onClose}
                aria-label="Close trivia"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            </div>
          </div>
          {activeSection === 'hearts' ? (
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
              <TriviaHeartsPanel onHeartsChanged={onHeartsChanged} onIncomingCountChange={setIncomingHeartRequestCount} />
            </div>
          ) : activeSection === 'leaderboard' ? (
            <TriviaLeaderboardPanel />
          ) : activeSection === 'gifts' ? (
            <TriviaAccountPanel credits={userTotalPoints + gameState.points} />
          ) : activeSection === 'party' && isDirector ? (
            <div className="flex min-h-0 flex-1 flex-col px-5 py-4 sm:px-6">
              <TriviaPartyPanel />
            </div>
          ) : (
            <TriviaMoreGamesPanel
              onOpenParty={isDirector ? () => router.push('/dashboard/trivia-party') : undefined}
            />
          )}
          <TriviaBottomNavigation
            activeSection={activeSection}
            onSelect={selectSection}
            incomingHeartRequestCount={incomingHeartRequestCount}
          />
        </motion.div>
      </div>
    );
  }

  // ─── LOADING / EMPTY STATE ─────────────────────────────────────
  if (isPreGameScreen) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative flex h-[min(620px,85dvh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex shrink-0 flex-col gap-1 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><h2 className="text-base font-bold tracking-tight text-slate-900">Trivia</h2></div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  {userTotalPoints + gameState.points}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-rose-600"
                  aria-label={`${gameState.dailyHeartsRemaining} daily hearts remaining`}
                  title={`${gameState.dailyHeartsRemaining} daily hearts remaining`}>
                  <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                  {gameState.dailyHeartsRemaining}
                </span>
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${isUrgent ? 'text-rose-600' : 'text-slate-500'}`}>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{gameState.timeLeft}s</span>
                </div>
                <TriviaUserBadge user={currentUser} />
                                  <RefreshQuestionsButton onRefresh={onRetryQuestions} />
<button
                  onClick={onClose}
                  aria-label="Close trivia"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <WelcomeGamePanel
              totalQuestions={totalQuestions}
              currentLevel={currentLevel}
              dailyHeartsRemaining={gameState.dailyHeartsRemaining}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              questionLoadError={questionLoadError}
              returning={gameState.currentQuestionIndex > 0 || gameState.answers.length > 0}
              heartsLocked={Boolean(dailyLockedUntil) || gameState.dailyHeartsRemaining === 0}
              onRequestHearts={() => selectSection('hearts')}
              lockReason={
                reachedGameLimit
                  ? 'Daily limit reached — come back tomorrow'
                  : Boolean(dailyLockedUntil) || gameState.dailyHeartsRemaining === 0
                    ? 'Out of hearts'
                    : null
              }
              onStart={() =>
                setGameState((prev) => ({
                  ...prev,
                  hasStarted: true,
                  timeLeft: TIME_PER_QUESTION,
                }))
              }
            />
          </div>
          <TriviaBottomNavigation
            activeSection={activeSection}
            onSelect={selectSection}
            incomingHeartRequestCount={incomingHeartRequestCount}
          />
        </motion.div>
      </div>
    );
  }

  // ─── RESULTS SCREEN ────────────────────────────────────────────
  if (gameState.showResult) {
    const accuracy = Math.round((gameState.correct / totalQuestions) * 100);
    const points = calculatePoints();
    const resultLevel = completionResult?.currentLevel ?? completedLevel ?? currentLevel;
    const resultLevelUnlocked = completionResult?.levelUnlocked ?? levelUnlocked;
    const resultNewLevel = completionResult?.newLevel ?? newLevel;
    const qualifiesForNextLevel =
      resultLevel < MAX_LEVEL && accuracy >= MIN_ACCURACY_TO_LEVEL_UP;
    const showContinueButton =
      Boolean(onContinue) &&
      (resultLevelUnlocked || (gameState.isSubmitting && qualifiesForNextLevel));
    const nextLevel = resultNewLevel ?? resultLevel + 1;
    const completedAllLevels = resultLevel >= MAX_LEVEL && !resultLevelUnlocked;

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative flex h-[min(620px,85dvh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex shrink-0 flex-col gap-1 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold tracking-tight text-slate-900">Results</h2>
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  {userTotalPoints + gameState.points}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-rose-600"
                  aria-label={`${gameState.dailyHeartsRemaining} daily hearts remaining`}
                  title={`${gameState.dailyHeartsRemaining} daily hearts remaining`}>
                  <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                  {gameState.dailyHeartsRemaining}
                </span>
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${isUrgent ? 'text-rose-600' : 'text-slate-500'}`}>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{gameState.timeLeft}s</span>
                </div>
              <TriviaUserBadge user={currentUser} />
<button
                  onClick={onClose}
                  aria-label="Close trivia results"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-evenly gap-2 overflow-hidden px-4 py-2 sm:px-5">
            <div className="text-center">
              <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-amber-400">
                {completedAllLevels ? <Crown className="h-4 w-4" /> : <Trophy className="h-4 w-4" />}
              </div>
              <p className="text-[11px] font-medium text-slate-500">Points Earned</p>
              <p className="text-xl font-bold tracking-tight text-slate-900">+{gameState.points}</p>
              <p className="text-[10px] text-slate-400">
                Total: {userTotalPoints + gameState.points}
              </p>
              {gameState.isSubmitting && (
                <div
                  role="status"
                  aria-live="polite"
                  className="min-h-4 text-[10px] text-slate-500"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={savingMessageIndex}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      {SCORE_SAVING_MESSAGES[savingMessageIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              )}
              {gameState.submissionError && (
                <p role="alert" className="text-[10px] text-rose-600">
                  Your result is shown, but the score could not be saved.
                </p>
              )}
              {questionLoadError && !isLoading && (
                <p role="alert" className="text-[10px] text-rose-600">
                  {questionLoadError}
                </p>
              )}
            </div>

            {resultLevelUnlocked && resultNewLevel && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-emerald-50 px-3 py-1.5 text-center"
              >
                <p className="text-[11px] font-semibold text-emerald-800">
                  🎉 Level {resultNewLevel} unlocked!
                </p>
                <p className="text-[10px] text-emerald-600">
                  Keep the streak alive with 10 new questions.
                </p>
              </motion.div>
            )}
            {!resultLevelUnlocked && gameState.isSubmitting && qualifiesForNextLevel && (
              <p role="status" className="rounded-lg bg-emerald-50 px-3 py-1.5 text-center text-[11px] font-medium text-emerald-800">
                Updating your level…
              </p>
            )}

            {completedAllLevels && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-amber-50 px-3 py-1.5 text-center"
              >
                <p className="text-[11px] font-semibold text-amber-800">
                  👑 All {MAX_LEVEL} levels complete!
                </p>
                <p className="text-[10px] text-amber-700">
                  You&apos;ve mastered every level. Replay any level to sharpen your skills.
                </p>
              </motion.div>
            )}

            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600">
                  Level {resultLevel}
                </span>
                <span className="text-[10px] text-slate-500">
                  {resultLevel >= MAX_LEVEL ? 'Max' : `${MAX_LEVEL - resultLevel} to go`}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-slate-900 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(resultLevel / MAX_LEVEL) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 text-center">
                <p className="text-sm font-bold text-slate-800">
                  {gameState.correct}/{totalQuestions}
                </p>
                <p className="text-[9px] font-medium text-slate-500">Correct</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 text-center">
                <p className="text-sm font-bold text-slate-800">{accuracy}%</p>
                <p className="text-[9px] font-medium text-slate-500">Accuracy</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 text-center">
                <p className="text-sm font-bold text-slate-800">{gameState.maxStreak}</p>
                <p className="text-[9px] font-medium text-slate-500">Streak</p>
              </div>
            </div>
            <p className="text-center text-[10px] font-semibold text-rose-600">
              {gameState.dailyHeartsRemaining} daily{' '}
              {gameState.dailyHeartsRemaining === 1 ? 'heart' : 'hearts'} remaining
            </p>
            {dailyGames && (
              <p className="text-center text-[10px] font-semibold text-slate-500">
                {dailyGames.completed} of {dailyGames.limit} games completed today
                {reachedGameLimit ? ' — resets at midnight East Africa Time.' : ''}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              {gameState.submissionError && (
                <button
                  onClick={retryGameResult}
                  disabled={gameState.isSubmitting}
                  className="w-full rounded-lg bg-rose-50 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-wait disabled:opacity-70"
                >
                  {gameState.isSubmitting ? 'Saving score…' : 'Retry saving score'}
                </button>
              )}
              {showContinueButton ? (
                <button
                  onClick={onContinue}
                  disabled={
                    !resultLevelUnlocked ||
                    gameState.isSubmitting ||
                    isLoading ||
                    reachedGameLimit
                  }
                  className="w-full rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {reachedGameLimit && resultLevelUnlocked
                    ? `Level ${nextLevel} unlocked — available after reset`
                    : isLoading
                      ? `Loading Level ${nextLevel}…`
                    : gameState.isSubmitting
                      ? 'Updating your level…'
                      : questionLoadError
                        ? `Retry Level ${nextLevel}`
                        : `Continue to Level ${nextLevel} →`}
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {completedAllLevels ? 'Finish' : 'Done'}
                </button>
              )}
              
            </div>
          </div>
          <TriviaBottomNavigation
            activeSection={activeSection}
            onSelect={selectSection}
            incomingHeartRequestCount={incomingHeartRequestCount}
          />
        </motion.div>
      </div>
    );
  }

  // ─── GAMEPLAY SCREEN ──────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="relative flex h-[min(620px,85dvh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="absolute inset-x-0 top-0 z-10 h-1 bg-indigo-50">
          <motion.div
            className="h-full bg-indigo-600"
            animate={{
              width: `${((gameState.currentQuestionIndex + 1) / totalQuestions) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />
        </div>

        <div className="flex shrink-0 flex-col gap-1 px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2"><h2 className="text-base font-bold tracking-tight text-slate-900">Trivia</h2></div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="relative flex items-center gap-1 text-xs font-bold text-amber-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              {userTotalPoints + gameState.points}
              <AnimatePresence>
                {gameState.lastPointsEarned > 0 && gameState.feedbackType === 'success' && (
                  <motion.span
                    initial={{ opacity: 0, y: 0, scale: 0.8 }}
                    animate={{ opacity: 1, y: -16, scale: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="pointer-events-none absolute -top-1 right-0 text-[10px] font-bold text-emerald-600"
                  >
                    +{gameState.lastPointsEarned}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <span className="flex items-center gap-1 text-xs font-semibold text-rose-600"
                  aria-label={`${gameState.dailyHeartsRemaining} daily hearts remaining`}
                  title={`${gameState.dailyHeartsRemaining} daily hearts remaining`}>
                  <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                  {gameState.dailyHeartsRemaining}
                </span>

            <div
              className={`flex items-center gap-1.5 text-xs font-semibold ${
                isUrgent ? 'text-rose-600' : 'text-slate-500'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{gameState.timeLeft}s</span>
            </div>
              <TriviaUserBadge user={currentUser} />
              <RefreshQuestionsButton onRefresh={onRetryQuestions} />
<button
              onClick={onClose}
              aria-label="Close trivia"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
            </div>
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

        {activeSection === 'trivia' && <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3 text-xs font-semibold sm:px-6">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Question</span>
            <span className="font-bold text-slate-700">{gameState.currentQuestionIndex + 1}</span>
            <span className="font-normal text-slate-400">/ {totalQuestions}</span>
          </div>

          <div className="flex items-center gap-2">
            {!gameState.isAnswered && !gameState.showExplanation && !gameState.showMoreGames && (
              <span className="text-[10px] font-medium text-slate-500">
                {attemptsLeft} {attemptsLeft === 1 ? 'try' : 'tries'} left
              </span>
            )}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={gameState.currentQuestionIndex}
              className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700"
            >
              Level {currentLevel}
            </motion.div>
          </div>
        </div>}


        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-5 sm:px-6">
          <AnimatePresence mode="wait">
            {activeSection === 'hearts' ? (
              <motion.div
                key="hearts-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <TriviaHeartsPanel
                  onHeartsChanged={onHeartsChanged}
                  onIncomingCountChange={setIncomingHeartRequestCount}
                />
              </motion.div>
            ) : activeSection === 'leaderboard' ? (
              <motion.div
                key="leaderboard-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <TriviaLeaderboardPanel />
              </motion.div>
            ) : activeSection === 'gifts' ? (
              <motion.div
                key="gifts-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <TriviaAccountPanel credits={userTotalPoints + gameState.points} />
              </motion.div>
            ) : activeSection === 'more-games' ? (
              <motion.div
                key="more-games-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <TriviaMoreGamesPanel
                  onOpenParty={isDirector ? () => router.push('/dashboard/trivia-party') : undefined}
                />
              </motion.div>
            ) : activeSection === 'party' && isDirector ? (
              <motion.div
                key="party-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex min-h-0 flex-1 flex-col px-5 sm:px-6"
              >
                <TriviaPartyPanel />
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
                  <h3 className="text-base font-semibold leading-snug text-slate-900">
                    {currentQuestion?.question}
                  </h3>
                </motion.div>

                <div className="space-y-2">
                  {currentQuestion?.options.map((option, index) => {
                    let buttonStyle =
                      'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-slate-50';

                    if (gameState.isAnswered || gameState.showExplanation) {
                      if (index === currentQuestion.correctAnswer) {
                        buttonStyle =
                          'border-emerald-400 bg-emerald-50/70 text-emerald-900 font-medium';
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
                        'border-indigo-400 bg-indigo-50/70 text-indigo-900';
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
                        className={`relative flex w-full min-h-11 items-center rounded-xl border py-2 pl-3 pr-10 text-left text-sm transition-colors ${
                          gameState.isAnswered || gameState.showExplanation
                            ? 'cursor-default'
                            : 'cursor-pointer'
                        } ${buttonStyle}`}
                      >
                        <div className="flex min-w-0 w-full items-center gap-2.5">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-current text-xs font-semibold">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="min-w-0 flex-1 break-words leading-relaxed">
                            {option}
                          </span>
                        </div>

                        {showCorrectIcon && (
                          <Check
                            aria-label="Correct answer"
                            className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600"
                          />
                        )}
                        {gameState.isAnswered &&
                          index === gameState.selectedAnswer &&
                          index !== currentQuestion.correctAnswer && (
                            <XCircle
                              aria-label="Incorrect answer"
                              className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-600"
                            />
                          )}
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
                {gameState.submissionError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
                  >
                    {gameState.submissionError} Your answers are still here; select
                    Retry to submit them again.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-slate-50/60 px-5 py-0 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="ml-auto flex items-center gap-2">
              {activeSection === 'trivia' && (
                <>
              {!gameState.showMoreGames &&
                !gameState.isDailyLockout &&
              !gameState.isAnswered &&
                !gameState.showExplanation && (
                  <button
                    onClick={handleSkip}
                    className="flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-900"
                  >
                    <SkipForward className="h-3 w-3" />
                    Skip
                  </button>
                )}

              {!gameState.showMoreGames &&
                !gameState.isDailyLockout &&
                (gameState.isAnswered || gameState.showExplanation) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleNext}
                    disabled={gameState.isSubmitting}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-70"
                  >
                    {gameState.isSubmitting ? (
                      <>Saving score...</>
                    ) : isLastQuestion ? (
                      <>
                        <Trophy className="h-3 w-3" />
                        {gameState.submissionError ? 'Retry' : 'Finish'}
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-3 w-3" />
                      </>
                    )}
                  </motion.button>
                )}
              {gameState.failureError &&
                gameState.failedQuestionId &&
                gameState.failureId && (
                <div className="flex items-center gap-2">
                  <span role="alert" className="max-w-48 text-xs text-rose-600">
                    {gameState.failureError}
                  </span>
                  <button
                    onClick={() => {
                      if (gameState.failedQuestionId) {
                        void handleQuestionFailure(
                          gameState.failedQuestionId,
                          gameState.failureId ?? undefined,
                        );
                      }
                    }}
                    disabled={gameState.isRecordingFailure}
                    className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-70"
                  >
                    Retry
                  </button>
                </div>
              )}
                </>
              )}
            </div>
          </div>

          <TriviaBottomNavigation
            activeSection={activeSection}
            onSelect={(section) => section === 'trivia' ? setGameState((prev) => ({ ...prev, hasStarted: false })) : selectSection(section)}
            incomingHeartRequestCount={incomingHeartRequestCount}
            triviaLabel="Home"
          />
        </div>
      </motion.div>
    </div>
  );
}