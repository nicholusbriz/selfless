'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Crown, Gamepad2, Heart, Star, Trophy, X } from 'lucide-react';
import TriviaBottomNavigation from './TriviaBottomNavigation';
import type { TriviaSection } from './TriviaBottomNavigation';
import VerifiedBadge from '@/components/VerifiedBadge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useOnlineUsers } from '@/lib/hooks/useOnlineUsers';

const TIME_PER_QUESTION = 30;
const MAX_ATTEMPTS = 2;

export function TriviaOnlineUsers() {
  const { user } = useAuth();
  const { users: onlineUsers } = useOnlineUsers(user);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (onlineUsers.length <= 1) return;
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % onlineUsers.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [onlineUsers.length]);

  if (onlineUsers.length === 0) return null;

  const current = onlineUsers[index % onlineUsers.length];
  const name =
    current.fullName?.trim() ||
    `${current.firstName || ''} ${current.lastName || ''}`.trim() ||
    'User';
  const extra = onlineUsers.length - 1;

  return (
    <div className="flex items-center gap-1.5" title={`${onlineUsers.length} online`}>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white bg-indigo-100 text-[8px] font-bold text-indigo-700">
        {current.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.image} alt="" className="h-full w-full object-cover" />
        ) : (
          `${current.firstName?.[0] || ''}${current.lastName?.[0] || ''}`.toUpperCase() || '?'
        )}
      </span>
      <span className="hidden min-w-0 items-center gap-1 sm:flex">
        <span className="max-w-[90px] truncate text-[9px] font-bold text-[#8B6914]">
          {name}
          {current.hasVerifiedBadge && <VerifiedBadge className="ml-0.5 inline h-2.5 w-2.5 align-[-1px]" />}
        </span>
        {current.techCenter?.name && (
          <span className="max-w-[70px] truncate text-[8px] font-medium text-slate-400">
            · {current.techCenter.name}
          </span>
        )}
      </span>
      {extra > 0 && (
        <span className="text-[9px] font-bold text-slate-500">+{extra}</span>
      )}
    </div>
  );
}

export function TriviaUserBadge({ user }: { user: ReturnType<typeof useAuth>['user'] }) {
  if (!user?.hasVerifiedBadge) return null;
  return <VerifiedBadge className="h-4 w-4" />;
}

interface TriviaScreenHeaderProps {
  onClose: () => void;
  userTotalPoints: number;
  sessionPoints: number;
  dailyHeartsRemaining: number;
  timeLeft: number;
  isUrgent: boolean;
}

