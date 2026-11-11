'use client';

export const dynamic = 'force-dynamic';

import {
  Loader2,
  AlertCircle,
  X,
  Plus,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  Maximize2,
  CheckCircle2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  MoreVertical,
} from 'lucide-react';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { isRecord } from '@/app/dashboard/response-guards';
import { getApiErrorMessage, readJsonObject } from '@/lib/api-response';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import AzureMediaUpload from '@/components/AzureMediaUpload';
import MediaPostInteractions from './components/MediaPostInteractions';

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
  approvedAt: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    techCenter?: {
      id: string;
      name: string;
    } | null;
  } | null;
}

interface VideoControlsState {
  currentTime: number;
  duration: number;
  isMuted: boolean;
  isPlaying: boolean;
}

function formatVideoTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

interface MediaPage {
  items: MediaItem[];
  hasMore: boolean;
  totalCount: number;
  statusCounts?: {
    APPROVED: number;
    PENDING: number;
    REJECTED: number;
  };
}

interface FollowStatus {
  [userId: string]: boolean;
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
    (typeof value.approvedAt === 'string' || value.approvedAt === null) &&
    typeof value.createdAt === 'string' &&
    (value.user === undefined ||
      value.user === null ||
      (isRecord(value.user) &&
        typeof value.user.id === 'string' &&
        typeof value.user.firstName === 'string' &&
        typeof value.user.lastName === 'string' &&
        (typeof value.user.profileImageUrl === 'string' ||
          value.user.profileImageUrl === null) &&
        (value.user.techCenter === undefined ||
          value.user.techCenter === null ||
          (isRecord(value.user.techCenter) &&
            typeof value.user.techCenter.id === 'string' &&
            typeof value.user.techCenter.name === 'string'))))
  );
}

function PostDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const updateTruncation = () => {
      if (!expanded) {
        setIsTruncated(element.scrollHeight > element.clientHeight + 1);
      }
    };

    updateTruncation();
    const observer = new ResizeObserver(updateTruncation);
    observer.observe(element);
    return () => observer.disconnect();
  }, [description, expanded]);

  return (
    <div className="relative">
      <p
        ref={textRef}
        className={`whitespace-pre-wrap text-sm leading-6 text-[#526078] ${
          expanded ? '' : 'line-clamp-2'
        }`}
      >
        {description}
      </p>
      {expanded && isTruncated && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-expanded="true"
          className="text-sm font-semibold text-[#1A2B4C] hover:underline"
        >
          Less
        </button>
      )}
      {!expanded && isTruncated && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-expanded="false"
          className="absolute bottom-0 right-0 bg-white pl-1 text-sm font-semibold leading-6 text-[#1A2B4C] hover:underline"
        >
          More
        </button>
      )}
    </div>
  );
}

