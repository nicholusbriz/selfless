'use client';

export const dynamic = 'force-dynamic';

/* ============================================================
   DASHBOARD PAGE
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
  Sparkles,
  Eye,
  X,
  ChevronLeft,
  Maximize2,
  Music2,
  Pause,
  Play,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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
import SpinningGlobe from '@/components/SpinningGlobe';
import VerifiedBadge from '@/components/VerifiedBadge';
import type { PageCacheAdapter } from '@/lib/social/cacheKeys';
import {
  findInStudentsShape,
} from '@/lib/social/patchHelpers';
import { SocialActions } from '@/components/social/SocialActions';
import { getResponseError, isRecord } from './response-guards';
import MediaPostInteractions from './gallery/components/MediaPostInteractions';

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
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  loop?: boolean;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    hasVerifiedBadge?: boolean | null;
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
  hasVerifiedBadge?: boolean;
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
    (value.approvalStatus === 'PENDING' ||
      value.approvalStatus === 'APPROVED' ||
      value.approvalStatus === 'REJECTED') &&
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
    superadmin: 'Director',
    dev: 'Selfless Support',
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
    find: (old, targetId) =>
      findInStudentsShape(
        (old as SocialSummary)?.trending?.students || [],
        targetId,
      ),
  },
];

/* ============================================================
   DIRECTORS
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
      showVerified
    />
  );
}

/* ============================================================
   ANNOUNCEMENTS
============================================================ */

interface DashboardAnnouncement {
  id: string;
  title: string;
  createdAt: string;
  isGlobal: boolean;
  author?: {
    firstName?: string | null;
    lastName?: string | null;
    hasVerifiedBadge?: boolean | null;
  } | null;
}

