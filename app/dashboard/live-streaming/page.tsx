'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Eye,
  Monitor,
  Music,
  Play,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';

import {
  useEnglishLearningVideos,
  useMusicVideos,
} from '@/hooks/useYouTube';

type VideoItem = {
  id: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: string;
  viewCount?: string | number;
  channelTitle?: string;
  channelId?: string;
  publishedAt?: string;
  categoryId?: string;
};

type TabType = 'english' | 'music';

type YouTubePlayer = {
  destroy: () => void;
  cueVideoById: (videoId: string) => void;
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
};

type YouTubePlayerEvent = {
  target: YouTubePlayer;
  data: number;
};

type YouTubePlayerConstructor = new (
  element: HTMLElement,
  options: {
    videoId: string;
    playerVars?: {
      autoplay?: number;
      controls?: number;
      rel?: number;
      modestbranding?: number;
      iv_load_policy?: number;
      playsinline?: number;
    };
    events?: {
      onReady?: (event: YouTubePlayerEvent) => void;
      onStateChange?: (event: YouTubePlayerEvent) => void;
    };
  }
) => YouTubePlayer;

type YouTubeNamespace = {
  Player: YouTubePlayerConstructor;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const TOKENS = `
  [data-streaming-scope] {
    --ink: #10192b;
    --ink-2: #3d4a61;
    --ink-3: #6b7789;
    --ink-4: #98a2b3;

    --surface: #ffffff;
    --surface-2: #f7f8fa;
    --surface-3: #eef1f5;

    --line: #e2e6ec;
    --line-strong: #cfd6e0;

    --brand: #1a365d;
    --brand-hover: #14294a;
    --brand-soft: #eef2f8;

    --music-brand: #7c3aed;
    --music-brand-hover: #6d28d9;
    --music-brand-soft: #ede9fe;

    --ok: #17734b;
    --ok-soft: #eaf6f0;

    --bad: #a52121;
    --bad-soft: #fdeeee;

    --radius: 12px;
    --radius-sm: 8px;

    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1, 'cv05' 1;
  }
`;

const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-2)]';

const panel =
  'rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)]';

const buttonBase = `
  inline-flex items-center justify-center gap-2
  rounded-[var(--radius-sm)]
  px-3.5 py-2
  text-sm font-medium
  transition-colors duration-200
  disabled:cursor-not-allowed
  disabled:opacity-50
  ${focusRing}
`;

const primaryButton = `
  ${buttonBase}
  bg-[var(--brand)]
  text-white
  hover:bg-[var(--brand-hover)]
`;

const musicButton = `
  ${buttonBase}
  bg-[var(--music-brand)]
  text-white
  hover:bg-[var(--music-brand-hover)]
`;

const englishCategories = [
  {
    id: 'all',
    label: 'All Content',
    query: 'English language learning',
  },
  {
    id: 'grammar',
    label: 'Grammar',
    query: 'English grammar tutorial',
  },
  {
    id: 'pronunciation',
    label: 'Pronunciation',
    query: 'English pronunciation guide',
  },
  {
    id: 'conversation',
    label: 'Conversation',
    query: 'conversational English',
  },
  {
    id: 'vocabulary',
    label: 'Vocabulary',
    query: 'English vocabulary',
  },
  {
    id: 'listening',
    label: 'Listening',
    query: 'English listening practice',
  },
  {
    id: 'beginners',
    label: 'For Beginners',
    query: 'English for beginners',
  },
  {
    id: 'series',
    label: 'TV Series',
    query: 'English TV series educational',
  },
] as const;

const musicCategories = [
  {
    id: 'trending',
    label: 'Trending',
    query: 'trending music videos 2026',
  },
  {
    id: 'rnb',
    label: 'R&B',
    query: 'R&B music videos lyrics',
  },
  {
    id: 'hiphop',
    label: 'Hip Hop',
    query: 'hip hop music videos lyrics',
  },
  {
    id: 'gospel',
    label: 'Gospel',
    query: 'gospel music videos lyrics',
  },
  {
    id: 'pop',
    label: 'Pop',
    query: 'pop music videos lyrics',
  },
  {
    id: 'afrobeats',
    label: 'Afrobeats',
    query: 'afrobeats music videos',
  },
  {
    id: 'reggae',
    label: 'Reggae',
    query: 'reggae music videos lyrics',
  },
  {
    id: 'classic',
    label: 'Classic',
    query: 'classic music videos lyrics',
  },
] as const;

