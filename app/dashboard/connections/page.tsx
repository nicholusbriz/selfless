'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Heart,
  Loader2,
  AlertCircle,
  TrendingUp,
  UserPlus,
  Check,
  Eye,
  MapPin,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import Image from 'next/image';

import { SocialActions } from '@/components/social/SocialActions';
import { useSocialActions } from '@/lib/hooks/useSocialActions';
import VerifiedBadge from '@/components/VerifiedBadge';

// ============================================================
// CONSTANTS
// ============================================================

const CONNECTION_PAGE_SIZE = 20;

// ============================================================
// TYPES
// ============================================================

interface ConnectionUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  hasVerifiedBadge?: boolean;
  techCenter: { id: string; name: string } | null;
  role?: { name: string } | null;
  generalCourse?: string | null;
  previousTechCenter?: { id: string; name: string } | null;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  profileViewsCount: number;
  isFollowing: boolean;
  isLiked: boolean;
  connectedAt?: string;
  likedAt?: string;
}

interface ConnectionPage {
  users: ConnectionUser[];
  hasMore: boolean;
  nextOffset: number;
  totalCount: number;
}

interface LikesPage extends ConnectionPage {
  totalLikes: number;
  totalLikedUsers: number;
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
  offset: number,
): Promise<ConnectionPage> {
  const params = new URLSearchParams({
    type,
    limit: String(CONNECTION_PAGE_SIZE),
    offset: String(offset),
  });
  const res = await fetch(`/api/social/connections/${userId}?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch ${type}`);
  const data = (await res.json()) as {
    connections?: ConnectionUser[];
    hasMore?: boolean;
    nextOffset?: number;
    totalCount?: number;
  };
  return {
    users: Array.isArray(data.connections) ? data.connections : [],
    hasMore: data.hasMore === true,
    nextOffset: typeof data.nextOffset === 'number' ? data.nextOffset : offset,
    totalCount: typeof data.totalCount === 'number' ? data.totalCount : 0,
  };
}

async function fetchLikes(
  userId: string,
  view: LikesView,
  offset: number,
): Promise<LikesPage> {
  const params = new URLSearchParams({
    view,
    limit: String(CONNECTION_PAGE_SIZE),
    offset: String(offset),
  });
  const res = await fetch(`/api/social/likes/${userId}?${params}`);
  if (!res.ok) throw new Error('Failed to fetch likes');
  const data = (await res.json()) as {
    likers?: ConnectionUser[];
    likedUsers?: ConnectionUser[];
    totalLikes?: number;
    totalLikedUsers?: number;
    hasMore?: boolean;
    nextOffset?: number;
  };
  const totalLikes = typeof data.totalLikes === 'number' ? data.totalLikes : 0;
  const totalLikedUsers =
    typeof data.totalLikedUsers === 'number' ? data.totalLikedUsers : 0;
  const users =
    view === 'sent'
      ? Array.isArray(data.likedUsers) ? data.likedUsers : []
      : Array.isArray(data.likers) ? data.likers : [];
  return {
    users,
    hasMore: data.hasMore === true,
    nextOffset: typeof data.nextOffset === 'number' ? data.nextOffset : offset,
    totalCount: view === 'sent' ? totalLikedUsers : totalLikes,
    totalLikes,
    totalLikedUsers,
  };
}

