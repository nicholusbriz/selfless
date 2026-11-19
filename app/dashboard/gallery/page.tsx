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
import { useMediaInteractionsPrefetch } from '@/lib/hooks/useMediaInteractionsPrefetch';
import VerifiedBadge from '@/components/VerifiedBadge';

/* ─────────────────────────────────────────────────────────────────────────────
   Types + guards
   ───────────────────────────────────────────────────────────────────────────── */

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
    hasVerifiedBadge?: boolean;
    techCenter?: { id: string; name: string } | null;
  } | null;
}

interface VideoControlsState {
  currentTime: number;
  duration: number;
  isMuted: boolean;
  isPlaying: boolean;
}

interface MediaPage {
  items: MediaItem[];
  hasMore: boolean;
  totalCount: number;
  statusCounts?: { APPROVED: number; PENDING: number; REJECTED: number };
}

function formatVideoTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
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

/* ─────────────────────────────────────────────────────────────────────────────
   Skeletons
   ───────────────────────────────────────────────────────────────────────────── */

function FeaturedPlayerSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
      <div className="aspect-video w-full animate-pulse bg-[#f1f5f9]" />
      <div className="space-y-2 border-t border-[#e2e8f0] p-3">
        <div className="h-3 w-3/4 animate-pulse rounded bg-[#f1f5f9]" />
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-[#f1f5f9]" />
      </div>
    </div>
  );
}

function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
      <div className="aspect-video w-full animate-pulse bg-[#f1f5f9]" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#f1f5f9]" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-[#f1f5f9]" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────────────────────── */

