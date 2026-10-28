'use client';

/* ============================================================
   DASHBOARD PAGE
   ------------------------------------------------------------
   Editorial, bold, solid. Structure over decoration.
============================================================ */

import {
  Trophy,
  Users,
  BookOpen,
  Briefcase,
  Clock,
  ArrowRight,
  User,
  MapPin,
  Video,
  GraduationCap,
  ChevronRight,
  Library,
  MessageCircle,
  MessageSquare,
  Loader2,
  Heart,
  UserPlus,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Eye,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSession } from 'next-auth/react';
import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { DiscoverStudents, type DiscoverStudent } from './components/DiscoverStudents';
import { VideoPlayer } from './components/VideoPlayer';
import type { PageCacheAdapter } from '@/lib/social/cacheKeys';
import {
  findInStudentsShape,
} from '@/lib/social/patchHelpers';
import { SocialActions } from '@/components/social/SocialActions';
import { compareSuperadminWithImageFirst } from '@/lib/social/ranking';
import { getResponseError, isRecord } from './response-guards';

/* ============================================================
   TYPES
============================================================ */

interface TechCenter {
  id: string;
  name: string;
  city?: string | null;
}

interface Tutor {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  email: string;
  techCenter?: { id: string; name: string };
  role?: { name: string };
}

interface CenterAdmin {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string | null;
  status: string;
  isActive: boolean;
}

interface AssignmentData {
  isTeacher: boolean;
  hasTutor?: boolean;
  tutor?: Tutor | null;
  studentCount?: number;
  students?: Student[];
}

interface QuickLink {
  icon: React.ReactNode;
  label: string;
  description: string;
  path: string;
}

interface MediaItem {
  id: string;
  publicUrl: string;
  blobName: string;
  contentType: string;
  size: number;
  title: string;
  description: string | null;
  category: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  } | null;
}

interface MeStats {
  id: string;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  profileViewsCount: number;
}

interface SocialSummary {
  me: MeStats;
  trending: {
    students: SocialUser[];
    generatedAt: string;
  };
  activity: {
    likers: Array<SocialUser & { likedAt?: string }>;
    likedUsers: Array<SocialUser & { likedAt?: string }>;
    followers: Array<SocialUser & { connectedAt?: string }>;
  };
}

interface SocialUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  status?: string;
  role?: string | null;
  techCenter: { id: string; name: string } | null;
  previousTechCenter?: { id: string; name: string } | null;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  profileViewsCount: number;
  isFollowing: boolean;
  isLiked: boolean;
}

function isMediaItem(value: unknown): value is MediaItem {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.publicUrl === 'string' &&
    typeof value.blobName === 'string' &&
    typeof value.contentType === 'string' &&
    typeof value.size === 'number' &&
    typeof value.title === 'string' &&
    (typeof value.description === 'string' || value.description === null) &&
    (typeof value.category === 'string' || value.category === null) &&
    typeof value.createdAt === 'string' &&
    (value.user === undefined ||
      value.user === null ||
      (isRecord(value.user) &&
        typeof value.user.id === 'string' &&
        typeof value.user.firstName === 'string' &&
        typeof value.user.lastName === 'string' &&
        (typeof value.user.profileImageUrl === 'string' ||
          value.user.profileImageUrl === null)))
  );
}

function isTechCenter(value: unknown): value is TechCenter {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    (value.city === undefined ||
      typeof value.city === 'string' ||
      value.city === null)
  );
}

function isTutor(value: unknown): value is Tutor {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.firstName === 'string' &&
    typeof value.lastName === 'string' &&
    (typeof value.profileImageUrl === 'string' ||
      value.profileImageUrl === null) &&
    (value.status === undefined || typeof value.status === 'string') &&
    typeof value.email === 'string' &&
    (value.techCenter === undefined ||
      (isRecord(value.techCenter) &&
        typeof value.techCenter.id === 'string' &&
        typeof value.techCenter.name === 'string')) &&
    (value.role === undefined ||
      (isRecord(value.role) && typeof value.role.name === 'string'))
  );
}

function isCenterAdmin(value: unknown): value is CenterAdmin {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.firstName === 'string' &&
    typeof value.lastName === 'string' &&
    (typeof value.profileImageUrl === 'string' ||
      value.profileImageUrl === null)
  );
}

function isTechCenterActivityItem(
  value: unknown,
): value is TechCenterActivityItem {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.action === 'string' &&
    typeof value.createdAt === 'string' &&
    isRecord(value.user) &&
    typeof value.user.id === 'string' &&
    typeof value.user.firstName === 'string' &&
    typeof value.user.lastName === 'string' &&
    typeof value.user.email === 'string' &&
    (typeof value.user.profileImageUrl === 'string' ||
      value.user.profileImageUrl === null) &&
    (value.techCenter === undefined ||
      (isRecord(value.techCenter) &&
        typeof value.techCenter.id === 'string' &&
        typeof value.techCenter.name === 'string'))
  );
}

function isSocialUser(value: unknown): value is SocialUser {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.firstName === 'string' &&
    typeof value.lastName === 'string' &&
    (typeof value.profileImageUrl === 'string' ||
      value.profileImageUrl === null) &&
    (value.role === undefined ||
      typeof value.role === 'string' ||
      value.role === null) &&
    (value.techCenter === null ||
      (isRecord(value.techCenter) &&
        typeof value.techCenter.id === 'string' &&
        typeof value.techCenter.name === 'string')) &&
    (value.previousTechCenter === undefined ||
      value.previousTechCenter === null ||
      (isRecord(value.previousTechCenter) &&
        typeof value.previousTechCenter.id === 'string' &&
        typeof value.previousTechCenter.name === 'string')) &&
    typeof value.followersCount === 'number' &&
    typeof value.followingCount === 'number' &&
    typeof value.likesReceivedCount === 'number' &&
    typeof value.profileViewsCount === 'number' &&
    typeof value.isFollowing === 'boolean' &&
    typeof value.isLiked === 'boolean'
  );
}

