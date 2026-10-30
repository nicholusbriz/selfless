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
import { UnfollowButton } from '@/components/social/UnfollowButton';
import { UnlikeButton } from '@/components/social/UnlikeButton';
import { useSocialActions } from '@/lib/hooks/useSocialActions';

// ============================================================
// BRAND TOKENS (mirrors students page)
// ============================================================

const GOLD_DEEP = '#B98A3E';
const CONNECTION_PAGE_SIZE = 20;

// ============================================================
// TYPES
// ============================================================

interface ConnectionUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
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
// FETCHERS (typed to satisfy strict TS)
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
    className="relative aspect-[3/4] w-full overflow-hidden rounded-[22px] border border-[#C8A24A]/40 bg-[#0F1115]"
    aria-hidden="true"
  >
    <div className="h-full w-full animate-pulse bg-[#18212F]" />
  </div>
);

const GridSkeleton = ({ cards = 6 }: { cards?: number }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: cards }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

const StatsSkeleton = () => (
  <div className="mt-4 flex flex-wrap items-center gap-2 animate-pulse">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="h-7 w-28 rounded-full bg-[#E5E7EB]" />
    ))}
  </div>
);

// ============================================================
// CONNECTION CARD (matches DiscoverStudents visual language)
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
          : 'bg-white/15 text-white';

  return (
    <article
      className="group row-enter relative w-full overflow-hidden rounded-[22px] border border-[#C8A24A]/40 bg-[#0F1115] shadow-[0_24px_65px_rgba(0,0,0,0.52)] transition-all hover:border-[#C8A24A]/70 hover:shadow-[0_28px_75px_rgba(0,0,0,0.6)]"
      style={{ animationDelay: `${Math.min(rank * 30, 300)}ms` }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
        {user.profileImageUrl ? (
          <Image
            src={user.profileImageUrl}
            alt={fullName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="h-full w-full object-cover object-center"
            quality={95}
            priority={rank === 1}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#18212F] text-4xl font-semibold text-white/70">
            {initials}
          </div>
        )}

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          {isTrending && (
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] font-bold tabular-nums shadow-sm ${rankBadgeStyles}`}
              aria-label={`Rank ${rank}`}
            >
              {rank}
            </span>
          )}
          {isSelf && (
            <span className="inline-flex items-center rounded-full border border-white/40 bg-black/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur">
              You
            </span>
          )}
        </div>

        {/* Text overlay — identical structure to DiscoverStudents */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
          <div className="flex flex-col gap-2">
            {/* Row 1 — Name + Role */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[16px] font-bold leading-tight text-white">
                {fullName}
              </h3>
              {roleLabel && (
                <span className="shrink-0 text-[11px] font-medium text-white/90">
                  {roleLabel}
                </span>
              )}
            </div>

            {/* Row 2 — Course */}
            {user.generalCourse && (
              <p className="text-[13px] font-medium text-white">
                {user.generalCourse}
              </p>
            )}

            {/* Row 3 — Tech Center */}
            {user.techCenter?.name && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-[12px] w-[12px] shrink-0 text-[#D4A84B]" />
                <span className="text-[12px] font-medium text-white/90">
                  {user.techCenter.name}
                </span>
              </div>
            )}

            {/* Row 3.5 — Previous Tech Center (for directors) */}
            {user.previousTechCenter?.name && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-[12px] w-[12px] shrink-0 text-white/60" />
                <span className="text-[11px] font-medium text-white/70">
                  {user.previousTechCenter.name}
                </span>
              </div>
            )}

            {/* Row 4 — Date label (non-trending tabs) */}
            {!isTrending && dateLabel && (
              <p className="text-[10.5px] font-medium text-white/70">
                {dateLabel}
              </p>
            )}

            {/* Row 5 — Stats */}
            <div className="mt-1 flex items-center gap-2 text-[11px] text-white/90">
              <span className="font-semibold text-white tabular-nums">
                {user.followersCount}
              </span>
              <span>followers</span>
              <span className="text-white/60">•</span>
              <span className="font-semibold text-white tabular-nums">
                {Math.max(0, user.likesReceivedCount)}
              </span>
              <span>likes</span>
              <span className="text-white/60">•</span>
              <span className="font-semibold text-white tabular-nums">
                {user.profileViewsCount}
              </span>
              <span>views</span>
            </div>

            {/* Row 6 — Actions */}
            {!isSelf && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/dashboard/students/${user.id}`)
                  }
                  className="inline-flex items-center gap-1 rounded-md border border-white/30 bg-black/25 px-2.5 py-1 text-[10px] font-semibold text-white transition-all hover:border-white/50 hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A84B]"
                >
                  View Profile
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(`/dashboard/messages?userId=${user.id}`)
                  }
                  className="inline-flex items-center gap-1 rounded-md border border-white/30 bg-black/25 px-2.5 py-1 text-[10px] font-semibold text-white transition-all hover:bg-black/35 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A84B]"
                  aria-label={`Message ${fullName}`}
                  title={`Message ${fullName}`}
                >
                  <MessageSquare className="h-3 w-3" />
                  Message
                </button>

                {isTrending ? (
                  <SocialActions
                    userId={user.id}
                    currentUserId={currentUserId}
                    size="sm"
                    variant="featured"
                    allowUnfollow={true}
                    allowUnlike={true}
                  />
                ) : (
                  <>
                    {activeTab === 'followers' &&
                      (user.isFollowing ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-[#55705B] bg-[#55705B] px-2.5 py-1 text-[10px] font-semibold text-white">
                          <Check className="h-3 w-3" strokeWidth={2.5} />
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
                          className="inline-flex items-center gap-1 rounded-md bg-[#1A2B4C] px-2.5 py-1 text-[10px] font-semibold text-white transition-all hover:bg-[#2C3E5A] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
                        >
                          {social.isFollowPending &&
                          social.followTarget === user.id ? (
                            <Loader2
                              className="h-3 w-3 animate-spin"
                              strokeWidth={2}
                            />
                          ) : (
                            <UserPlus className="h-3 w-3" strokeWidth={2} />
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
    refetchInterval: false, // Remove auto-polling
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: false,
  } as const;

  // ---------- prefetch ----------
  useEffect(() => {
    if (!currentUserId) return;

    queryClient.prefetchQuery({
      queryKey: ['social', 'me'],
      queryFn: fetchMe,
      staleTime: sharedQueryOptions.staleTime,
    });
  }, [currentUserId, queryClient, sharedQueryOptions.staleTime]);

  // ---------- queries ----------

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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 5 * 60 * 1000,
    refetchInterval: false, // Remove auto-polling
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: 'always',
    enabled: !!currentUserId && activeTab === 'trending',
  });

  const activeQuery = useMemo(() => {
    if (activeTab === 'followers') return followersQuery;
    if (activeTab === 'following') return followingQuery;
    if (activeTab === 'likes') return likesQuery;
    return trendingQuery;
  }, [activeTab, followersQuery, followingQuery, likesQuery, trendingQuery]);

  // ---------- rows for the active tab ----------
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

  // Tab config for the header
  const tabs: Array<{
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    count?: number;
    accent: string;
  }> = [
    {
      key: 'trending',
      label: 'Trending',
      icon: <TrendingUp className="h-4 w-4" strokeWidth={2.2} />,
      accent: GOLD_DEEP,
    },
    {
      key: 'followers',
      label: 'Followers',
      icon: <Users className="h-4 w-4" strokeWidth={2.2} />,
      count: me?.followersCount,
      accent: GOLD_DEEP,
    },
    {
      key: 'following',
      label: 'Following',
      icon: <Users className="h-4 w-4" strokeWidth={2.2} />,
      count: me?.followingCount,
      accent: '#55705B',
    },
    {
      key: 'likes',
      label: 'Likes',
      icon: <Heart className="h-4 w-4" strokeWidth={2.2} />,
      count: me?.likesReceivedCount,
      accent: '#DC2626',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1A2B4C]">
      <style jsx global>{`
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
          .row-enter {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-5">
        {/* HEADER */}
        <header className="mb-5 border-t border-[#1A2B4C] pt-3 sm:mb-6 sm:pt-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#1A2B4C] sm:text-[30px]">
                My Connections
              </h1>
              <p className="mt-1 text-[13px] font-medium leading-5 text-[#6B7280] sm:text-[14px]">
                Trending peers, followers, following, and likes — all in one
                place.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#1A2B4C] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#1A2B4C] transition-colors hover:bg-[#F7F6F2] active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.2} />
              Refresh
            </button>
          </div>

          {/* Stats + tabs rail */}
          {showSessionLoading || !me ? (
            <StatsSkeleton />
          ) : (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B98A3E]/30 bg-[#B98A3E]/10 px-2.5 py-1 font-mono text-[11px] font-bold text-[#8A6A2E] tabular-nums">
                  <Users className="h-3 w-3" strokeWidth={2.4} />
                  {me.followersCount} followers
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#55705B]/30 bg-[#55705B]/10 px-2.5 py-1 font-mono text-[11px] font-bold text-[#55705B] tabular-nums">
                  <Users className="h-3 w-3" strokeWidth={2.4} />
                  {me.followingCount} following
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 font-mono text-[11px] font-bold text-red-600 tabular-nums">
                  <Heart
                    className="h-3 w-3 fill-red-500 text-red-500"
                    strokeWidth={2}
                  />
                  {me.likesReceivedCount} likes
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3E5C76]/30 bg-[#3E5C76]/10 px-2.5 py-1 font-mono text-[11px] font-bold text-[#3E5C76] tabular-nums">
                  <Eye className="h-3 w-3" strokeWidth={2.2} />
                  {me.profileViewsCount} views
                </span>
              </div>

              {/* Tab rail — gold active underline mirrors students page convention */}
              <nav
                role="tablist"
                aria-label="Connection views"
                className="mt-4 flex flex-wrap items-center gap-1 border-b border-[#D1D5DB]"
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
                      className={`relative -mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-bold transition-colors ${
                        isActive
                          ? 'border-[#D4A84B] text-[#1A2B4C]'
                          : 'border-transparent text-[#6B7280] hover:text-[#1A2B4C]'
                      }`}
                    >
                      <span style={{ color: isActive ? tab.accent : undefined }}>
                        {tab.icon}
                      </span>
                      <span>{tab.label}</span>
                      {typeof tab.count === 'number' && (
                        <span
                          className={`ml-0.5 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums ${
                            isActive
                              ? 'bg-[#1A2B4C] text-white'
                              : 'bg-[#E5E7EB] text-[#4B5646]'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </>
          )}
        </header>

        {/* LIKES SUB-TABS */}
        {activeTab === 'likes' && (
          <div
            className="mb-4 flex items-center gap-1 rounded-md border border-[#D1D5DB] bg-white p-1"
            role="tablist"
            aria-label="Likes filter"
          >
            <button
              type="button"
              role="tab"
              aria-selected={likesView === 'received'}
              onClick={() => setLikesView('received')}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-[12px] font-bold transition-colors ${
                likesView === 'received'
                  ? 'bg-red-600 text-white'
                  : 'text-[#4B5646] hover:bg-[#F7F6F2]'
              }`}
            >
              <Heart className="h-3.5 w-3.5" strokeWidth={2.2} />
              Received ({likesQuery.data?.pages[0]?.totalLikes ?? 0})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={likesView === 'sent'}
              onClick={() => setLikesView('sent')}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-[12px] font-bold transition-colors ${
                likesView === 'sent'
                  ? 'bg-red-600 text-white'
                  : 'text-[#4B5646] hover:bg-[#F7F6F2]'
              }`}
            >
              <Heart className="h-3.5 w-3.5" strokeWidth={2.2} />
              You liked ({likesQuery.data?.pages[0]?.totalLikedUsers ?? 0})
            </button>
          </div>
        )}

        {/* CONTENT */}
        {showSessionLoading || isFetchingWithoutData ? (
          <GridSkeleton cards={6} />
        ) : error && connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#A4462F]/40 bg-white px-6 py-16 text-center">
            <AlertCircle
              className="mb-3 h-10 w-10 text-[#A4462F]"
              strokeWidth={1.6}
            />
            <h3 className="mb-1.5 text-[16px] font-bold text-[#1A2B4C]">
              Error loading connections
            </h3>
            <p className="mb-4 max-w-md text-[13px] text-[#4B5646]">
              {error instanceof Error
                ? error.message
                : 'Failed to load connections'}
            </p>
            <button
              type="button"
              onClick={() => activeQuery?.refetch()}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#1A2B4C] px-4 text-[12px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#2C3E5A]"
            >
              Retry
            </button>
          </div>
        ) : connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D1D5DB] bg-white px-6 py-16 text-center">
            {activeTab === 'likes' ? (
              <Heart
                className="mb-3 h-10 w-10 text-[#9CA3AF]"
                strokeWidth={1.6}
              />
            ) : activeTab === 'trending' ? (
              <TrendingUp
                className="mb-3 h-10 w-10 text-[#9CA3AF]"
                strokeWidth={1.6}
              />
            ) : (
              <Users
                className="mb-3 h-10 w-10 text-[#9CA3AF]"
                strokeWidth={1.6}
              />
            )}
            <h3 className="mb-1.5 text-[16px] font-bold text-[#1A2B4C]">
              {activeTab === 'trending'
                ? 'No trending students yet'
                : activeTab === 'likes' && likesView === 'sent'
                  ? 'No profiles liked yet'
                  : `No ${activeTab} yet`}
            </h3>
            <p className="max-w-md text-[13px] text-[#4B5646]">
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
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-[22px] border border-dashed border-[#1A2B4C]/30 bg-white px-6 text-center text-[#1A2B4C] transition-colors hover:border-[#1A2B4C] hover:bg-[#F7F6F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A84B] disabled:cursor-wait disabled:opacity-70"
                  aria-label={
                    activeQuery.isFetchNextPageError
                      ? 'Retry loading more connections'
                      : 'Load more connections'
                  }
                >
                  {activeQuery.isFetchingNextPage ? (
                    <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                  ) : (
                    <UserPlus className="h-6 w-6" aria-hidden="true" />
                  )}
                  <span className="text-sm font-bold">
                    {activeQuery.isFetchingNextPage
                      ? 'Loading…'
                      : activeQuery.isFetchNextPageError
                        ? 'Try loading more'
                        : 'Load more'}
                  </span>
                  <span className="text-xs text-[#6B7280]">
                    {activeQuery.isFetchingNextPage
                      ? 'Please wait'
                      : 'Show the next 20 profiles'}
                  </span>
                </button>
              )}
            </div>

            {activeTab === 'trending' && (
              <p className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-center text-[12px] text-[#6B7280]">
                <TrendingUp
                  className="h-3.5 w-3.5 shrink-0 text-[#B98A3E]"
                  strokeWidth={2.2}
                />
                <span>
                  Showing the most popular students, ranked by followers
                  first, then likes.
                </span>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}