export default function GalleryPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<
    'all' | 'photos' | 'videos' | 'mine' | 'saved'
  >('all');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deletePostError, setDeletePostError] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [fullscreenMedia, setFullscreenMedia] = useState<MediaItem | null>(null);
  const [videoControls, setVideoControls] = useState<
    Record<string, VideoControlsState>
  >({});
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [postUploadNotice, setPostUploadNotice] = useState<string | null>(null);
  const [featuredVideoSelection, setFeaturedVideoSelection] = useState<{
    filter: 'all' | 'photos' | 'videos' | 'mine' | 'saved';
    id: string;
  } | null>(null);

  const featuredVideoRef = useRef<HTMLVideoElement | null>(null);
  const featuredSoundEnabledRef = useRef(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  /* ────────────── Queries ────────────── */

  const {
    data: items = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<MediaItem[]>({
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
      const params = new URLSearchParams({
        category: 'gallery',
        mine: 'true',
        limit: '10',
        offset: String(pageParam),
      });
      const response = await fetch(`/api/media/list?${params.toString()}`);
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

  /* ────────────── Derived data ────────────── */

  const myPosts = useMemo(
    () => myPostsQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [myPostsQuery.data?.pages],
  );
  const savedPosts = useMemo(() => savedPostsQuery.data ?? [], [savedPostsQuery.data]);

  const photos = useMemo(
    () => items.filter((i) => i.contentType.startsWith('image/')),
    [items],
  );
  const videos = useMemo(
    () => items.filter((i) => i.contentType.startsWith('video/')),
    [items],
  );

  const sourceItems =
    activeFilter === 'mine'
      ? myPosts
      : activeFilter === 'saved'
        ? savedPosts
        : activeFilter === 'photos'
          ? photos
          : activeFilter === 'videos'
            ? videos
            : items;

  const sourceVideos = useMemo(
    () => sourceItems.filter((i) => i.contentType.startsWith('video/')),
    [sourceItems],
  );

  const playlistVideos = useMemo(
    () =>
      [...sourceVideos].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [sourceVideos],
  );

  const featuredVideo =
    playlistVideos.find(
      (v) =>
        featuredVideoSelection?.filter === activeFilter &&
        v.id === featuredVideoSelection.id,
    ) ??
    playlistVideos[0] ??
    null;

  const visibleItems = useMemo(() => {
    const base =
      activeFilter === 'mine'
        ? myPosts
        : activeFilter === 'saved'
          ? savedPosts
          : activeFilter === 'photos'
            ? photos
            : activeFilter === 'videos'
              ? videos
              : items;
    if (!featuredVideo) return base;
    return base.filter((i) => i.id !== featuredVideo.id);
  }, [activeFilter, myPosts, savedPosts, photos, videos, items, featuredVideo]);

  useMediaInteractionsPrefetch(
    useMemo(() => visibleItems.map((i) => i.id), [visibleItems]),
  );

  const visibleCount =
    activeFilter === 'mine'
      ? myPostsQuery.data?.pages[0]?.totalCount ?? myPosts.length
      : activeFilter === 'saved'
        ? savedPosts.length
        : activeFilter === 'photos'
          ? photos.length
          : activeFilter === 'videos'
            ? videos.length
            : items.length;

  const myPostStats =
    myPostsQuery.data?.pages[0]?.statusCounts ??
    myPosts.reduce(
      (s, i) => {
        s[i.approvalStatus] += 1;
        return s;
      },
      { APPROVED: 0, PENDING: 0, REJECTED: 0 },
    );

  /* ────────────── Effects ────────────── */

  useEffect(() => {
    if (!openPostMenuId) return;
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t && !t.closest('[data-post-menu]')) setOpenPostMenuId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenPostMenuId(null);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openPostMenuId]);

  useEffect(() => {
    if (!fullscreenMedia) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenMedia(null);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [fullscreenMedia]);

  useEffect(() => {
    return () => {
      videoRefs.current = {};
    };
  }, []);

  useEffect(() => {
    const video = featuredVideoRef.current;
    if (!video) return;
    video.muted = !featuredSoundEnabledRef.current;
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => {});
    });
  }, [featuredVideo?.id]);

  /* ────────────── Handlers ────────────── */

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
      const removePost = (prev: MediaItem[] | undefined) =>
        prev?.filter((i) => i.id !== mediaId);
      queryClient.setQueryData<MediaItem[]>(['gallery-media'], removePost);
      queryClient.setQueryData<InfiniteData<MediaPage>>(
        ['gallery-my-posts', currentUser?.id],
        (prev) =>
          prev
            ? {
                ...prev,
                pages: prev.pages.map((p) => ({
                  ...p,
                  items: p.items.filter((i) => i.id !== mediaId),
                  totalCount: Math.max(0, p.totalCount - 1),
                })),
              }
            : prev,
      );
      queryClient.setQueryData<MediaItem[]>(
        ['gallery-saved-posts', currentUser?.id],
        removePost,
      );
      setFullscreenMedia((prev) => (prev?.id === mediaId ? null : prev));
      void queryClient.invalidateQueries({ queryKey: ['gallery-post-count'] });
      void queryClient.invalidateQueries({
        queryKey: ['gallery-my-posts', currentUser?.id],
      });
    } catch (err) {
      setDeletePostError({
        id: mediaId,
        message: err instanceof Error ? err.message : 'Could not delete post',
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

  const updateVideoControls = useCallback(
    (videoId: string, patch: Partial<VideoControlsState>) => {
      setVideoControls((curr) => ({
        ...curr,
        [videoId]: {
          ...(curr[videoId] ?? {
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
    Object.values(videoRefs.current).forEach((v) => v?.pause());
    setFullscreenMedia(item);
  }, []);

  const handleVideoPlay = (videoId: string) => {
    Object.entries(videoRefs.current).forEach(([id, v]) => {
      if (id !== videoId && v) v.pause();
    });
  };

  const toggleVideoPlayback = (videoId: string) => {
    const v = videoRefs.current[videoId];
    if (!v) return;
    if (v.paused) {
      handleVideoPlay(videoId);
      void v.play().catch(() => updateVideoControls(videoId, { isPlaying: false }));
    } else {
      v.pause();
    }
  };

  const selectFeaturedVideo = useCallback(
    (video: MediaItem) => {
      featuredSoundEnabledRef.current = true;
      setFeaturedVideoSelection({ filter: activeFilter, id: video.id });
    },
    [activeFilter],
  );

  /* ────────────── Flags ────────────── */

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

  const statCards = [
    {
      label: 'Total posts',
      value: visibleCount,
      icon: ImageIcon,
      tone: 'bg-white text-[#0f172a] border-[#e2e8f0]',
      accent: 'text-[#0f172a]',
    },
    {
      label: 'Live in feed',
      value: myPostStats.APPROVED,
      icon: CheckCircle2,
      tone: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      accent: 'text-emerald-700',
    },
    {
      label: 'In review',
      value: myPostStats.PENDING,
      icon: Loader2,
      tone: 'bg-amber-50 text-amber-800 border-amber-200',
      accent: 'text-amber-700',
    },
    {
      label: 'Needs changes',
      value: myPostStats.REJECTED,
      icon: AlertCircle,
      tone: 'bg-red-50 text-red-800 border-red-200',
      accent: 'text-red-700',
    },
  ];

  /* ────────────── Render ────────────── */

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <div className="mx-auto w-full max-w-[1500px] px-3 pt-12 pb-3 sm:px-4 lg:px-6">
        {/* Title */}
        <div className="mb-5 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a365d] text-white">
              <ImageIcon className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          </div>
          <p className="text-sm text-[#64748b]">
            Photos, videos, and updates from your community.
          </p>
        </div>

        {/* Header row */}
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="group"
            aria-label="Filter posts"
            className="flex gap-1.5 overflow-x-auto rounded-full border border-[#e2e8f0] bg-white p-1.5 shadow-sm"
          >
            {(
              [
                ['all', 'All'],
                ['photos', 'Photos'],
                ['videos', 'Videos'],
                ['mine', 'My posts'],
                ['saved', 'Saved'],
              ] as const
            ).map(([f, label]) => (
              <button
                key={f}
                type="button"
                aria-pressed={activeFilter === f}
                onClick={() => setActiveFilter(f)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  activeFilter === f
                    ? 'bg-[#1a365d] text-white shadow-sm'
                    : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-busy={isRefreshing}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#334155] transition hover:bg-[#f8fafc] disabled:opacity-60"
              aria-label="Refresh posts"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsCreatePostModalOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1a365d] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#14294a] active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              Create post
            </button>
          </div>
        </header>

        {postUploadNotice && (
          <div
            role="status"
            className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-900"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <p className="flex-1">{postUploadNotice}</p>
            <button
              type="button"
              onClick={() => setPostUploadNotice(null)}
              aria-label="Dismiss message"
              className="rounded p-0.5 text-emerald-800 hover:bg-emerald-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {activeFilter === 'mine' && (
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {myPostsQuery.isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[68px] animate-pulse rounded-xl border border-[#e2e8f0] bg-[#f1f5f9]"
                  />
                ))
              : statCards.map(({ label, value, icon: Icon, tone, accent }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 ${tone}`}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-70" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium opacity-70">{label}</p>
                      <p className={`text-lg font-bold tabular-nums leading-tight ${accent}`}>
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
          </div>
        )}

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* Keep the player, playlist, and feed in one responsive grid. */}
          <div className="contents lg:block">
            <div className="order-1 min-w-0 lg:order-none">
            {isInitialLoading ? (
              <FeaturedPlayerSkeleton />
            ) : featuredVideo ? (
              <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
                <div className="relative aspect-video w-full bg-black">
                  <video
                    key={featuredVideo.id}
                    ref={featuredVideoRef}
                    src={featuredVideo.publicUrl}
                    controls
                    playsInline
                    preload="metadata"
                    poster={featuredVideo.publicUrl}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="border-t border-[#e2e8f0] px-3 py-2.5">
                  <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-medium text-[#1a365d]">
                    <Play className="h-3 w-3" />
                    {activeFilter === 'mine' ? 'Your video' : 'Featured video'}
                  </div>
                  <h2 className="line-clamp-1 text-sm font-semibold leading-5">
                    {featuredVideo.title || 'Untitled video'}
                  </h2>
                  {featuredVideo.user && (
                    <p className="mt-0.5 truncate text-[11px] text-[#64748b]">
                      {featuredVideo.user.firstName} {featuredVideo.user.lastName}
                      {featuredVideo.user.techCenter?.name &&
                        ` · ${featuredVideo.user.techCenter.name}`}
                    </p>
                  )}
                </div>
                {currentUser && featuredVideo.approvalStatus === 'APPROVED' && (
                  <MediaPostInteractions
                    mediaId={featuredVideo.id}
                    currentUser={{
                      id: currentUser.id,
                      firstName: currentUser.firstName,
                      lastName: currentUser.lastName,
                      profileImageUrl: currentUser.profileImageUrl,
                    }}
                  />
                )}
              </div>
            ) : null}
            </div>

            <div className="order-3 min-w-0 lg:order-none">
            {/* Feed header */}
            <div className="mt-4 mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#0f172a]">
                  {activeFilter === 'mine'
                    ? 'My posts'
                    : activeFilter === 'saved'
                      ? 'Saved posts'
                      : activeFilter === 'photos'
                        ? 'Photos'
                        : activeFilter === 'videos'
                          ? 'Videos'
                          : 'Community feed'}
                </h2>
                <p className="mt-0.5 text-xs text-[#64748b]">
                  {visibleCount} {visibleCount === 1 ? 'post' : 'posts'}
                </p>
              </div>
            </div>

            {/* Feed */}
            {isInitialLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            ) : activeError ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-red-100 bg-white px-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">Could not load posts</h3>
                <p className="mt-1 text-xs text-[#64748b]">Please try again.</p>
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#1a365d] px-3 text-xs font-semibold text-white hover:bg-[#14294a]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try again
                </button>
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd5e1] bg-white px-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#334155]">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">
                  {activeFilter === 'mine'
                    ? 'Your gallery is empty'
                    : activeFilter === 'saved'
                      ? 'No saved posts'
                      : activeFilter === 'all'
                        ? 'Your feed starts here'
                        : `No ${activeFilter} to show`}
                </h3>
                <p className="mt-1 max-w-sm text-xs leading-5 text-[#64748b]">
                  {activeFilter === 'mine'
                    ? 'Share your first photo or video.'
                    : activeFilter === 'saved'
                      ? 'Posts you save appear here.'
                      : activeFilter === 'all'
                        ? 'Share a photo or video to bring your community feed to life.'
                        : 'Try another filter.'}
                </p>
                {activeFilter === 'mine' ? (
                  <button
                    type="button"
                    onClick={() => setIsCreatePostModalOpen(true)}
                    className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#1a365d] px-3 text-xs font-semibold text-white hover:bg-[#14294a]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create your first post
                  </button>
                ) : activeFilter !== 'all' ? (
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className="mt-3 text-xs font-semibold text-[#1a365d] hover:underline"
                  >
                    Show all posts
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                <div className="space-y-4">
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
                    const state = videoControls[item.id] ?? {
                      currentTime: 0,
                      duration: 0,
                      isMuted: false,
                      isPlaying: false,
                    };

                    return (
                      <article
                        key={item.id}
                        className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-[#0f172a]">
                          {isVideo ? (
                            <div className="relative h-full w-full">
                              <video
                                ref={(el) => {
                                  if (el) videoRefs.current[item.id] = el;
                                }}
                                src={item.publicUrl}
                                playsInline
                                preload="metadata"
                                onClick={() => toggleVideoPlayback(item.id)}
                                className="h-full w-full cursor-pointer object-contain"
                                onLoadedMetadata={(e) =>
                                  updateVideoControls(item.id, {
                                    duration: e.currentTarget.duration,
                                    isMuted: e.currentTarget.muted,
                                  })
                                }
                                onTimeUpdate={(e) =>
                                  updateVideoControls(item.id, {
                                    currentTime: e.currentTarget.currentTime,
                                  })
                                }
                                onVolumeChange={(e) =>
                                  updateVideoControls(item.id, {
                                    isMuted: e.currentTarget.muted,
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
                              {!state.isPlaying && (
                                <button
                                  type="button"
                                  onClick={() => toggleVideoPlayback(item.id)}
                                  aria-label={`Play ${item.title || 'video'}`}
                                  className="absolute inset-0 flex items-center justify-center"
                                >
                                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-black/60">
                                    <Play className="ml-1 h-6 w-6 fill-current" />
                                  </span>
                                </button>
                              )}

                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-2 pb-2 pt-8">
                                <div className="flex items-center gap-2 text-white">
                                  <button
                                    type="button"
                                    onClick={() => toggleVideoPlayback(item.id)}
                                    aria-label={state.isPlaying ? 'Pause' : 'Play'}
                                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
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
                                    aria-label={state.isMuted ? 'Unmute' : 'Mute'}
                                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
                                  >
                                    {state.isMuted ? (
                                      <VolumeX className="h-3 w-3" />
                                    ) : (
                                      <Volume2 className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative h-full w-full">
                              <Image
                                src={item.publicUrl}
                                alt={item.title}
                                fill
                                sizes="(max-width: 1024px) 100vw, 60vw"
                                className="object-contain"
                              />

                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2.5">
                          {item.user?.id ? (
                            item.user.profileImageUrl ? (
                              <Image
                                src={item.user.profileImageUrl}
                                alt={`${item.user.firstName} ${item.user.lastName}`}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full object-cover ring-1 ring-[#e2e8f0]"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2f8] text-xs font-bold text-[#1a365d] ring-1 ring-[#e2e8f0]">
                                {item.user.firstName[0]}
                                {item.user.lastName[0]}
                              </div>
                            )
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2f8] text-xs font-bold text-[#1a365d]">
                              U
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="flex items-center gap-1 truncate text-sm font-semibold">
                              {item.user?.id ? (
                                <Link
                                  href={`/dashboard/students/${item.user.id}`}
                                  className="truncate hover:underline"
                                >
                                  {item.user.firstName} {item.user.lastName}
                                </Link>
                              ) : (
                                <span className="truncate">Community</span>
                              )}
                              {item.user?.hasVerifiedBadge && (
                                <VerifiedBadge className="h-3.5 w-3.5 shrink-0" />
                              )}
                            </h3>
                            <p className="truncate text-[11px] text-[#64748b]">
                              {item.user?.techCenter?.name} ·{' '}
                              {new Date(displayDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          {isOwnPost && item.approvalStatus !== 'APPROVED' && (
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                item.approvalStatus === 'REJECTED'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {item.approvalStatus === 'REJECTED' ? 'Rejected' : 'Pending'}
                            </span>
                          )}
                          {activeFilter === 'mine' && isOwnPost && (
                            <div className="relative shrink-0" data-post-menu>
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenPostMenuId((o) =>
                                    o === item.id ? null : item.id,
                                  )
                                }
                                aria-label="Post options"
                                aria-haspopup="menu"
                                aria-expanded={openPostMenuId === item.id}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {openPostMenuId === item.id && (
                                <div
                                  role="menu"
                                  className="absolute right-0 top-full z-20 mt-1 min-w-32 rounded-lg border border-[#e2e8f0] bg-white p-1 shadow-lg"
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
                                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
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
                          <p role="alert" className="px-3 pb-2 text-[11px] text-red-600">
                            {deletePostError.message}
                          </p>
                        )}

                        {item.title && (
                          <div className="px-3 pb-1">
                            <h4 className="line-clamp-2 text-sm font-semibold leading-snug">
                              {item.title}
                            </h4>
                          </div>
                        )}

                        {item.description && (
                          <div className="px-3 pb-2">
                            <p className="line-clamp-3 text-xs leading-5 text-[#64748b]">
                              {item.description}
                            </p>
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

                {activeFilter === 'mine' && myPostsQuery.hasNextPage && (
                  <div className="mt-4 flex flex-col items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => void myPostsQuery.fetchNextPage()}
                      disabled={myPostsQuery.isFetchingNextPage}
                      className="inline-flex h-9 min-w-36 items-center justify-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-4 text-xs font-semibold text-[#1a365d] transition hover:bg-[#f8fafc] disabled:opacity-60"
                    >
                      {myPostsQuery.isFetchingNextPage ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load more'
                      )}
                    </button>
                    {myPostsQuery.isFetchNextPageError && (
                      <p role="alert" className="text-[11px] text-red-600">
                        Could not load more. Try again.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
            </div>
          </div>

          {/* Playlist follows the featured video on mobile and sits beside it on desktop. */}
          <aside className="order-2 min-w-0 lg:order-none">
            <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white lg:sticky lg:top-16">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] px-3 py-2.5">
                <h2 className="text-sm font-semibold">
                  {activeFilter === 'mine' ? 'Your videos' : 'Up next'}
                </h2>
                <span className="text-[11px] text-[#64748b]">
                  {playlistVideos.length} videos
                </span>
              </div>

              <div
                className="max-h-72 space-y-1 overflow-y-auto p-2 lg:max-h-[calc(100vh-120px)]"
              >
                {isInitialLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex gap-2.5 rounded-lg p-1.5"
                    >
                      <div className="aspect-video w-28 shrink-0 animate-pulse rounded-md bg-[#f1f5f9]" />
                      <div className="min-w-0 flex-1 space-y-1.5 py-1">
                        <div className="h-3 w-full animate-pulse rounded bg-[#f1f5f9]" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-[#f1f5f9]" />
                      </div>
                    </div>
                  ))
                ) : playlistVideos.length > 0 ? (
                  playlistVideos.map((video) => {
                    const isSelected = featuredVideo?.id === video.id;
                    return (
                      <button
                        key={video.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => selectFeaturedVideo(video)}
                        className={`group flex w-full gap-2 rounded-lg p-1 text-left transition ${
                          isSelected
                            ? 'bg-[#eef2f8] ring-1 ring-[#1a365d]/20'
                            : 'hover:bg-[#f8fafc]'
                        }`}
                      >
                        <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-black">
                          <video
                            src={video.publicUrl}
                            muted
                            playsInline
                            preload="metadata"
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play className="h-4 w-4 fill-white text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 py-0.5">
                          <h3 className="line-clamp-2 text-[12px] font-medium leading-[1.35] lg:text-[13px]">
                            {video.title || 'Untitled video'}
                          </h3>
                          {video.user && (
                            <p className="mt-0.5 truncate text-[9px] leading-tight text-[#64748b] lg:text-[10px]">
                              {video.user.firstName} {video.user.lastName}
                              {video.user.techCenter?.name && (
                                <span className="text-[#94A3B8]"> · {video.user.techCenter.name}</span>
                              )}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="w-full px-3 py-8 text-center text-xs text-[#64748b]">
                    No videos yet.
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <h3 id="confirm-delete-title" className="mt-3 text-base font-semibold">
              Delete this post?
            </h3>
            <p className="mt-1 text-xs leading-5 text-[#64748b]">
              &ldquo;{confirmDelete.title || 'Untitled post'}&rdquo; and all its
              comments will be permanently deleted. This cannot be undone.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-semibold text-[#1a365d] hover:bg-[#f8fafc]"
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
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen */}
      {fullscreenMedia && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={fullscreenMedia.title || 'Fullscreen media'}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3"
          onClick={(e) => {
            if (e.target === e.currentTarget) setFullscreenMedia(null);
          }}
        >
          <button
            type="button"
            onClick={() => setFullscreenMedia(null)}
            className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/65 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {fullscreenMedia.contentType.startsWith('video/') ? (
            <video
              key={fullscreenMedia.id}
              src={fullscreenMedia.publicUrl}
              autoPlay
              controls
              playsInline
              preload="auto"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="relative h-full w-full">
              <Image
                src={fullscreenMedia.publicUrl}
                alt={fullscreenMedia.title || 'Photo'}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          )}
        </div>
      )}

      {/* Create post modal */}
      {isCreatePostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-post-title"
            className="w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
            style={{ maxHeight: '90vh' }}
          >
            <div className="flex items-center justify-between border-b border-[#e2e8f0] p-3">
              <h3 id="create-post-title" className="text-base font-semibold">
                Create post
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatePostModalOpen(false)}
                aria-label="Close"
                className="rounded p-1 text-[#64748b] hover:bg-[#f1f5f9]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-3">
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