function RecentAnnouncementsPanel() {
  const { data: announcements = [], isLoading, error } = useQuery<
    DashboardAnnouncement[]
  >({
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
        .filter(
          (announcement): announcement is DashboardAnnouncement =>
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
    <div className="mt-3 border-t border-white/10 pt-2.5">
      <Link
        href="/dashboard/announcements"
        className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#D4A84B] transition-colors hover:text-white"
      >
        Recent announcements
      </Link>

      {isLoading ? (
        <div className="mt-2 space-y-1.5" aria-label="Loading announcements">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-2.5 w-full animate-pulse rounded bg-white/10" />
          ))}
        </div>
      ) : error ? (
        <p role="status" className="mt-2 text-[11px] text-red-300">
          Announcements could not be loaded.
        </p>
      ) : announcements.length === 0 ? (
        <p className="mt-2 text-[11px] text-white/50">No announcements yet.</p>
      ) : (
        <ul className="mt-2 space-y-1 pr-1">
          {announcements.map((announcement) => (
            <li key={announcement.id} className="border-b border-white/5 py-1 last:border-b-0">
              <Link
                href="/dashboard/announcements"
                title={announcement.title}
                className="block break-words text-[11.5px] leading-4 text-white/85 transition-colors hover:text-white hover:underline"
              >
                {announcement.title}
              </Link>
              <span className="block truncate text-[9.5px] text-white/40">
                <span className="inline-flex items-center gap-1">
                  {[announcement.author?.firstName, announcement.author?.lastName]
                    .filter(Boolean)
                    .join(' ') || 'Selfless'}
                  {announcement.author?.hasVerifiedBadge && (
                    <VerifiedBadge className="h-3 w-3 shrink-0" />
                  )}
                </span>
                ·{' '}
                <time dateTime={announcement.createdAt}>
                  {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ============================================================
   RECENT POSTS
============================================================ */

function RecentPostsSection() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [videoActionErrorId, setVideoActionErrorId] = useState<string | null>(null);
  const postsCarouselRef = useRef<HTMLDivElement>(null);

  const { data: posts = [], isLoading, error } = useQuery<MediaItem[]>({
    queryKey: ['dashboard-recent-posts'],
    queryFn: async () => {
      const response = await fetch('/api/media/list?category=gallery&limit=10');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data: unknown = await response.json();
      if (!isRecord(data) || data.success !== true || !Array.isArray(data.items)) {
        throw new Error('Invalid posts response');
      }
      return data.items
        .filter(isMediaItem)
        .filter(
          (item) =>
            item.approvalStatus === 'APPROVED' &&
            (item.contentType.startsWith('image/') ||
              item.contentType.startsWith('video/') ||
              item.contentType.startsWith('audio/')),
        )
        .slice(0, 10);
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!selectedMedia) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedMedia(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMedia]);

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3 border-b border-[#E5E7EB] pb-2">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-[#1A2B4C]">
            Recent posts
          </h2>
          <p className="mt-0.5 text-[11.5px] text-[#6B7280]">
            Discover community stories, videos, and updates
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-[#E5E7EB] bg-white px-2 py-0.5 text-[11px] font-medium text-[#4B5646]">
          {posts.length > 9 ? '9+ posts' : `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`}
        </span>
      </div>

      {isLoading ? (
        <div className="flex snap-x gap-3 overflow-x-auto pb-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
            <div key={item} className="w-[240px] shrink-0 animate-pulse sm:w-[260px]">
              <div className="aspect-[3/4] w-full rounded-lg bg-[#F3F4F6]" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p role="status" className="text-[12px] font-medium text-red-700">
            Posts could not be loaded. Please try again.
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-[#F8F9FA] p-6 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E7EB]">
            <ImageIcon className="h-5 w-5 text-[#9CA3AF]" />
          </div>
          <p className="text-[13px] font-semibold text-[#1A2B4C]">
            No recent posts yet
          </p>
          <p className="mt-0.5 text-[11.5px] text-[#6B7280]">
            Be the first to share with the community
          </p>
        </div>
      ) : (
        <div
          ref={postsCarouselRef}
          aria-label="Recent posts"
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 scroll-smooth"
        >
          {posts.map((post) => {
            const isVideo = post.contentType.startsWith('video/');
            const isAudio = post.contentType.startsWith('audio/');

            return (
              <article
                key={post.id}
                className="w-[240px] shrink-0 snap-start overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm transition-colors hover:border-[#C59B4C]/50 sm:w-[260px]"
              >
                {isVideo ? (
                  <div
                    data-recent-video-card
                    className="group relative aspect-[3/4] overflow-hidden bg-black"
                  >
                    <video
                      src={post.publicUrl}
                      playsInline
                      preload="metadata"
                      aria-label={post.title || 'Community video'}
                      className="absolute inset-0 h-full w-full object-cover"
                      onPlay={(event) => {
                        const currentVideo = event.currentTarget;
                        currentVideo
                          .closest('section')
                          ?.querySelectorAll('video')
                          .forEach((video) => {
                            if (video !== currentVideo) video.pause();
                          });
                        setPlayingVideoId(post.id);
                        setVideoActionErrorId(null);
                      }}
                      onPause={() => {
                        setPlayingVideoId((current) =>
                          current === post.id ? null : current,
                        );
                      }}
                      onEnded={() => {
                        setPlayingVideoId((current) =>
                          current === post.id ? null : current,
                        );
                      }}
                    />
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />

                    <div className="pointer-events-none absolute inset-x-2 top-2 flex items-center justify-between gap-2">
                      {post.user?.id ? (
                        <Link
                          href={`/dashboard/students/${post.user.id}`}
                          aria-label={`View ${post.user.firstName} ${post.user.lastName}'s profile`}
                          className="pointer-events-auto flex min-w-0 items-center gap-1.5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          {post.user.profileImageUrl ? (
                            <Image
                              src={post.user.profileImageUrl}
                              alt=""
                              width={24}
                              height={24}
                              className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-white/70"
                            />
                          ) : (
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-[9px] font-bold">
                              {post.user.firstName[0]}
                              {post.user.lastName[0]}
                            </span>
                          )}
                          <span className="flex min-w-0 items-center gap-1">
                            <span className="truncate text-[10.5px] font-semibold drop-shadow">
                              {post.user.firstName} {post.user.lastName}
                            </span>
                            {post.user.hasVerifiedBadge && (
                              <VerifiedBadge className="h-3 w-3 shrink-0" />
                            )}
                          </span>
                        </Link>
                      ) : (
                        <span className="min-w-0 truncate text-[10.5px] font-semibold text-white drop-shadow">
                          Selfless community
                        </span>
                      )}
                      <div className="pointer-events-auto flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={(event) => {
                            const video = event.currentTarget
                              .closest('[data-recent-video-card]')
                              ?.querySelector('video');
                            if (!video) return;
                            if (video.paused) {
                              void video.play().catch(() => {
                                setVideoActionErrorId(post.id);
                              });
                            } else {
                              video.pause();
                            }
                          }}
                          aria-label={playingVideoId === post.id ? 'Pause video' : 'Play video'}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/50 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          {playingVideoId === post.id ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="h-3.5 w-3.5 fill-current" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            const card = event.currentTarget.closest(
                              '[data-recent-video-card]',
                            );
                            if (!card) return;
                            card.querySelector('video')?.pause();
                            setSelectedMedia(post);
                          }}
                          aria-label={`Watch ${post.title || 'video'} fullscreen`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/50 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {videoActionErrorId === post.id && (
                      <p
                        role="status"
                        className="absolute inset-x-3 top-11 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white"
                      >
                        Video playback or fullscreen is unavailable.
                      </p>
                    )}

                    <div
                      className={`pointer-events-none absolute inset-x-2.5 ${
                        user ? 'bottom-14' : 'bottom-2.5'
                      } text-white`}
                    >
                      {post.title && (
                        <h3 className="line-clamp-2 text-[12px] font-bold leading-4 drop-shadow">
                          {post.title}
                        </h3>
                      )}
                      {post.description && (
                        <p className="mt-1 line-clamp-2 text-[9.5px] leading-3.5 text-white/85 drop-shadow">
                          {post.description}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <p className="text-[8.5px] font-medium text-white/75">
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        {post.category && (
                          <>
                            <span className="h-0.5 w-0.5 rounded-full bg-white/50" />
                            <span className="text-[8.5px] font-medium capitalize text-white/75">
                              {post.category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {user && (
                      <div className="absolute inset-x-0 bottom-0 z-10">
                        <MediaPostInteractions
                          mediaId={post.id}
                          showCommentInput
                          currentUser={{
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            profileImageUrl: user.profileImageUrl ?? null,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : isAudio ? (
                  <>
                    <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-[#1A2B4C] p-3 text-white">
                      <Music2 className="h-9 w-9 text-white/85" />
                      <audio
                        src={post.publicUrl}
                        controls
                        preload="metadata"
                        aria-label={post.title || 'Community audio'}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2 p-3">
                      {post.user && (
                        <div className="flex items-center gap-1.5">
                          {post.user.profileImageUrl ? (
                            <Image
                              src={post.user.profileImageUrl}
                              alt=""
                              width={20}
                              height={20}
                              className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-[#E5E7EB]"
                            />
                          ) : (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E5E7EB] text-[9px] font-bold text-[#1A2B4C]">
                              {post.user.firstName[0]}
                              {post.user.lastName[0]}
                            </span>
                          )}
                          <p className="flex min-w-0 items-center gap-1 text-[11px] font-semibold text-[#1A2B4C]">
                            <span className="truncate">
                              {post.user.firstName} {post.user.lastName}
                            </span>
                            {post.user.hasVerifiedBadge && (
                              <VerifiedBadge className="h-3 w-3 shrink-0" />
                            )}
                          </p>
                        </div>
                      )}
                      {post.title && (
                        <h3 className="line-clamp-2 text-[12.5px] font-bold leading-5 text-[#1A2B4C]">
                          {post.title}
                        </h3>
                      )}
                      {post.description && (
                        <p className="line-clamp-2 text-[11px] leading-4 text-[#6B7280]">
                          {post.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-[9.5px] text-[#9CA3AF]">
                        <time dateTime={post.createdAt}>
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </time>
                        {post.category && (
                          <>
                            <span className="h-0.5 w-0.5 rounded-full bg-[#D1D5DB]" />
                            <span className="capitalize">{post.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {user && (
                      <MediaPostInteractions
                        mediaId={post.id}
                        showCommentInput
                        currentUser={{
                          id: user.id,
                          firstName: user.firstName,
                          lastName: user.lastName,
                          profileImageUrl: user.profileImageUrl ?? null,
                        }}
                      />
                    )}
                  </>
                ) : (
                  <div className="group relative aspect-[3/4] overflow-hidden bg-[#E9EDF3]">
                    <div className="absolute inset-0">
                      <Image
                        src={post.publicUrl}
                        alt={post.title || 'Community photo'}
                        fill
                        sizes="(max-width: 640px) 240px, 260px"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75" />
                    </div>

                    <div className="pointer-events-none absolute inset-x-2 top-2 flex items-center justify-between gap-2">
                      {post.user?.id ? (
                        <Link
                          href={`/dashboard/students/${post.user.id}`}
                          aria-label={`View ${post.user.firstName} ${post.user.lastName}'s profile`}
                          className="pointer-events-auto flex min-w-0 items-center gap-1.5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          {post.user.profileImageUrl ? (
                            <Image
                              src={post.user.profileImageUrl}
                              alt=""
                              width={24}
                              height={24}
                              className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-white/70"
                            />
                          ) : (
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-[9px] font-bold">
                              {post.user.firstName[0]}
                              {post.user.lastName[0]}
                            </span>
                          )}
                          <span className="truncate text-[10.5px] font-semibold drop-shadow">
                            {post.user.firstName} {post.user.lastName}
                          </span>
                        </Link>
                      ) : (
                        <span className="min-w-0 truncate text-[10.5px] font-semibold text-white drop-shadow">
                          Selfless community
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedMedia(post)}
                        aria-label={`View ${post.title || 'photo'} fullscreen`}
                        className="pointer-events-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/50 bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div
                      className={`pointer-events-none absolute inset-x-2.5 ${
                        user ? 'bottom-14' : 'bottom-2.5'
                      } text-white`}
                    >
                      {post.title && (
                        <h3 className="line-clamp-2 text-[12px] font-bold leading-4 drop-shadow">
                          {post.title}
                        </h3>
                      )}
                      {post.description && (
                        <p className="mt-1 line-clamp-2 text-[9.5px] leading-3.5 text-white/85 drop-shadow">
                          {post.description}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <p className="text-[8.5px] font-medium text-white/75">
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        {post.category && (
                          <>
                            <span className="h-0.5 w-0.5 rounded-full bg-white/50" />
                            <span className="text-[8.5px] font-medium capitalize text-white/75">
                              {post.category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {user && (
                      <div className="absolute inset-x-0 bottom-0 z-10">
                        <MediaPostInteractions
                          mediaId={post.id}
                          showCommentInput
                          currentUser={{
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            profileImageUrl: user.profileImageUrl ?? null,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Link
            href="/dashboard/gallery"
            className="inline-flex items-center gap-1 rounded-md bg-[#1A2B4C] px-3 py-1.5 text-[11.5px] font-semibold text-white transition-colors hover:bg-[#263D66]"
          >
            <Plus className="h-3.5 w-3.5" />
            Create post
          </Link>
          {posts.length > 1 && (
            <button
              type="button"
              onClick={() =>
                postsCarouselRef.current?.scrollBy({ left: -252, behavior: 'smooth' })
              }
              aria-label="Show previous posts"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#4B5646] transition-colors hover:border-[#C59B4C] hover:text-[#1A2B4C]"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}
          {posts.length > 1 && (
            <button
              type="button"
              onClick={() =>
                postsCarouselRef.current?.scrollBy({ left: 252, behavior: 'smooth' })
              }
              aria-label="Show next posts"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#4B5646] transition-colors hover:border-[#C59B4C] hover:text-[#1A2B4C]"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => router.push('/dashboard/gallery')}
          className="inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-[#4B5646] transition-colors hover:border-[#C59B4C] hover:text-[#1A2B4C]"
        >
          View all posts
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {selectedMedia && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedMedia.title || 'Fullscreen community media'}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedMedia(null);
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedMedia(null)}
            aria-label="Close fullscreen media"
            className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" />
          </button>
          {selectedMedia.contentType.startsWith('video/') ? (
            <video
              key={selectedMedia.id}
              src={selectedMedia.publicUrl}
              autoPlay
              controls
              playsInline
              preload="auto"
              aria-label={selectedMedia.title || 'Community video'}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="relative h-full w-full">
              <Image
                src={selectedMedia.publicUrl}
                alt={selectedMedia.title || 'Community photo'}
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   SECTION HEADER — flat
============================================================ */

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
    <div className="mb-3 flex items-end justify-between gap-3 border-b border-[#E5E7EB] pb-2">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[14px] font-semibold tracking-tight text-[#1A2B4C]">
          {label}
        </h2>
        {typeof count === 'number' && (
          <span className="text-[11px] font-semibold tabular-nums text-[#C59B4C]">
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
      const response = await fetch('/api/media/list?category=dashboard');
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

  const featuredChristmasVideo: MediaItem = {
    id: 'featured-christmas-2024',
    publicUrl: '/xmas.mp4',
    blobName: 'xmas.mp4',
    contentType: 'video/mp4',
    size: 0,
    title: 'Christmas message from the First Presidency',
    description: null,
    category: 'featured',
    approvalStatus: 'APPROVED',
    createdAt: new Date().toISOString(),
    loop: true,
  };

  const videos = useMemo(
    () => {
      const fetchedVideos = items.filter((item) => item.contentType.startsWith('video/'));
      return [featuredChristmasVideo, ...fetchedVideos];
    },
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
      <div className="flex items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white py-12 text-[12.5px] text-[#6B7280]">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading reels…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-[12.5px] text-red-700">
        {error instanceof Error ? error.message : 'Could not load reels'}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-white">
        <div className="px-5 py-10 text-center">
          <Video className="mx-auto mb-2 h-5 w-5 text-[#9CA3AF]" />
          <p className="text-[13px] font-semibold text-[#1A2B4C]">No reels yet</p>
          <p className="mt-0.5 text-[11.5px] text-[#6B7280]">
            Be the first to share a video with the community
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
      <div className="mx-auto w-full bg-black">
        {current && (
          <VideoPlayer
            key={`video-${current.id}`}
            src={current.publicUrl}
            title={current.title}
            description={current.description || undefined}
            className="w-full"
            playRef={videoPlayerRef}
            autoplay={currentIndex === 0}
            loop={current.loop || false}
            onEnded={() => {
              if (videos.length > 1) goNext();
            }}
          />
        )}
      </div>
      <ul
        aria-label="Available videos"
        className="mx-auto max-h-56 w-full space-y-0.5 overflow-y-auto bg-white p-2"
      >
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
                className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[12px] transition-colors ${
                  isCurrentVideo
                    ? 'bg-[#FBF7EE] font-semibold text-[#8A6328]'
                    : 'text-[#4B5646] hover:bg-[#F8F9FA]'
                }`}
              >
                <Video className="h-3.5 w-3.5 shrink-0 text-[#C59B4C]" />
                <span className="min-w-0 flex-1 truncate">{video.title}</span>
                {isCurrentVideo && (
                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-[#C59B4C]">
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

/* ============================================================
   LOADING SKELETON — matches full hero with status bar + globe
============================================================ */

function DashboardLoadingSkeleton() {
  return (
    <main
      className="min-h-screen bg-[#F8F9FA] text-[#1A2B4C]"
      aria-label="Loading dashboard"
      aria-busy="true"
    >
      <div className="w-full min-w-0 py-3 sm:py-5">
        <header className="relative overflow-hidden bg-[#1A2B4C] text-white">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F1B33]/92 via-[#1A2B4C]/82 to-[#0F1B33]/95" />
          <div className="relative px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="h-2.5 w-24 animate-pulse rounded bg-white/15" />
                <div className="h-8 w-48 max-w-full animate-pulse rounded bg-white/15 sm:h-9" />
                <div className="h-2.5 w-44 max-w-full animate-pulse rounded bg-white/10" />
              </div>
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-white/10 sm:h-16 sm:w-16" />
            </div>
            <div className="mt-6 grid grid-cols-4 gap-3 border-t border-white/10 pt-5">
              {[0, 1, 2, 3].map((stat) => (
                <div key={stat} className="space-y-1.5">
                  <div className="h-5 w-10 animate-pulse rounded bg-white/15 sm:h-6" />
                  <div className="h-2 w-14 animate-pulse rounded bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-2 h-3.5 w-40 animate-pulse rounded bg-[#E5E7EB]" />
          <div className="flex gap-3 overflow-hidden">
            {[0, 1, 2, 3].map((card) => (
              <div key={card} className="w-40 shrink-0">
                <div className="aspect-square w-full animate-pulse rounded-lg bg-[#E5E7EB]" />
                <div className="mt-2 h-2.5 w-3/4 animate-pulse rounded bg-[#E5E7EB]" />
                <div className="mt-1.5 h-2 w-1/2 animate-pulse rounded bg-[#F3F4F6]" />
              </div>
            ))}
          </div>
        </section>

        <section
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-20 animate-pulse rounded-lg border border-[#E5E7EB] bg-white"
            />
          ))}
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   SUGGESTED STUDENTS
============================================================ */

function SuggestedStudents({
  trending = [],
  isLoading,
  showVerified = false,
}: {
  trending?: SocialUser[];
  isLoading?: boolean;
  showVerified?: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Order comes from the API — do not re-sort here
  const sortedTrending = useMemo(() => trending.slice(0, 50), [trending]);

  if (isLoading) {
    return (
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-64 w-[240px] shrink-0 animate-pulse rounded-lg bg-[#F3F4F6] sm:w-[260px]"
          />
        ))}
      </div>
    );
  }

  if (sortedTrending.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-white px-5 py-8 text-center">
        <TrendingUp className="mx-auto mb-2 h-5 w-5 text-[#9CA3AF]" />
        <p className="text-[13px] font-semibold text-[#1A2B4C]">
          No active students yet
        </p>
        <p className="mt-0.5 text-[11.5px] text-[#6B7280]">
          Students appear here as they get followers and likes
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {sortedTrending.map((user) => {
          const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
          const isSelf = user.id === currentUserId;

          return (
            <article
              key={user.id}
              className="w-[240px] shrink-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm transition-colors hover:border-[#C59B4C]/50 sm:w-[260px]"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1A2B4C]">
                {user.profileImageUrl ? (
                  <Image
                    src={user.profileImageUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    fill
                    sizes="260px"
                    className="object-cover object-top"
                    quality={95}
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-2xl font-bold text-white/90">
                      {initials}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/students/${user.id}`);
                  }}
                  className="absolute right-2 top-2 z-10 rounded border border-white/30 bg-black/40 px-2 py-0.5 text-[9.5px] font-semibold text-white transition-colors hover:border-white/50 hover:bg-black/60"
                  aria-label={`View ${user.firstName} ${user.lastName}'s profile`}
                >
                  View
                </button>

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-2.5">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-[12.5px] font-bold leading-tight text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    {(showVerified || user.hasVerifiedBadge) && (
                      <VerifiedBadge className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 truncate text-[10px] leading-snug text-white/85">
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

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9.5px] text-white/85">
                    <span className="font-semibold text-white tabular-nums">
                      {user.followersCount}
                    </span>
                    <span>followers</span>
                    <span className="text-white/50">·</span>
                    <span className="font-semibold text-white tabular-nums">
                      {user.likesReceivedCount}
                    </span>
                    <span>likes</span>
                    <span className="text-white/50">·</span>
                    <span className="font-semibold text-white tabular-nums">
                      {user.profileViewsCount}
                    </span>
                    <span>views</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-1">
                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/dashboard/messages?userId=${user.id}`)
                        }
                        className="inline-flex shrink-0 items-center gap-1 rounded border border-white/30 bg-black/25 px-1.5 py-0.5 text-[9.5px] font-semibold text-white transition-colors hover:border-white/50 hover:bg-black/35"
                        aria-label={`Message ${user.firstName} ${user.lastName}`}
                      >
                        <MessageSquare className="h-2.5 w-2.5 shrink-0" />
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
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10.5px] text-[#9CA3AF]">
          <span className="uppercase tracking-wide">Scroll to discover more</span>
          <ChevronRight className="h-3 w-3" />
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
      <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-white px-5 py-8 text-center">
        <Heart className="mx-auto mb-2 h-5 w-5 text-[#9CA3AF]" />
        <p className="text-[13px] font-semibold text-[#1A2B4C]">No activity yet</p>
        <p className="mt-0.5 text-[11.5px] text-[#6B7280]">
          Likes and follows on your profile appear here
        </p>
      </div>
    );
  }

  return (
    <ul className="max-h-[328px] divide-y divide-[#F3F4F6] overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white">
      {events.map((event) => {
        const initials = `${event.user.firstName[0] ?? ''}${event.user.lastName[0] ?? ''}`.toUpperCase();
        const isLike = event.kind === 'like';
        const eventKey = `${event.id}-${event.at}`;

        return (
          <li key={eventKey} className="flex items-center gap-2.5 px-3 py-2">
            <div className="relative h-8 w-8 shrink-0">
              {event.user.profileImageUrl ? (
                <Image
                  src={event.user.profileImageUrl}
                  alt={`${event.user.firstName} ${event.user.lastName}`}
                  fill
                  sizes="32px"
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A2B4C] text-[10px] font-bold text-white">
                  {initials}
                </div>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white ${
                  isLike ? 'bg-[#A4462F]' : 'bg-[#55705B]'
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
              <p className="truncate text-[12px] leading-5 text-[#1A2B4C]">
                <span className="font-semibold">
                  {event.user.firstName} {event.user.lastName}
                </span>{' '}
                <span className="text-[#6B7280]">
                  {isLike ? 'liked your profile' : 'started following you'}
                </span>
              </p>
            </div>

            <span className="shrink-0 text-[10px] tabular-nums text-[#9CA3AF]">
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
        if (!res.ok) throw new Error('Failed to fetch all activities');
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
        return <BookOpen className="h-2.5 w-2.5" />;
      case 'cleaning_registration':
      case 'cleaning_day_change':
      case 'cleaning_week_created':
      case 'cleaning_day_created':
        return <Briefcase className="h-2.5 w-2.5" />;
      case 'football_team_joined':
        return <Trophy className="h-2.5 w-2.5" />;
      default:
        return <Sparkles className="h-2.5 w-2.5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-3">
        <div className="space-y-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="h-8 w-8 animate-pulse rounded-full bg-[#F3F4F6]" />
              <div className="flex-1 space-y-1">
                <div className="h-2.5 w-32 animate-pulse rounded bg-[#F3F4F6]" />
                <div className="h-2 w-24 animate-pulse rounded bg-[#F3F4F6]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-white px-5 py-8 text-center">
        <Sparkles className="mx-auto mb-2 h-5 w-5 text-[#9CA3AF]" />
        <p className="text-[13px] font-semibold text-[#1A2B4C]">No activity yet</p>
        <p className="mt-0.5 text-[11.5px] text-[#6B7280]">
          {isSuperAdminOrDev
            ? 'Activities from all tech centers will appear here'
            : 'Recent activities from your tech center will appear here'}
        </p>
      </div>
    );
  }

  return (
    <ul className="max-h-[400px] divide-y divide-[#F3F4F6] overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white">
      {activities.map((activity) => {
        const initials = `${activity.user.firstName[0] ?? ''}${activity.user.lastName[0] ?? ''}`.toUpperCase();

        return (
          <li key={activity.id} className="flex items-center gap-2.5 px-3 py-2">
            <div className="relative h-8 w-8 shrink-0">
              {activity.user.profileImageUrl ? (
                <Image
                  src={activity.user.profileImageUrl}
                  alt={`${activity.user.firstName} ${activity.user.lastName}`}
                  fill
                  sizes="32px"
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A2B4C] text-[10px] font-bold text-white">
                  {initials}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white bg-[#C59B4C]">
                {getActionIcon(activity.action)}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] leading-5 text-[#1A2B4C]">
                <span className="font-semibold">
                  {activity.user.firstName} {activity.user.lastName}
                </span>{' '}
                <span className="text-[#6B7280]">
                  {getActionLabel(activity.action)}
                </span>
                {activity.techCenter && (
                  <span className="ml-1.5 text-[10.5px] text-[#C59B4C]">
                    ({activity.techCenter.name})
                  </span>
                )}
              </p>
            </div>

            <span className="shrink-0 text-[10px] tabular-nums text-[#9CA3AF]">
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

  // Kept: motivation message rotation state
  const [, setMessageIndex] = useState(0);
  // Kept: real-time clock
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
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
  });

  const meStats = socialSummary?.me;
  const directorProfiles =
    socialSummary?.trending.students.filter(
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
        const response = await fetch('/api/dashboard/discover-students?limit=1000');
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

  // Kept: motivation messages + rotation
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

  // Kept: real-time clock update
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

  const getRoleLabel = (role?: string | null) => {
    if (!role) return '';
    const roleLabels: Record<string, string> = {
      admin: 'Manager',
      super_admin: 'Director',
      superadmin: 'Director',
      teacher: 'Tutor',
      dev: 'Selfless Support',
    };
    return roleLabels[role.toLowerCase()] ?? role.replace(/_/g, ' ');
  };

  const greeting = getGreeting();
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
  const firstName = user?.firstName || 'Guest';

  const quickLinks: QuickLink[] = useMemo(() => {
    const userRole = user?.role;

    if (userRole === 'super_admin') {
      return [
        { icon: <Users className="h-4 w-4" />, label: 'Tech Centers', description: 'Manage all', path: '/dashboard/super-admin/centers' },
        { icon: <Users className="h-4 w-4" />, label: 'All Users', description: 'Manage system', path: '/dashboard/super-admin/users' },
        { icon: <Briefcase className="h-4 w-4" />, label: 'Internships', description: 'Opportunities', path: '/dashboard/internships' },
        { icon: <Library className="h-4 w-4" />, label: 'Policy Book', description: 'Read policies', path: '/dashboard/policies' },
        { icon: <BookOpen className="h-4 w-4" />, label: 'Tuition', description: 'View info', path: '/dashboard/courses' },
        { icon: <MessageCircle className="h-4 w-4" />, label: 'Support', description: 'IT team', path: '/dashboard/support' },
      ];
    }

    if (userRole === 'admin') {
      return [
        { icon: <GraduationCap className="h-4 w-4" />, label: 'Tutors', description: 'Assign students', path: '/dashboard/admin/teachers' },
        { icon: <BookOpen className="h-4 w-4" />, label: 'Courses', description: 'Enrolled units', path: '/dashboard/courses' },
        { icon: <Users className="h-4 w-4" />, label: 'Students', description: 'Peer network', path: '/dashboard/students' },
        { icon: <Briefcase className="h-4 w-4" />, label: 'Internships', description: 'Opportunities', path: '/dashboard/internships' },
        { icon: <Clock className="h-4 w-4" />, label: 'Cleaning', description: 'Your schedule', path: '/dashboard/cleaning' },
        { icon: <MessageCircle className="h-4 w-4" />, label: 'Support', description: 'IT team', path: '/dashboard/support' },
      ];
    }

    return [
      { icon: <BookOpen className="h-4 w-4" />, label: 'Courses', description: 'Enrolled units', path: '/dashboard/courses' },
      { icon: <Users className="h-4 w-4" />, label: 'Students', description: 'Peer network', path: '/dashboard/students' },
      { icon: <Briefcase className="h-4 w-4" />, label: 'Internships', description: 'Opportunities', path: '/dashboard/internships' },
      { icon: <Clock className="h-4 w-4" />, label: 'Cleaning', description: 'Your schedule', path: '/dashboard/cleaning' },
      { icon: <Library className="h-4 w-4" />, label: 'Policies', description: 'Read policies', path: '/dashboard/policies' },
      { icon: <Trophy className="h-4 w-4" />, label: 'Sports', description: 'Join team', path: '/dashboard/football-team' },
    ];
  }, [user?.role]);

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#F8F9FA] text-[#1A2B4C]">
      <div className="w-full min-w-0 py-3 sm:py-5">
        {/* ============================================================
            HERO — full featured with globe, status bar, clock, stats
        ============================================================ */}
        <header className="relative overflow-hidden bg-[#1A2B4C] text-white">
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F1B33]/70 via-[#1A2B4C]/55 to-[#0F1B33]/75" />

          {/* Spinning globe accents — kept, subtler */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
          >
            <div className="absolute -right-28 -top-28 h-[520px] w-[520px] opacity-60">
              <SpinningGlobe />
            </div>
            <div className="absolute -bottom-32 -left-24 h-[460px] w-[460px] opacity-40">
              <SpinningGlobe />
            </div>
          </div>

          <div className="relative z-10">
            {/* Status Bar — kept, tightened */}
            <div className="border-b border-white/10 px-4 py-1.5 sm:px-6">
              <div className="flex items-center justify-between text-[9px] text-white/65">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#C59B4C]" />
                    <span className="uppercase tracking-wider text-[#D4A84B]">Live</span>
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="uppercase tracking-wider">
                    {currentTime.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="uppercase tracking-wider">
                    {currentTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="hidden items-center gap-1 sm:flex">
                  <span className="inline-flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-wider text-[#D4A84B]">
                    <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-[#C59B4C]" />
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Profile + Stats */}
            <div className="px-4 py-5 sm:px-6 sm:py-6">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.7fr)] md:items-start md:gap-6">
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg sm:h-14 sm:w-14">
                        {user?.profileImageUrl ? (
                          <Image
                            src={user.profileImageUrl}
                            alt={userName}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#C59B4C]/15">
                            <span className="text-lg font-bold text-[#D4A84B]">
                              {firstName?.charAt(0) ?? <User className="h-4 w-4" />}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1A2B4C] bg-[#55705B]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D4A84B]">
                        {greeting}
                      </p>
                      <h1 className="mt-0.5 flex items-center gap-1.5 text-[22px] font-bold leading-tight tracking-tight text-white sm:text-[26px]">
                        <span>
                          {userName}
                          <span className="text-[#E6C779]">.</span>
                        </span>
                        {user?.hasVerifiedBadge && (
                          <VerifiedBadge className="h-5 w-5 shrink-0" />
                        )}
                      </h1>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                        <span className="inline-flex items-center gap-1 text-[#D4A84B]">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C59B4C]" />
                          <span className="uppercase tracking-wide">Active</span>
                        </span>
                        {user?.role && (
                          <span className="uppercase tracking-wide text-white/70">
                            {getRoleLabel(user.role)}
                          </span>
                        )}
                        {techCenter && (
                          <span className="inline-flex items-center gap-1 text-white/70">
                            <MapPin className="h-2.5 w-2.5 text-[#D4A84B]" />
                            <span>{techCenter.name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
                    {[
                      { icon: <Users className="h-3 w-3" />, label: 'Followers', value: meStats?.followersCount ?? 0 },
                      { icon: <UserPlus className="h-3 w-3" />, label: 'Following', value: meStats?.followingCount ?? 0 },
                      { icon: <Eye className="h-3 w-3" />, label: 'Views', value: meStats?.profileViewsCount ?? 0 },
                      { icon: <Heart className="h-3 w-3" />, label: 'Likes', value: meStats?.likesReceivedCount ?? 0 },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-[#D4A84B]">
                          {icon}
                          <span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-white/65">
                            {label}
                          </span>
                        </div>
                        <span className="text-[16px] font-bold tabular-nums text-[#E6C779] sm:text-[18px]">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <RecentAnnouncementsPanel />
              </div>
            </div>
          </div>
        </header>

        {/* ============================================================
            MAIN CONTENT
        ============================================================ */}
        <div className="mt-6 space-y-8 px-4 sm:px-6">
          <RecentPostsSection />

          {(!socialSummary || directorProfiles.length > 0) && (
            <section>
              <SectionHeader label="Organization Directors" />
              <DirectorsDisplay
                trending={directorProfiles}
                isLoading={!socialSummary}
              />
            </section>
          )}

          {discoverStudents.length > 0 && (
            <section>
              <SectionHeader label="Discover students" />
              <DiscoverStudents
                students={discoverStudents}
                isLoading={discoverStudentsLoading}
              />
            </section>
          )}

          <section>
            <SectionHeader
              label="Trending student profiles"
              action={
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/students')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4B5646] transition-colors hover:text-[#1A2B4C]"
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

          <div className="grid grid-cols-1 gap-8">
            <section>
              <SectionHeader label="Reels" />
              <MediaLibrary />
            </section>

            <section>
              <SectionHeader label="On your profile" />
              <RecentSocialActivity
                likers={socialSummary?.activity?.likers}
                followers={socialSummary?.activity?.followers}
              />
            </section>
          </div>

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

          {/* Quick Access */}
          <section>
            <SectionHeader label="Quick access" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {quickLinks.slice(0, 6).map((link) => (
                <button
                  key={`${link.label}-${link.path}`}
                  type="button"
                  onClick={() => router.push(link.path)}
                  className="group flex flex-col items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white p-3 text-center transition-colors hover:border-[#C59B4C] hover:bg-[#FBF7EE]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1A2B4C] text-white transition-colors group-hover:bg-[#C59B4C]">
                    {link.icon}
                  </span>
                  <span className="text-[12px] font-semibold leading-tight text-[#1A2B4C]">
                    {link.label}
                  </span>
                  <span className="text-[10.5px] leading-snug text-[#6B7280]">
                    {link.description}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Action Needed */}
          {user?.role === 'admin' && (
            <section>
              <div className="flex flex-col gap-3 rounded-lg border border-[#E5E7EB] border-l-2 border-l-[#C59B4C] bg-[#FBF7EE] p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A6328]">
                    Action needed
                  </p>
                  <h3 className="mt-0.5 text-[13px] font-semibold text-[#1A2B4C]">
                    Assign students to tutors
                  </h3>
                  <p className="mt-0.5 max-w-2xl text-[11.5px] leading-5 text-[#6B7280]">
                    Help students get regular support by assigning them to tutors.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/admin/teachers')}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#1A2B4C] px-3 py-1.5 text-[11.5px] font-semibold text-white transition-colors hover:bg-[#263D66]"
                >
                  Open
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </section>
          )}

          {/* Admins */}
          {(adminsLoading || centerAdmins.length > 0) &&
            user?.role !== 'super_admin' && (
              <section>
                <SectionHeader
                  label={`${techCenter?.name || 'Your'} admins`}
                  count={centerAdmins.length}
                />
                {adminsLoading ? (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-12 animate-pulse rounded-md bg-[#F3F4F6]"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                    {centerAdmins.map((admin) => (
                      <div
                        key={admin.id}
                        className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5"
                      >
                        {admin.profileImageUrl ? (
                          <Image
                            src={admin.profileImageUrl}
                            alt={`${admin.firstName} ${admin.lastName}`}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A2B4C] text-[9px] font-bold text-white">
                            {admin.firstName.charAt(0)}
                            {admin.lastName.charAt(0)}
                          </div>
                        )}
                        <span className="truncate text-[11.5px] font-medium text-[#1A2B4C]">
                          {admin.firstName} {admin.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

          {/* Tutors */}
          {(tutorsLoading || tutors.length > 0) &&
            user?.role !== 'super_admin' && (
              <section>
                <SectionHeader
                  label={`${techCenter?.name || 'Your'} tutors`}
                  count={tutors.length}
                />
                {tutorsLoading ? (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-12 animate-pulse rounded-md bg-[#F3F4F6]"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                    {tutors.map((tutor: Tutor) => (
                      <div
                        key={tutor.id}
                        className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5"
                      >
                        {tutor.profileImageUrl ? (
                          <Image
                            src={tutor.profileImageUrl}
                            alt={`${tutor.firstName} ${tutor.lastName}`}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A2B4C] text-[9px] font-bold text-white">
                            {tutor.firstName.charAt(0)}
                            {tutor.lastName.charAt(0)}
                          </div>
                        )}
                        <span className="truncate text-[11.5px] font-medium text-[#1A2B4C]">
                          {tutor.firstName} {tutor.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

          {/* Assignment */}
          {(user?.role === 'student' || user?.role === 'teacher') && (
            <section>
              <SectionHeader label={isTeacher ? 'Your students' : 'Your tutor(s)'} />
              {loadingAssignment ? (
                <div className="rounded-lg border border-[#E5E7EB] bg-white p-3.5">
                  <div className="h-3.5 w-40 animate-pulse rounded bg-[#F3F4F6]" />
                </div>
              ) : isTeacher ? (
                studentCount > 0 ? (
                  <div className="rounded-lg border border-[#E5E7EB] bg-white p-3.5">
                    <p className="text-[13px] font-semibold text-[#1A2B4C]">
                      {studentCount} student{studentCount > 1 ? 's' : ''} under
                      your mentorship
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-[#E5E7EB] bg-white p-3.5">
                    <p className="text-[13px] font-semibold text-[#1A2B4C]">
                      No students assigned yet
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-[#6B7280]">
                      Contact your tech center admin to be assigned students.
                    </p>
                  </div>
                )
              ) : tutorInfo ? (
                <div className="rounded-lg border border-[#E5E7EB] bg-white p-3.5">
                  <div className="flex items-center gap-2.5">
                    {tutorInfo.profileImageUrl ? (
                      <Image
                        src={tutorInfo.profileImageUrl}
                        alt={`${tutorInfo.firstName} ${tutorInfo.lastName}`}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A2B4C] text-[11px] font-bold text-white">
                        {tutorInfo.firstName.charAt(0)}
                        {tutorInfo.lastName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-[#1A2B4C]">
                        {tutorInfo.firstName} {tutorInfo.lastName}
                      </p>
                      <p className="truncate text-[11px] text-[#6B7280]">
                        {tutorInfo.email}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-[#E5E7EB] bg-white p-3.5">
                  <p className="text-[13px] font-semibold text-[#1A2B4C]">
                    Not assigned to a tutor yet
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-[#6B7280]">
                    Contact your tech center admin for support.
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}