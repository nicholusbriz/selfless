'use client';

import { BookOpen, Gamepad2, Trophy, UserRound, Heart, Gift } from 'lucide-react';
import { MAX_DAILY_HEARTS } from '@/lib/trivia/heart-sharing';

export type TriviaSection = 'trivia' | 'leaderboard' | 'more-games' | 'account';

export default function TriviaBottomNavigation({
  activeSection,
  onSelect,
  dailyHeartsRemaining,
  showHeartRequests,
  onToggleHeartRequests,
  incomingHeartRequestCount,
  onHeartsChanged,
  onIncomingCountChange,
}: {
  activeSection: TriviaSection;
  onSelect: (section: TriviaSection) => void;
  dailyHeartsRemaining: number;
  showHeartRequests: boolean;
  onToggleHeartRequests: () => void;
  incomingHeartRequestCount: number;
  onHeartsChanged: () => void;
  onIncomingCountChange: (count: number) => void;
}) {
  const sections = [
    { id: 'trivia', label: 'Trivia', icon: BookOpen },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'account', label: 'Gifts', icon: Gift },
  ] as const;

  const heartButton = (
    <button
      type="button"
      onClick={onToggleHeartRequests}
      aria-pressed={showHeartRequests}
      className="flex min-h-0 flex-col items-center justify-center gap-0.5 px-2 py-3 text-[10px] font-semibold transition text-rose-600 hover:bg-white"
    >
      <div className="relative">
        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
        <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold leading-none text-white">
          {incomingHeartRequestCount > 99 ? '99+' : incomingHeartRequestCount}
        </span>
      </div>
      <span>requests</span>
    </button>
  );

  const moreGamesButton = (
    <button
      type="button"
      onClick={() => onSelect('more-games')}
      aria-current={activeSection === 'more-games' ? 'page' : undefined}
      className={`flex min-h-0 flex-col items-center justify-center gap-0.5 px-2 py-3 text-[10px] font-semibold transition ${activeSection === 'more-games'
        ? 'text-indigo-700'
        : 'text-slate-500 hover:bg-white hover:text-slate-900'
        }`}
    >
      <Gamepad2 className="h-4 w-4" />
      <span>More Games</span>
    </button>
  );

  return (
    <div className="shrink-0 bg-slate-50/60">
      <nav
        aria-label="Trivia sections"
        className="grid grid-cols-5"
      >
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-current={activeSection === id ? 'page' : undefined}
            className={`flex min-h-0 flex-col items-center justify-center gap-0.5 px-2 py-3 text-[10px] font-semibold transition ${activeSection === id
              ? 'text-indigo-700'
              : 'text-slate-500 hover:bg-white hover:text-slate-900'
              }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
        {heartButton}
        {moreGamesButton}
      </nav>
    </div>
  );
}