function safeText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value == null) return fallback;

  try {
    return String(value);
  } catch {
    return fallback;
  }
}

function formatViews(value: unknown): string {
  const raw = safeText(value, '0');

  if (!raw) return '0 views';

  const numeric = Number(raw.replace(/,/g, ''));

  if (!Number.isNaN(numeric)) {
    if (numeric >= 1_000_000) {
      return `${(numeric / 1_000_000)
        .toFixed(1)
        .replace('.0', '')}M views`;
    }

    if (numeric >= 1_000) {
      return `${(numeric / 1_000)
        .toFixed(1)
        .replace('.0', '')}K views`;
    }

    return `${numeric} views`;
  }

  return `${raw} views`;
}

/* ============================================================
   YOUTUBE API LOADER
   ------------------------------------------------------------
   Loads the YouTube IFrame API once for the whole page.
============================================================ */

let youtubeApiPromise: Promise<YouTubeNamespace> | null = null;

function loadYouTubeAPI(): Promise<YouTubeNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error('YouTube API is only available in the browser.')
    );
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReady === 'function') {
        previousReady();
      }

      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        reject(
          new Error(
            'YouTube IFrame API loaded without the Player constructor.'
          )
        );
      }
    };

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');

    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;

    script.onerror = () => {
      youtubeApiPromise = null;
      reject(new Error('Failed to load the YouTube IFrame API.'));
    };

    document.head.appendChild(script);
  });

  return youtubeApiPromise;
}

/* ============================================================
   VIDEO CARD
============================================================ */

function VideoCard({
  video,
  onSelect,
  isMusic = false,
  isSelected = false,
}: {
  video: VideoItem;
  onSelect: (video: VideoItem) => void;
  isMusic?: boolean;
  isSelected?: boolean;
}) {
  const title = safeText(video.title, 'Untitled video');
  const channel = safeText(video.channelTitle, 'YouTube');
  const views = formatViews(video.viewCount);

  return (
    <article
      className={`
        ${panel}
        group
        overflow-hidden
        transition-[border-color,box-shadow,transform]
        duration-200
        hover:-translate-y-0.5
        hover:border-[var(--line-strong)]
        hover:shadow-md
        ${
          isSelected
            ? isMusic
              ? 'border-[var(--music-brand)] shadow-sm'
              : 'border-[var(--brand)] shadow-sm'
            : ''
        }
      `}
    >
      <button
        type="button"
        onClick={() => onSelect(video)}
        className={`block w-full text-left ${focusRing}`}
        aria-label={`Play ${title}`}
        aria-pressed={isSelected}
      >
        <div className="relative aspect-video overflow-hidden bg-[var(--surface-3)]">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {isMusic ? (
                <Music className="h-10 w-10 text-[var(--ink-4)]" />
              ) : (
                <Monitor className="h-10 w-10 text-[var(--ink-4)]" />
              )}
            </div>
          )}

          <div
            className={`
              absolute inset-0
              flex items-center justify-center
              transition-colors duration-200
              ${
                isSelected
                  ? 'bg-black/25'
                  : 'bg-black/0 group-hover:bg-black/20'
              }
            `}
          >
            <span
              className={`
                flex h-11 w-11
                items-center justify-center
                rounded-full
                bg-white
                shadow-lg
                transition-[opacity,transform]
                duration-200
                ${
                  isSelected
                    ? 'scale-100 opacity-100'
                    : 'translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
                }
              `}
              style={{
                color: isMusic
                  ? 'var(--music-brand)'
                  : 'var(--brand)',
              }}
            >
              <Play
                className="ml-0.5 h-5 w-5 fill-current"
                aria-hidden
              />
            </span>
          </div>

          {isSelected && (
            <span
              className="absolute bottom-2 left-2 rounded-md bg-white/95 px-2 py-1 text-[11px] font-bold shadow-sm"
              style={{
                color: isMusic
                  ? 'var(--music-brand)'
                  : 'var(--brand)',
              }}
            >
              Selected
            </span>
          )}

          {video.duration && (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/80 px-2 py-1 text-[11px] font-semibold text-white">
              <Clock
                className="h-3 w-3"
                aria-hidden
              />
              {video.duration}
            </span>
          )}

          <span
            className="absolute left-2 top-2 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold shadow-sm"
            style={{
              color: isMusic
                ? 'var(--music-brand)'
                : 'var(--brand)',
            }}
          >
            {isMusic ? 'Music' : 'Learning'}
          </span>
        </div>
      </button>

      <div className="p-3">
        <h3 className="line-clamp-2 min-h-[36px] text-[14px] font-semibold leading-5 text-[var(--ink)]">
          {title}
        </h3>

        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <span
            className="min-w-0 truncate font-medium"
            style={{
              color: isMusic
                ? 'var(--music-brand)'
                : 'var(--brand)',
            }}
          >
            {channel}
          </span>

          <span className="inline-flex shrink-0 items-center gap-1 text-[var(--ink-3)]">
            <Eye
              className="h-3 w-3 shrink-0"
              aria-hidden
            />
            {views}
          </span>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   SINGLE GLOBAL PLAYER
   ------------------------------------------------------------
   IMPORTANT:
   There is ONLY ONE YouTube player instance.

   Initial/default video:
     cueVideoById()
     -> loads the video without playing.

   After user manually presses Play:
     hasUserStartedRef = true

   Clicking another video:
     loadVideoById()
     -> automatically plays ONLY after user has previously
        started playback.