// ✅ Skeleton card for loading state
function GallerySkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[#E4E8EF] bg-white">
      <div className="aspect-square w-full bg-[#EEF0F4]" />
      <div className="space-y-2 border-t border-[#F0F2F5] p-3">
        <div className="h-3 w-3/4 rounded bg-[#EEF0F4]" />
        <div className="h-2.5 w-1/2 rounded bg-[#EEF0F4]" />
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<'all' | 'photos' | 'videos' | 'mine' | 'saved'>('all');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deletePostError, setDeletePostError] = useState<{ id: string; message: string } | null>(null);
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  // ✅ Proper confirmation dialog instead of window.confirm
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  // ✅ fullscreen state declared ABOVE handleDeletePost (fixes reference-error risk)
  const [fullscreenMedia, setFullscreenMedia] = useState<MediaItem | null>(null);
  const [videoControls, setVideoControls] = useState<Record<string, VideoControlsState>>({});

  const { data: items = [], isLoading, isFetching, error, refetch } = useQuery<MediaItem[]>({
    queryKey: ['gallery-media'],
    queryFn: async () => {
      const response = await fetch('/api/media/list?category=gallery');
      if (!response.ok) throw new Error('Failed to fetch media');
      const data: unknown = await response.json();
      if (!isRecord(data) || data.success !== true || !Array.isArray(data.items)) {
        throw new Error('Failed to load gallery');
      }
      return data.items.filter(isMediaItem);
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const myPostsQuery = useInfiniteQuery<MediaPage>({
    queryKey: ['gallery-my-posts', currentUser?.id],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams({
        category: 'gallery',
        mine: 'true',
        limit: '10',
        offset: String(pageParam),
      });
      const response = await fetch(`/api/media/list?${searchParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch your posts');
      const data: unknown = await response.json();
      if (
        !isRecord(data) ||
        data.success !== true ||
        !Array.isArray(data.items) ||
        typeof data.hasMore !== 'boolean' ||
        typeof data.totalCount !== 'number'
      ) {
        throw new Error('Failed to load your posts');
      }
      const statusCounts =
        isRecord(data.statusCounts) &&
        typeof data.statusCounts.APPROVED === 'number' &&
        typeof data.statusCounts.PENDING === 'number' &&
        typeof data.statusCounts.REJECTED === 'number'
          ? {
              APPROVED: data.statusCounts.APPROVED,
              PENDING: data.statusCounts.PENDING,
              REJECTED: data.statusCounts.REJECTED,
            }
          : undefined;
      return {
        items: data.items.filter(isMediaItem),
        hasMore: data.hasMore,
        totalCount: data.totalCount,
        statusCounts,
      };
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length * 10 : undefined,
    enabled: activeFilter === 'mine' && Boolean(currentUser),
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const savedPostsQuery = useQuery<MediaItem[]>({
    queryKey: ['gallery-saved-posts', currentUser?.id],
    queryFn: async () => {
      const response = await fetch('/api/media/list?category=gallery&saved=true');
      if (!response.ok) throw new Error('Failed to fetch saved posts');
      const data: unknown = await response.json();
      if (!isRecord(data) || data.success !== true || !Array.isArray(data.items)) {
        throw new Error('Failed to load saved posts');
      }
      return data.items.filter(isMediaItem);
    },
    enabled: activeFilter === 'saved' && Boolean(currentUser),
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const [followStatus, setFollowStatus] = useState<FollowStatus>({});
  const [pendingFollows, setPendingFollows] = useState<FollowStatus>({});
  const [followErrors, setFollowErrors] = useState<FollowStatus>({});
  const pendingFollowIds = useRef(new Set<string>());
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [postUploadNotice, setPostUploadNotice] = useState<string | null>(null);

  // ✅ ONE request for the whole feed instead of N per-author requests
  useEffect(() => {
    if (!currentUser || items.length === 0) return;

    const checkFollowStatus = async () => {
      const userIds = [
        ...new Set(
          items
            .map((item) => item.user?.id)
            .filter((userId): userId is string => Boolean(userId)),
        ),
      ];
      if (userIds.length === 0) return;

      try {
        const response = await fetch(
          `/api/social/connections/${currentUser.id}?type=following&limit=500`,
        );
        if (!response.ok) return;
        const data: unknown = await response.json();
        if (!isRecord(data) || !Array.isArray(data.connections)) return;

        const followingSet = new Set(
          data.connections
            .filter(isRecord)
            .map((conn) => conn.id)
            .filter((id): id is string => typeof id === 'string'),
        );
        const status: FollowStatus = {};
        for (const userId of userIds) status[userId] = followingSet.has(userId);

        setFollowStatus((previous) => {
          const merged = { ...previous, ...status };
          for (const userId of pendingFollowIds.current) merged[userId] = true;
          return merged;
        });
      } catch (followError) {
        console.error('Failed to check follow status:', followError);
      }
    };

    void checkFollowStatus();
  }, [currentUser, items]);

  const handleFollow = async (userId: string) => {
    if (!currentUser || pendingFollowIds.current.has(userId)) return;

    const isCurrentlyFollowing = followStatus[userId];
    pendingFollowIds.current.add(userId);
    setPendingFollows((previous) => ({ ...previous, [userId]: true }));
    setFollowErrors((previous) => ({ ...previous, [userId]: false }));
    try {
      const response = await fetch(`/api/social/follow/${userId}`, {
        method: isCurrentlyFollowing ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error(
          isCurrentlyFollowing
            ? 'Could not unfollow this user'
            : 'Could not follow this user',
        );
      }

      setFollowStatus((previous) => ({
        ...previous,
        [userId]: !isCurrentlyFollowing,
      }));
    } catch (followError) {
      console.error('Failed to toggle follow:', followError);
      setFollowErrors((previous) => ({ ...previous, [userId]: true }));
    } finally {
      pendingFollowIds.current.delete(userId);
      setPendingFollows((previous) => ({ ...previous, [userId]: false }));
    }
  };

  const handleDeletePost = async (mediaId: string) => {
    setDeletingPostId(mediaId);
    setDeletePostError(null);
    try {
      const response = await fetch('/api/media/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId }),
      });
      const result = await readJsonObject(response);
      if (!response.ok || result.success !== true) {
        throw new Error(getApiErrorMessage(result, 'Could not delete post'));
      }

      const removePost = (previous: MediaItem[] | undefined) =>
        previous?.filter((item) => item.id !== mediaId);
      queryClient.setQueryData<MediaItem[]>(['gallery-media'], removePost);
      queryClient.setQueryData<InfiniteData<MediaPage>>(
        ['gallery-my-posts', currentUser?.id],
        (previous) =>
          previous
            ? {
                ...previous,
                pages: previous.pages.map((page) => ({
                  ...page,
                  items: page.items.filter((item) => item.id !== mediaId),
                  totalCount: Math.max(0, page.totalCount - 1),
                })),
              }
            : previous,
      );
      queryClient.setQueryData<MediaItem[]>(
        ['gallery-saved-posts', currentUser?.id],
        removePost,
      );
      setFullscreenMedia((previous) =>
        previous?.id === mediaId ? null : previous,
      );
      void queryClient.invalidateQueries({ queryKey: ['gallery-post-count'] });
      void queryClient.invalidateQueries({
        queryKey: ['gallery-my-posts', currentUser?.id],
      });
    } catch (deleteError) {
      setDeletePostError({
        id: mediaId,
        message:
          deleteError instanceof Error
            ? deleteError.message
            : 'Could not delete post',
      });
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleUploadsComplete = (count: number) => {
    if (count === 0) return;

    setIsCreatePostModalOpen(false);
    setActiveFilter('mine');
    setPostUploadNotice(
      currentUser?.role === 'dev' || currentUser?.role === 'super_admin'
        ? 'Your post is published and visible in the community feed.'
        : 'Your post was submitted for review. It will appear in the community feed after approval.',
    );
    void refetch();
    void myPostsQuery.refetch();
  };

  const photos = items.filter((item) => item.contentType.startsWith('image/'));
  const videos = items.filter((item) => item.contentType.startsWith('video/'));
  const myPosts = myPostsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const visibleItems =
    activeFilter === 'mine'
      ? myPosts
      : activeFilter === 'saved'
        ? savedPostsQuery.data ?? []
        : activeFilter === 'photos'
          ? photos
          : activeFilter === 'videos'
            ? videos
            : items;
  const visibleCount =
    activeFilter === 'mine'
      ? myPostsQuery.data?.pages[0]?.totalCount ?? myPosts.length
      : activeFilter === 'saved'
        ? savedPostsQuery.data?.length ?? 0
        : activeFilter === 'photos'
          ? photos.length
          : activeFilter === 'videos'
            ? videos.length
            : items.length;
  const myPostStats =
    myPostsQuery.data?.pages[0]?.statusCounts ??
    myPosts.reduce(
      (stats, item) => {
        stats[item.approvalStatus] += 1;
        return stats;
      },
      { APPROVED: 0, PENDING: 0, REJECTED: 0 },
    );

  const communityGrowth = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfToday);
      date.setDate(startOfToday.getDate() - (6 - index));
      return {
        key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: 0,
      };
    });

    for (const item of items) {
      const createdAt = new Date(item.createdAt);
      if (!Number.isFinite(createdAt.getTime())) continue;
      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}-${createdAt.getDate()}`;
      const day = days.find((entry) => entry.key === key);
      if (day) day.count += 1;
    }

    let total = 0;
    const points = days.map((day) => {
      total += day.count;
      return { ...day, cumulative: total };
    });

    return {
      points,
      maximumDaily: Math.max(1, ...points.map((point) => point.count)),
      maximumCumulative: Math.max(1, total),
    };
  }, [items]);

  // ✅ Outside-click + Escape close for post menu
  useEffect(() => {
    if (!openPostMenuId) return;
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (target && !target.closest('[data-post-menu]')) {
        setOpenPostMenuId(null);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPostMenuId(null);
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [openPostMenuId]);

  const updateVideoControls = useCallback(
    (videoId: string, patch: Partial<VideoControlsState>) => {
      setVideoControls((current) => ({
        ...current,
        [videoId]: {
          ...(current[videoId] ?? {
            currentTime: 0,
            duration: 0,
            isMuted: false,
            isPlaying: false,
          }),
          ...patch,
        },
      }));
    },
    [],
  );

  const toggleVideoMute = useCallback(
    (videoId: string) => {
      const video = videoRefs.current[videoId];
      if (!video) return;
      video.muted = !video.muted;
      updateVideoControls(videoId, { isMuted: video.muted });
    },
    [updateVideoControls],
  );

  const openFullscreenMedia = useCallback((item: MediaItem) => {
    Object.values(videoRefs.current).forEach((video) => video?.pause());
    setFullscreenMedia(item);
  }, []);

  const closeFullscreenMedia = useCallback(() => {
    setFullscreenMedia(null);
  }, []);

  useEffect(() => {
    if (!fullscreenMedia) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeFullscreenMedia();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenMedia, closeFullscreenMedia]);

  useEffect(() => {
    if (!fullscreenMedia) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreenMedia]);

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const handleVideoPlay = (videoId: string) => {
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (id !== videoId && video) {
        video.pause();
      }
    });
  };

  useEffect(() => {
    return () => {
      videoRefs.current = {};
    };
  }, []);

  const isRefreshing =
    activeFilter === 'mine'
      ? myPostsQuery.isFetching
      : activeFilter === 'saved'
        ? savedPostsQuery.isFetching
        : isFetching;

  const isInitialLoading =
    activeFilter === 'mine'
      ? myPostsQuery.isLoading
      : activeFilter === 'saved'
        ? savedPostsQuery.isLoading
        : isLoading;

  const activeError =
    activeFilter === 'mine'
      ? myPostsQuery.error && !myPostsQuery.isFetchNextPageError
        ? myPostsQuery.error
        : null
      : activeFilter === 'saved'
        ? savedPostsQuery.error
        : error;

  const handleRefresh = () => {
    void (activeFilter === 'mine'
      ? myPostsQuery.refetch()
      : activeFilter === 'saved'
        ? savedPostsQuery.refetch()
        : refetch());
  };

  const handleTryAgain = () => {
    void (activeFilter === 'mine'
      ? myPostsQuery.refetch()
      : activeFilter === 'saved'
        ? savedPostsQuery.refetch()
        : refetch());
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8f9fb_0%,#f2f4f7_100%)]">
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:py-8">
        {/* ✅ Hero — university-specific copy + stat strip */}
        <div className="relative isolate min-h-[230px] overflow-hidden rounded-3xl bg-[#101827] text-white shadow-lg sm:min-h-[280px]">
          <Image
            src="/camera.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1152px"
            className="object-cover object-[center_44%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101827]/95 via-[#101827]/75 to-[#101827]/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101827]/70 via-transparent to-[#101827]/10" />
          <div className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-white/10 sm:inset-4" />
          <div className="relative flex min-h-[230px] flex-col justify-end gap-5 px-6 py-6 sm:min-h-[280px] sm:flex-row sm:items-end sm:justify-between sm:px-9 sm:py-8">
            <div className="max-w-2xl">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E6C779]">
                {currentUser?.techCenter?.name ?? 'University'} · Community Gallery
              </p>
              <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Where our community{' '}
                <span className="text-[#E6C779]">shines.</span>
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-5 text-white/80">
                Share research, events, projects, and campus moments. Approved
                posts appear in the university-wide feed.
              </p>
              {!isInitialLoading && items.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-5 text-sm">
                  <div>
                    <span className="text-2xl font-bold tabular-nums text-white">
                      {items.length}
                    </span>{' '}
                    <span className="text-white/70">posts</span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold tabular-nums text-white">
                      {photos.length}
                    </span>{' '}
                    <span className="text-white/70">photos</span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold tabular-nums text-white">
                      {videos.length}
                    </span>{' '}
                    <span className="text-white/70">videos</span>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsCreatePostModalOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#E6C779] px-4 py-2.5 text-sm font-bold text-[#172033] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#F0D88F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              Create a post
            </button>
          </div>
        </div>

        {postUploadNotice && (
          <div
            role="status"
            className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <p className="flex-1">{postUploadNotice}</p>
            <button
              type="button"
              onClick={() => setPostUploadNotice(null)}
              aria-label="Dismiss post upload message"
              className="rounded p-1 text-emerald-800 hover:bg-emerald-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-7 min-w-0">
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#92713A]">
                  Selfless community
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-[#172033]">
                  {activeFilter === 'mine'
                    ? 'My posts'
                    : activeFilter === 'saved'
                      ? 'Saved posts'
                      : 'Community feed'}
                </h2>
                <p className="mt-1 text-xs text-[#687386]">
                  {activeFilter === 'mine'
                    ? `${visibleCount} ${visibleCount === 1 ? 'post' : 'posts'} shared by you`
                    : `${visibleCount} ${visibleCount === 1 ? 'post' : 'posts'} from across the community`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                aria-busy={isRefreshing}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E1E5EB] bg-white text-[#526078] shadow-sm transition hover:border-[#C8D0DB] hover:bg-[#F3F5F8] hover:text-[#172033] disabled:cursor-wait disabled:opacity-60"
                aria-label="Refresh posts"
                title="Refresh posts"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
              </button>
            </div>

            {/* ✅ Filter pills — horizontal scroll on mobile instead of 3-col wrap */}
            <div
              aria-label="Filter posts"
              className="mb-5 flex w-full gap-1 overflow-x-auto rounded-2xl border border-[#E5E8ED] bg-white p-1 shadow-sm sm:rounded-full"
              role="group"
            >
              {(
                [
                  ['all', 'All'],
                  ['photos', 'Photos'],
                  ['videos', 'Videos'],
                  ['mine', 'My posts'],
                  ['saved', 'Saved'],
                ] as const
              ).map(([filter, label]) => (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition sm:flex-1 sm:rounded-full ${
                    activeFilter === filter
                      ? 'bg-[#1A2B4C] text-white shadow-sm'
                      : 'text-[#687386] hover:bg-[#F3F5F8] hover:text-[#172033]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeFilter === 'mine' && (
              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    label: 'All posts',
                    count: visibleCount,
                    color: 'text-[#172033]',
                    surface: 'bg-white',
                  },
                  {
                    label: 'Approved',
                    count: myPostStats.APPROVED,
                    color: 'text-emerald-700',
                    surface: 'bg-emerald-50',
                  },
                  {
                    label: 'Pending',
                    count: myPostStats.PENDING,
                    color: 'text-amber-700',
                    surface: 'bg-amber-50',
                  },
                  {
                    label: 'Rejected',
                    count: myPostStats.REJECTED,
                    color: 'text-red-700',
                    surface: 'bg-red-50',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-2xl border border-[#E7EAF0] px-4 py-3 shadow-sm ${stat.surface}`}
                  >
                    <p className="text-xs font-medium text-[#687386]">
                      {stat.label}
                    </p>
                    <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
                      {myPostsQuery.isLoading ? '—' : stat.count}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* ✅ Skeleton grid on initial load */}
            {isInitialLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <GallerySkeleton key={index} />
                ))}
              </div>
            ) : activeError ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#F1D5D5] bg-white px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1F1] text-[#C53030]">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-[#172033]">
                  We couldn&apos;t load the feed
                </h3>
                <p className="mt-1 text-sm text-[#687386]">
                  Please try again in a moment.
                </p>
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1A2B4C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#263D66]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8DEE8] bg-white px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2F4F7] text-[#526078]">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#172033]">
                  {activeFilter === 'mine'
                    ? 'You haven\u2019t shared any posts yet'
                    : activeFilter === 'saved'
                      ? 'No saved posts yet'
                      : activeFilter === 'all'
                        ? 'Your feed starts here'
                        : `No ${activeFilter} to show`}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#687386]">
                  {activeFilter === 'mine'
                    ? 'Posts you share will appear here with their review status.'
                    : activeFilter === 'saved'
                      ? 'Posts you save will be collected here for easy access.'
                      : activeFilter === 'all'
                        ? 'Share a photo or video to bring the latest moments from your community to life.'
                        : 'Try another feed filter to see more posts.'}
                </p>
                {(activeFilter === 'mine' || activeFilter === 'all') && (
                  <button
                    type="button"
                    onClick={() => setIsCreatePostModalOpen(true)}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1A2B4C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#263D66]"
                  >
                    <Plus className="h-4 w-4" />
                    Create a post
                  </button>
                )}
                {activeFilter !== 'all' && activeFilter !== 'mine' && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className="mt-4 text-sm font-semibold text-[#1A2B4C] hover:underline"
                  >
                    Show all posts
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* ✅ 1 column on small screens, 2 columns on larger screens */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  {visibleItems.map((item) => {
                    const isVideo = item.contentType.startsWith('video/');
                    const authorId = item.user?.id;
                    const isOwnPost =
                      Boolean(currentUser) && authorId === currentUser?.id;
                    const displayDate =
                      activeFilter === 'mine' &&
                      item.approvalStatus === 'APPROVED' &&
                      item.approvedAt
                        ? item.approvedAt
                        : item.createdAt;

                    return (
                      <article
                        key={item.id}
                        className="overflow-hidden rounded-2xl border border-[#E4E8EF] bg-white shadow-[0_4px_16px_rgba(16,24,40,0.06)]"
                      >
                        <div className="relative aspect-square w-full overflow-hidden bg-[#101827]">
                          {isVideo ? (
                            <div className="relative h-full w-full">
                              <video
                                ref={(el) => {
                                  if (el) videoRefs.current[item.id] = el;
                                }}
                                src={item.publicUrl}
                                playsInline
                                preload="metadata"
                                className="h-full w-full object-cover"
                                onLoadedMetadata={(event) =>
                                  updateVideoControls(item.id, {
                                    duration: event.currentTarget.duration,
                                    isMuted: event.currentTarget.muted,
                                  })
                                }
                                onTimeUpdate={(event) =>
                                  updateVideoControls(item.id, {
                                    currentTime: event.currentTarget.currentTime,
                                  })
                                }
                                onVolumeChange={(event) =>
                                  updateVideoControls(item.id, {
                                    isMuted: event.currentTarget.muted,
                                  })
                                }
                                onPlay={() => {
                                  handleVideoPlay(item.id);
                                  updateVideoControls(item.id, { isPlaying: true });
                                }}
                                onPause={() =>
                                  updateVideoControls(item.id, { isPlaying: false })
                                }
                              />
                              {/* ✅ Video badge */}
                              <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur">
                                <Play className="h-2.5 w-2.5 fill-current" /> Video
                              </span>
                              {item.description && (
                                <div className="absolute inset-x-0 bottom-0 p-3 pt-16">
                                  <p className="line-clamp-3 text-xs leading-5 text-white drop-shadow-md">
                                    {item.description}
                                  </p>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => openFullscreenMedia(item)}
                                aria-label={`View ${item.title || 'video'} fullscreen`}
                                title="View fullscreen"
                                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-black/55 text-white shadow-sm backdrop-blur-sm transition hover:scale-105 hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                              >
                                <Maximize2 className="h-3.5 w-3.5" />
                              </button>
                              {(() => {
                                const state = videoControls[item.id] ?? {
                                  currentTime: 0,
                                  duration: 0,
                                  isMuted: false,
                                  isPlaying: false,
                                };
                                return (
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-2 pb-2 pt-8">
                                    <div className="flex items-center gap-2 text-white">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const video = videoRefs.current[item.id];
                                          if (!video) return;
                                          if (video.paused) {
                                            void video.play().catch(() => {
                                              updateVideoControls(item.id, {
                                                isPlaying: false,
                                              });
                                            });
                                          } else {
                                            video.pause();
                                          }
                                        }}
                                        aria-label={
                                          state.isPlaying ? 'Pause video' : 'Play video'
                                        }
                                        title={state.isPlaying ? 'Pause' : 'Play'}
                                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                      >
                                        {state.isPlaying ? (
                                          <Pause className="h-3 w-3" />
                                        ) : (
                                          <Play className="h-3 w-3 fill-current" />
                                        )}
                                      </button>
                                      <span className="min-w-0 flex-1 whitespace-nowrap text-[10px] font-medium tabular-nums text-white/90">
                                        {formatVideoTime(state.currentTime)} /{' '}
                                        {formatVideoTime(state.duration)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => toggleVideoMute(item.id)}
                                        aria-label={
                                          state.isMuted ? 'Unmute video' : 'Mute video'
                                        }
                                        title={state.isMuted ? 'Unmute' : 'Mute'}
                                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                      >
                                        {state.isMuted ? (
                                          <VolumeX className="h-3 w-3" />
                                        ) : (
                                          <Volume2 className="h-3 w-3" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            <div className="relative h-full w-full">
                              <Image
                                src={item.publicUrl}
                                alt={item.title}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover"
                              />
                              {item.description && (
                                <div className="absolute inset-x-0 bottom-0 p-3">
                                  <p className="line-clamp-3 text-xs leading-5 text-white drop-shadow-md">
                                    {item.description}
                                  </p>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => openFullscreenMedia(item)}
                                aria-label={`View ${item.title || 'photo'} fullscreen`}
                                title="View fullscreen"
                                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-black/55 text-white shadow-sm backdrop-blur-sm transition hover:scale-105 hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                              >
                                <Maximize2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 border-t border-[#F0F2F5] px-2.5 py-1.5">
                          {item.user?.id ? (
                            <div className="relative shrink-0">
                              <div className="rounded-full">
                                {item.user.profileImageUrl ? (
                                  <Image
                                    src={item.user.profileImageUrl}
                                    alt={`${item.user.firstName} ${item.user.lastName}`}
                                    width={28}
                                    height={28}
                                    className="h-7 w-7 rounded-full object-cover ring-1 ring-[#F1F3F6]"
                                  />
                                ) : (
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8ECF3] text-xs font-bold text-[#1A2B4C] ring-1 ring-[#F1F3F6]">
                                    {item.user.firstName[0]}
                                    {item.user.lastName[0]}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8ECF3] text-xs font-bold text-[#1A2B4C] ring-1 ring-[#F1F3F6]">
                              U
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-xs font-semibold text-[#172033]">
                              {item.user?.id ? (
                                <Link
                                  href={`/dashboard/students/${item.user.id}`}
                                  className="rounded-sm transition hover:text-[#1A2B4C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C]"
                                >
                                  {item.user.firstName} {item.user.lastName}
                                </Link>
                              ) : (
                                'Selfless community'
                              )}
                            </h3>
                            <p className="truncate text-[10px] text-[#7A8495]">
                              {item.user?.techCenter?.name} ·{' '}
                              {new Date(displayDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          {isOwnPost && item.approvalStatus !== 'APPROVED' && (
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                                item.approvalStatus === 'REJECTED'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {item.approvalStatus === 'REJECTED'
                                ? 'Rejected'
                                : 'Pending'}
                            </span>
                          )}
                          {activeFilter === 'mine' && isOwnPost && (
                            <div className="relative shrink-0" data-post-menu>
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenPostMenuId((openId) =>
                                    openId === item.id ? null : item.id,
                                  )
                                }
                                aria-label="Post options"
                                aria-haspopup="menu"
                                aria-expanded={openPostMenuId === item.id}
                                title="Post options"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#687386] transition hover:bg-[#F1F3F6] hover:text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C]"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {openPostMenuId === item.id && (
                                <div
                                  role="menu"
                                  className="absolute right-0 top-full z-20 mt-1 min-w-32 rounded-xl border border-[#E1E5EB] bg-white p-1 shadow-lg"
                                >
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                      setOpenPostMenuId(null);
                                      setConfirmDelete({
                                        id: item.id,
                                        title: item.title,
                                      });
                                    }}
                                    disabled={deletingPostId === item.id}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                                  >
                                    {deletingPostId === item.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {deletePostError?.id === item.id && (
                          <p role="alert" className="px-3 pb-2 text-[10px] text-red-600">
                            {deletePostError.message}
                          </p>
                        )}

                        {item.title && (
                          <div className="px-2.5 pb-1">
                            <h4 className="line-clamp-2 text-sm font-bold leading-snug text-[#172033]">
                              {item.title}
                            </h4>
                          </div>
                        )}

                        {currentUser && item.approvalStatus === 'APPROVED' && (
                          <MediaPostInteractions
                            mediaId={item.id}
                            currentUser={{
                              id: currentUser.id,
                              firstName: currentUser.firstName,
                              lastName: currentUser.lastName,
                              profileImageUrl: currentUser.profileImageUrl,
                            }}
                          />
                        )}
                      </article>
                    );
                  })}
                </div>

                {/* ✅ Pagination moved OUTSIDE the grid */}
                {activeFilter === 'mine' && myPostsQuery.hasNextPage && (
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <p className="text-xs text-[#8A93A2]">
                      Showing {myPosts.length} of {visibleCount} posts
                    </p>
                    <button
                      type="button"
                      onClick={() => void myPostsQuery.fetchNextPage()}
                      disabled={myPostsQuery.isFetchingNextPage}
                      className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl border border-[#D9E0EA] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A2B4C] shadow-sm transition hover:border-[#B9C5D5] hover:bg-[#F7F9FC] disabled:cursor-wait disabled:opacity-60"
                    >
                      {myPostsQuery.isFetchingNextPage ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading posts...
                        </>
                      ) : (
                        'Load 10 more posts'
                      )}
                    </button>
                    {myPostsQuery.isFetchNextPageError && (
                      <p role="alert" className="text-xs text-red-600">
                        Could not load more posts. Try again.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="mt-8 lg:hidden">
            <div className="overflow-hidden rounded-2xl border border-[#E7EAF0] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold tracking-tight text-[#172033]">
                Community growth
              </h2>

              <div
                className="mt-4"
                role="img"
                aria-label={`Community post growth over the last seven days. ${communityGrowth.points
                  .map((point) => `${point.label}: ${point.count} posts`)
                  .join(', ')}`}
              >
                <svg
                  viewBox="0 0 280 128"
                  className="h-32 w-full overflow-visible"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="community-growth-fill"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#C59B4C" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#C59B4C" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2].map((line) => (
                    <line
                      key={line}
                      x1="10"
                      x2="270"
                      y1={14 + line * 38}
                      y2={14 + line * 38}
                      stroke="#E9EDF2"
                      strokeDasharray="3 5"
                    />
                  ))}
                  {communityGrowth.points.map((point, index) => {
                    const x = 14 + index * (252 / 6);
                    const barHeight =
                      (point.count / communityGrowth.maximumDaily) * 62;
                    return (
                      <rect
                        key={point.key}
                        x={x - 7}
                        y={90 - barHeight}
                        width="14"
                        height={barHeight}
                        rx="5"
                        fill="#DCE3ED"
                      />
                    );
                  })}
                  <polygon
                    points={[
                      '14,90',
                      ...communityGrowth.points.map((point, index) => {
                        const x = 14 + index * (252 / 6);
                        const y =
                          12 +
                          62 *
                            (1 -
                              point.cumulative /
                                communityGrowth.maximumCumulative);
                        return `${x},${y}`;
                      }),
                      '266,90',
                    ].join(' ')}
                    fill="url(#community-growth-fill)"
                  />
                  <polyline
                    points={communityGrowth.points
                      .map((point, index) => {
                        const x = 14 + index * (252 / 6);
                        const y =
                          12 +
                          62 *
                            (1 -
                              point.cumulative /
                                communityGrowth.maximumCumulative);
                        return `${x},${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#B98A3E"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                  />
                  {communityGrowth.points.map((point, index) => {
                    const x = 14 + index * (252 / 6);
                    const y =
                      12 +
                      62 *
                        (1 - point.cumulative / communityGrowth.maximumCumulative);
                    return (
                      <circle
                        key={point.key}
                        cx={x}
                        cy={y}
                        r="3"
                        fill="white"
                        stroke="#B98A3E"
                        strokeWidth="2"
                      />
                    );
                  })}
                  {communityGrowth.points.map((point, index) => (
                    <text
                      key={point.key}
                      x={14 + index * (252 / 6)}
                      y="115"
                      textAnchor="middle"
                      className="fill-[#8791A1] text-[9px] font-medium"
                    >
                      {point.label}
                    </text>
                  ))}
                </svg>
              </div>

              <div className="mt-3 flex items-center gap-4 text-[10px] font-medium text-[#687386]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-[#DCE3ED]" />
                  Daily posts
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-3 rounded bg-[#B98A3E]" />
                  Growth
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#EEF0F4] pt-4">
                <div>
                  <p className="text-[10px] font-medium text-[#7A8495]">Posts</p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-[#172033]">
                    {items.length}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-[#7A8495]">Photos</p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-[#172033]">
                    {photos.length}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-[#7A8495]">Videos</p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-[#172033]">
                    {videos.length}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ✅ Confirmation dialog replaces window.confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <h3
              id="confirm-delete-title"
              className="mt-4 text-lg font-semibold text-[#172033]"
            >
              Delete this post?
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#687386]">
              &ldquo;{confirmDelete.title || 'Untitled post'}&rdquo; and all of
              its comments and replies will be permanently deleted. This cannot
              be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border border-[#D9E0EA] bg-white px-4 py-2.5 text-sm font-semibold text-[#1A2B4C] transition hover:bg-[#F7F9FC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = confirmDelete.id;
                  setConfirmDelete(null);
                  void handleDeletePost(id);
                }}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen media viewer */}
      {fullscreenMedia && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={fullscreenMedia.title || 'Fullscreen community media'}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeFullscreenMedia();
          }}
        >
          <button
            type="button"
            onClick={closeFullscreenMedia}
            className="absolute right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close fullscreen media"
          >
            <X className="h-6 w-6" />
          </button>

          {fullscreenMedia.contentType.startsWith('video/') ? (
            <video
              key={fullscreenMedia.id}
              src={fullscreenMedia.publicUrl}
              autoPlay
              controls
              playsInline
              preload="auto"
              aria-label={fullscreenMedia.title || 'Community video'}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="relative h-full w-full">
              <Image
                src={fullscreenMedia.publicUrl}
                alt={fullscreenMedia.title || 'Community photo'}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          )}
        </div>
      )}

      {/* Create Post Modal */}
      {isCreatePostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-post-title"
            className="w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
            style={{ maxHeight: '90vh' }}
          >
            <div className="flex items-center justify-between border-b border-[#E4E6EB] p-4">
              <h3
                id="create-post-title"
                className="text-lg font-semibold text-[#1C1E21]"
              >
                Create Post
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatePostModalOpen(false)}
                aria-label="Close create post dialog"
                className="rounded p-1 text-[#65676B] transition hover:bg-[#F1F3F6] hover:text-[#1C1E21]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <AzureMediaUpload
                label="Drop files here, or click to browse"
                accept="image/*,video/*"
                defaultCategory="gallery"
                showFormWhenEmpty
                submitLabel="Share post"
                allowAudio={false}
                allowMultiple={currentUser?.role === 'dev'}
                onAllUploadsComplete={handleUploadsComplete}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}