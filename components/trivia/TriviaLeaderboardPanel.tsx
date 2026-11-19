'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Crown, LoaderCircle, RefreshCw, Trophy } from 'lucide-react';
import Image from 'next/image';
import { isJsonObject } from '@/lib/api-response';
import UserName from '@/components/UserName';

interface TriviaLeaderboardEntry {
  rank: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    hasVerifiedBadge: boolean;
  };
  points: number;
  gamesPlayed: number;
}

function TriviaLeaderboardAvatar({
  firstName,
  lastName,
  imageUrl,
}: {
  firstName: string;
  lastName: string;
  imageUrl: string | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

  if (imageUrl && !imageFailed) {
    return (
      <Image
        src={imageUrl}
        alt={`${firstName} ${lastName}`}
        width={40}
        height={40}
        unoptimized
        onError={() => setImageFailed(true)}
        className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
      />
    );
  }

  return (
    <span
      aria-label={`${firstName} ${lastName} profile`}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-xs font-bold text-indigo-700"
    >
      {initials}
    </span>
  );
}

function isTriviaLeaderboardEntry(value: unknown): value is TriviaLeaderboardEntry {
  return (
    isJsonObject(value) &&
    typeof value.rank === 'number' &&
    typeof value.points === 'number' &&
    typeof value.gamesPlayed === 'number' &&
    isJsonObject(value.user) &&
    typeof value.user.id === 'string' &&
    typeof value.user.firstName === 'string' &&
    typeof value.user.lastName === 'string' &&
    (typeof value.user.profileImageUrl === 'string' ||
      value.user.profileImageUrl === null) &&
    typeof value.user.hasVerifiedBadge === 'boolean'
  );
}

export default function TriviaLeaderboardPanel() {
  const { data = [], error, isLoading, refetch } = useQuery({
    queryKey: ['trivia-leaderboard'],
    queryFn: async (): Promise<TriviaLeaderboardEntry[]> => {
      const response = await fetch('/api/trivia/leaderboard', { cache: 'no-store' });
      const result: unknown = await response.json();
      if (
        !response.ok ||
        !isJsonObject(result) ||
        result.success !== true ||
        !Array.isArray(result.leaderboard) ||
        !result.leaderboard.every(isTriviaLeaderboardEntry)
      ) {
        throw new Error(
          isJsonObject(result) && typeof result.error === 'string'
            ? result.error
            : 'Could not load the leaderboard.',
        );
      }
      return result.leaderboard;
    },
  });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <h3 className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-xs font-bold text-slate-900 sm:gap-2 sm:text-sm">
          <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
          Trivia Leaderboard
        </h3>
        <p className="shrink-0 whitespace-nowrap text-[10px] text-slate-500 sm:text-xs">
          Top 10 players by total points
        </p>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-slate-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading leaderboard…
        </div>
      ) : error ? (
        <div className="px-4 py-16 text-center">
          <p role="alert" className="text-sm text-rose-700">
            {error instanceof Error ? error.message : 'Could not load leaderboard.'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      ) : data.length === 0 ? (
        <p className="px-4 py-16 text-center text-sm text-slate-500">
          No scores yet. Play a game to get on the leaderboard!
        </p>
      ) : (
        <ol className="space-y-2 px-3 py-2">
          {data.map((entry) => (
            <li key={entry.user.id} className="flex items-center gap-3 rounded-xl px-2 py-2">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                  entry.rank === 1
                    ? 'bg-amber-100 text-amber-700'
                    : entry.rank === 2
                      ? 'bg-slate-200 text-slate-700'
                      : entry.rank === 3
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-slate-100 text-slate-500'
                }`}
              >
                {entry.rank === 1 ? <Crown className="h-4 w-4" /> : entry.rank}
              </span>
              <TriviaLeaderboardAvatar
                firstName={entry.user.firstName}
                lastName={entry.user.lastName}
                imageUrl={entry.user.profileImageUrl}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#8B6914]">
                  <UserName
                    firstName={entry.user.firstName}
                    lastName={entry.user.lastName}
                    hasVerifiedBadge={entry.user.hasVerifiedBadge}
                    className="max-w-full"
                    badgeClassName="h-3.5 w-3.5"
                    allowWrap
                  />
                </p>
                <p className="text-[11px] text-slate-500">
                  {entry.gamesPlayed} {entry.gamesPlayed === 1 ? 'game' : 'games'}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold tabular-nums text-rose-600">
                {entry.points.toLocaleString()}{' '}
                <span className="text-[10px] font-medium text-slate-400">points</span>
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