async function fetchTrending(offset: number): Promise<ConnectionPage> {
  const params = new URLSearchParams({
    limit: String(CONNECTION_PAGE_SIZE),
    offset: String(offset),
  });
  const res = await fetch(
    `/api/social/trending?${params}&_t=${Date.now()}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error('Failed to fetch trending');
  const data = (await res.json()) as {
    students?: ConnectionUser[];
    hasMore?: boolean;
    nextOffset?: number;
    totalCount?: number;
  };
  return {
    users: Array.isArray(data.students) ? data.students : [],
    hasMore: data.hasMore === true,
    nextOffset: typeof data.nextOffset === 'number' ? data.nextOffset : offset,
    totalCount: typeof data.totalCount === 'number' ? data.totalCount : 0,
  };
}

async function fetchMe(): Promise<MeStats | null> {
  const res = await fetch('/api/social/me');
  if (!res.ok) throw new Error('Failed to fetch personal stats');
  return (await res.json()) as MeStats | null;
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

const getInitials = (first?: string, last?: string) =>
  `${(first || '?').charAt(0)}${(last || '?').charAt(0)}`.toUpperCase();

function formatRole(role?: { name: string } | null) {
  if (!role || !role.name) return 'Student';
  const roleName = role.name;
  if (roleName === 'teacher') return 'Tutor';
  if (roleName === 'admin') return 'Manager';
  if (roleName === 'superadmin' || roleName === 'super_admin') return 'Director';
  if (roleName === 'student') return 'Student';
  return roleName;
}

// ============================================================
// SKELETONS
// ============================================================

const CardSkeleton = () => (
  <div
    className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F3F4F6]"
    aria-hidden="true"
  >
    <div className="h-full w-full animate-pulse bg-[#E5E7EB]" />
  </div>
);

const GridSkeleton = ({ cards = 6 }: { cards?: number }) => (
  <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
    {Array.from({ length: cards }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

const StatsSkeleton = () => (
  <div className="mt-3 flex flex-wrap items-center gap-1.5 animate-pulse">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="h-6 w-24 rounded-md bg-[#E5E7EB]" />
    ))}
  </div>
);

// ============================================================
// CONNECTION CARD
// ============================================================

function ConnectionCard({
  user,
  rank,
  isTrending,
  isSelf,
  activeTab,
  likesView,
  dateLabel,
  router,
  currentUserId,
  social,
}: {
  user: ConnectionUser;
  rank: number;
  isTrending: boolean;
  isSelf: boolean;
  activeTab: TabKey;
  likesView: LikesView;
  dateLabel: string | null;
  router: ReturnType<typeof useRouter>;
  currentUserId?: string;
  social: ReturnType<typeof useSocialActions>;
}) {
  const fullName =
    `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Unknown';
  const initials = getInitials(user.firstName, user.lastName);
  const roleLabel = formatRole(user.role);

  const rankBadgeStyles =
    rank === 1
      ? 'bg-[#F5C518] text-[#1A2B4C]'
      : rank === 2
        ? 'bg-[#C0C0C0] text-[#1A2B4C]'
        : rank === 3
          ? 'bg-[#CD7F32] text-white'
          : 'bg-black/50 text-white';

  return (
    <article
      className="group row-enter relative w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#0F1115] shadow-sm transition-all hover:border-[#C59B4C]/50 hover:shadow-md"
      style={{ animationDelay: `${Math.min(rank * 25, 250)}ms` }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
        {user.profileImageUrl ? (
          <Image
            src={user.profileImageUrl}
            alt={fullName}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="h-full w-full object-cover object-center"
            quality={90}
            priority={rank === 1}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#18212F] text-3xl font-semibold text-white/70">
            {initials}
          </div>
        )}

        {/* Top badges */}
        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          {isTrending && (
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold tabular-nums shadow-sm ${rankBadgeStyles}`}
              aria-label={`Rank ${rank}`}
            >
              {rank}
            </span>
          )}
          {isSelf && (
            <span className="inline-flex items-center rounded-full border border-white/40 bg-black/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur">
              You
            </span>
          )}
        </div>

        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5">
          <div className="flex flex-col gap-1">
            {/* Name + Role */}
            <div className="flex items-start justify-between gap-1.5">
              <div className="flex min-w-0 items-center gap-1">
                <h3 className="line-clamp-2 text-[13px] font-bold leading-tight text-white">
                  {fullName}
                </h3>
                {user.hasVerifiedBadge && (
                  <VerifiedBadge className="h-3.5 w-3.5 shrink-0" />
                )}
              </div>
              <span className="shrink-0 rounded bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur">
                {roleLabel}
              </span>
            </div>

            {/* Course */}
            {user.generalCourse && (
              <p className="line-clamp-1 text-[11px] font-medium text-white/85">
                {user.generalCourse}
              </p>
            )}

            {/* Tech Center */}
            {user.techCenter?.name && (
              <div className="flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5 shrink-0 text-[#D4A84B]" />
                <span className="line-clamp-1 text-[10.5px] font-medium text-white/85">
                  {user.techCenter.name}
                </span>
              </div>
            )}

            {/* Previous Tech Center */}
            {user.previousTechCenter?.name && (
              <div className="flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5 shrink-0 text-white/50" />
                <span className="line-clamp-1 text-[10px] font-medium text-white/60">
                  {user.previousTechCenter.name}
                </span>
              </div>
            )}

            {/* Date label */}
            {!isTrending && dateLabel && (
              <p className="line-clamp-1 text-[9.5px] font-medium text-white/65">
                {dateLabel}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-1.5 text-[10px] text-white/85">
              <span className="font-semibold text-white tabular-nums">
                {user.followersCount}
              </span>
              <span>followers</span>
              <span className="text-white/50">·</span>
              <span className="font-semibold text-white tabular-nums">
                {Math.max(0, user.likesReceivedCount)}
              </span>
              <span>likes</span>
              <span className="text-white/50">·</span>
              <span className="font-semibold text-white tabular-nums">
                {user.profileViewsCount}
              </span>
              <span>views</span>
            </div>

            {/* Actions */}
            {!isSelf && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/students/${user.id}`)}
                  className="inline-flex items-center gap-1 rounded border border-white/30 bg-black/30 px-2 py-0.5 text-[10px] font-semibold text-white transition-colors hover:border-white/50 hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A84B]"
                >
                  View
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(`/dashboard/messages?userId=${user.id}`)
                  }
                  className="inline-flex items-center gap-1 rounded border border-white/30 bg-black/30 px-2 py-0.5 text-[10px] font-semibold text-white transition-colors hover:border-white/50 hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A84B]"
                  aria-label={`Message ${fullName}`}
                  title={`Message ${fullName}`}
                >
                  <MessageSquare className="h-2.5 w-2.5" />
                  Message
                </button>

                {isTrending ? (
                  <SocialActions
                    userId={user.id}
                    currentUserId={currentUserId}
                    isFollowing={user.isFollowing}
                    isLiked={user.isLiked}
                    size="sm"
                    variant="featured"
                    allowUnfollow={true}
                    allowUnlike={true}
                  />
                ) : (
                  <>
                    {activeTab === 'followers' &&
                      (user.isFollowing ? (
                        <span className="inline-flex items-center gap-1 rounded border border-[#55705B] bg-[#55705B] px-2 py-0.5 text-[10px] font-semibold text-white">
                          <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
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
                          className="inline-flex items-center gap-1 rounded bg-[#1A2B4C] px-2 py-0.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#263D66] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {social.isFollowPending &&
                          social.followTarget === user.id ? (
                            <Loader2
                              className="h-2.5 w-2.5 animate-spin"
                              strokeWidth={2}
                            />
                          ) : (
                            <UserPlus className="h-2.5 w-2.5" strokeWidth={2} />
                          )}
                          {social.isFollowPending &&
                          social.followTarget === user.id
                            ? 'Following…'
                            : 'Follow'}
                        </button>
                      ))}

                    {activeTab === 'following' && (
                      <span className="inline-flex items-center gap-1 rounded border border-[#55705B] bg-[#55705B] px-2 py-0.5 text-[10px] font-semibold text-white">
                        <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                        Following
                      </span>
                    )}

                    {activeTab === 'likes' && likesView === 'sent' && (
                      <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-[#A4462F]">
                        <Heart className="h-2.5 w-2.5 fill-red-500 text-red-500" strokeWidth={2} />
                        Liked
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

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
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: false as const,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: false as const,
  };

  useEffect(() => {
    if (!currentUserId) return;
    queryClient.prefetchQuery({
      queryKey: ['social', 'me'],
      queryFn: fetchMe,
      staleTime: sharedQueryOptions.staleTime,
    });
  }, [currentUserId, queryClient, sharedQueryOptions.staleTime]);

  const meQuery = useQuery({
    queryKey: ['social', 'me'],
    queryFn: fetchMe,
    ...sharedQueryOptions,
  });

  const followersQuery = useInfiniteQuery({
    queryKey: ['connections', 'pages', 'followers', currentUserId],
    queryFn: ({ pageParam }) =>
      fetchConnections(currentUserId!, 'followers', pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextOffset : undefined,
    ...sharedQueryOptions,
    enabled: !!currentUserId && activeTab === 'followers',
  });

  const followingQuery = useInfiniteQuery({
    queryKey: ['connections', 'pages', 'following', currentUserId],
    queryFn: ({ pageParam }) =>
      fetchConnections(currentUserId!, 'following', pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextOffset : undefined,
    ...sharedQueryOptions,
    enabled: !!currentUserId && activeTab === 'following',
  });

  const likesQuery = useInfiniteQuery({
    queryKey: ['connections', 'pages', 'likes', likesView, currentUserId],
    queryFn: ({ pageParam }) =>
      fetchLikes(currentUserId!, likesView, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextOffset : undefined,
    ...sharedQueryOptions,
    enabled: !!currentUserId && activeTab === 'likes',
  });

  const trendingQuery = useInfiniteQuery({
    queryKey: ['social', 'trending', 'pages'],
    queryFn: ({ pageParam }) => fetchTrending(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextOffset : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: false as const,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: 'always' as const,
    enabled: !!currentUserId && activeTab === 'trending',
  });

  const activeQuery = useMemo(() => {
    if (activeTab === 'followers') return followersQuery;
    if (activeTab === 'following') return followingQuery;
    if (activeTab === 'likes') return likesQuery;
    return trendingQuery;
  }, [activeTab, followersQuery, followingQuery, likesQuery, trendingQuery]);

  const connections: ConnectionUser[] = useMemo(() => {
    if (activeTab === 'trending') {
      return trendingQuery.data?.pages.flatMap((page) => page.users) ?? [];
    }
    if (activeTab === 'likes') {
      return likesQuery.data?.pages.flatMap((page) => page.users) ?? [];
    }
    if (activeTab === 'following') {
      const base =
        followingQuery.data?.pages.flatMap((page) => page.users) ?? [];
      return base.filter((c) => c.isFollowing !== false);
    }
    return followersQuery.data?.pages.flatMap((page) => page.users) ?? [];
  }, [
    activeTab,
    trendingQuery.data,
    likesQuery.data,
    followingQuery.data,
    followersQuery.data,
  ]);

  const isFetchingWithoutData =
    !!activeQuery?.isFetching && activeQuery.data === undefined;
  const error = activeQuery?.error;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['connections'] });
    queryClient.invalidateQueries({ queryKey: ['social', 'trending'] });
    queryClient.invalidateQueries({ queryKey: ['social', 'me'] });
  };

  const showSessionLoading = status === 'loading';
  const me = meQuery.data;

  const tabs: Array<{
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }> = [
    {
      key: 'trending',
      label: 'Trending',
      icon: <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.2} />,
    },
    {
      key: 'followers',
      label: 'Followers',
      icon: <Users className="h-3.5 w-3.5" strokeWidth={2.2} />,
      count: me?.followersCount,
    },
    {
      key: 'following',
      label: 'Following',
      icon: <Users className="h-3.5 w-3.5" strokeWidth={2.2} />,
      count: me?.followingCount,
    },
    {
      key: 'likes',
      label: 'Likes',
      icon: <Heart className="h-3.5 w-3.5" strokeWidth={2.2} />,
      count: me?.likesReceivedCount,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A2B4C]">
      <style jsx global>{`
        @keyframes rowEnter {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .row-enter {
          animation: rowEnter 200ms ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .row-enter {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-5">
        {/* HEADER */}
        <header className="mb-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-[20px] font-bold leading-tight tracking-tight text-[#1A2B4C] sm:text-[22px]">
                Connections
              </h1>
              <p className="mt-0.5 text-[12px] leading-5 text-[#6B7280]">
                Trending peers, followers, following, and likes.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#4B5646] transition-colors hover:border-[#C59B4C] hover:text-[#1A2B4C]"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={2.2} />
              Refresh
            </button>
          </div>

          {/* Stats strip */}
          {showSessionLoading || !me ? (
            <StatsSkeleton />
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] font-medium text-[#4B5646]">
                <Users className="h-3 w-3 text-[#6B7280]" strokeWidth={2.2} />
                <span className="font-semibold text-[#1A2B4C] tabular-nums">
                  {me.followersCount}
                </span>
                followers
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] font-medium text-[#4B5646]">
                <Users className="h-3 w-3 text-[#6B7280]" strokeWidth={2.2} />
                <span className="font-semibold text-[#1A2B4C] tabular-nums">
                  {me.followingCount}
                </span>
                following
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] font-medium text-[#4B5646]">
                <Heart
                  className="h-3 w-3 fill-red-500 text-red-500"
                  strokeWidth={2}
                />
                <span className="font-semibold text-[#1A2B4C] tabular-nums">
                  {me.likesReceivedCount}
                </span>
                likes
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] font-medium text-[#4B5646]">
                <Eye className="h-3 w-3 text-[#6B7280]" strokeWidth={2.2} />
                <span className="font-semibold text-[#1A2B4C] tabular-nums">
                  {me.profileViewsCount}
                </span>
                views
              </span>
            </div>
          )}

          {/* Tab rail */}
          <nav
            role="tablist"
            aria-label="Connection views"
            className="mt-3 flex flex-wrap items-center gap-0.5 border-b border-[#E5E7EB]"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative -mb-px inline-flex items-center gap-1.5 border-b-2 px-2.5 py-2 text-[12px] font-semibold transition-colors ${
                    isActive
                      ? 'border-[#C59B4C] text-[#1A2B4C]'
                      : 'border-transparent text-[#6B7280] hover:text-[#1A2B4C]'
                  }`}
                >
                  <span className={isActive ? 'text-[#C59B4C]' : ''}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span
                      className={`ml-0.5 rounded px-1 py-0.5 text-[9.5px] font-bold tabular-nums ${
                        isActive
                          ? 'bg-[#1A2B4C] text-white'
                          : 'bg-[#F3F4F6] text-[#4B5646]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </header>

        {/* LIKES SUB-TABS */}
        {activeTab === 'likes' && (
          <div
            className="mb-3 flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-white p-0.5"
            role="tablist"
            aria-label="Likes filter"
          >
            <button
              type="button"
              role="tab"
              aria-selected={likesView === 'received'}
              onClick={() => setLikesView('received')}
              className={`inline-flex flex-1 items-center justify-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                likesView === 'received'
                  ? 'bg-[#1A2B4C] text-white'
                  : 'text-[#4B5646] hover:bg-[#F8F9FA]'
              }`}
            >
              <Heart className="h-3 w-3" strokeWidth={2.2} />
              Received ({likesQuery.data?.pages[0]?.totalLikes ?? 0})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={likesView === 'sent'}
              onClick={() => setLikesView('sent')}
              className={`inline-flex flex-1 items-center justify-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                likesView === 'sent'
                  ? 'bg-[#1A2B4C] text-white'
                  : 'text-[#4B5646] hover:bg-[#F8F9FA]'
              }`}
            >
              <Heart className="h-3 w-3" strokeWidth={2.2} />
              You liked ({likesQuery.data?.pages[0]?.totalLikedUsers ?? 0})
            </button>
          </div>
        )}

        {/* CONTENT */}
        {showSessionLoading || isFetchingWithoutData ? (
          <GridSkeleton cards={8} />
        ) : error && connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-5 py-12 text-center">
            <AlertCircle
              className="mb-2 h-8 w-8 text-[#A4462F]"
              strokeWidth={1.6}
            />
            <h3 className="mb-1 text-[14px] font-semibold text-[#1A2B4C]">
              Couldn&apos;t load connections
            </h3>
            <p className="mb-3 max-w-md text-[12px] text-[#6B7280]">
              {error instanceof Error
                ? error.message
                : 'Failed to load connections'}
            </p>
            <button
              type="button"
              onClick={() => activeQuery?.refetch()}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1A2B4C] px-3 text-[11.5px] font-semibold text-white transition-colors hover:bg-[#263D66]"
            >
              Retry
            </button>
          </div>
        ) : connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] bg-white px-5 py-12 text-center">
            {activeTab === 'likes' ? (
              <Heart
                className="mb-2 h-8 w-8 text-[#9CA3AF]"
                strokeWidth={1.6}
              />
            ) : activeTab === 'trending' ? (
              <TrendingUp
                className="mb-2 h-8 w-8 text-[#9CA3AF]"
                strokeWidth={1.6}
              />
            ) : (
              <Users
                className="mb-2 h-8 w-8 text-[#9CA3AF]"
                strokeWidth={1.6}
              />
            )}
            <h3 className="mb-1 text-[14px] font-semibold text-[#1A2B4C]">
              {activeTab === 'trending'
                ? 'No trending students yet'
                : activeTab === 'likes' && likesView === 'sent'
                  ? 'No profiles liked yet'
                  : `No ${activeTab} yet`}
            </h3>
            <p className="max-w-md text-[12px] text-[#6B7280]">
              {activeTab === 'likes' && likesView === 'sent'
                ? 'Profiles you like will appear here.'
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
          <>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
              {connections.map((user, index) => {
                const rank = index + 1;
                const isTrending = activeTab === 'trending';
                const isSelf = currentUserId === user.id;

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

                return (
                  <ConnectionCard
                    key={user.id}
                    user={user}
                    rank={rank}
                    isTrending={isTrending}
                    isSelf={isSelf}
                    activeTab={activeTab}
                    likesView={likesView}
                    dateLabel={dateLabel}
                    router={router}
                    currentUserId={currentUserId}
                    social={social}
                  />
                );
              })}
              {activeQuery?.hasNextPage && (
                <button
                  type="button"
                  onClick={() => void activeQuery.fetchNextPage()}
                  disabled={activeQuery.isFetchingNextPage}
                  className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#E5E7EB] bg-white px-4 text-center text-[#1A2B4C] transition-colors hover:border-[#C59B4C] hover:bg-[#F8F9FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C] disabled:cursor-wait disabled:opacity-70"
                  aria-label={
                    activeQuery.isFetchNextPageError
                      ? 'Retry loading more connections'
                      : 'Load more connections'
                  }
                >
                  {activeQuery.isFetchingNextPage ? (
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <UserPlus className="h-5 w-5" aria-hidden="true" />
                  )}
                  <span className="text-[12px] font-semibold">
                    {activeQuery.isFetchingNextPage
                      ? 'Loading…'
                      : activeQuery.isFetchNextPageError
                        ? 'Try loading more'
                        : 'Load more'}
                  </span>
                  <span className="text-[10.5px] text-[#6B7280]">
                    {activeQuery.isFetchingNextPage
                      ? 'Please wait'
                      : 'Show next 20'}
                  </span>
                </button>
              )}
            </div>

            {activeTab === 'trending' && (
              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11.5px] text-[#6B7280]">
                <TrendingUp
                  className="h-3 w-3 shrink-0 text-[#C59B4C]"
                  strokeWidth={2.2}
                />
                <span>Ranked by followers, then likes.</span>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}