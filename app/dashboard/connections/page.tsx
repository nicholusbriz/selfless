'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Heart,
  Loader2,
  AlertCircle,
  TrendingUp,
  UserPlus,
  Check,
  Eye,
} from 'lucide-react';
import Image from 'next/image';

import { SocialActions } from '@/components/social/SocialActions';
import { UnfollowButton } from '@/components/social/UnfollowButton';
import { UnlikeButton } from '@/components/social/UnlikeButton';
import { useSocialActions } from '@/lib/hooks/useSocialActions';

// ============================================================
// TYPES — every list returns rows with stats already attached
// ============================================================

interface ConnectionUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  techCenter: { id: string; name: string } | null;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  profileViewsCount: number;
  isFollowing: boolean;
  isLiked: boolean;
  connectedAt?: string;
  likedAt?: string;
}

interface LikesData {
  likers: ConnectionUser[];
  likedUsers: ConnectionUser[];
}

interface TrendingApiResponse {
  students: ConnectionUser[];
  generatedAt: string;
}

interface MeStats {
  id: string;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  profileViewsCount: number;
}

type TabKey = 'trending' | 'followers' | 'following' | 'likes';
type LikesView = 'received' | 'sent';

// ============================================================
// FETCHERS
// ============================================================

async function fetchConnections(
  userId: string,
  type: 'followers' | 'following',
): Promise<ConnectionUser[]> {
  const res = await fetch(`/api/social/connections/${userId}?type=${type}`);
  if (!res.ok) throw new Error(`Failed to fetch ${type}`);
  const data = await res.json();
  return Array.isArray(data.connections) ? data.connections : [];
}