============================================================ */

function VideoPlayer({
  video,
  isMusic,
  hasUserStartedRef,
  onStarted,
}: {
  video: VideoItem;
  isMusic: boolean;
  hasUserStartedRef: React.MutableRefObject<boolean>;
  onStarted: () => void;
}) {
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const currentVideoIdRef = useRef<string | null>(null);
  const initialVideoIdRef = useRef(video.id);
  const readyRef = useRef(false);

  const title = safeText(
    video.title,
    isMusic ? 'Music video' : 'Learning video'
  );

  const channel = safeText(
    video.channelTitle,
    'YouTube'
  );

  const views = formatViews(video.viewCount);

  /*
   * Keep the latest selected video id available to the
   * YouTube API callbacks without recreating the player.
   */
  useEffect(() => {
    currentVideoIdRef.current = video.id;
  }, [video.id]);

  /*
   * Create the SINGLE player.
   *
   * This effect intentionally runs only once for this
   * component instance.
   */
  useEffect(() => {
    let cancelled = false;

    const createPlayer = async () => {
      try {
        const YT = await loadYouTubeAPI();

        if (
          cancelled ||
          !playerHostRef.current ||
          playerRef.current
        ) {
          return;
        }

        const initialVideoId = initialVideoIdRef.current;

        const player = new YT.Player(
          playerHostRef.current,
          {
            videoId: initialVideoId,

            playerVars: {
              autoplay: 0,
              controls: 1,
              rel: 0,
              modestbranding: 1,
              iv_load_policy: 3,
              playsinline: 1,
            },

            events: {
              onReady: () => {
                readyRef.current = true;

                /*
                 * Explicitly cue instead of play.
                 * This guarantees the first video does
                 * NOT autoplay.
                 */
                player.cueVideoById(initialVideoId);
              },

              onStateChange: (event) => {
                if (
                  event.data === YT.PlayerState.PLAYING
                ) {
                  /*
                   * This is the important interaction:
                   * the user has manually started the player.
                   */
                  if (!hasUserStartedRef.current) {
                    hasUserStartedRef.current = true;
                    onStarted();
                  }
                }
              },
            },
          }
        );

        playerRef.current = player;
      } catch (error) {
        console.error(
          'Unable to initialize YouTube player:',
          error
        );
      }
    };

    void createPlayer();

    return () => {
      cancelled = true;

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore cleanup errors from the YouTube iframe.
        }

        playerRef.current = null;
      }

      readyRef.current = false;
    };
  }, [hasUserStartedRef, onStarted]);

  /*
   * When the selected video changes, update the EXISTING
   * player rather than creating another iframe/player.
   *
   * This is what makes the whole page use one player.
   */
  useEffect(() => {
    if (
      !readyRef.current ||
      !playerRef.current ||
      !video.id
    ) {
      return;
    }

    const currentId = currentVideoIdRef.current;

    if (!currentId) {
      currentVideoIdRef.current = video.id;

      playerRef.current.cueVideoById(video.id);
      return;
    }

    /*
     * Do not reload the same video unnecessarily.
     */
    if (currentId === video.id) {
      return;
    }

    currentVideoIdRef.current = video.id;

    /*
     * If the user has already pressed Play somewhere in
     * this session, a manually selected new video starts
     * immediately.
     *
     * If the user has not started playback yet, the new
     * selection is merely loaded/cued and remains paused.
     */
    if (hasUserStartedRef.current) {
      playerRef.current.loadVideoById(video.id);
    } else {
      playerRef.current.cueVideoById(video.id);
    }
  }, [video.id, hasUserStartedRef]);

  return (
    <section
      className={`${panel} mb-8 overflow-hidden shadow-sm`}
      aria-label="Video player"
    >
      <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{
              backgroundColor: isMusic
                ? 'var(--music-brand)'
                : 'var(--brand)',
            }}
          />

          <span className="truncate text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ink-3)]">
            {hasUserStartedRef.current
              ? 'Now playing'
              : 'Ready to play'}
          </span>
        </div>

        <span className="shrink-0 text-xs text-[var(--ink-4)]">
          {hasUserStartedRef.current
            ? 'Select another video to continue'
            : 'Press play to start'}
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <div className="relative aspect-video bg-black lg:aspect-auto lg:min-h-[420px]">
          {/*
            The YouTube API replaces this DIV with the ONE iframe.
            No second player is rendered anywhere else.
          */}
          <div
            ref={playerHostRef}
            className="absolute inset-0 h-full w-full"
          />
        </div>

        <div className="flex flex-col justify-center p-5 sm:p-6 lg:p-7">
          <div className="mb-4 flex items-center gap-2">
            <span
              className="rounded-md px-2 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: isMusic
                  ? 'var(--music-brand-soft)'
                  : 'var(--brand-soft)',
                color: isMusic
                  ? 'var(--music-brand)'
                  : 'var(--brand)',
              }}
            >
              {isMusic
                ? 'Music'
                : 'English Learning'}
            </span>

            <span className="text-xs text-[var(--ink-4)]">
              {hasUserStartedRef.current
                ? 'Playing'
                : 'Selected'}
            </span>
          </div>

          <h2 className="text-lg font-semibold leading-6 text-[var(--ink)] sm:text-xl">
            {title}
          </h2>

          <div className="mt-3 flex items-center gap-2 text-sm text-[var(--ink-3)]">
            <Eye
              className="h-4 w-4 shrink-0"
              aria-hidden
            />

            <span>{views}</span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ink-4)]">
              Channel
            </p>

            <p
              className="mt-1 truncate text-sm font-semibold"
              style={{
                color: isMusic
                  ? 'var(--music-brand)'
                  : 'var(--brand)',
              }}
            >
              {channel}
            </p>
          </div>

          <p className="mt-5 text-sm leading-6 text-[var(--ink-3)]">
            {hasUserStartedRef.current
              ? 'Choose another video below and it will continue playing here.'
              : 'The first video is ready. Press the YouTube play button when you are ready to begin.'}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CATEGORY NAVIGATION
