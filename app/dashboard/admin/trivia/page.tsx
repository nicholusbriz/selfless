'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Trophy,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Target,
  TrendingUp,
  Calendar,
  LoaderCircle,
} from 'lucide-react';

interface TriviaSession {
  id: string;
  correct: number;
  total: number;
  points: number;
  streak: number;
  accuracy: number;
  playedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
}

interface TriviaStats {
  totalGames: number;
  averageAccuracy: number;
  averagePoints: number;
  totalPointsEarned: number;
}

interface TriviaSessionsResponse {
  success: boolean;
  sessions: TriviaSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: TriviaStats;
}

const UserAvatar = ({ user }: { user: TriviaSession['user'] }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = user.profileImageUrl?.trim();
  const initials = `${user.firstName?.[0] ?? 'U'}${user.lastName?.[0] ?? ''}`;

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F2EFEA] text-xs font-bold uppercase tracking-[0.08em] text-[#12203B]">
      {imageUrl && !imageFailed ? (
        <Image
          src={imageUrl}
          alt={`${user.firstName} ${user.lastName}`}
          width={40}
          height={40}
          unoptimized
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
};

export default function TriviaTrackingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Role-based access control: only super_admin and dev can access
  useEffect(() => {
    if (session?.user?.role) {
      const normalizedRole = session.user.role.toLowerCase();
      if (normalizedRole !== 'super_admin' && normalizedRole !== 'dev') {
        router.replace('/dashboard');
      }
    }
  }, [session, router]);

  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const [data, setData] = useState<TriviaSessionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (submittedSearchTerm) {
        params.append('userId', submittedSearchTerm);
      }

      const response = await fetch(`/api/admin/trivia-sessions?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch trivia sessions');
      }

      const result: TriviaSessionsResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [page, submittedSearchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearchTerm(searchTerm.trim());
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <div className="mb-2 h-7 w-48 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <Gamepad2 className="h-7 w-7 text-red-600" />
          </div>

          <h3 className="text-xl font-bold text-gray-900">
            Failed to Load Trivia Sessions
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error}
          </p>

          <button
            onClick={fetchSessions}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const sessions = data?.sessions ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 rounded-2xl border border-[#E7E6E1] bg-[#F8F7F3] p-4 shadow-[0_1px_3px_rgba(18,32,59,0.04)] sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DADCD3] bg-white text-[#3D4A61] transition hover:border-[#B98A3E] hover:text-[#12203B]"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                  Game Tracking
                </p>
                <h1 className="text-xl font-bold text-[#12203B] sm:text-2xl">
                  Trivia Game Sessions
                </h1>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#DADCD3] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#12203B] xl:self-center">
              <Gamepad2 className="h-3.5 w-3.5 text-[#B98A3E]" />
              Game Analytics
            </div>
          </div>
        </div>

        {stats && (
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#E7E6E1] bg-white p-4 shadow-[0_1px_2px_rgba(18,32,59,0.03)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3E5C3] text-[#B98A3E]">
                  <Gamepad2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280]">Total Games</p>
                  <p className="text-lg font-bold text-[#12203B]">{stats.totalGames}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E7E6E1] bg-white p-4 shadow-[0_1px_2px_rgba(18,32,59,0.03)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#2F6B45]">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280]">Avg Accuracy</p>
                  <p className="text-lg font-bold text-[#12203B]">{stats.averageAccuracy}%</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E7E6E1] bg-white p-4 shadow-[0_1px_2px_rgba(18,32,59,0.03)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF3E0] text-[#B98A3E]">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280]">Avg Points</p>
                  <p className="text-lg font-bold text-[#12203B]">{stats.averagePoints}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E7E6E1] bg-white p-4 shadow-[0_1px_2px_rgba(18,32,59,0.03)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FCE4EC] text-[#8B3A24]">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280]">Total Points</p>
                  <p className="text-lg font-bold text-[#12203B]">{stats.totalPointsEarned}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-5 rounded-2xl border border-[#E7E6E1] bg-white p-3 shadow-[0_1px_2px_rgba(18,32,59,0.03)] sm:p-4">
          <form
            role="search"
            className="flex min-w-0 gap-2"
            onSubmit={handleSearch}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />

              <input
                type="search"
                aria-label="Search by user ID"
                placeholder="Search by user ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-[#DADCD3] bg-[#F9F9F7] py-2.5 pl-9 pr-3 text-sm text-[#12203B] outline-none transition placeholder:text-[#6B7280] focus:border-[#B98A3E] focus:ring-2 focus:ring-[#F3E5C3]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#12203B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#263653] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#B98A3E] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </button>
          </form>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Gamepad2 className="h-8 w-8 text-gray-400" />
            </div>

            <h3 className="text-xl font-bold text-gray-900">
              No Trivia Sessions Found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {searchTerm
                ? 'Try adjusting your search to find trivia sessions.'
                : 'No trivia games have been played yet.'}
            </p>

            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSubmittedSearchTerm('');
                  setPage(1);
                }}
                className="mt-5 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-[#E7E6E1] bg-white shadow-[0_1px_2px_rgba(18,32,59,0.03)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E7E6E1] bg-[#F8F7F3]">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                        Player
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                        Accuracy
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                        Streak
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                        Points
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                        Played At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr
                        key={session.id}
                        className="border-b border-[#E7E6E1] transition hover:bg-[#F9F9F7]"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={session.user} />
                            <div>
                              <p className="text-sm font-semibold text-[#12203B]">
                                {session.user.firstName} {session.user.lastName}
                              </p>
                              <p className="text-xs text-[#6B7280]">
                                {session.user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Target className="h-4 w-4 text-[#B98A3E]" />
                            <span className="text-sm font-semibold text-[#12203B]">
                              {session.correct}/{session.total}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-[#E8F5E9] px-2.5 py-1 text-xs font-semibold text-[#2F6B45]">
                            {Math.round(session.accuracy)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4 text-[#B98A3E]" />
                            <span className="text-sm font-semibold text-[#12203B]">
                              {session.streak}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Trophy className="h-4 w-4 text-[#B98A3E]" />
                            <span className="text-sm font-bold text-[#12203B]">
                              +{session.points}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(session.playedAt)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#DADCD3] bg-white px-3 py-2 text-sm font-semibold text-[#12203B] transition hover:border-[#B98A3E] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <span className="text-sm text-[#6B7280]">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#DADCD3] bg-white px-3 py-2 text-sm font-semibold text-[#12203B] transition hover:border-[#B98A3E] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
