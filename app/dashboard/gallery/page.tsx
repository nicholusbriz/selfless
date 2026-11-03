'use client';

import {
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  UserCheck,
  Plus,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  Video,
  CheckCircle2,
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
import { useState, useEffect, useCallback, useRef } from 'react';
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

export default function GalleryPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<'all' | 'photos' | 'videos' | 'mine' | 'saved'>('all');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deletePostError, setDeletePostError] = useState<{ id: string; message: string } | null>(null);
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

  // Check follow status for all users in the feed
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
      const status: FollowStatus = {};

      await Promise.all(
        userIds.map(async (userId) => {
          try {
            const response = await fetch(`/api/social/connections/${userId}`);
            if (response.ok) {
              const data: unknown = await response.json();
              if (isRecord(data) && typeof data.isFollowing === 'boolean') {
                status[userId] = data.isFollowing;
              }
            }
          } catch (error) {
            console.error('Failed to check follow status:', error);
          }
        })
      );

      setFollowStatus((previous) => {
        const merged = { ...status, ...previous };
        for (const userId of pendingFollowIds.current) {
          merged[userId] = true;
        }
        return merged;
      });
    };

    checkFollowStatus();
  }, [currentUser, items]);

  const handleFollow = async (userId: string) => {
    if (!currentUser || pendingFollowIds.current.has(userId)) return;

    pendingFollowIds.current.add(userId);
    setFollowStatus((previous) => ({ ...previous, [userId]: true }));
    setPendingFollows((previous) => ({ ...previous, [userId]: true }));
    setFollowErrors((previous) => ({ ...previous, [userId]: false }));
    try {
      const response = await fetch(`/api/social/follow/${userId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Could not follow this user');
      }
    } catch (error) {
      console.error('Failed to follow:', error);
      setFollowStatus((previous) => ({ ...previous, [userId]: false }));
      setFollowErrors((previous) => ({ ...previous, [userId]: true }));
    } finally {
      pendingFollowIds.current.delete(userId);
      setPendingFollows((previous) => ({ ...previous, [userId]: false }));
    }
  };

  const handleDeletePost = async (mediaId: string) => {
    if (!window.confirm('Delete this post? Its comments and replies will also be deleted.')) {
      return;
    }

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
      setLightboxItems((previous) => previous.filter((item) => item.id !== mediaId));
      setLightboxOpen(false);
      void queryClient.invalidateQueries({
        queryKey: ['gallery-my-posts', currentUser?.id],
      });
    } catch (error) {
      setDeletePostError({
        id: mediaId,
        message: error instanceof Error ? error.message : 'Could not delete post',
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
  const myPostStats = myPostsQuery.data?.pages[0]?.statusCounts ?? myPosts.reduce(
    (stats, item) => {
      stats[item.approvalStatus] += 1;
      return stats;
    },
    { APPROVED: 0, PENDING: 0, REJECTED: 0 },
  );

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxItems, setLightboxItems] = useState<MediaItem[]>([]);

  // Open lightbox with specific item (photos only)
  const openLightbox = useCallback((item: MediaItem, allItems: MediaItem[]) => {
    // Only open lightbox for images, not videos
    if (item.contentType.startsWith('video/')) return;
    setLightboxItems(allItems);
    const index = allItems.findIndex((i) => i.id === item.id);
    setLightboxIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
  }, []);

  // Close lightbox
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  // Navigate to next item
  const nextItem = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % lightboxItems.length);
  }, [lightboxItems.length]);

  // Navigate to previous item
  const prevItem = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + lightboxItems.length) % lightboxItems.length);
  }, [lightboxItems.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextItem();
      if (e.key === 'ArrowLeft') prevItem();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, nextItem, prevItem]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  const currentItem = lightboxItems[lightboxIndex];

  // Store video refs to control playback
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Handle video play - pause all other videos
  const handleVideoPlay = (videoId: string) => {
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (id !== videoId && video) {
        video.pause();
      }
    });
  };

  // Cleanup video refs on unmount
  useEffect(() => {
    return () => {
      videoRefs.current = {};
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#F6F7F9]">
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
        <div className="relative isolate min-h-[230px] overflow-hidden rounded-3xl bg-[#101827] text-white shadow-lg sm:min-h-[260px]">
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
          <div className="relative flex min-h-[230px] flex-col justify-end gap-5 px-6 py-6 sm:min-h-[260px] sm:flex-row sm:items-end sm:justify-between sm:px-9 sm:py-8">
            <div className="max-w-2xl">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E6C779]">
                Selfless · Community stories
              </p>
              <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Your space to <span className="text-[#E6C779]">share.</span>
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-5 text-white/80">
                Showcase your business, share your ideas, post videos, or tell the community what you’re working on.
              </p>
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

        <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#172033]">
                  {activeFilter === 'mine'
                    ? 'My posts'
                    : activeFilter === 'saved'
                      ? 'Saved posts'
                      : 'Community feed'}
                </h2>
                <p className="mt-1 text-sm text-[#687386]">
                  {activeFilter === 'mine'
                    ? `${visibleCount} ${visibleCount === 1 ? 'post' : 'posts'} shared by you`
                    : `${visibleCount} ${visibleCount === 1 ? 'post' : 'posts'} from across the community`}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div
                  aria-label="Filter posts"
                  className="inline-flex rounded-xl border border-[#E5E8ED] bg-white p-1 shadow-sm"
                  role="group"
                >
                  {([
                    ['all', 'All'],
                    ['photos', 'Photos'],
                    ['videos', 'Videos'],
                    ['mine', 'My posts'],
                    ['saved', 'Saved'],
                  ] as const).map(([filter, label]) => (
                    <button
                      key={filter}
                      type="button"
                      aria-pressed={activeFilter === filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        activeFilter === filter
                          ? 'bg-[#1A2B4C] text-white shadow-sm'
                          : 'text-[#687386] hover:bg-[#F3F5F8] hover:text-[#172033]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void (
                      activeFilter === 'mine'
                        ? myPostsQuery.refetch()
                        : activeFilter === 'saved'
                          ? savedPostsQuery.refetch()
                          : refetch()
                    )
                  }
                  disabled={
                    activeFilter === 'mine'
                      ? myPostsQuery.isFetching
                      : activeFilter === 'saved'
                        ? savedPostsQuery.isFetching
                        : isFetching
                  }
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E8ED] bg-white text-[#526078] shadow-sm transition hover:bg-[#F3F5F8] hover:text-[#172033] disabled:cursor-wait disabled:opacity-60"
                  aria-label="Refresh posts"
                  title="Refresh posts"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      (activeFilter === 'mine'
                        ? myPostsQuery.isFetching
                        : activeFilter === 'saved'
                          ? savedPostsQuery.isFetching
                          : isFetching)
                        ? 'animate-spin'
                        : ''
                    }`}
                  />
                </button>
              </div>
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
                    className={`rounded-xl border border-[#E7EAF0] px-4 py-3 shadow-sm ${stat.surface}`}
                  >
                    <p className="text-xs font-medium text-[#687386]">{stat.label}</p>
                    <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
                      {myPostsQuery.isLoading ? '—' : stat.count}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {(activeFilter === 'mine'
              ? myPostsQuery.isLoading
              : activeFilter === 'saved'
                ? savedPostsQuery.isLoading
                : isLoading) ? (
              <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#E5E8ED] bg-white">
                <div className="flex items-center gap-3 text-[#687386]">
                  <Loader2 className="h-5 w-5 animate-spin text-[#1A2B4C]" />
                  <span className="text-sm font-medium">
                    {activeFilter === 'mine'
                      ? 'Loading your posts...'
                      : activeFilter === 'saved'
                        ? 'Loading your saved posts...'
                        : 'Loading your community feed...'}
                  </span>
                </div>
              </div>
            ) : (activeFilter === 'mine'
              ? myPostsQuery.error && !myPostsQuery.isFetchNextPageError
              : activeFilter === 'saved'
                ? savedPostsQuery.error
                : error) ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#F1D5D5] bg-white px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1F1] text-[#C53030]">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-[#172033]">We couldn&apos;t load the feed</h3>
                <p className="mt-1 text-sm text-[#687386]">Please try again in a moment.</p>
                <button
                  type="button"
                  onClick={() =>
                    void (
                      activeFilter === 'mine'
                        ? myPostsQuery.refetch()
                        : activeFilter === 'saved'
                          ? savedPostsQuery.refetch()
                          : refetch()
                    )
                  }
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
                    ? 'You haven’t shared any posts yet'
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
              </div>
            ) : (
              <div className="space-y-5">
                {visibleItems.map((item) => {
                  const isVideo = item.contentType.startsWith('video/');
                  const authorId = item.user?.id;
                  const displayDate =
                    activeFilter === 'mine' &&
                    item.approvalStatus === 'APPROVED' &&
                    item.approvedAt
                      ? item.approvedAt
                      : item.createdAt;

                  return (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-[#E7EAF0] bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 px-5 py-4">
                        {item.user?.id ? (
                          <Link
                            href={`/dashboard/students/${item.user.id}`}
                            aria-label={`View ${item.user.firstName} ${item.user.lastName}'s profile`}
                            title={`View ${item.user.firstName} ${item.user.lastName}'s profile`}
                            className="shrink-0 rounded-full transition hover:ring-2 hover:ring-[#C59B4C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C]"
                          >
                            {item.user.profileImageUrl ? (
                              <Image
                                src={item.user.profileImageUrl}
                                alt={`${item.user.firstName} ${item.user.lastName}`}
                                width={44}
                                height={44}
                                className="h-11 w-11 rounded-full object-cover ring-2 ring-[#F1F3F6]"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8ECF3] text-sm font-bold text-[#1A2B4C] ring-2 ring-[#F1F3F6]">
                                {item.user.firstName[0]}{item.user.lastName[0]}
                              </div>
                            )}
                          </Link>
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8ECF3] text-sm font-bold text-[#1A2B4C] ring-2 ring-[#F1F3F6]">
                            S
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-[#172033]">
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
                          {item.user?.techCenter?.name && (
                            <p className="mt-0.5 truncate text-xs text-[#7A8495]" title={item.user.techCenter.name}>
                              {item.user.techCenter.name}
                            </p>
                          )}
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs leading-5 text-[#7A8495]">
                            {new Date(displayDate).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                            {activeFilter === 'mine' &&
                              item.approvalStatus === 'APPROVED' &&
                              item.approvedAt &&
                              ' · Approved'}
                          </p>
                        </div>
                        {currentUser && authorId && authorId !== currentUser.id && (
                          followStatus[authorId] ? (
                            <button
                              type="button"
                              disabled={pendingFollows[authorId]}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#F0F2F5] px-3 py-2 text-xs font-semibold text-[#526078] disabled:cursor-wait"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              {pendingFollows[authorId] ? 'Following…' : 'Following'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleFollow(authorId)}
                              title={
                                followErrors[authorId]
                                  ? 'Follow failed. Click to try again.'
                                  : undefined
                              }
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#1A2B4C] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#263D66]"
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                              {followErrors[authorId] ? 'Try again' : 'Follow'}
                            </button>
                          )
                        )}
                        {activeFilter === 'mine' &&
                          currentUser &&
                          authorId === currentUser.id && (
                          <button
                            type="button"
                            onClick={() => void handleDeletePost(item.id)}
                            disabled={deletingPostId === item.id}
                            aria-label="Delete your post"
                            title="Delete your post"
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-white text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                          >
                            {deletingPostId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        {activeFilter === 'mine' && (
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              item.approvalStatus === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700'
                                : item.approvalStatus === 'REJECTED'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {item.approvalStatus === 'APPROVED'
                              ? 'Approved'
                              : item.approvalStatus === 'REJECTED'
                                ? 'Rejected'
                                : 'Pending review'}
                          </span>
                        )}
                      </div>

                      {deletePostError?.id === item.id && (
                        <p role="alert" className="px-5 pb-3 text-xs text-red-600">
                          {deletePostError.message}
                        </p>
                      )}

                      {(item.title || item.description) && (
                        <div className="px-5 pb-4">
                          {item.title && (
                            <h4 className="text-base font-semibold leading-6 text-[#172033]">
                              {item.title}
                            </h4>
                          )}
                          {item.description && (
                            <div className={item.title ? 'mt-1' : ''}>
                              <PostDescription description={item.description} />
                            </div>
                          )}
                        </div>
                      )}

                      <div className={`relative overflow-hidden bg-[#101827] ${isVideo ? 'aspect-video' : 'aspect-[4/3] sm:aspect-video'}`}>
                        {isVideo ? (
                          <video
                            ref={(el) => {
                              if (el) videoRefs.current[item.id] = el;
                            }}
                            src={item.publicUrl}
                            controls
                            preload="metadata"
                            className="h-full w-full object-contain"
                            onPlay={() => handleVideoPlay(item.id)}
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => openLightbox(item, photos)}
                            className="group relative block h-full w-full cursor-zoom-in"
                            aria-label={`View ${item.title} image`}
                          >
                            <Image
                              src={item.publicUrl}
                              alt={item.title}
                              width={1200}
                              height={675}
                              sizes="(max-width: 1024px) 100vw, 700px"
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                            />
                          </button>
                        )}
                      </div>

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
                {activeFilter === 'mine' && myPostsQuery.hasNextPage && (
                  <div className="flex flex-col items-center gap-2 pt-2">
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
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <div className="rounded-2xl border border-[#E7EAF0] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A6A2F]">
                At a glance
              </p>
              <h2 className="mt-2 text-lg font-bold text-[#172033]">Community moments</h2>
              <p className="mt-1 text-sm leading-5 text-[#687386]">
                A snapshot of what&apos;s being shared.
              </p>
              <div className="mt-5 divide-y divide-[#EEF0F4]">
                <div className="flex items-center justify-between py-3 first:pt-0">
                  <span className="text-sm text-[#526078]">All posts</span>
                  <span className="text-sm font-bold text-[#172033]">{items.length}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="inline-flex items-center gap-2 text-sm text-[#526078]">
                    <ImageIcon className="h-4 w-4 text-[#8A6A2F]" />
                    Photos
                  </span>
                  <span className="text-sm font-bold text-[#172033]">{photos.length}</span>
                </div>
                <div className="flex items-center justify-between py-3 last:pb-0">
                  <span className="inline-flex items-center gap-2 text-sm text-[#526078]">
                    <Video className="h-4 w-4 text-[#8A6A2F]" />
                    Videos
                  </span>
                  <span className="text-sm font-bold text-[#172033]">{videos.length}</span>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-8">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Previous button */}
          {lightboxItems.length > 1 && (
            <button
              onClick={prevItem}
              className="absolute left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Previous item"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next button */}
          {lightboxItems.length > 1 && (
            <button
              onClick={nextItem}
              className="absolute right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Next item"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Content */}
          <div className="relative max-h-[90vh] max-w-[95vw]">
            <div className="relative max-h-[85vh] max-w-[95vw]">
              <Image
                src={currentItem.publicUrl}
                alt={currentItem.title}
                width={1920}
                height={1080}
                className="max-h-[85vh] w-auto object-contain rounded-lg"
                priority
              />
            </div>

            {/* Info panel */}
            <div className="mt-4 max-w-2xl text-center">
              <h3 className="text-xl font-semibold text-white">{currentItem.title}</h3>
              {currentItem.description && (
                <p className="mt-2 text-sm text-gray-300">{currentItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {isCreatePostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#E4E6EB]">
              <h3 className="text-lg font-semibold text-[#1C1E21]">Create Post</h3>
              <button
                onClick={() => setIsCreatePostModalOpen(false)}
                className="text-[#65676B] hover:text-[#1C1E21]"
              >
                <X className="w-5 h-5" />
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