function TriviaScreenHeader({
  onClose,
  userTotalPoints,
  sessionPoints,
  dailyHeartsRemaining,
  timeLeft,
  isUrgent,
}: TriviaScreenHeaderProps) {
  const { user: currentUser } = useAuth();
  return (
    <div className="flex shrink-0 flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2"><h2 className="text-base font-bold tracking-tight text-slate-900">Trivia</h2></div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            {userTotalPoints + sessionPoints}
          </span>
          <span
            className="flex items-center gap-1 text-xs font-semibold text-rose-600"
            aria-label={`${dailyHeartsRemaining} daily hearts remaining`}
            title={`${dailyHeartsRemaining} daily hearts remaining`}
          >
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
            {dailyHeartsRemaining}
          </span>
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${isUrgent ? 'text-rose-600' : 'text-slate-500'}`}>
            <Clock className="h-3.5 w-3.5" />
            <span>{timeLeft}s</span>
          </div>
          <TriviaUserBadge user={currentUser} />
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
  );
}

interface TriviaScreenNavProps {
  activeSection: TriviaSection;
  onSelectSection: (section: TriviaSection) => void;
  incomingHeartRequestCount: number;
}

function TriviaScreenNav({
  activeSection,
  onSelectSection,
  incomingHeartRequestCount,
}: TriviaScreenNavProps) {
  return (
    <TriviaBottomNavigation
      activeSection={activeSection}
      onSelect={onSelectSection}
      incomingHeartRequestCount={incomingHeartRequestCount}
    />
  );
}

const modalShell =
  'relative flex h-[min(620px,85dvh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl';

const modalOverlay =
  'fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md';

interface WelcomeGamePanelProps {
  totalQuestions: number;
  currentLevel: number;
  dailyHeartsRemaining: number;
  onStart: () => void;
  isLoading?: boolean;
  loadingMessage?: string;
  questionLoadError?: string | null;
  lockReason?: string | null;
  returning?: boolean;
  heartsLocked?: boolean;
  onRequestHearts?: () => void;
}

export function WelcomeGamePanel({
  totalQuestions,
  currentLevel,
  dailyHeartsRemaining,
  onStart,
  isLoading = false,
  loadingMessage = '',
  questionLoadError = null,
  lockReason = null,
  returning = false,
  heartsLocked = false,
  onRequestHearts,
}: WelcomeGamePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: leaderboard } = useQuery({
    queryKey: ['trivia-leaderboard-top'],
    queryFn: async () => {
      const res = await fetch('/api/trivia/leaderboard');
      const data: any = await res.json();
      return (data.leaderboard ?? []).filter((e: any) => e.user?.profileImageUrl).slice(0, 10) as Array<{
        rank: number;
        user: { id: string; firstName: string; lastName: string; profileImageUrl?: string | null; hasVerifiedBadge?: boolean };
        points: number;
      }>;
    },
    staleTime: 60000,
  });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-0 py-4">
      {/* Session card */}
      <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Today&apos;s session
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-500">
            Top players
          </p>
        </div>
        {/* Trending students - horizontal scroll */}
        <div className="mt-2">
          <div ref={scrollRef} className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(leaderboard ?? []).map((entry) => {
              const name = `${entry.user.firstName} ${entry.user.lastName}`.trim();
              const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div
                  key={entry.user.id}
                  className="group relative aspect-[3/4] w-[140px] shrink-0 snap-start overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm transition-colors hover:border-[#C59B4C]/50 sm:w-[160px]"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1A2B4C]">
                    {entry.user.profileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={entry.user.profileImageUrl}
                        alt={name}
                        className="absolute inset-0 h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-2xl font-bold text-white/90">{initials}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                    {entry.rank === 1 && (
                      <Crown className="absolute right-2 top-2 z-10 h-4 w-4 fill-amber-400 text-amber-500 drop-shadow" />
                    )}
                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-2.5">
                      <h3 className="flex items-start gap-1 text-[12px] font-bold leading-tight text-white">
                        <span className="line-clamp-2">{name}</span>
                        {entry.user.hasVerifiedBadge && <VerifiedBadge className="h-3 w-3 shrink-0" />}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold tabular-nums text-amber-300">
                        <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                        {entry.points.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {!leaderboard && (
              <p className="py-2 text-[10px] text-slate-400">Loading top players…</p>
            )}
          </div>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollRef.current?.scrollBy({ left: -160, behavior: 'smooth' })}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollRef.current?.scrollBy({ left: 160, behavior: 'smooth' })}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Rule chips */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-medium text-slate-500">
        <span className="rounded-full bg-slate-100 px-2.5 py-1">{TIME_PER_QUESTION}s / question</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1">{MAX_ATTEMPTS} attempts</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1">Streak bonuses</span>
      </div>

      {/* CTA */}
      <div className="mt-4 flex items-center justify-center gap-2">
      <button
        onClick={onStart}
        disabled={isLoading || totalQuestions === 0 || Boolean(lockReason)}
        className="group relative mt-0 inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <Gamepad2 className="h-5 w-5" />
        {lockReason ? lockReason : isLoading ? 'Getting game ready…' : returning ? 'Return to game' : 'Start Game'}
        <span className="text-white/70 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
      </button>
      {heartsLocked && onRequestHearts && (
        <button
          type="button"
          onClick={onRequestHearts}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
        >
          <Heart className="h-4 w-4" />
          Request a heart
        </button>
      )}
      </div>

      {/* Status */}
      <p
        className={`mt-3 text-center text-[11px] ${questionLoadError ? 'text-rose-600' : 'text-slate-500'}`}
        role={questionLoadError ? 'alert' : 'status'}
      >
        {lockReason ?? (isLoading ? loadingMessage : questionLoadError ?? (totalQuestions === 0 ? 'No questions are available right now.' : ''))}
      </p>

      {/* Tips */}
      <div className="mt-3 space-y-0.5 text-center">
        <p className="text-[10px] leading-4 text-slate-600">Read each question carefully before choosing.</p>
        <p className="text-[10px] leading-4 text-slate-600">You get {MAX_ATTEMPTS} attempts for each question.</p>
        <p className="text-[10px] leading-4 text-slate-600">Correct answers build your streak and earn points.</p>
      </div>
    </div>
  );
}

interface TriviaWelcomeScreenProps {
  onClose: () => void;
  onStart: () => void;
  activeSection: TriviaSection;
  onSelectSection: (section: TriviaSection) => void;
  incomingHeartRequestCount: number;
  totalQuestions: number;
  currentLevel: number;
  userTotalPoints: number;
  sessionPoints: number;
  dailyHeartsRemaining: number;
  timeLeft: number;
  isUrgent: boolean;
}

export function TriviaWelcomeScreen({
  onClose,
  onStart,
  activeSection,
  onSelectSection,
  incomingHeartRequestCount,
  totalQuestions,
  currentLevel,
  userTotalPoints,
  sessionPoints,
  dailyHeartsRemaining,
  timeLeft,
  isUrgent,
}: TriviaWelcomeScreenProps) {
  return (
    <div className={modalOverlay}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={modalShell}
      >
        <TriviaScreenHeader
          onClose={onClose}
          userTotalPoints={userTotalPoints}
          sessionPoints={sessionPoints}
          dailyHeartsRemaining={dailyHeartsRemaining}
          timeLeft={timeLeft}
          isUrgent={isUrgent}
        />
        <WelcomeGamePanel
          totalQuestions={totalQuestions}
          currentLevel={currentLevel}
          dailyHeartsRemaining={dailyHeartsRemaining}
          onStart={onStart}
        />
        <TriviaScreenNav
          activeSection={activeSection}
          onSelectSection={onSelectSection}
          incomingHeartRequestCount={incomingHeartRequestCount}
        />
      </motion.div>
    </div>
  );
}


interface TriviaEmptyPanelProps {
  isLoading: boolean;
  loadingMessage: string;
  questionLoadError: string | null;
  currentLevel: number;
  dailyHeartsRemaining: number;
  onRetryQuestions: () => void;
  onClose: () => void;
}

export function TriviaEmptyPanel({
  isLoading,
  loadingMessage,
  questionLoadError,
  currentLevel,
  dailyHeartsRemaining,
  onRetryQuestions,
  onClose,
}: TriviaEmptyPanelProps) {
  return (
<div className="min-h-0 flex-1 overflow-y-auto">
  <div className="p-4 text-center">
    <h3 className="text-lg font-bold tracking-tight text-slate-900">
      Ready for a challenge?
    </h3>
    <p className="mt-1.5 text-[13px] leading-5 text-slate-600">
      Answer questions, build your streak, and earn points. You&apos;ll have{' '}
      {TIME_PER_QUESTION} seconds and {MAX_ATTEMPTS} attempts for each question.
    </p>
    <div
      className="mt-4 flex min-h-8 items-center justify-center gap-2 text-xs font-semibold text-slate-600"
      aria-live="polite"
      aria-label={isLoading ? 'Loading hearts and level' : undefined}
    >
      {isLoading ? (
        <>
          <span className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
          <span className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
        </>
      ) : (
        <>
          <span className="rounded-full bg-rose-50 px-3 py-1.5 text-rose-700">
            {dailyHeartsRemaining} hearts
          </span>
          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-indigo-700">
            Level {currentLevel}
          </span>
        </>
      )}
    </div>
  </div>
  <p
    className={`mt-3 px-5 text-[13px] ${questionLoadError ? 'text-rose-600' : 'text-slate-500'}`}
    role={questionLoadError ? 'alert' : 'status'}
  >
    {isLoading ? loadingMessage : questionLoadError ?? 'No questions are available right now.'}
  </p>
  <div className="mt-3 px-5 text-center">
    <p className="text-[11px] leading-4 text-slate-700">Read each question carefully before choosing.</p>
    <p className="text-[11px] leading-4 text-slate-700">You get {MAX_ATTEMPTS} attempts for each question.</p>
    <p className="text-[11px] leading-4 text-slate-700">Correct answers build your streak and earn points.</p>
    <p className="text-[11px] leading-4 text-slate-700">You can start as soon as your questions are ready.</p>
  </div>
  <button
    type="button"
    disabled
    className="mx-5 mt-4 inline-flex w-[calc(100%-2.5rem)] cursor-wait items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white opacity-70"
  >
    {isLoading ? (
      <>
        <Clock className="h-4 w-4 animate-spin" />
        Getting game ready…
      </>
    ) : (
      'Start game'
    )}
  </button>
  {!isLoading && (
    <button
      onClick={questionLoadError ? onRetryQuestions : onClose}
      className="mx-5 mt-1.5 w-[calc(100%-2.5rem)] rounded-lg py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
    >
      {questionLoadError ? 'Try again' : 'Close'}
    </button>
  )}
</div>
  );
}

interface TriviaEmptyScreenProps {
  onClose: () => void;
  onRetryQuestions: () => void;
  isLoading: boolean;
  loadingMessage: string;
  questionLoadError: string | null;
  currentLevel: number;
  userTotalPoints: number;
  sessionPoints: number;
  dailyHeartsRemaining: number;
  timeLeft: number;
  isUrgent: boolean;
  activeSection: TriviaSection;
  onSelectSection: (section: TriviaSection) => void;
  incomingHeartRequestCount: number;
}

export function TriviaEmptyScreen({
  onClose,
  onRetryQuestions,
  isLoading,
  loadingMessage,
  questionLoadError,
  currentLevel,
  userTotalPoints,
  sessionPoints,
  dailyHeartsRemaining,
  timeLeft,
  isUrgent,
  activeSection,
  onSelectSection,
  incomingHeartRequestCount,
}: TriviaEmptyScreenProps) {
  return (
    <div className={modalOverlay}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={modalShell}
      >
        <TriviaScreenHeader
          onClose={onClose}
          userTotalPoints={userTotalPoints}
          sessionPoints={sessionPoints}
          dailyHeartsRemaining={dailyHeartsRemaining}
          timeLeft={timeLeft}
          isUrgent={isUrgent}
        />
        <TriviaEmptyPanel
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          questionLoadError={questionLoadError}
          currentLevel={currentLevel}
          dailyHeartsRemaining={dailyHeartsRemaining}
          onRetryQuestions={onRetryQuestions}
          onClose={onClose}
        />
        <TriviaScreenNav
          activeSection={activeSection}
          onSelectSection={onSelectSection}
          incomingHeartRequestCount={incomingHeartRequestCount}
        />
      </motion.div>
    </div>
  );
}