============================================================ */

function CategoryNavigation({
  categories,
  selectedCategory,
  activeTab,
  onChange,
}: {
  categories:
    | readonly {
        id: string;
        label: string;
        query: string;
      }[];

  selectedCategory: string;
  activeTab: TabType;

  onChange: (category: {
    id: string;
    label: string;
    query: string;
  }) => void;
}) {
  return (
    <section
      className="mb-7"
      aria-label="Browse categories"
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--ink-4)]">
            Explore
          </p>

          <h2 className="mt-1 text-base font-semibold text-[var(--ink)]">
            {activeTab === 'english'
              ? 'Browse English topics'
              : 'Browse music'}
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1 border-b border-[var(--line)]">
          {categories.map((category) => {
            const active =
              selectedCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onChange(category)}
                aria-pressed={active}
                className={`
                  relative
                  whitespace-nowrap
                  px-3 py-3
                  text-sm font-medium
                  transition-colors duration-200
                  ${focusRing}
                  ${
                    active
                      ? 'text-[var(--brand)]'
                      : 'text-[var(--ink-3)] hover:text-[var(--ink)]'
                  }
                `}
                style={
                  active && activeTab === 'music'
                    ? {
                        color:
                          'var(--music-brand)',
                      }
                    : undefined
                }
              >
                {category.label}

                {active && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        activeTab === 'music'
                          ? 'var(--music-brand)'
                          : 'var(--brand)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   LOADING GRID
============================================================ */

function LoadingGrid() {
  return (
    <section
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      aria-busy="true"
      aria-live="polite"
    >
      {[
        0, 1, 2, 3, 4,
        5, 6, 7, 8, 9,
      ].map((item) => (
        <div
          key={item}
          className={`${panel} overflow-hidden`}
        >
          <div className="aspect-video animate-pulse bg-[var(--surface-3)]" />

          <div className="space-y-2 p-3">
            <div className="h-3 w-4/5 animate-pulse rounded bg-[var(--surface-3)]" />

            <div className="h-2.5 w-full animate-pulse rounded bg-[var(--surface-3)]" />
          </div>
        </div>
      ))}
    </section>
  );
}

/* ============================================================
   STREAMING PAGE
============================================================ */

export default function StreamingPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<TabType>('english');

  const [searchQuery, setSearchQuery] =
    useState('English language learning');

  const [selectedCategory, setSelectedCategory] =
    useState('all');

  const [selectedVideo, setSelectedVideo] =
    useState<VideoItem | null>(null);

  /*
   * This ref intentionally survives video changes.
   *
   * false:
   *   The user has not pressed Play yet.
   *
   * true:
   *   The user has manually started playback.
   *
   * Once true, clicking another video will make that
   * video play immediately.
   */
  const hasUserStartedRef = useRef(false);

  const [playerHasStarted, setPlayerHasStarted] =
    useState(false);

  const categories =
    activeTab === 'english'
      ? englishCategories
      : musicCategories;

  const englishHook = useEnglishLearningVideos(
    activeTab === 'english'
      ? searchQuery
      : '',
    12
  );

  const musicHook = useMusicVideos(
    activeTab === 'music'
      ? searchQuery
      : '',
    12
  );

  const {
    data,
    isLoading,
    error,
    refetch,
  } =
    activeTab === 'english'
      ? englishHook
      : musicHook;

  const videos = useMemo<VideoItem[]>(() => {
    if (
      !data ||
      !Array.isArray(data.videos)
    ) {
      return [];
    }

    return data.videos;
  }, [data]);

  /*
   * On the initial page load, select the first video.
   *
   * This does NOT play it.
   */
  useEffect(() => {
    if (
      videos.length > 0 &&
      !selectedVideo
    ) {
      setSelectedVideo(videos[0]);
    }
  }, [videos, selectedVideo]);

  /*
   * When a new category/search result arrives, load its
   * first video into the SAME player.
   *
   * We deliberately reset the selection to the first
   * video, but we DO NOT call play.
   *
   * The VideoPlayer will cue the video rather than play it
   * because this is a collection change rather than an
   * explicit video-card click.
   */
  const previousVideosRef =
    useRef<VideoItem[]>([]);

  useEffect(() => {
    if (videos.length === 0) {
      return;
    }

    const previousFirstId =
      previousVideosRef.current[0]?.id;

    const newFirstId = videos[0].id;

    if (
      previousFirstId &&
      previousFirstId !== newFirstId
    ) {
      setSelectedVideo(videos[0]);
    }

    previousVideosRef.current = videos;
  }, [videos]);

  /*
   * The selected video is removed from the grid so it does
   * not appear twice as both the player and a card.
   */
  const gridVideos = videos.filter(
    (video) =>
      video.id !== selectedVideo?.id
  );

  const handleCategoryChange = (
    category: {
      id: string;
      label: string;
      query: string;
    }
  ) => {
    setSelectedCategory(category.id);
    setSearchQuery(category.query);

    /*
     * Do NOT reset hasUserStartedRef here.
     *
     * However, the category's first video is loaded through
     * the collection-change effect and is cued rather than
     * explicitly played.
     */
    refetch();
  };

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    refetch();
  };

  /*
   * This is the ONLY place where a video card changes
   * the current video.
   *
   * Notice that there is NO scrollIntoView().
   *
   * The user's current scroll position remains untouched.
   */
  const handleVideoClick = (
    video: VideoItem
  ) => {
    setSelectedVideo(video);
  };

  const handleTabChange = (
    tab: TabType
  ) => {
    setActiveTab(tab);

    setSelectedCategory(
      tab === 'english'
        ? 'all'
        : 'trending'
    );

    setSearchQuery(
      tab === 'english'
        ? 'English language learning'
        : 'trending music videos 2026'
    );

    /*
     * Changing the main tab is a content navigation
     * action, not a direct video click.
     *
     * Therefore the first video from the new collection
     * will be loaded without autoplay.
     */
  };

  const handlePlayerStarted = () => {
    hasUserStartedRef.current = true;
    setPlayerHasStarted(true);
  };

  const isMusic =
    activeTab === 'music';

  return (
    <div
      data-streaming-scope
      className="min-h-screen bg-[var(--surface-2)] text-[var(--ink)] antialiased"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: TOKENS,
        }}
      />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-7">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className={`
                ${buttonBase}
                mt-0.5
                shrink-0
                border
                border-[var(--line-strong)]
                bg-[var(--surface)]
                px-2.5
                text-[var(--ink-2)]
                shadow-sm
                hover:bg-[var(--surface-2)]
                hover:text-[var(--ink)]
              `}
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden
              />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                  Learning & Media
                </span>

                <span className="h-1 w-1 rounded-full bg-[var(--line-strong)]" />

                <span className="text-[11px] font-medium text-[var(--ink-4)]">
                  Student Hub
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-[-0.025em] text-[var(--ink)] sm:text-3xl">
                Streaming Hub
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--ink-3)] sm:text-[15px]">
                Learn, explore and take a break with carefully
                organized English learning and music content.
              </p>
            </div>
          </div>
        </header>

        {/* =====================================================
            EXPERIENCE SWITCHER
        ====================================================== */}

        <section
          className={`${panel} mb-7 p-1.5 shadow-sm`}
          aria-label="Choose content type"
        >
          <div className="grid grid-cols-2 gap-1">

            <button
              type="button"
              onClick={() =>
                handleTabChange('english')
              }
              aria-pressed={
                activeTab === 'english'
              }
              className={`
                ${focusRing}
                flex min-h-[58px]
                items-center justify-center
                gap-3
                rounded-[9px]
                px-3 py-2
                text-left
                transition-colors
                duration-200
                sm:justify-start
                sm:px-5
                ${
                  activeTab === 'english'
                    ? 'bg-[var(--brand)] text-white'
                    : 'text-[var(--ink-2)] hover:bg-[var(--surface-2)]'
                }
              `}
            >
              <span
                className={`
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-lg
                  ${
                    activeTab === 'english'
                      ? 'bg-white/10'
                      : 'bg-[var(--brand-soft)]'
                  }
                `}
              >
                <BookOpen
                  className="h-4 w-4"
                  aria-hidden
                />
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  English Learning
                </span>

                <span
                  className={`
                    mt-0.5
                    hidden
                    text-xs
                    sm:block
                    ${
                      activeTab === 'english'
                        ? 'text-white/70'
                        : 'text-[var(--ink-4)]'
                    }
                  `}
                >
                  Improve your language skills
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleTabChange('music')
              }
              aria-pressed={
                activeTab === 'music'
              }
              className={`
                ${focusRing}
                flex min-h-[58px]
                items-center justify-center
                gap-3
                rounded-[9px]
                px-3 py-2
                text-left
                transition-colors
                duration-200
                sm:justify-start
                sm:px-5
                ${
                  activeTab === 'music'
                    ? 'bg-[var(--music-brand)] text-white'
                    : 'text-[var(--ink-2)] hover:bg-[var(--surface-2)]'
                }
              `}
            >
              <span
                className={`
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-lg
                  ${
                    activeTab === 'music'
                      ? 'bg-white/10'
                      : 'bg-[var(--music-brand-soft)]'
                  }
                `}
              >
                <Music
                  className="h-4 w-4"
                  aria-hidden
                />
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  Music
                </span>

                <span
                  className={`
                    mt-0.5
                    hidden
                    text-xs
                    sm:block
                    ${
                      activeTab === 'music'
                        ? 'text-white/70'
                        : 'text-[var(--ink-4)]'
                    }
                  `}
                >
                  Discover music and lyrics
                </span>
              </span>
            </button>
          </div>
        </section>

        {/* =====================================================
            THE ONLY VIDEO PLAYER ON THE PAGE
        ====================================================== */}

        {selectedVideo && (
          <VideoPlayer
            video={selectedVideo}
            isMusic={isMusic}
            hasUserStartedRef={
              hasUserStartedRef
            }
            onStarted={
              handlePlayerStarted
            }
          />
        )}

        {/* =====================================================
            SEARCH
        ====================================================== */}

        <section
          className={`${panel} mb-7 p-4 sm:p-5`}
        >
          <div className="mb-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--ink-4)]">
              Find something
            </p>

            <p className="mt-1 text-sm text-[var(--ink-3)]">
              Search across the current{' '}
              {isMusic
                ? 'music'
                : 'learning'}{' '}
              collection.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-2.5 sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-4)]"
                aria-hidden
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder={
                  isMusic
                    ? 'Search music, artists or songs...'
                    : 'Search lessons, topics or English skills...'
                }
                aria-label={
                  isMusic
                    ? 'Search music videos'
                    : 'Search English learning videos'
                }
                className={`
                  h-11
                  w-full
                  rounded-[var(--radius-sm)]
                  border
                  border-[var(--line-strong)]
                  bg-[var(--surface)]
                  pl-10
                  pr-4
                  text-sm
                  text-[var(--ink)]
                  placeholder:text-[var(--ink-4)]
                  transition-colors
                  ${
                    isMusic
                      ? 'focus:border-[var(--music-brand)]'
                      : 'focus:border-[var(--brand)]'
                  }
                  ${focusRing}
                `}
              />
            </div>

            <button
              type="submit"
              className={`
                ${
                  isMusic
                    ? musicButton
                    : primaryButton
                }
                h-11
                shrink-0
                px-5
              `}
            >
              <Search
                className="h-4 w-4"
                aria-hidden
              />

              Search
            </button>

            <button
              type="button"
              onClick={() => refetch()}
              className={`
                ${buttonBase}
                h-11
                shrink-0
                border
                border-[var(--line-strong)]
                bg-[var(--surface)]
                px-3
                text-[var(--ink-2)]
                hover:bg-[var(--surface-2)]
              `}
              aria-label="Refresh results"
              title="Refresh results"
            >
              <RefreshCw
                className="h-4 w-4"
                aria-hidden
              />
            </button>
          </form>
        </section>

        {/* =====================================================
            LOADING
        ====================================================== */}

        {isLoading && <LoadingGrid />}

        {/* =====================================================
            ERROR
        ====================================================== */}

        {!isLoading && error && (
          <section
            className={`${panel} p-8 text-center sm:p-12`}
            role="alert"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bad-soft)]">
              <Monitor
                className="h-6 w-6 text-[var(--bad)]"
                aria-hidden
              />
            </div>

            <h2 className="mt-4 text-base font-semibold text-[var(--ink)]">
              {isMusic
                ? 'Music'
                : 'Learning videos'}{' '}
              could not be loaded
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink-3)]">
              We could not retrieve the content right now.
              Please check your connection and try again.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className={`
                ${
                  isMusic
                    ? musicButton
                    : primaryButton
                }
                mt-5
              `}
            >
              <RefreshCw
                className="h-4 w-4"
                aria-hidden
              />

              Try again
            </button>
          </section>
        )}

        {/* =====================================================
            EMPTY
        ====================================================== */}

        {!isLoading &&
          !error &&
          videos.length === 0 && (
            <section
              className={`${panel} p-8 text-center sm:p-12`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-soft)]">
                {isMusic ? (
                  <Music
                    className="h-7 w-7 text-[var(--music-brand)]"
                    aria-hidden
                  />
                ) : (
                  <Monitor
                    className="h-7 w-7 text-[var(--brand)]"
                    aria-hidden
                  />
                )}
              </div>

              <h2 className="mt-4 text-lg font-semibold text-[var(--ink)]">
                No{' '}
                {isMusic
                  ? 'music'
                  : 'learning videos'}{' '}
                found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink-3)]">
                Try another search phrase or select a different
                category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery(
                    isMusic
                      ? 'trending music videos 2026'
                      : 'English language learning'
                  );

                  setSelectedCategory(
                    isMusic
                      ? 'trending'
                      : 'all'
                  );
                }}
                className={`
                  ${
                    isMusic
                      ? musicButton
                      : primaryButton
                  }
                  mt-5
                `}
              >
                Reset search
              </button>
            </section>
          )}

        {/* =====================================================
            CONTENT
        ====================================================== */}

        {!isLoading &&
          !error &&
          videos.length > 0 && (
            <>
              <CategoryNavigation
                categories={categories}
                selectedCategory={
                  selectedCategory
                }
                activeTab={activeTab}
                onChange={
                  handleCategoryChange
                }
              />

              {/* Results Header */}
              <section
                aria-label={
                  isMusic
                    ? 'Music videos'
                    : 'English learning videos'
                }
              >
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles
                        className="h-4 w-4"
                        style={{
                          color: isMusic
                            ? 'var(--music-brand)'
                            : 'var(--brand)',
                        }}
                        aria-hidden
                      />

                      <h2 className="text-base font-semibold text-[var(--ink)]">
                        {isMusic
                          ? 'Music videos'
                          : 'Learning videos'}
                      </h2>
                    </div>

                    <p className="mt-1 text-sm text-[var(--ink-3)]">
                      {videos.length}{' '}
                      {isMusic
                        ? 'songs and videos'
                        : 'videos'}{' '}
                      available
                    </p>
                  </div>

                  <div className="text-xs font-medium text-[var(--ink-4)]">
                    {playerHasStarted
                      ? 'Select a video to play it in the player'
                      : 'Press Play first, then select videos to continue playback'}
                  </div>
                </div>
              </section>

              {/* =================================================
                  VIDEO GRID

                  The selected video is removed from this grid,
                  so it exists only once on the page.
              ================================================== */}

              <section
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                aria-label="Video results"
              >
                {gridVideos.map(
                  (video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onSelect={
                        handleVideoClick
                      }
                      isMusic={isMusic}
                      isSelected={
                        video.id ===
                        selectedVideo?.id
                      }
                    />
                  )
                )}
              </section>
            </>
          )}
      </main>
    </div>
  );
}