async function fetchLikes(userId: string): Promise<LikesData> {
  const res = await fetch(`/api/social/likes/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch likes');
  const data = await res.json();
  return {
    likers: Array.isArray(data.likers) ? data.likers : [],
    likedUsers: Array.isArray(data.likedUsers) ? data.likedUsers : [],
  };
}

async function fetchTrending(limit = 10): Promise<ConnectionUser[]> {
  const res = await fetch(
    `/api/social/trending?limit=${limit}&_t=${Date.now()}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error('Failed to fetch trending');
  const data: TrendingApiResponse = await res.json();
  return Array.isArray(data.students) ? data.students : [];
}

async function fetchMe(): Promise<MeStats | null> {
  const res = await fetch('/api/social/me');
  if (!res.ok) throw new Error('Failed to fetch personal stats');
  return res.json();
}

// ============================================================
// HELPERS
// ============================================================

function formatDate(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ============================================================
// SKELETONS
// ============================================================

const SkeletonRow = () => (
  <li className="px-4 py-3 flex items-center gap-3">
    <div className="h-7 w-7 shrink-0 rounded-full shimmer" />
    <div className="h-10 w-10 shrink-0 rounded-full shimmer" />
    <div className="flex-1 min-w-0 space-y-2">
      <div className="h-3.5 w-32 max-w-[45%] rounded shimmer" />
      <div className="h-2.5 w-40 max-w-[55%] rounded shimmer" />
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <div className="h-6 w-14 rounded-full shimmer" />
      <div className="h-6 w-16 rounded-full shimmer" />
      <div className="h-6 w-12 rounded-full shimmer" />
    </div>
  </li>
);

const SkeletonList = ({ rows = 8 }: { rows?: number }) => (
  <ul className="divide-y divide-[#F3F4F6]">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </ul>
);

const StatsSkeleton = () => (
  <div className="mt-4 flex flex-wrap items-center gap-4 animate-pulse">
    <div className="h-4 w-24 rounded shimmer" />
    <div className="h-4 w-24 rounded shimmer" />
    <div className="h-4 w-20 rounded shimmer" />
    <div className="h-4 w-20 rounded shimmer" />
  </div>
);

// ============================================================
// MAIN PAGE
// ============================================================

export default function ConnectionsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const currentUserId = session?.user?.id;

  const [activeTab, setActiveTab] = useState<TabKey>('trending');
  const [likesView, setLikesView] = useState<LikesView>('received');

  const social = useSocialActions();

  const sharedQueryOptions = {
    enabled: !!currentUserId,
    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: false,
  } as const;

  // ---------- prefetch ----------
  useEffect(() => {
    if (!currentUserId) return;

    queryClient.prefetchQuery({
      queryKey: ['social', 'trending'],
      queryFn: () => fetchTrending(10),
      staleTime: 0,
    });

    queryClient.prefetchQuery({
      queryKey: ['social', 'me'],
      queryFn: fetchMe,
      staleTime: sharedQueryOptions.staleTime,
    });

    queryClient.prefetchQuery({
      queryKey: ['connections', 'followers', currentUserId],
      queryFn: () => fetchConnections(currentUserId, 'followers'),
      staleTime: sharedQueryOptions.staleTime,
    });

    queryClient.prefetchQuery({
      queryKey: ['connections', 'following', currentUserId],
      queryFn: () => fetchConnections(currentUserId, 'following'),
      staleTime: sharedQueryOptions.staleTime,
    });

    queryClient.prefetchQuery({
      queryKey: ['connections', 'likes', currentUserId],
      queryFn: () => fetchLikes(currentUserId),
      staleTime: sharedQueryOptions.staleTime,
    });
  }, [currentUserId, queryClient, sharedQueryOptions.staleTime]);

  // ---------- queries ----------

  const meQuery = useQuery({
    queryKey: ['social', 'me'],
    queryFn: fetchMe,
    ...sharedQueryOptions,
  });

  const followersQuery = useQuery({
    queryKey: ['connections', 'followers', currentUserId],
    queryFn: () => fetchConnections(currentUserId!, 'followers'),
    ...sharedQueryOptions,
  });

  const followingQuery = useQuery({
    queryKey: ['connections', 'following', currentUserId],
    queryFn: () => fetchConnections(currentUserId!, 'following'),
    ...sharedQueryOptions,
  });

  const likesQuery = useQuery({
    queryKey: ['connections', 'likes', currentUserId],
    queryFn: () => fetchLikes(currentUserId!),
    ...sharedQueryOptions,
  });

  const trendingQuery = useQuery({
    queryKey: ['social', 'trending'],
    queryFn: () => fetchTrending(10),
    enabled: !!currentUserId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: 'always',
  });

  const activeQuery = useMemo(() => {
    if (activeTab === 'followers') return followersQuery;
    if (activeTab === 'following') return followingQuery;
    if (activeTab === 'likes') return likesQuery;
    return trendingQuery;
  }, [activeTab, followersQuery, followingQuery, likesQuery, trendingQuery]);

  // ---------- rows for the active tab — already contain stats ----------
  const connections: ConnectionUser[] = useMemo(() => {
    if (activeTab === 'trending') {
      return trendingQuery.data ?? [];
    }

    if (activeTab === 'likes') {
      return likesView === 'sent'
        ? likesQuery.data?.likedUsers ?? []
        : likesQuery.data?.likers ?? [];
    }

    if (activeTab === 'following') {
      const base = followingQuery.data ?? [];
      return base.filter((c) => c.isFollowing !== false);
    }

    return followersQuery.data ?? [];
  }, [
    activeTab,
    likesView,
    trendingQuery.data,
    likesQuery.data,
    followingQuery.data,
    followersQuery.data,
  ]);

  const isFetchingWithoutData =
    !!activeQuery?.isFetching && activeQuery.data === undefined;
  const error = activeQuery?.error;

  const getInitials = (first?: string, last?: string) =>
    `${(first || '?').charAt(0)}${(last || '?').charAt(0)}`.toUpperCase();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['connections'] });
    queryClient.invalidateQueries({ queryKey: ['social', 'trending'] });
    queryClient.invalidateQueries({ queryKey: ['social', 'me'] });
  };

  const showSessionLoading = status === 'loading';
  const me = meQuery.data;

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <style jsx global>{`
        @keyframes shimmerMove {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            #e5e7eb 0%,
            #f3f4f6 50%,
            #e5e7eb 100%
          );
          background-size: 200% 100%;
          animation: shimmerMove 1.4s ease-in-out infinite;
        }
        @keyframes rowEnter {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .row-enter {
          animation: rowEnter 240ms ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .shimmer,
          .row-enter {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[30px] sm:text-[34px] font-bold tracking-tight text-[#1A2B4C] leading-tight">
                My Connections
              </h1>
              <p className="mt-1.5 text-[14px] leading-5 text-[#B98A3E] font-semibold">
                Trending, followers, following, and likes
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-bold text-[#1A2B4C] transition-colors hover:border-[#B98A3E] hover:bg-[#F7F6F2] active:scale-95"
            >
              Refresh
            </button>
          </div>

          {showSessionLoading || !me ? (
            <StatsSkeleton />
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <button
                type="button"
                onClick={() => setActiveTab('trending')}
                className={`flex items-center gap-2 transition-colors underline ${
                  activeTab === 'trending'
                    ? 'text-[#B98A3E] font-bold'
                    : 'text-[#1A2B4C] hover:text-[#B98A3E]'
                }`}
              >
                <span className="relative flex h-4 w-4 items-center justify-center">
                  <TrendingUp className="h-4 w-4" strokeWidth={2} />
                  {activeTab === 'trending' && (
                    <span className="absolute -right-1.5 -top-1 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#55705B] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#55705B]" />
                    </span>
                  )}
                </span>
                <span className="text-[14px]">Trending</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('followers')}
                className={`flex items-center gap-2 transition-colors underline ${
                  activeTab === 'followers'
                    ? 'text-[#B98A3E] font-bold'
                    : 'text-[#1A2B4C] hover:text-[#B98A3E]'
                }`}
              >
                <Users className="w-4 h-4" strokeWidth={2} />
                <span className="text-[14px]">
                  {me.followersCount} followers
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('following')}
                className={`flex items-center gap-2 transition-colors underline ${
                  activeTab === 'following'
                    ? 'text-[#55705B] font-bold'
                    : 'text-[#1A2B4C] hover:text-[#55705B]'
                }`}
              >
                <Users className="w-4 h-4" strokeWidth={2} />
                <span className="text-[14px]">
                  {me.followingCount} following
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('likes')}
                className={`flex items-center gap-2 transition-colors underline ${
                  activeTab === 'likes'
                    ? 'text-red-500 font-bold'
                    : 'text-[#1A2B4C] hover:text-red-500'
                }`}
              >
                <Heart className="w-4 h-4" strokeWidth={2} />
                <span className="text-[14px]">
                  {me.likesReceivedCount} likes
                </span>
              </button>

              <span className="inline-flex items-center gap-1.5 text-[12px] font-mono text-[#6B7280] tabular-nums">
                <Eye className="h-3.5 w-3.5 text-[#3E5C76]" strokeWidth={2.2} />
                {me.profileViewsCount} views
              </span>
            </div>
          )}
        </header>

        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-md overflow-hidden">
          {activeTab === 'likes' && (
            <div
              className="flex items-center gap-4 border-b border-[#F3F4F6] px-4 py-3"
              role="tablist"
              aria-label="Likes"
            >
              <button
                type="button"
                role="tab"
                aria-selected={likesView === 'received'}
                onClick={() => setLikesView('received')}
                className={`text-[13px] font-semibold underline underline-offset-4 ${
                  likesView === 'received'
                    ? 'text-red-600'
                    : 'text-[#6B7280] hover:text-[#1A2B4C]'
                }`}
              >
                Received ({likesQuery.data?.likers.length ?? 0})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={likesView === 'sent'}
                onClick={() => setLikesView('sent')}
                className={`text-[13px] font-semibold underline underline-offset-4 ${
                  likesView === 'sent'
                    ? 'text-red-600'
                    : 'text-[#6B7280] hover:text-[#1A2B4C]'
                }`}
              >
                You liked ({likesQuery.data?.likedUsers.length ?? 0})
              </button>
            </div>
          )}

          {showSessionLoading || isFetchingWithoutData ? (
            <SkeletonList rows={8} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <AlertCircle
                className="w-10 h-10 text-[#A4462F] mb-4"
                strokeWidth={1.6}
              />
              <h3 className="text-[16px] font-bold text-[#1A2B4C] mb-2">
                Error loading connections
              </h3>
              <p className="text-[14px] text-[#4B5646] mb-4">
                {error instanceof Error
                  ? error.message
                  : 'Failed to load connections'}
              </p>
              <button
                type="button"
                onClick={() => activeQuery?.refetch()}
                className="inline-flex items-center gap-1.5 h-10 px-5 bg-[#1A2B4C] text-white font-mono text-[12px] uppercase tracking-widest hover:bg-[#2C3E5A] transition-colors rounded font-bold"
              >
                Retry
              </button>
            </div>
          ) : connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              {activeTab === 'likes' ? (
                <Heart className="w-10 h-10 text-[#9CA3AF] mb-4" strokeWidth={1.6} />
              ) : activeTab === 'trending' ? (
                <TrendingUp
                  className="w-10 h-10 text-[#9CA3AF] mb-4"
                  strokeWidth={1.6}
                />
              ) : (
                <Users className="w-10 h-10 text-[#9CA3AF] mb-4" strokeWidth={1.6} />
              )}
              <h3 className="text-[16px] font-bold text-[#1A2B4C] mb-2">
                {activeTab === 'trending'
                  ? 'No trending students yet'
                  : activeTab === 'likes' && likesView === 'sent'
                    ? 'No profiles liked yet'
                    : `No ${activeTab} yet`}
              </h3>
              <p className="text-[14px] text-[#4B5646]">
                {activeTab === 'likes' && likesView === 'sent'
                  ? 'Profiles you like will appear here. You can unlike them from this tab.'
                  : activeTab === 'followers'
                    ? 'When people follow you, they will appear here.'
                    : activeTab === 'following'
                      ? 'Follow other students to see them here.'
                      : activeTab === 'likes'
                        ? 'When people like your profile, they will appear here.'
                        : 'Students with followers or likes will appear here as the community grows.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#F3F4F6]">
              {connections.map((user, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;
                const isTrending = activeTab === 'trending';
                const isFeatured = isTrending && isTopThree;
                const isSelf = currentUserId === user.id;

                const initials = getInitials(user.firstName, user.lastName);
                const fullName =
                  `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
                  'Unknown';

                const connectedDate = formatDate(user.connectedAt);
                const likedDate = formatDate(user.likedAt);

                let dateLabel: string | null = null;
                if (activeTab === 'followers') {
                  dateLabel = connectedDate
                    ? `followed you on ${connectedDate}`
                    : 'followed you';
                } else if (activeTab === 'following') {
                  dateLabel = connectedDate
                    ? `started following on ${connectedDate}`
                    : 'started following';
                } else if (activeTab === 'likes') {
                  const likeMessage =
                    likesView === 'sent'
                      ? 'You liked this profile'
                      : 'liked your student profile';
                  dateLabel = likedDate
                    ? `${likeMessage} on ${likedDate}`
                    : likeMessage;
                }

                const rankBadgeStyles =
                  rank === 1
                    ? 'bg-gradient-to-br from-[#F5C518] to-[#D4A017] text-white shadow-[0_0_0_1px_rgba(212,160,23,0.25)]'
                    : rank === 2
                      ? 'bg-gradient-to-br from-[#C0C0C0] to-[#9CA3AF] text-white shadow-[0_0_0_1px_rgba(156,163,175,0.25)]'
                      : rank === 3
                        ? 'bg-gradient-to-br from-[#CD7F32] to-[#A65E2E] text-white shadow-[0_0_0_1px_rgba(166,94,46,0.25)]'
                        : 'bg-[#F7F6F2] text-[#4B5646]';

                return (
                  <li
                    key={user.id}
                    className={`
                      row-enter relative transition-colors
                      ${
                        isFeatured
                          ? 'overflow-hidden min-h-[210px] sm:min-h-[220px]'
                          : 'px-4 py-3 hover:bg-[#F7F6F2]/60'
                      }
                      ${
                        isTrending && rank === 1
                          ? 'bg-[#FBF7E9]'
                          : isTrending && rank === 2
                            ? 'bg-[#F5F6F7]'
                            : isTrending && rank === 3
                              ? 'bg-[#FBF4EF]'
                              : ''
                      }
                    `}
                    style={{
                      animationDelay: `${Math.min(index * 30, 300)}ms`,
                    }}
                  >
                    {isFeatured ? (
                      <div className="relative flex min-h-[210px] items-stretch sm:min-h-[220px]">
                        <div className="relative z-10 flex w-1/2 min-w-0 flex-col justify-between p-4 sm:p-5">
                          <div className="flex items-start gap-2">
                            <div
                              className={`
                                mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center
                                rounded-full font-mono text-[11px] font-bold tabular-nums
                                ${rankBadgeStyles}
                              `}
                              aria-label={`Rank ${rank}`}
                            >
                              {rank}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <h3 className="text-[15px] font-bold tracking-[-0.01em] text-[#1A2B4C] leading-tight break-words sm:text-[15.5px]">
                                  {fullName}
                                </h3>
                                {isSelf && (
                                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#B98A3E]/40 bg-[#B98A3E]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8A6A2E]">
                                    You
                                  </span>
                                )}
                              </div>
                              {user.techCenter && (
                                <p className="mt-0.5 text-[11.5px] font-medium text-[#4B5646] break-words">
                                  {user.techCenter.name}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B98A3E]/10 px-2 py-1 font-mono text-[10px] font-bold text-[#8A6A2E] tabular-nums">
                              <Users className="h-3 w-3 shrink-0" strokeWidth={2.4} />
                              <span>{user.followersCount}</span>
                              <span className="font-sans font-semibold">
                                Followers
                              </span>
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-1 font-mono text-[10px] font-bold text-red-600 tabular-nums">
                              <Heart
                                className="h-3 w-3 shrink-0 fill-red-500 text-red-500"
                                strokeWidth={2}
                              />
                              <span>{user.likesReceivedCount}</span>
                              <span className="font-sans font-semibold">
                                Likes
                              </span>
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3E5C76]/10 px-2 py-1 font-mono text-[10px] font-bold text-[#3E5C76] tabular-nums">
                              <Eye className="h-3 w-3 shrink-0" strokeWidth={2.2} />
                              <span>{user.profileViewsCount}</span>
                              <span className="font-sans font-semibold">
                                Views
                              </span>
                            </span>
                          </div>

                          {!isSelf && (
                            <div className="mt-3">
                              <SocialActions
                                userId={user.id}
                                currentUserId={currentUserId}
                                size="sm"
                                variant="featured"
                                allowUnfollow={true}
                                allowUnlike={true}
                              />
                            </div>
                          )}
                        </div>

                        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden">
                          {user.profileImageUrl ? (
                            <Image
                              src={user.profileImageUrl}
                              alt={fullName}
                              fill
                              sizes="(max-width: 640px) 50vw, 450px"
                              className="object-cover object-center"
                              priority={rank === 1}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#DCE2E8]">
                              <span className="text-5xl font-black tracking-tight text-[#1A2B4C]/35">
                                {initials}
                              </span>
                            </div>
                          )}
                          <div
                            className={`
                              absolute inset-0
                              ${
                                rank === 1
                                  ? 'bg-gradient-to-r from-[#FBF7E9] via-[#FBF7E9]/30 to-transparent'
                                  : rank === 2
                                    ? 'bg-gradient-to-r from-[#F5F6F7] via-[#F5F6F7]/30 to-transparent'
                                    : 'bg-gradient-to-r from-[#FBF4EF] via-[#FBF4EF]/30 to-transparent'
                              }
                            `}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#12203B]/30 via-transparent to-transparent" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                        {isTrending && (
                          <div
                            className={`
                              flex h-7 w-7 shrink-0 items-center justify-center
                              rounded-full font-mono text-[11px] font-bold tabular-nums
                              ${rankBadgeStyles}
                            `}
                            aria-label={`Rank ${rank}`}
                          >
                            {rank}
                          </div>
                        )}

                        <div className="relative shrink-0">
                          {user.profileImageUrl ? (
                            <Image
                              src={user.profileImageUrl}
                              alt={fullName}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover ring-1 ring-[#E5E7EB]"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A2B4C]">
                              <span className="text-[12px] font-mono font-bold text-white">
                                {initials}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className="text-[14.5px] font-bold tracking-[-0.01em] text-[#1A2B4C] leading-tight break-words">
                              {fullName}
                            </h3>
                            {isSelf && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#B98A3E]/40 bg-[#B98A3E]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8A6A2E]">
                                You
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-[#4B5646] leading-snug">
                            {user.techCenter && (
                              <span className="font-medium break-words">
                                {user.techCenter.name}
                              </span>
                            )}

                            {isTrending ? (
                              <>
                                <span className="hidden text-[#D1D5DB] sm:inline">
                                  ·
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#B98A3E]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#8A6A2E] tabular-nums">
                                  <Users className="h-3 w-3" strokeWidth={2.4} />
                                  {user.followersCount}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-red-600 tabular-nums">
                                  <Heart
                                    className="h-3 w-3 fill-red-500 text-red-500"
                                    strokeWidth={2}
                                  />
                                  {user.likesReceivedCount}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#3E5C76]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#3E5C76] tabular-nums">
                                  <Eye className="h-3 w-3" strokeWidth={2.2} />
                                  {user.profileViewsCount}
                                </span>
                              </>
                            ) : (
                              dateLabel && (
                                <span className="text-[#6B7280] break-words">
                                  {dateLabel}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-1.5 sm:w-auto">
                          {isSelf ? null : isTrending ? (
                            <SocialActions
                              userId={user.id}
                              currentUserId={currentUserId}
                              size="sm"
                              allowUnfollow={true}
                              allowUnlike={true}
                              onViewProfile={() =>
                                router.push(`/dashboard/students/${user.id}`)
                              }
                            />
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(`/dashboard/students/${user.id}`)
                                }
                                className="inline-flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1 text-[11px] font-semibold text-[#1A2B4C] transition-all hover:border-[#E5E7EB] hover:bg-[#F7F6F2] active:scale-95"
                              >
                                View Profile
                              </button>

                              {activeTab === 'followers' &&
                                (user.isFollowing ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-[#55705B] bg-[#55705B] px-2.5 py-1 text-[11px] font-semibold text-white">
                                    <Check
                                      className="h-3.5 w-3.5"
                                      strokeWidth={2.5}
                                    />
                                    Following
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => social.follow(user.id)}
                                    disabled={
                                      social.isFollowPending &&
                                      social.followTarget === user.id
                                    }
                                    className="inline-flex items-center gap-1 rounded-full bg-[#1A2B4C] px-2.5 py-1 text-[11px] font-semibold text-white transition-all hover:bg-[#2C3E5A] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
                                  >
                                    {social.isFollowPending &&
                                    social.followTarget === user.id ? (
                                      <Loader2
                                        className="h-3.5 w-3.5 animate-spin"
                                        strokeWidth={2}
                                      />
                                    ) : (
                                      <UserPlus
                                        className="h-3.5 w-3.5"
                                        strokeWidth={2}
                                      />
                                    )}
                                    {social.isFollowPending &&
                                    social.followTarget === user.id
                                      ? 'Following…'
                                      : 'Follow Back'}
                                  </button>
                                ))}

                              {activeTab === 'following' && (
                                <UnfollowButton userId={user.id} />
                              )}

                              {activeTab === 'likes' && likesView === 'sent' && (
                                <UnlikeButton userId={user.id} />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {activeTab === 'trending' && connections.length > 0 && (
          <p className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-center text-[12px] text-[#6B7280]">
            <TrendingUp
              className="h-3.5 w-3.5 shrink-0 text-[#B98A3E]"
              strokeWidth={2}
            />
            <span>
              Showing the most popular students, ranked by followers first,
              then likes.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}