function isLiker(value: unknown): value is SocialUser & { likedAt?: string } {
  return (
    isSocialUser(value) &&
    isRecord(value) &&
    (value.likedAt === undefined || typeof value.likedAt === 'string')
  );
}

function isFollower(
  value: unknown,
): value is SocialUser & { connectedAt?: string } {
  return (
    isSocialUser(value) &&
    isRecord(value) &&
    (value.connectedAt === undefined || typeof value.connectedAt === 'string')
  );
}

function isSocialSummary(value: unknown): value is SocialSummary {
  return (
    isRecord(value) &&
    isRecord(value.me) &&
    typeof value.me.id === 'string' &&
    typeof value.me.followersCount === 'number' &&
    typeof value.me.followingCount === 'number' &&
    typeof value.me.likesReceivedCount === 'number' &&
    typeof value.me.profileViewsCount === 'number' &&
    isRecord(value.trending) &&
    Array.isArray(value.trending.students) &&
    value.trending.students.every(isSocialUser) &&
    typeof value.trending.generatedAt === 'string' &&
    isRecord(value.activity) &&
    Array.isArray(value.activity.likers) &&
    value.activity.likers.every(isLiker) &&
    Array.isArray(value.activity.likedUsers) &&
    value.activity.likedUsers.every(isLiker) &&
    Array.isArray(value.activity.followers) &&
    value.activity.followers.every(isFollower)
  );
}

const getTrendingRoleLabel = (role?: string | null) => {
  if (!role) return null;
  const roleLabels: Record<string, string> = {
    admin: 'Manager',
    super_admin: 'Director',
    dev: 'Developer',
    student: 'Student',
    teacher: 'Tutor',
  };
  return (
    roleLabels[role.toLowerCase()] ??
    role.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
};

const DASHBOARD_TRENDING_ADAPTERS: PageCacheAdapter[] = [
  {
    queryKey: ['dashboard', 'social-summary'],
    patch: (old, targetId, patch) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as SocialSummary;
      if (!data.trending?.students) return old;
      return {
        ...data,
        trending: {
          ...data.trending,
          students: data.trending.students.map((s) =>
            s.id === targetId ? { ...s, ...patch } : s,
          ),
        },
      };
    },
    find: (old, targetId) => findInStudentsShape((old as SocialSummary)?.trending?.students || [], targetId),
  },
];

/* ============================================================
   SECTION HEADER — bold, editorial
============================================================ */

function DirectorsDisplay({
  trending = [],
  isLoading,
}: {
  trending?: SocialUser[];
  isLoading?: boolean;
}) {
  const directors = trending.filter(
    (profile) =>
      profile.role === 'super_admin' &&
      profile.status === 'ACTIVE' &&
      Boolean(profile.previousTechCenter),
  );

  return (
    <SuggestedStudents
      trending={directors}
      isLoading={isLoading}
      directorCardLayout
    />
  );
}

interface DashboardAnnouncement {
  id: string;
  title: string;
  createdAt: string;
  isGlobal: boolean;
}

