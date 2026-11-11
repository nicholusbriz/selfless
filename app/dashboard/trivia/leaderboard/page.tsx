'use client';

import Link from 'next/link';
import { ArrowLeft, Crown, LoaderCircle, RefreshCw, Trophy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { isJsonObject } from '@/lib/api-response';

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  points: number;
  gamesPlayed: number;
}

function isLeaderboardEntry(value: unknown): value is LeaderboardEntry {
  return (
    isJsonObject(value) &&
    typeof value.rank === 'number' &&
    typeof value.points === 'number' &&
    typeof value.gamesPlayed === 'number' &&
    isJsonObject(value.user) &&
    typeof value.user.id === 'string' &&
    typeof value.user.firstName === 'string' &&
    typeof value.user.lastName === 'string'
  );
}

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch('/api/trivia/leaderboard', {
    cache: 'no-store',
  });
  const data: unknown = await response.json();

  if (
    !response.ok ||
    !isJsonObject(data) ||
    data.success !== true ||
    !Array.isArray(data.leaderboard) ||
    !data.leaderboard.every(isLeaderboardEntry)
  ) {
    const message =
      isJsonObject(data) && typeof data.error === 'string'
        ? data.error
        : 'Failed to load the leaderboard.';
    throw new Error(message);
  }

  return data.leaderboard;
}

export default function TriviaLeaderboardPage() {
  const {
    data: leaderboard = [],
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['trivia-leaderboard'],
    queryFn: fetchLeaderboard,
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-950 px-6 py-7 text-white sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Trivia Leaderboard</h1>
              <p className="mt-1 text-sm text-slate-300">
                Top 10 players by total points earned
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading leaderboard...
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-rose-700">
              {error instanceof Error ? error.message : 'Failed to load the leaderboard.'}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-slate-500">
            No trivia scores yet. Play a game to get on the leaderboard!
          </p>
        ) : (
          <ol className="divide-y divide-slate-100">
            {leaderboard.map((entry) => (
              <li
                key={entry.user.id}
                className="flex items-center gap-4 px-5 py-4 sm:px-8"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                    entry.rank === 1
                      ? 'bg-amber-100 text-amber-700'
                      : entry.rank === 2
                        ? 'bg-slate-200 text-slate-700'
                        : entry.rank === 3
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-100 text-slate-500'
                  }`}
                  aria-label={`Rank ${entry.rank}`}
                >
                  {entry.rank === 1 ? (
                    <Crown className="h-5 w-5" />
                  ) : (
                    entry.rank
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {entry.user.firstName} {entry.user.lastName}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {entry.gamesPlayed} {entry.gamesPlayed === 1 ? 'game' : 'games'}
                  </p>
                </div>
                <p className="shrink-0 text-right font-bold tabular-nums text-slate-950">
                  {entry.points.toLocaleString()}
                  <span className="ml-1 text-xs font-medium text-slate-500">pts</span>
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
