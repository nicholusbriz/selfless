'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Gamepad2, Trophy, Heart, Gift, House } from 'lucide-react';

export type TriviaSection = 'trivia' | 'leaderboard' | 'hearts' | 'gifts' | 'more-games';

export default function TriviaBottomNavigation({
  activeSection,
  onSelect,
  incomingHeartRequestCount,
  triviaLabel,
}: {
  activeSection: TriviaSection;
  onSelect: (section: TriviaSection) => void;
  incomingHeartRequestCount: number;
  triviaLabel?: string;
}) {
  const [receivedGiftsCount, setReceivedGiftsCount] = useState(0);

  useEffect(() => {
    fetch('/api/gifts/received')
      .then((r) => r.json())
      .then((d: any) => {
        if (d?.success && Array.isArray(d.gifts)) setReceivedGiftsCount(d.gifts.length);
      })
      .catch(() => {});
  }, []);
  const sections = [
    { id: 'trivia', label: 'Home', icon: House },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'hearts', label: 'Hearts', icon: Heart },
    { id: 'gifts', label: 'Gifts', icon: Gift },
    { id: 'more-games', label: 'More Games', icon: Gamepad2 },
  ] as const;

  return (
    <div className="shrink-0 bg-slate-50/60">
      <nav
        aria-label="Trivia sections"
        className="grid grid-cols-5"
      >
        {sections.map(({ id, label, icon: Icon }) => {
          const SectionIcon = Icon;
          const isHearts = id === 'hearts';
          const isGifts = id === 'gifts';
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex min-h-0 flex-col items-center justify-center gap-0.5 px-2 py-3 text-[10px] font-semibold transition ${isActive
                ? isHearts
                  ? 'text-rose-600'
                  : 'text-indigo-700'
                : 'text-slate-500 hover:bg-white hover:text-slate-900'
                }`}
            >
              <span className="relative">
                <SectionIcon
                  className={`h-4 w-4 ${isHearts ? 'fill-red-500 text-red-500' : ''}`}
                />
                {isHearts && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold leading-none text-white">
                    {incomingHeartRequestCount > 99 ? '99+' : incomingHeartRequestCount}
                  </span>
                )}
                {isGifts && receivedGiftsCount > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold leading-none text-white">
                    {receivedGiftsCount > 99 ? '99+' : receivedGiftsCount}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