function AnnouncementsSection() {
  const router = useRouter();
  const { data: announcements = [], isLoading, error } = useQuery<DashboardAnnouncement[]>({
    queryKey: ['announcements', 'dashboard-preview'],
    queryFn: async () => {
      const response = await fetch('/api/announcements');
      const data: unknown = await response.json();
      if (!response.ok) {
        throw new Error(getResponseError(data, 'Failed to fetch announcements'));
      }
      if (!isRecord(data) || !Array.isArray(data.announcements)) {
        throw new Error('Invalid announcements response');
      }
      return data.announcements
        .filter((announcement): announcement is DashboardAnnouncement =>
          isRecord(announcement) &&
          typeof announcement.id === 'string' &&
          typeof announcement.title === 'string' &&
          typeof announcement.createdAt === 'string' &&
          typeof announcement.isGlobal === 'boolean',
        )
        .slice(0, 3);
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return (
    <section className="bg-white p-5 sm:p-7">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-[#B98A3E]" />
          <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[#1A2B4C]">
            Recent announcements
          </h2>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-5 py-2">
          {[0, 1, 2].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="mb-2 h-3 w-28 rounded bg-[#E5E7EB]" />
              <div className="h-5 max-w-2xl rounded bg-[#E5E7EB]" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p role="status" className="text-sm text-red-600">
          Announcements could not be loaded.
        </p>
      ) : announcements.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#6B7280]">No announcements yet.</p>
      ) : (
        <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement) => (
            <li key={announcement.id}>
              <button
                type="button"
                onClick={() => router.push('/dashboard/announcements')}
                className="w-full break-words text-left text-base font-semibold leading-6 text-[#1A2B4C] underline decoration-[#1A2B4C] underline-offset-2 transition-colors hover:text-[#8A642D] hover:decoration-[#8A642D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B98A3E]"
              >
                {announcement.title}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => router.push('/dashboard/announcements')}
        className="mt-4 inline-flex items-center gap-1 py-1 text-xs font-semibold text-[#1A2B4C] transition-colors hover:text-[#8A642D] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B98A3E]"
      >
        View all announcements
        <ChevronRight className="h-4 w-4" />
      </button>
    </section>
  );
}

function SectionHeader({
  label,
  count,
  action,
}: {
  label: string;
  count?: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-t-2 border-[#1A2B4C] pt-3">
      <div className="flex items-baseline gap-3">
        <h2 className="text-[17px] font-black uppercase tracking-tight text-[#1A2B4C] sm:text-[19px]">
          {label}
        </h2>
        {typeof count === 'number' && (
          <span className="font-mono text-[13px] font-bold tabular-nums text-[#B98A3E]">
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

/* ============================================================
   MEDIA LIBRARY (Reels)
============================================================ */

function MediaLibrary() {
  const { data: items = [], isLoading, error } = useQuery<MediaItem[]>({
    queryKey: ['dashboard-media'],
    queryFn: async () => {
      const response = await fetch('/api/media/list');
      if (!response.ok) throw new Error('Failed to fetch media');
      const data: unknown = await response.json();
      if (!isRecord(data) || data.success !== true || !Array.isArray(data.items)) {
        throw new Error(getResponseError(data, 'Failed'));
      }
      return data.items.filter(isMediaItem);
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const videos = useMemo(
    () => items.filter((item) => item.contentType.startsWith('video/')),
    [items],
  );

  const [rawIndex, setRawIndex] = useState(0);
  const videoPlayerRef = useRef<{ play: () => void } | null>(null);

  const currentIndex =
    videos.length === 0 ? 0 : Math.min(rawIndex, videos.length - 1);
  const current = videos[currentIndex] ?? null;

  const goNext = useCallback(() => {
    if (videos.length <= 1) return;
    setRawIndex((prev) => (prev + 1) % videos.length);
    setTimeout(() => videoPlayerRef.current?.play(), 100);
  }, [videos.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 bg-[#0F1923] py-16 text-sm text-white/40">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading reels…
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[#A4462F]/30 bg-[#A4462F]/5 p-4 text-sm text-[#A4462F]">
        {error instanceof Error ? error.message : 'Could not load reels'}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="border border-[#1A2B4C] bg-white">
        <div className="px-5 py-10 text-center">
          <Video className="mx-auto mb-3 h-6 w-6 text-[#9CA3AF]" />
          <p className="text-[15px] font-bold text-[#1A2B4C]">No reels yet</p>
          <p className="mt-1 text-[12px] text-[#6B7280]">
            Be the first to share a video with the community
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-3xl bg-black">
        {current && (
          <VideoPlayer
            key={`video-${current.id}`}
            src={current.publicUrl}
            title={current.title}
            description={current.description || undefined}
            className="w-full"
            playRef={videoPlayerRef}
            onEnded={() => {
              if (videos.length > 1) goNext();
            }}
          />
        )}
      </div>
      <ul aria-label="Available videos" className="mx-auto max-h-64 w-full max-w-3xl space-y-1 overflow-y-auto bg-white p-3">
        {videos.map((video, index) => {
          const isCurrentVideo = index === currentIndex;

          return (
            <li key={video.id}>
              <button
                type="button"
                aria-current={isCurrentVideo ? 'true' : undefined}
                onClick={() => {
                  setRawIndex(index);
                  window.setTimeout(() => videoPlayerRef.current?.play(), 150);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B98A3E] ${
                  isCurrentVideo
                    ? 'bg-[#F8F9FA] font-semibold text-blue-700'
                    : 'text-blue-700 hover:bg-[#F8F9FA]'
                }`}
              >
                <Video className="h-4 w-4 shrink-0 text-[#B98A3E]" />
                <span className="min-w-0 flex-1 break-words underline decoration-1 underline-offset-2">
                  {video.title}
                </span>
                {isCurrentVideo && (
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#8A642D]">
                    Playing
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DashboardLoadingSkeleton() {
  return (
    <main
      className="min-h-screen bg-[#F8F9FA] text-[#1A2B4C]"
      aria-label="Loading dashboard"
      aria-busy="true"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
        <header className="bg-[#1A2B4C] px-5 py-6 text-white sm:px-8 sm:py-8">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-3 w-28 animate-pulse bg-white/15" />
              <div className="h-10 w-56 max-w-full animate-pulse bg-white/15 sm:h-12" />
              <div className="h-3 w-52 max-w-full animate-pulse bg-white/10" />
            </div>
            <div className="h-16 w-16 shrink-0 animate-pulse bg-white/10 sm:h-20 sm:w-20" />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-4">
            {[0, 1, 2, 3].map((stat) => (
              <div key={stat} className="space-y-2">
                <div className="h-7 w-12 animate-pulse bg-white/15 sm:h-8" />
                <div className="h-2.5 w-16 animate-pulse bg-white/10" />
              </div>
            ))}
          </div>
        </header>

        <section className="mt-10" aria-hidden="true">
          <div className="mb-3 h-4 w-48 animate-pulse bg-[#E5E7EB]" />
          <div className="flex gap-3 overflow-hidden">
            {[0, 1, 2, 3].map((card) => (
              <div key={card} className="w-40 shrink-0">
                <div className="aspect-square w-full animate-pulse bg-[#E5E7EB]" />
                <div className="mt-3 h-3 w-3/4 animate-pulse bg-[#E5E7EB]" />
                <div className="mt-2 h-2.5 w-1/2 animate-pulse bg-[#ECEEF0]" />
                <div className="mt-3 space-y-2">
                  <div className="h-2.5 w-full animate-pulse bg-[#ECEEF0]" />
                  <div className="h-2.5 w-4/5 animate-pulse bg-[#ECEEF0]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse border border-[#E5E7EB] bg-white"
            />
          ))}
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   SUGGESTED STUDENTS — mobile-first, no borders
============================================================ */

function SuggestedStudents({
  trending = [],
  isLoading,
  directorCardLayout = false,
}: {
  trending?: SocialUser[];
  isLoading?: boolean;
  directorCardLayout?: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Prioritize superadmin with profile image first, then profile images, then followers and likes.
  const sortedTrending = useMemo(() => {
    return [...trending].sort(compareSuperadminWithImageFirst).slice(0, 50);
  }, [trending]);

  if (isLoading) {
    return (
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-72 w-[320px] shrink-0 animate-pulse bg-[#E5E7EB]"
          />
        ))}
      </div>
    );
  }

  if (sortedTrending.length === 0) {
    return (
      <div className="border border-[#D1D5DB] bg-white px-6 py-8 text-center">
        <TrendingUp className="mx-auto mb-3 h-5 w-5 text-[#9CA3AF]" />
        <p className="text-[14px] font-bold text-[#1A2B4C]">
          No active students yet
        </p>
        <p className="mt-1 text-[12px] text-[#6B7280]">
          Students appear here as they get followers and likes
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 scroll-smooth">
        {sortedTrending.map((user) => {
          const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''
            }`.toUpperCase();
          const isSelf = user.id === currentUserId;

          return (
            <article
              key={user.id}
              className={`shrink-0 overflow-hidden rounded-[22px] border border-[#E5E7EB] bg-white shadow-sm transition-shadow hover:shadow-md ${
                directorCardLayout ? '' : 'w-60'
              }`}
              style={directorCardLayout ? { width: '245px' } : undefined}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1A2B4C]">
                {user.profileImageUrl ? (
                  <Image
                    src={user.profileImageUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    fill
                    sizes="240px"
                    className="object-cover object-top"
                    quality={100}
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-mono text-2xl font-black text-white/90">
                      {initials}
                    </span>
                  </div>
                )}

                {/* View Profile - Top Right */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/students/${user.id}`);
                  }}
                  className="absolute right-2 top-2 z-10 rounded-md border border-white/30 bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:border-white/50 hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A84B]"
                  aria-label={`View ${user.firstName} ${user.lastName}'s profile`}
                >
                  View profile
                </button>

                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <p className="truncate text-[15px] font-bold leading-tight text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] leading-snug text-white/90">
                    {(user.role === 'super_admin'
                      ? user.previousTechCenter ?? user.techCenter
                      : user.techCenter) && (
                      <span className="truncate">
                        {(user.role === 'super_admin'
                          ? user.previousTechCenter ?? user.techCenter
                          : user.techCenter)?.name}
                      </span>
                    )}
                    {getTrendingRoleLabel(user.role) && (
                      <>
                        {(user.role === 'super_admin'
                          ? user.previousTechCenter ?? user.techCenter
                          : user.techCenter) && (
                          <span className="shrink-0 text-white/60">•</span>
                        )}
                        <span className="shrink-0">
                          {getTrendingRoleLabel(user.role)}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[10px]">
                    <span className="font-mono font-bold text-white">
                      {user.followersCount}
                    </span>
                    <span className="text-white/80">followers</span>
                    <span className="text-white/80">•</span>
                    <span className="font-mono font-bold text-white">
                      {user.likesReceivedCount}
                    </span>
                    <span className="text-white/80">likes</span>
                    <span className="text-white/80">•</span>
                    <span className="font-mono font-bold text-white">
                      {user.profileViewsCount}
                    </span>
                    <span className="text-white/80">views</span>
                  </div>

                  <div className="mt-3 flex flex-nowrap items-center justify-between gap-1">
                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/dashboard/messages?userId=${user.id}`)
                        }
                        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/30 bg-black/25 px-2 py-1 text-[10px] font-semibold text-white transition-all hover:border-white/50 hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A84B]"
                        aria-label={`Message ${user.firstName} ${user.lastName}`}
                      >
                        <MessageSquare className="h-3 w-3 shrink-0" />
                        Message
                      </button>
                    )}
                    {!isSelf && (
                      <div className="flex shrink-0 items-center justify-end gap-1">
                        <SocialActions
                          userId={user.id}
                          currentUserId={currentUserId}
                          isFollowing={user.isFollowing}
                          isLiked={user.isLiked}
                          pageAdapters={DASHBOARD_TRENDING_ADAPTERS}
                          size="xs"
                          allowUnfollow={false}
                          allowUnlike={true}
                          className="!flex-nowrap shrink-0 gap-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {sortedTrending.length > 3 && (
        <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-[#6B7280]">
          <span className="font-mono text-[10px] uppercase tracking-wider">
            Scroll to discover more
          </span>
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   RECENT SOCIAL ACTIVITY
============================================================ */

function RecentSocialActivity({
  likers = [],
  followers = [],
}: {
  likers?: Array<SocialUser & { likedAt?: string }>;
  followers?: Array<SocialUser & { connectedAt?: string }>;
}) {
  const events = useMemo(() => {
    const items: Array<{
      id: string;
      kind: 'like' | 'follow';
      user: {
        id: string;
        firstName: string;
        lastName: string;
        profileImageUrl: string | null;
      };
      at: string;
    }> = [];

    for (const liker of likers) {
      items.push({
        id: `like-${liker.id}`,
        kind: 'like',
        user: {
          id: liker.id,
          firstName: liker.firstName,
          lastName: liker.lastName,
          profileImageUrl: liker.profileImageUrl,
        },
        at: liker.likedAt ?? new Date().toISOString(),
      });
    }

    for (const follower of followers) {
      items.push({
        id: `follow-${follower.id}`,
        kind: 'follow',
        user: {
          id: follower.id,
          firstName: follower.firstName,
          lastName: follower.lastName,
          profileImageUrl: follower.profileImageUrl,
        },
        at: follower.connectedAt ?? new Date().toISOString(),
      });
    }

    return items.sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    );
  }, [likers, followers]);

  if (events.length === 0) {
    return (
      <div className="bg-white px-6 py-8 text-center">
        <Heart className="mx-auto mb-3 h-5 w-5 text-[#9CA3AF]" />
        <p className="text-[14px] font-bold text-[#1A2B4C]">No activity yet</p>
        <p className="mt-1 text-[12px] text-[#6B7280]">
          Likes and follows on your profile appear here
        </p>
      </div>
    );
  }

  return (
    <ul className="max-h-[328px] space-y-1 overflow-y-auto overscroll-contain pr-2">
      {events.map((event) => {
        const initials = `${event.user.firstName[0] ?? ''}${event.user.lastName[0] ?? ''
          }`.toUpperCase();
        const isLike = event.kind === 'like';
        const eventKey = `${event.id}-${event.at}`;

        return (
          <li key={eventKey} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5">
            <div className="relative h-9 w-9 shrink-0">
              {event.user.profileImageUrl ? (
                <Image
                  src={event.user.profileImageUrl}
                  alt={`${event.user.firstName} ${event.user.lastName}`}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center bg-[#1A2B4C] font-mono text-[11px] font-bold text-white">
                  {initials}
                </div>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center border border-white ${isLike ? 'bg-[#A4462F]' : 'bg-[#55705B]'
                  }`}
              >
                {isLike ? (
                  <Heart className="h-2 w-2 text-white" fill="currentColor" />
                ) : (
                  <UserPlus className="h-2 w-2 text-white" />
                )}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] leading-snug text-[#1A2B4C]">
                <span className="font-bold">
                  {event.user.firstName} {event.user.lastName}
                </span>{' '}
                <span className="text-[#6B7280]">
                  {isLike ? 'liked your profile' : 'started following you'}
                </span>
              </p>
            </div>

            <span className="shrink-0 font-mono text-[10px] tabular-nums text-[#9CA3AF]">
              {new Date(event.at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ============================================================
   TECH CENTER ACTIVITY
============================================================ */

interface TechCenterActivityItem {
  id: string;
  action: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl: string | null;
  };
  techCenter?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

function TechCenterActivity({
  techCenterId,
  userRole,
}: {
  techCenterId?: string;
  userRole?: string;
}) {
  const isSuperAdminOrDev = userRole === 'super_admin' || userRole === 'dev';

  const { data: activities, isLoading } = useQuery<TechCenterActivityItem[]>({
    queryKey: ['tech-center', 'activity', techCenterId, isSuperAdminOrDev],
    queryFn: async () => {
      if (isSuperAdminOrDev) {
        const res = await fetch('/api/admin/activity-logs?limit=all');
        if (!res.ok) {
          throw new Error('Failed to fetch all activities');
        }
        const json: unknown = await res.json();
        if (!isRecord(json) || !Array.isArray(json.logs)) return [];
        return json.logs.filter(isTechCenterActivityItem);
      } else if (techCenterId) {
        const res = await fetch(
          `/api/tech-centers/${techCenterId}/activity?limit=10`,
        );
        if (!res.ok) throw new Error('Failed to fetch tech center activity');
        const result: unknown = await res.json();
        return Array.isArray(result)
          ? result.filter(isTechCenterActivityItem)
          : [];
      }
      return [];
    },
    enabled: isSuperAdminOrDev || !!techCenterId,
    staleTime: 60 * 1000,
  });

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      course_submission: 'submitted a course',
      cleaning_registration: 'registered for cleaning',
      cleaning_day_change: 'changed cleaning day',
      cleaning_week_created: 'created a cleaning week',
      cleaning_day_created: 'created a cleaning day',
      football_team_joined: 'joined the football team',
    };
    return labels[action] || action.replace(/_/g, ' ');
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'course_submission':
        return <BookOpen className="h-3 w-3" />;
      case 'cleaning_registration':
      case 'cleaning_day_change':
      case 'cleaning_week_created':
      case 'cleaning_day_created':
        return <Briefcase className="h-3 w-3" />;
      case 'football_team_joined':
        return <Trophy className="h-3 w-3" />;
      default:
        return <Sparkles className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-5">
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-[#E5E7EB]" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-32 animate-pulse bg-[#E5E7EB]" />
                <div className="h-2 w-24 animate-pulse bg-[#ECEEF0]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white px-6 py-8 text-center">
        <Sparkles className="mx-auto mb-3 h-5 w-5 text-[#9CA3AF]" />
        <p className="text-[14px] font-bold text-[#1A2B4C]">No activity yet</p>
        <p className="mt-1 text-[12px] text-[#6B7280]">
          {isSuperAdminOrDev
            ? 'Activities from all tech centers will appear here'
            : 'Recent activities from your tech center will appear here'}
        </p>
      </div>
    );
  }

  return (
    <ul className="max-h-[400px] space-y-2 overflow-y-auto">
      {activities.map((activity) => {
        const initials = `${activity.user.firstName[0] ?? ''}${activity.user.lastName[0] ?? ''
          }`.toUpperCase();

        return (
          <li key={activity.id} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5">
            <div className="relative h-9 w-9 shrink-0">
              {activity.user.profileImageUrl ? (
                <Image
                  src={activity.user.profileImageUrl}
                  alt={`${activity.user.firstName} ${activity.user.lastName}`}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center bg-[#1A2B4C] font-mono text-[11px] font-bold text-white">
                  {initials}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center border border-white bg-[#B98A3E]">
                {getActionIcon(activity.action)}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] leading-snug text-[#1A2B4C]">
                <span className="font-bold">
                  {activity.user.firstName} {activity.user.lastName}
                </span>{' '}
                <span className="text-[#6B7280]">
                  {getActionLabel(activity.action)}
                </span>
                {activity.techCenter && (
                  <span className="ml-2 text-[11px] text-[#B98A3E]">
                    ({activity.techCenter.name})
                  </span>
                )}
              </p>
            </div>

            <span className="shrink-0 font-mono text-[10px] tabular-nums text-[#9CA3AF]">
              {new Date(activity.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const techCenterId = user?.techCenterId;
  const [, setMessageIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: socialSummary } = useQuery<SocialSummary>({
    queryKey: ['dashboard', 'social-summary'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/social-summary?limit=100');
      if (!res.ok) throw new Error('Failed to fetch social summary');
      const result: unknown = await res.json();
      if (!isSocialSummary(result)) {
        throw new Error('Invalid social summary response');
      }
      return result;
    },
    enabled: !!currentUserId,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const meStats = socialSummary?.me;
  const directorProfiles = socialSummary?.trending.students.filter(
    (profile) =>
      profile.role === 'super_admin' &&
      profile.status === 'ACTIVE' &&
      Boolean(profile.previousTechCenter),
  ) ?? [];
  const trendingProfiles = socialSummary?.trending.students.filter(
    (profile) => profile.role !== 'super_admin',
  );

  const { data: techCenter = null } = useQuery<TechCenter | null>({
    queryKey: ['dashboard-tech-center', techCenterId],
    queryFn: async () => {
      if (!techCenterId) {
        throw new Error('A tech center is required to fetch tech center details');
      }
      const response = await fetch(`/api/tech-centers/${techCenterId}`);
      if (!response.ok) throw new Error('Failed to fetch tech center');
      const data: unknown = await response.json();
      if (!isTechCenter(data)) throw new Error('Invalid tech center response');
      return data;
    },
    enabled: !!techCenterId,
    staleTime: 10 * 60 * 1000,
  });

  const { data: tutorsData, isLoading: tutorsLoading } = useQuery({
    queryKey: ['tutors', user?.techCenterId],
    queryFn: async () => {
      const response = await fetch('/api/tech-centers/tutors?limit=100');
      if (!response.ok) throw new Error('Failed to fetch tutors');
      const data: unknown = await response.json();
      const allTutors =
        isRecord(data) && Array.isArray(data.tutors)
          ? data.tutors.filter(isTutor)
          : [];
      if (user?.techCenterId) {
        return allTutors.filter(
          (tutor: Tutor) => tutor.techCenter?.id === user.techCenterId,
        );
      }
      return allTutors;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!user?.techCenterId,
  });

  const tutors = tutorsData || [];

  const { data: adminsData, isLoading: adminsLoading } = useQuery({
    queryKey: ['tech-center-admins', user?.techCenterId],
    queryFn: async () => {
      const response = await fetch('/api/tech-centers/admins');
      if (!response.ok) throw new Error('Failed to fetch tech center admins');
      const data: unknown = await response.json();
      return isRecord(data) && Array.isArray(data.admins)
        ? data.admins.filter(isCenterAdmin)
        : [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!user?.techCenterId && user?.role !== 'super_admin',
  });

  const centerAdmins = adminsData || [];

  const { data: discoverStudents = [], isLoading: discoverStudentsLoading } =
    useQuery<DiscoverStudent[]>({
      queryKey: ['dashboard-discover-students'],
      queryFn: async () => {
        const response = await fetch('/api/dashboard/discover-students');
        if (!response.ok) throw new Error('Failed to fetch discover students');
        return response.json();
      },
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!user?.id,
    });

  const { data: assignmentData, isLoading: loadingAssignment } = useQuery({
    queryKey: ['assignment-info', user?.id, user?.role],
    queryFn: async () => {
      const response = await fetch('/api/user/tutor');
      if (!response.ok)
        throw new Error('Failed to fetch assignment information');
      return response.json() as Promise<AssignmentData>;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled:
      !!user?.id && (user?.role === 'student' || user?.role === 'teacher'),
  });

  const isTeacher = assignmentData?.isTeacher || false;
  const tutorInfo = assignmentData?.tutor || null;
  const studentCount = assignmentData?.studentCount || 0;

  const motivationMessages = useMemo(
    () => [
      'Learn with purpose. Build with confidence.',
      'Every lesson is another step toward your future.',
      'Your skills grow through practice and consistency.',
      'Stay curious. Ask questions. Keep moving forward.',
      'Small progress today creates opportunities tomorrow.',
      'Consistency compounds. Show up daily.',
      'Skills are built one session at a time.',
      'Great things take time. Trust the process.',
    ],
    [],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((current) =>
        current === motivationMessages.length - 1 ? 0 : current + 1,
      );
    }, 6000);
    return () => window.clearInterval(interval);
  }, [motivationMessages.length]);

  // Update current time every second
  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Friendly UI labels for staff roles. Admins are shown as "Manager" and
  // super admins as "Director"; other roles fall back to a cleaned-up string.
  const getRoleLabel = (role?: string | null) => {
    if (!role) return '';
    if (role === 'admin') return 'Manager';
    if (role === 'super_admin') return 'Director';
    return role.replace(/_/g, ' ');
  };

  const greeting = getGreeting();
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
  const firstName = user?.firstName || 'Guest';

  const quickLinks: QuickLink[] = useMemo(() => {
    const userRole = user?.role;

    if (userRole === 'super_admin') {
      return [
        { icon: <Users className="h-5 w-5" />, label: 'Tech Centers', description: 'Manage all', path: '/dashboard/super-admin/centers' },
        { icon: <Users className="h-5 w-5" />, label: 'All Users', description: 'Manage system', path: '/dashboard/super-admin/users' },
        { icon: <Briefcase className="h-5 w-5" />, label: 'Internships', description: 'Opportunities', path: '/dashboard/internships' },
        { icon: <Library className="h-5 w-5" />, label: 'Policy Book', description: 'Read policies', path: '/dashboard/policies' },
        { icon: <BookOpen className="h-5 w-5" />, label: 'Tuition', description: 'View info', path: '/dashboard/courses' },
        { icon: <MessageCircle className="h-5 w-5" />, label: 'Support', description: 'IT team', path: '/dashboard/support' },
      ];
    }

    if (userRole === 'admin') {
      return [
        { icon: <GraduationCap className="h-5 w-5" />, label: 'Tutors', description: 'Assign students', path: '/dashboard/admin/teachers' },
        { icon: <BookOpen className="h-5 w-5" />, label: 'Courses', description: 'Enrolled units', path: '/dashboard/courses' },
        { icon: <Users className="h-5 w-5" />, label: 'Students', description: 'Peer network', path: '/dashboard/students' },
        { icon: <Briefcase className="h-5 w-5" />, label: 'Internships', description: 'Opportunities', path: '/dashboard/internships' },
        { icon: <Clock className="h-5 w-5" />, label: 'Cleaning', description: 'Your schedule', path: '/dashboard/cleaning' },
        { icon: <MessageCircle className="h-5 w-5" />, label: 'Support', description: 'IT team', path: '/dashboard/support' },
      ];
    }

    return [
      { icon: <BookOpen className="h-5 w-5" />, label: 'Courses', description: 'Enrolled units', path: '/dashboard/courses' },
      { icon: <Users className="h-5 w-5" />, label: 'Students', description: 'Peer network', path: '/dashboard/students' },
      { icon: <Briefcase className="h-5 w-5" />, label: 'Internships', description: 'Opportunities', path: '/dashboard/internships' },
      { icon: <Clock className="h-5 w-5" />, label: 'Cleaning', description: 'Your schedule', path: '/dashboard/cleaning' },
      { icon: <Library className="h-5 w-5" />, label: 'Policies', description: 'Read policies', path: '/dashboard/policies' },
      { icon: <Trophy className="h-5 w-5" />, label: 'Sports', description: 'Join team', path: '/dashboard/football-team' },
    ];
  }, [user?.role]);

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A2B4C]">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        {/* ============================================================
            HERO — greeting + stats + announcements + directors (unified)
        ============================================================ */}
        <header className="overflow-hidden bg-[#1A2B4C] text-white">
          {/* Status Bar */}
          <div className="border-b border-white/10 px-4 py-1.5 sm:px-6">
            <div className="flex items-center justify-between font-mono text-[9px] text-white/70">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#B98A3E]" />
                  <span className="uppercase tracking-wider text-[#B98A3E]">Live</span>
                </span>
                <span className="text-white/20">•</span>
                <span className="uppercase tracking-wider">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className="text-white/20">•</span>
                <span className="uppercase tracking-wider">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="hidden items-center gap-1 sm:flex">
                <span className="inline-flex items-center gap-1.5 font-mono text-[8px] font-bold uppercase tracking-wider text-[#B98A3E]">
                  <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-[#B98A3E]" />
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* Profile + Stats */}
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border-2 border-[#B98A3E]/40 sm:h-16 sm:w-16">
                  {user?.profileImageUrl ? (
                    <Image
                      src={user.profileImageUrl}
                      alt={userName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#B98A3E]/10">
                      <span className="font-mono text-xl font-black text-[#B98A3E]">
                        {firstName?.charAt(0) ?? <User className="h-5 w-5" />}
                      </span>
                    </div>
                  )}
                </div>
                {/* Online dot on avatar */}
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#1A2B4C] bg-[#55705B]" />
              </div>

              {/* Name + badges */}
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#B98A3E]">
                  {greeting}
                </p>
                <h1 className="mt-0.5 text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                  {firstName}<span className="text-[#B98A3E]">.</span>
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9.5px]">
                  <span className="inline-flex items-center gap-1 text-[#B98A3E]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#B98A3E]" />
                    <span className="uppercase tracking-wider">Active</span>
                  </span>
                  {user?.role && (
                    <span className="uppercase tracking-wider text-white/75">
                      {getRoleLabel(user.role)}
                    </span>
                  )}
                  {techCenter && (
                    <span className="inline-flex items-center gap-1 text-white/75">
                      <MapPin className="h-2.5 w-2.5 text-[#B98A3E]" />
                      <span>{techCenter.name}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
              {[
                { icon: <Users className="h-3 w-3" />, label: 'Followers', value: meStats?.followersCount ?? 0 },
                { icon: <UserPlus className="h-3 w-3" />, label: 'Following', value: meStats?.followingCount ?? 0 },
                { icon: <Eye className="h-3 w-3" />, label: 'Views', value: meStats?.profileViewsCount ?? 0 },
                { icon: <Heart className="h-3 w-3" />, label: 'Likes', value: meStats?.likesReceivedCount ?? 0 },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-[#B98A3E]">
                    {icon}
                    <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-white/75">
                      {label}
                    </span>
                  </div>
                  <span className="font-mono text-lg font-black tabular-nums text-[#B98A3E] sm:text-xl">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </header>

        {/* ============================================================
            MAIN CONTENT - Unified layout
        ============================================================ */}
        <div className="mt-10 space-y-12">
          <AnnouncementsSection />

          {(!socialSummary || directorProfiles.length > 0) && (
            <section>
              <SectionHeader label="Organisation Directors" />
              <DirectorsDisplay
                trending={directorProfiles}
                isLoading={!socialSummary}
              />
            </section>
          )}

          {/* Discover Students */}
          {discoverStudents.length > 0 && (
            <section>
              <SectionHeader label="Discover students" />
              <DiscoverStudents
                students={discoverStudents}
                isLoading={discoverStudentsLoading}
              />
            </section>
          )}

          {/* Trending Students */}
          <section>
            <SectionHeader
              label="Trending student profiles"
              action={
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/students')}
                  className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#1A2B4C] transition-colors hover:text-[#6B7280]"
                >
                  See all
                  <ChevronRight className="h-3 w-3" />
                </button>
              }
            />
            <SuggestedStudents
              trending={trendingProfiles}
              isLoading={!socialSummary}
            />
          </section>

          {/* Reels and profile activity remain full-width stacked rows */}
          <div className="grid grid-cols-1 gap-10">
            {/* Reels */}
            <section>
              <SectionHeader label="Reels" />
              <MediaLibrary />
            </section>

            {/* Recent Activity */}
            <section>
              <SectionHeader label="On your profile" />
              <RecentSocialActivity
                likers={socialSummary?.activity?.likers}
                followers={socialSummary?.activity?.followers}
              />
            </section>
          </div>

          {/* Tech Center Activity - Full Width */}
          {(techCenter?.id ||
            user?.role === 'super_admin' ||
            user?.role === 'dev') && (
              <section>
                <SectionHeader
                  label={
                    user?.role === 'super_admin' || user?.role === 'dev'
                      ? 'All tech centers activity'
                      : `${techCenter?.name || 'Your tech center'} activity`
                  }
                />
                <TechCenterActivity
                  techCenterId={techCenter?.id}
                  userRole={user?.role}
                />
              </section>
            )}
        </div>

        {/* ============================================================
            FULL-WIDTH ROW SECTIONS (desktop rows, mobile stacked)
        ============================================================ */}

        {/* Quick Access — full width row */}
        <section className="mt-12">
          <SectionHeader label="Quick access" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {quickLinks.slice(0, 6).map((link) => (
              <button
                key={`${link.label}-${link.path}`}
                type="button"
                onClick={() => router.push(link.path)}
                className="group flex flex-col items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white p-4 text-center transition-all hover:border-[#B98A3E] hover:bg-[#FBF7EE] hover:shadow-md active:scale-[0.98]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A2B4C] text-white transition-colors group-hover:bg-[#B98A3E]">
                  {link.icon}
                </span>
                <span className="text-[13px] font-bold leading-tight text-[#1A2B4C]">
                  {link.label}
                </span>
                <span className="text-[11px] leading-snug text-[#6B7280]">
                  {link.description}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Action Needed — full width banner (admins only) */}
        {user?.role === 'admin' && (
          <section className="mt-12">
            <div className="flex flex-col gap-4 rounded-r-lg border-l-4 border-[#B98A3E] bg-[#FBF7EE] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A6328]">
                  Action needed
                </p>
                <h3 className="mt-1 text-[15px] font-black text-[#1A2B4C]">
                  Assign students to tutors
                </h3>
                <p className="mt-1 max-w-2xl text-[13px] leading-5 text-[#6B7280]">
                  Help students get regular support by assigning them to tutors.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/dashboard/admin/teachers')}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#1A2B4C] px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#B98A3E]"
              >
                Open
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* Admins — full width row */}
        {(adminsLoading || centerAdmins.length > 0) &&
          user?.role !== 'super_admin' && (
            <section className="mt-12">
              <SectionHeader
                label={`${techCenter?.name || 'Your'} admins`}
                count={centerAdmins.length}
              />
              {adminsLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-lg bg-[#E5E7EB]"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                  {centerAdmins.map((admin) => (
                    <div
                      key={admin.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5"
                    >
                      {admin.profileImageUrl ? (
                        <Image
                          src={admin.profileImageUrl}
                          alt={`${admin.firstName} ${admin.lastName}`}
                          width={28}
                          height={28}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A2B4C] font-mono text-[10px] font-bold text-white">
                          {admin.firstName.charAt(0)}
                          {admin.lastName.charAt(0)}
                        </div>
                      )}
                      <span className="truncate text-[12px] font-bold text-[#1A2B4C]">
                        {admin.firstName} {admin.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        {/* Tutors — full width row */}
        {(tutorsLoading || tutors.length > 0) &&
          user?.role !== 'super_admin' && (
            <section className="mt-12">
              <SectionHeader
                label={`${techCenter?.name || 'Your'} tutors`}
                count={tutors.length}
              />
              {tutorsLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-lg bg-[#E5E7EB]"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                  {tutors.map((tutor: Tutor) => (
                    <div
                      key={tutor.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5"
                    >
                      {tutor.profileImageUrl ? (
                        <Image
                          src={tutor.profileImageUrl}
                          alt={`${tutor.firstName} ${tutor.lastName}`}
                          width={28}
                          height={28}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A2B4C] font-mono text-[10px] font-bold text-white">
                          {tutor.firstName.charAt(0)}
                          {tutor.lastName.charAt(0)}
                        </div>
                      )}
                      <span className="truncate text-[12px] font-bold text-[#1A2B4C]">
                        {tutor.firstName} {tutor.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        {/* ============================================================
            ASSIGNMENT (student / teacher)
        ============================================================ */}
        {(user?.role === 'student' || user?.role === 'teacher') && (
          <section className="mt-12">
            <SectionHeader label={isTeacher ? 'Your students' : 'Your tutor(s)'} />
            {loadingAssignment ? (
              <div className="border border-[#E5E7EB] bg-white p-5">
                <div className="h-4 w-48 animate-pulse bg-[#E5E7EB]" />
              </div>
            ) : isTeacher ? (
              studentCount > 0 ? (
                <div className="border border-[#E5E7EB] bg-white p-5">
                  <p className="text-[14px] font-black text-[#1A2B4C]">
                    {studentCount} student{studentCount > 1 ? 's' : ''} under
                    your mentorship
                  </p>
                </div>
              ) : (
                <div className="border border-[#E5E7EB] bg-white p-5">
                  <p className="text-[14px] font-black text-[#1A2B4C]">
                    No students assigned yet
                  </p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">
                    Contact your tech center admin to be assigned students.
                  </p>
                </div>
              )
            ) : tutorInfo ? (
              <div className="border border-[#E5E7EB] bg-white p-5">
                <div className="flex items-center gap-4">
                  {tutorInfo.profileImageUrl ? (
                    <Image
                      src={tutorInfo.profileImageUrl}
                      alt={`${tutorInfo.firstName} ${tutorInfo.lastName}`}
                      width={44}
                      height={44}
                      className="h-11 w-11 object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center bg-[#1A2B4C] font-mono text-[13px] font-bold text-white">
                      {tutorInfo.firstName.charAt(0)}
                      {tutorInfo.lastName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-black text-[#1A2B4C]">
                      {tutorInfo.firstName} {tutorInfo.lastName}
                    </p>
                    <p className="font-mono text-[11px] text-[#6B7280]">
                      {tutorInfo.email}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-[#E5E7EB] bg-white p-5">
                <p className="text-[14px] font-black text-[#1A2B4C]">
                  Not assigned to a tutor yet
                </p>
                <p className="mt-1 text-[12px] text-[#6B7280]">
                  Contact your tech center admin for support.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}