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
  Star,
  MessageCircle,
  MessageSquare,
  Trash2,
  Loader2,
  Send,
  Heart,
  UserPlus,
  TrendingUp,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DiscoverStudents, type DiscoverStudent } from './components/DiscoverStudents';
import { VideoPlayer } from './components/VideoPlayer';
import ProfileCompletenessCard from './components/ProfileCompletenessCard';
import AnnouncementCarousel from './components/AnnouncementCarousel';
import type { PageCacheAdapter } from '@/lib/social/cacheKeys';
import {
  findInStudentsShape,
  patchStudentsShape,
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

interface ActivityItem {
  id: string;
  action: string;
  createdAt: string | Date;
  details?: Record<string, string | number> | null;
  user?: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string | null;
  } | null;
  techCenter?: { id: string; name: string } | null;
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

interface VideoRequest {
  id: string;
  request: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  };
  techCenter?: {
    id: string;
    name: string;
    country?: { name: string };
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

function isVideoRequest(value: unknown): value is VideoRequest {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.request === 'string' &&
    typeof value.status === 'string' &&
    typeof value.createdAt === 'string' &&
    isRecord(value.user) &&
    typeof value.user.id === 'string' &&
    typeof value.user.firstName === 'string' &&
    typeof value.user.lastName === 'string' &&
    (typeof value.user.profileImageUrl === 'string' ||
      value.user.profileImageUrl === null) &&
    (value.techCenter === undefined ||
      value.techCenter === null ||
      (isRecord(value.techCenter) &&
        typeof value.techCenter.id === 'string' &&
        typeof value.techCenter.name === 'string' &&
        (value.techCenter.country === undefined ||
          (isRecord(value.techCenter.country) &&
            typeof value.techCenter.country.name === 'string'))))
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

function isActivityItem(value: unknown): value is ActivityItem {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.action === 'string' &&
    (typeof value.createdAt === 'string' || value.createdAt instanceof Date) &&
    (value.entityId === undefined || typeof value.entityId === 'string') &&
    (value.userAgent === undefined || typeof value.userAgent === 'string') &&
    (value.location === undefined || typeof value.location === 'string') &&
    (value.page === undefined || typeof value.page === 'string') &&
    (value.method === undefined || typeof value.method === 'string') &&
    (value.details === undefined ||
      value.details === null ||
      (isRecord(value.details) &&
        Object.values(value.details).every(
          (item) => typeof item === 'string' || typeof item === 'number',
        ))) &&
    (value.user === undefined ||
      value.user === null ||
      (isRecord(value.user) &&
        typeof value.user.firstName === 'string' &&
        typeof value.user.lastName === 'string' &&
        (value.user.profileImageUrl === undefined ||
          typeof value.user.profileImageUrl === 'string' ||
          value.user.profileImageUrl === null))) &&
    (value.techCenter === undefined ||
      value.techCenter === null ||
      (isRecord(value.techCenter) &&
        typeof value.techCenter.id === 'string' &&
        typeof value.techCenter.name === 'string'))
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
    patch: (old, targetId, patch) =>
      patchStudentsShape((old as SocialSummary)?.trending?.students || [], targetId, patch),
    find: (old, targetId) => findInStudentsShape((old as SocialSummary)?.trending?.students || [], targetId),
  },
];

/* ============================================================
   STAT ITEM — compact metric display
============================================================ */

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:items-baseline sm:gap-2">
      <p className="truncate font-mono text-[9px] font-semibold uppercase tracking-wider text-white/50 sm:text-[10px]">
        {label}
      </p>
      <p
        className="font-mono text-sm font-black tabular-nums leading-none sm:text-base"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   SECTION HEADER — bold, editorial
============================================================ */

/* ============================================================
   RECENT ANNOUNCEMENTS STRIP — lives inside the hero card
============================================================ */

function RecentAnnouncementsStrip() {
  const router = useRouter();

  const { data, isLoading } = useQuery<{ announcements: Array<{ id: string; title: string; createdAt: string; isGlobal: boolean }> }>({
    queryKey: ['announcements', 'recent-strip'],
    queryFn: async () => {
      const res = await fetch('/api/announcements');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: (data) => ({
      announcements: data.announcements.slice(0, 3),
    }),
  });

  const announcements = data?.announcements ?? [];

  return (
    <div className="border-t border-white/10">
      {/* Section header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#B98A3E]/15">
            <AlertCircle className="h-3 w-3 text-[#B98A3E]" />
          </div>
          <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/50">
            Announcements
          </span>
        </div>
        <button
          type="button"
          onClick={() => router.push('/dashboard/announcements')}
          className="inline-flex items-center gap-1.5 rounded border border-[#B98A3E]/30 bg-[#B98A3E]/10 px-2.5 py-1 font-mono text-[8.5px] font-bold uppercase tracking-[0.14em] text-[#B98A3E] transition-colors hover:border-[#B98A3E]/60 hover:bg-[#B98A3E]/20"
        >
          View all
          <ArrowRight className="h-2.5 w-2.5" />
        </button>
      </div>

      {/* List */}
      <div className="px-4 pb-4 sm:px-6">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-md bg-white/5" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <p className="py-3 text-center font-mono text-[10px] text-white/25">
            No announcements yet
          </p>
        ) : (
          <ol className="space-y-px">
            {announcements.map((a, idx) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/announcements')}
                  className="group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  {/* Number */}
                  <span className="mt-0.5 shrink-0 font-mono text-[10px] font-black tabular-nums text-[#B98A3E]/50">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Title — full wrap, no truncation */}
                  <span className="flex-1 text-[12.5px] font-semibold leading-snug text-white/75 group-hover:text-white">
                    {a.title}
                  </span>

                  {/* Badges + arrow */}
                  <div className="ml-2 flex shrink-0 items-center gap-1.5 pt-0.5">
                    {a.isGlobal && (
                      <span className="rounded border border-[#B98A3E]/25 bg-[#B98A3E]/10 px-1.5 py-0.5 font-mono text-[7.5px] font-bold uppercase tracking-wider text-[#B98A3E]">
                        Global
                      </span>
                    )}
                    <ChevronRight className="h-3 w-3 text-white/20 transition-colors group-hover:text-[#B98A3E]" />
                  </div>
                </button>

                {/* Divider between items */}
                {idx < announcements.length - 1 && (
                  <div className="mx-3 h-px bg-white/5" />
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: videoRequests = [] } = useQuery<VideoRequest[]>({
    queryKey: ['video-requests'],
    queryFn: async () => {
      const response = await fetch('/api/video-requests');
      if (!response.ok) throw new Error('Failed to fetch video requests');
      const data: unknown = await response.json();
      if (!isRecord(data) || data.success !== true || !Array.isArray(data.data)) {
        throw new Error(getResponseError(data, 'Failed'));
      }
      return data.data.filter(isVideoRequest);
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!user?.id,
  });

  const videos = useMemo(
    () => items.filter((item) => item.contentType.startsWith('video/')),
    [items],
  );

  const [rawIndex, setRawIndex] = useState(0);
  const [requestInput, setRequestInput] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const videoPlayerRef = useRef<{ play: () => void } | null>(null);

  const currentIndex =
    videos.length === 0 ? 0 : Math.min(rawIndex, videos.length - 1);
  const current = videos[currentIndex] ?? null;

  const goNext = useCallback(() => {
    if (videos.length <= 1) return;
    setRawIndex((prev) => (prev + 1) % videos.length);
    setTimeout(() => videoPlayerRef.current?.play(), 100);
  }, [videos.length]);

  const goPrevious = useCallback(() => {
    if (videos.length <= 1) return;
    setRawIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setTimeout(() => videoPlayerRef.current?.play(), 100);
  }, [videos.length]);

  const selectVideo = useCallback((index: number) => {
    setRawIndex(index);
    setTimeout(() => videoPlayerRef.current?.play(), 100);
  }, []);

  const handleRequestSubmit = async (request: string) => {
    const content = request.trim();
    if (!content || isSubmittingRequest) return;

    setIsSubmittingRequest(true);
    try {
      const response = await fetch('/api/video-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: content }),
      });
      const data: unknown = await response.json();
      if (!response.ok || !isRecord(data) || data.success !== true) {
        throw new Error(getResponseError(data, 'Request failed'));
      }
      setRequestInput('');
      queryClient.invalidateQueries({ queryKey: ['video-requests'] });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Delete this request?')) return;
    try {
      const response = await fetch(`/api/video-requests/${requestId}`, {
        method: 'DELETE',
      });
      const data: unknown = await response.json();
      if (!response.ok || !isRecord(data) || data.success !== true) {
        throw new Error(getResponseError(data, 'Failed'));
      }
      queryClient.invalidateQueries({ queryKey: ['video-requests'] });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete request');
    }
  };

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

        <div className="border-t border-[#E5E7EB] px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={requestInput}
              onChange={(e) => setRequestInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === 'Enter' && handleRequestSubmit(requestInput)
              }
              placeholder="Request a video topic…"
              maxLength={30}
              disabled={isSubmittingRequest}
              className="h-9 flex-1 border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#1A2B4C] placeholder:text-[#9CA3AF] focus:border-[#B98A3E] focus:outline-none"
            />
            <button
              onClick={() => handleRequestSubmit(requestInput)}
              disabled={!requestInput.trim() || isSubmittingRequest}
              className="inline-flex h-9 w-9 items-center justify-center bg-[#1A2B4C] text-white transition-colors hover:bg-[#2C3E5A] disabled:opacity-40"
              aria-label="Send request"
            >
              {isSubmittingRequest ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {videoRequests.length > 0 && (
            <div className="mt-3 max-h-24 space-y-1 overflow-y-auto">
              {videoRequests.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 border-b border-[#F3F4F6] py-1 last:border-0"
                >
                  <span className="shrink-0 text-[10px] font-bold text-[#B98A3E]">
                    {item.user.firstName} {item.user.lastName}
                  </span>
                  <span className="flex-1 truncate text-[11px] text-[#6B7280]">
                    {item.request}
                  </span>
                  {item.user.id === user?.id && (
                    <button
                      onClick={() => handleDeleteRequest(item.id)}
                      className="shrink-0 text-[#9CA3AF] transition-colors hover:text-[#A4462F]"
                      aria-label="Delete request"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-[#1A2B4C] bg-[#0F1923]">
      <div className="w-full bg-black">
        {current && (
          <VideoPlayer
            key={`video-${current.id}`}
            src={current.publicUrl}
            title={current.title}
            description={current.description || undefined}
            className="w-full"
            playRef={videoPlayerRef}
            onPrevious={videos.length > 1 ? goPrevious : undefined}
            onNext={videos.length > 1 ? goNext : undefined}
            videoIndex={currentIndex}
            videoCount={videos.length}
            onEnded={() => {
              if (videos.length > 1) goNext();
            }}
          />
        )}
      </div>

      <div className="bg-[#0F1923]">
        {videos.length > 1 && (
          <div className="border-t border-white/[0.08]">
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
              <Video className="h-3 w-3 text-[#B98A3E]" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#B98A3E]">
                Queue
              </span>
              <span className="ml-auto font-mono text-[10px] tabular-nums text-white/30">
                {currentIndex + 1} / {videos.length}
              </span>
            </div>

            <div className="max-h-[7.5rem] divide-y divide-white/[0.04] overflow-y-auto">
              {videos.map((item, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectVideo(idx)}
                    className={`group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${isActive
                      ? 'border-l-2 border-l-[#B98A3E] bg-[#B98A3E]/[0.12]'
                      : 'border-l-2 border-l-transparent hover:bg-white/[0.04]'
                      }`}
                  >
                    <span
                      className={`w-5 shrink-0 text-center font-mono text-[10px] font-bold tabular-nums ${isActive
                        ? 'text-[#B98A3E]'
                        : 'text-white/25 group-hover:text-white/50'
                        }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`flex-1 truncate text-[11px] font-bold ${isActive
                        ? 'text-[#B98A3E]'
                        : 'text-white/70 group-hover:text-white/90'
                        }`}
                    >
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="border-t border-white/[0.08] px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={requestInput}
              onChange={(e) => setRequestInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === 'Enter' && handleRequestSubmit(requestInput)
              }
              placeholder="Request a video topic…"
              maxLength={30}
              disabled={isSubmittingRequest}
              className="h-8 flex-1 border border-white/10 bg-white/[0.06] px-3 text-[11px] font-semibold text-white/80 placeholder:text-white/25 focus:border-[#B98A3E]/60 focus:outline-none"
            />
            <button
              onClick={() => handleRequestSubmit(requestInput)}
              disabled={!requestInput.trim() || isSubmittingRequest}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center bg-[#B98A3E] text-white transition-colors hover:bg-[#E8A33D] disabled:opacity-40"
              aria-label="Send request"
            >
              {isSubmittingRequest ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Send className="h-3 w-3" />
              )}
            </button>
          </div>

          {videoRequests.length > 0 && (
            <div className="mt-2 max-h-24 space-y-1 overflow-y-auto">
              {videoRequests.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 border-b border-white/[0.05] py-1 last:border-0"
                >
                  <span className="shrink-0 text-[10px] font-bold text-[#B98A3E]">
                    {item.user.firstName} {item.user.lastName}
                  </span>
                  <span className="flex-1 truncate text-[11px] text-white/50">
                    {item.request}
                  </span>
                  {item.user.id === user?.id && (
                    <button
                      onClick={() => handleDeleteRequest(item.id)}
                      className="shrink-0 text-white/25 transition-colors hover:text-red-400"
                      aria-label="Delete request"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STAT BLOCK — bold, solid, editorial
============================================================ */

function StatBlock({
  value,
  label,
  accent,
}: {
  value: number | string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <span
        className={`font-mono text-2xl font-black leading-none tabular-nums sm:text-3xl ${accent ? 'text-[#B98A3E]' : 'text-white'
          }`}
      >
        {value}
      </span>
      <span className="mt-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 sm:text-[10px]">
        {label}
      </span>
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

function SuggestedStudents({ trending = [], isLoading }: { trending?: SocialUser[]; isLoading?: boolean }) {
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
              className="w-60 shrink-0 overflow-hidden rounded-md border border-[#E5E7EB] bg-white shadow-sm transition-shadow hover:shadow-md"
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
  likedUsers = [],
  followers = [],
}: {
  likers?: Array<SocialUser & { likedAt?: string }>;
  likedUsers?: Array<SocialUser & { likedAt?: string }>;
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

    return items
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 6);
  }, [likers, followers]);

  if (events.length === 0) {
    return (
      <div className="border border-[#D1D5DB] bg-white px-6 py-8 text-center">
        <Heart className="mx-auto mb-3 h-5 w-5 text-[#9CA3AF]" />
        <p className="text-[14px] font-bold text-[#1A2B4C]">No activity yet</p>
        <p className="mt-1 text-[12px] text-[#6B7280]">
          Likes and follows on your profile appear here
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[#E5E7EB] border-y border-[#E5E7EB]">
      {events.map((event) => {
        const initials = `${event.user.firstName[0] ?? ''}${event.user.lastName[0] ?? ''
          }`.toUpperCase();
        const isLike = event.kind === 'like';

        return (
          <li key={event.id} className="flex items-center gap-3 py-3">
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
          `/api/tech-centers/${techCenterId}/activity?limit=all`,
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
      <div className="border border-[#E5E7EB] bg-white p-5">
        <div className="space-y-3">
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
      <div className="border border-[#D1D5DB] bg-white px-6 py-8 text-center">
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
    <div className="border border-[#E5E7EB] bg-white">
      <ul className="max-h-[400px] divide-y divide-[#E5E7EB] overflow-y-auto">
        {activities.map((activity) => {
          const initials = `${activity.user.firstName[0] ?? ''}${activity.user.lastName[0] ?? ''
            }`.toUpperCase();

          return (
            <li key={activity.id} className="flex items-center gap-3 py-3">
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
    </div>
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
  const queryClient = useQueryClient();

  const [techCenter, setTechCenter] = useState<TechCenter | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: socialSummary } = useQuery<SocialSummary>({
    queryKey: ['dashboard', 'social-summary'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/social-summary?limit=50');
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

  // Prefetch announcement carousel data on page load
  useEffect(() => {
    const prefetchCarouselData = async () => {
      // Prefetch directors
      queryClient.prefetchQuery({
        queryKey: ['directors'],
        queryFn: async () => {
          const response = await fetch('/api/directors');
          if (!response.ok) throw new Error('Failed to fetch directors');
          const data: unknown = await response.json();
          if (!isRecord(data) || data.success !== true || !Array.isArray(data.directors)) {
            throw new Error(getResponseError(data, 'Failed'));
          }
          return data.directors.filter(isRecord);
        },
        staleTime: 5 * 60 * 1000,
      });

      // Prefetch tech center admin teams
      queryClient.prefetchQuery({
        queryKey: ['tech-center-admin-teams'],
        queryFn: async () => {
          const response = await fetch('/api/tech-centers/admin-teams');
          if (!response.ok) throw new Error('Failed to fetch tech center admin teams');
          const data: unknown = await response.json();
          if (!isRecord(data) || data.success !== true || !Array.isArray(data.techCenters)) {
            throw new Error(getResponseError(data, 'Failed'));
          }
          return data.techCenters.filter(isTechCenter);
        },
        staleTime: 5 * 60 * 1000,
      });
    };

    prefetchCarouselData();
  }, [queryClient]);

  const fetchTechCenter = useCallback(async (techCenterId: string) => {
    try {
      const response = await fetch(`/api/tech-centers/${techCenterId}`);
      if (response.ok) {
        const data: unknown = await response.json();
        if (isTechCenter(data)) setTechCenter(data);
      }
    } catch (error) {
      console.error('Error fetching tech center:', error);
    }
  }, []);

  const fetchRecentActivity = useCallback(async (techCenterId: string) => {
    try {
      const response = await fetch(
        `/api/tech-centers/${techCenterId}/activity?limit=all`,
      );
      if (response.ok) {
        const data: unknown = await response.json();
        if (Array.isArray(data)) {
          setRecentActivity(data.filter(isActivityItem));
        }
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  }, []);

  const fetchAllActivity = useCallback(async () => {
    try {
      const techCentersResponse = await fetch('/api/admin/tech-centers');
      if (techCentersResponse.ok) {
        const techCentersData: unknown = await techCentersResponse.json();
        const techCenters = Array.isArray(techCentersData)
          ? techCentersData.filter(isTechCenter)
          : [];

        const activityPromises = techCenters.map(async (tc) => {
          try {
            const activityResponse = await fetch(
              `/api/tech-centers/${tc.id}/activity?limit=all`,
            );
            if (activityResponse.ok) {
              const activitiesData: unknown = await activityResponse.json();
              const activities = Array.isArray(activitiesData)
                ? activitiesData.filter(isActivityItem)
                : [];
              return (activities || []).map((activity) => ({
                ...activity,
                techCenter: { id: tc.id, name: tc.name },
              }));
            }
            return [];
          } catch {
            return [];
          }
        });

        const allActivities = await Promise.all(activityPromises);
        const flattened = allActivities
          .flat()
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          );
        setRecentActivity(flattened);
      }
    } catch (error) {
      console.error('Error fetching all activity:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (user?.techCenterId) await fetchTechCenter(user.techCenterId);
      if (user?.role === 'super_admin') {
        await fetchAllActivity();
      } else if (user?.techCenterId) {
        await fetchRecentActivity(user.techCenterId);
      }
    };
    loadData();
  }, [
    user?.techCenterId,
    user?.role,
    fetchTechCenter,
    fetchRecentActivity,
    fetchAllActivity,
  ]);

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

  const ACTIVITY_META: Record<string, { label: string }> = {
    course_submission: { label: 'submitted a course' },
    cleaning_registration: { label: 'registered for cleaning day' },
    cleaning_day_change: { label: 'changed cleaning day' },
    cleaning_week_created: { label: 'created cleaning week' },
    cleaning_day_created: { label: 'created cleaning day' },
    change_user_role: { label: 'changed user role' },
    create_user: { label: 'created new user' },
    delete_user: { label: 'deleted user' },
    create_tech_center: { label: 'created tech center' },
    update_tech_center: { label: 'updated tech center' },
  };

  const getActivityMeta = (action: string): { label: string } =>
    ACTIVITY_META[action.toLowerCase()] ?? {
      label: action.replace(/_/g, ' '),
    };

  const formatTimeAgo = (date: Date | string) => {
    const timestamp = new Date(date).getTime();
    if (Number.isNaN(timestamp)) return '';
    const diffInMs = currentTime.getTime() - timestamp;
    const mins = Math.floor(diffInMs / 60000);
    const hours = Math.floor(diffInMs / 3600000);
    const days = Math.floor(diffInMs / 86400000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString();
  };

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
      { icon: <Trophy className="h-5 w-5" />, label: 'Football', description: 'Join team', path: '/dashboard/football-team' },
    ];
  }, [user?.role]);

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A2B4C]">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        {/* ============================================================
            HERO — greeting + stats + recent announcements  (1st)
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

          {/* Recent Announcements strip */}
          <RecentAnnouncementsStrip />
        </header>

        {/* ============================================================
            ANNOUNCEMENT CAROUSEL — community updates  (2nd)
        ============================================================ */}
        <div className="mt-3 bg-[#1A2B4C]">
          <div className="px-4 pt-4 sm:px-6">
            <h2 className="text-sm font-semibold text-white sm:text-base">
              Selfless Live Updates
            </h2>
          </div>
          <div className="px-4 pb-4 pt-3 sm:px-6">
            <AnnouncementCarousel inHeader={true} />
          </div>
        </div>

        {/* ============================================================
            MAIN CONTENT - Unified layout
        ============================================================ */}
        <div className="mt-10 space-y-12">
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
              label="Trending profiles"
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
              trending={socialSummary?.trending.students}
              isLoading={!socialSummary}
            />
          </section>

          {/* Reels + Recent Activity - Two Column on Desktop */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
            {/* Reels */}
            <section>
              <SectionHeader label="Reels" />
              <MediaLibrary />
            </section>

            {/* Recent Activity */}
            <section>
              <SectionHeader label="On your profile" />
              <RecentSocialActivity
                likers={socialSummary?.activity.likers}
                followers={socialSummary?.activity.followers}
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

        {/* Profile Completion */}
        <section className="mt-12">
          <ProfileCompletenessCard user={user} inHeader={false} />
        </section>
      </div>
    </div>
  );
}