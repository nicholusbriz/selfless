"use client";

import React, {
  FormEvent,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  GraduationCap,
  Loader2,
  Play,
  Search,
  Volume2,
  X,
  ArrowUp,
} from "lucide-react";
import {
  useEnglishLearningVideos,
  // useMusicVideos,
} from "@/hooks/useYouTube";

type VideoItem = {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
  publishedAt?: string;
  duration?: string;
  viewCount?: string | number;
};

type TabType = "english";
// type TabType = "english" | "music";

type Category = {
  id: string;
  label: string;
  query: string;
};

type YouTubePlayerState = {
  UNSTARTED: -1;
  ENDED: 0;
  PLAYING: 1;
  PAUSED: 2;
  BUFFERING: 3;
  CUED: 5;
};

type YouTubePlayer = {
  destroy: () => void;
  cueVideoById: (videoId: string) => void;
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getPlayerState: () => number;
};

type YouTubePlayerConstructor = new (
  element: HTMLElement,
  options: {
    videoId?: string;
    playerVars?: Record<string, number>;
    events?: {
      onReady?: () => void;
      onStateChange?: (event: { data: number }) => void;
      onError?: (event: { data: number }) => void;
    };
  }
) => YouTubePlayer;

declare global {
  interface Window {
    YT?: {
      Player: YouTubePlayerConstructor;
      PlayerState: YouTubePlayerState;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const TOKENS = `
  :root {
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

    --ok: #17734b;
    --ok-soft: #eaf6f0;

    --bad: #a52121;
    --bad-soft: #fdeeee;

    --radius: 12px;
    --radius-sm: 8px;
  }
`;

const ENGLISH_CATEGORIES: Category[] = [
  {
    id: "all",
    label: "All",
    query: "English language learning",
  },
  {
    id: "grammar",
    label: "Grammar",
    query: "English grammar tutorial",
  },
  {
    id: "pronunciation",
    label: "Pronunciation",
    query: "English pronunciation guide",
  },
  {
    id: "conversation",
    label: "Conversation",
    query: "conversational English",
  },
  {
    id: "vocabulary",
    label: "Vocabulary",
    query: "English vocabulary",
  },
  {
    id: "listening",
    label: "Listening",
    query: "English listening practice",
  },
  {
    id: "beginners",
    label: "Beginners",
    query: "English for beginners",
  },
  {
    id: "series",
    label: "English Series",
    query: "English TV series educational",
  },
];

// Music categories are intentionally kept commented out.
// They can be enabled later without changing the English implementation.
//
// const MUSIC_CATEGORIES: Category[] = [
//   {
//     id: "trending",
//     label: "Trending",
//     query: "trending music videos 2026",
//   },
//   {
//     id: "rnb",
//     label: "R&B",
//     query: "R&B music",
//   },
//   {
//     id: "hiphop",
//     label: "Hip Hop",
//     query: "hip hop music",
//   },
//   {
//     id: "gospel",
//     label: "Gospel",
//     query: "gospel music",
//   },
//   {
//     id: "pop",
//     label: "Pop",
//     query: "pop music",
//   },
//   {
//     id: "afrobeats",
//     label: "Afrobeats",
//     query: "Afrobeats music",
//   },
//   {
//     id: "reggae",
//     label: "Reggae",
//     query: "reggae music",
//   },
//   {
//     id: "classic",
//     label: "Classic",
//     query: "classic music",
//   },
// ];

function safeText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim() || fallback;
}

function formatViews(value: string | number | undefined) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const numeric =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/,/g, ""));

  if (!Number.isFinite(numeric)) {
    return String(value);
  }

  if (numeric >= 1_000_000_000) {
    return `${(numeric / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  }

  if (numeric >= 1_000_000) {
    return `${(numeric / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (numeric >= 1_000) {
    return `${(numeric / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }

  return String(numeric);
}

function loadYouTubeAPI() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("YouTube player is only available in the browser."));
      return;
    }

    if (window.YT?.Player) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;

    script.onerror = () => {
      reject(new Error("Unable to load the YouTube player."));
    };

    document.head.appendChild(script);
  });
}

function VideoCard({
  video,
  selected,
  onClick,
}: {
  video: VideoItem;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group w-full overflow-hidden rounded-xl border bg-white text-left",
        "transition duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30",
        selected
          ? "border-[#1a365d] shadow-sm ring-1 ring-[#1a365d]/10"
          : "border-[#e2e6ec]",
      ].join(" ")}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#eef1f5]">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className="h-8 w-8 text-[#98a2b3]" />
          </div>
        )}

        {video.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {video.duration}
          </span>
        )}

        {selected && (
          <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-md bg-[#1a365d] px-2 py-1 text-[11px] font-semibold text-white">
            <Volume2 className="h-3 w-3" />
            Playing
          </div>
        )}
      </div>

      <div className="p-4 sm:p-3.5">
        <h3 className="min-h-0 line-clamp-2 text-[15px] font-semibold leading-5 text-[#10192b] sm:text-[14px]">
          {safeText(video.title, "Untitled video")}
        </h3>

        <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-[#6b7789]">
          {video.channelTitle && (
            <span className="min-w-0 truncate">
              {safeText(video.channelTitle)}
            </span>
          )}

          {video.viewCount !== undefined && (
            <>
              <span className="shrink-0 text-[#cfd6e0]">•</span>
              <span className="flex shrink-0 items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatViews(video.viewCount)}
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

function VideoPlayer({
  video,
  hasUserStartedRef,
  shouldAutoplay,
  onStarted,
  onPlayingStateChange,
}: {
  video: VideoItem | null;
  hasUserStartedRef: MutableRefObject<boolean>;
  shouldAutoplay: boolean;
  onStarted: () => void;
  onPlayingStateChange: (playing: boolean) => void;
}) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerHostRef = useRef<HTMLDivElement | null>(null);

  const readyRef = useRef(false);
  const loadedVideoIdRef = useRef<string | null>(null);

  const latestVideoIdRef = useRef<string | null>(null);
  const latestAutoplayRef = useRef(false);

  const [playerReady, setPlayerReady] = useState(false);
  const [playerHasStarted, setPlayerHasStarted] = useState(false);
  const [playerIsPlaying, setPlayerIsPlaying] = useState(false);
  const [playerError, setPlayerError] = useState(false);

  const handleStarted = useCallback(() => {
    hasUserStartedRef.current = true;
    setPlayerHasStarted(true);
    onStarted();
  }, [hasUserStartedRef, onStarted]);

  const handlePlayingStateChange = useCallback(
    (playing: boolean) => {
      setPlayerIsPlaying(playing);
      onPlayingStateChange(playing);
    },
    [onPlayingStateChange]
  );

  useEffect(() => {
    latestVideoIdRef.current = video?.id ?? null;
    latestAutoplayRef.current = shouldAutoplay;
  }, [video?.id, shouldAutoplay]);

  useEffect(() => {
    let cancelled = false;

    async function createPlayer() {
      try {
        await loadYouTubeAPI();

        if (cancelled || !playerHostRef.current || !window.YT?.Player) {
          return;
        }

        if (playerRef.current) {
          return;
        }

        const initialVideoId = video?.id ?? undefined;

        playerRef.current = new window.YT.Player(playerHostRef.current, {
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
              setPlayerReady(true);
              setPlayerError(false);

              const currentVideoId = latestVideoIdRef.current;

              if (!currentVideoId || !playerRef.current) {
                return;
              }

              loadedVideoIdRef.current = currentVideoId;

              if (
                latestAutoplayRef.current &&
                hasUserStartedRef.current
              ) {
                playerRef.current.loadVideoById(currentVideoId);
              } else {
                playerRef.current.cueVideoById(currentVideoId);
              }
            },

            onStateChange: (event) => {
              if (!window.YT) return;

              const state = event.data;

              if (state === window.YT.PlayerState.PLAYING) {
                if (!hasUserStartedRef.current) {
                  hasUserStartedRef.current = true;
                  setPlayerHasStarted(true);
                  onStarted();
                }

                handlePlayingStateChange(true);
              }

              if (
                state === window.YT.PlayerState.PAUSED ||
                state === window.YT.PlayerState.ENDED ||
                state === window.YT.PlayerState.CUED
              ) {
                handlePlayingStateChange(false);
              }
            },

            onError: () => {
              setPlayerError(true);
              handlePlayingStateChange(false);
            },
          },
        });
      } catch {
        if (!cancelled) {
          setPlayerError(true);
        }
      }
    }

    createPlayer();

    return () => {
      cancelled = true;
    };
  }, [
    handlePlayingStateChange,
    onStarted,
    video?.id,
    hasUserStartedRef,
  ]);

  useEffect(() => {
    if (!readyRef.current || !playerRef.current || !video?.id) {
      return;
    }

    const nextVideoId = video.id;

    if (loadedVideoIdRef.current === nextVideoId) {
      return;
    }

    loadedVideoIdRef.current = nextVideoId;
    setPlayerError(false);

    if (shouldAutoplay && hasUserStartedRef.current) {
      playerRef.current.loadVideoById(nextVideoId);
    } else {
      playerRef.current.cueVideoById(nextVideoId);
    }
  }, [video?.id, shouldAutoplay, hasUserStartedRef]);

  useEffect(() => {
    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
      readyRef.current = false;
    };
  }, []);

  if (!video) {
    return (
      <section className="overflow-hidden rounded-xl border border-[#e2e6ec] bg-white">
        <div className="flex aspect-video items-center justify-center bg-[#f7f8fa]">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2f8]">
              <Play className="h-5 w-5 text-[#1a365d]" />
            </div>
            <p className="mt-3 text-sm font-medium text-[#3d4a61]">
              Select a video to start learning
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[#e2e6ec] bg-white shadow-sm">
      <div className="relative aspect-video w-full bg-black">
        <div
          ref={playerHostRef}
          className="absolute inset-0 h-full w-full"
        />

        {!playerReady && !playerError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#10192b]">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-white" />
              <p className="mt-3 text-sm text-white/75">
                Loading video...
              </p>
            </div>
          </div>
        )}

        {playerError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#10192b] px-5">
            <div className="text-center">
              <p className="text-sm font-medium text-white">
                Unable to load this video
              </p>
              <p className="mt-1 text-xs text-white/65">
                Please select another video.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#e2e6ec] px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-[#1a365d]">
              <BookOpen className="h-3.5 w-3.5" />
              English Learning
            </div>

            <h2 className="line-clamp-2 text-base font-semibold leading-6 text-[#10192b] sm:text-lg">
              {safeText(video.title, "Untitled video")}
            </h2>

            {video.channelTitle && (
              <p className="mt-1 truncate text-xs text-[#6b7789]">
                {safeText(video.channelTitle)}
              </p>
            )}
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 rounded-md bg-[#f7f8fa] px-2.5 py-1.5 text-xs text-[#6b7789] sm:flex">
            <Play className="h-3.5 w-3.5" />
            {playerIsPlaying
              ? "Playing"
              : playerHasStarted
                ? "Paused"
                : "Ready"}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryNavigation({
  categories,
  activeCategory,
  onSelect,
}: {
  categories: Category[];
  activeCategory: string;
  onSelect: (category: Category) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -260 : 260,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Scroll categories left"
        className="absolute left-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2e6ec] bg-white text-[#3d4a61] shadow-sm hover:bg-[#f7f8fa] sm:flex"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-0 pb-1 scrollbar-none sm:px-10"
      >
        {categories.map((category) => {
          const active = category.id === activeCategory;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category)}
              className={[
                "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition",
                active
                  ? "border-[#1a365d] bg-[#1a365d] text-white"
                  : "border-[#e2e6ec] bg-white text-[#3d4a61] hover:border-[#cfd6e0] hover:bg-[#f7f8fa]",
              ].join(" ")}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Scroll categories right"
        className="absolute right-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2e6ec] bg-white text-[#3d4a61] shadow-sm hover:bg-[#f7f8fa] sm:flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-[#e2e6ec] bg-white"
        >
          <div className="aspect-video animate-pulse bg-[#eef1f5]" />

          <div className="space-y-2 p-4 sm:p-3.5">
            <div className="h-4 w-full animate-pulse rounded bg-[#eef1f5]" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-[#eef1f5]" />
            <div className="h-3 w-2/5 animate-pulse rounded bg-[#eef1f5]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StreamingPage() {
  const router = useRouter();

  const [activeTab] = useState<TabType>("english");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");

  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const [shouldAutoplaySelected, setShouldAutoplaySelected] =
    useState(false);

  const hasUserStartedRef = useRef(false);

  const [playerHasStarted, setPlayerHasStarted] = useState(false);
  const [, setPlayerIsPlaying] = useState(false);

  const [showBackToTop, setShowBackToTop] = useState(false);

  const englishCategory = useMemo(
    () =>
      ENGLISH_CATEGORIES.find(
        (category) => category.id === activeCategory
      ) ?? ENGLISH_CATEGORIES[0],
    [activeCategory]
  );

  /*
   * MUSIC FUNCTIONALITY — COMMENTED OUT
   *
   * const musicCategory = useMemo(
   *   () =>
   *     MUSIC_CATEGORIES.find(
   *       (category) => category.id === activeCategory
   *     ) ?? MUSIC_CATEGORIES[0],
   *   [activeCategory]
   * );
   */

  const query = useMemo(() => {
    if (searchInput.trim()) {
      return searchInput.trim();
    }

    return englishCategory.query;
  }, [searchInput, englishCategory.query]);

  const {
    data: englishData,
    isLoading: englishLoading,
    error: englishError,
    refetch: refetchEnglish,
  } = useEnglishLearningVideos(query, 12);

  /*
   * MUSIC DATA — COMMENTED OUT
   *
   * const {
   *   data: musicData,
   *   isLoading: musicLoading,
   *   error: musicError,
   *   refetch: refetchMusic,
   * } = useMusicVideos(
   *   searchInput.trim()
   *     ? searchInput.trim()
   *     : musicCategory.query,
   *   12
   * );
   */

  const videos = useMemo(() => {
    return (englishData?.videos ?? []) as VideoItem[];
  }, [englishData]);

  /*
   * When music is enabled again, this can become:
   *
   * const videos =
   *   activeTab === "english"
   *     ? ((englishData?.videos ?? []) as VideoItem[])
   *     : ((musicData?.videos ?? []) as VideoItem[]);
   */

  const isLoading = englishLoading;

  /*
   * MUSIC LOADING — COMMENTED OUT
   *
   * const isLoading =
   *   activeTab === "english" ? englishLoading : musicLoading;
   */

  const error = englishError;

  /*
   * MUSIC ERROR — COMMENTED OUT
   *
   * const error =
   *   activeTab === "english" ? englishError : musicError;
   */

  const handleStarted = useCallback(() => {
    hasUserStartedRef.current = true;
    setPlayerHasStarted(true);
  }, []);

  const handlePlayingStateChange = useCallback((playing: boolean) => {
    setPlayerIsPlaying(playing);
  }, []);

  useEffect(() => {
    if (!videos.length) {
      setSelectedVideo(null);
      return;
    }

    setSelectedVideo((current) => {
      const stillExists = current
        ? videos.some((video) => video.id === current.id)
        : false;

      return stillExists ? current : videos[0];
    });

    // A new category/search result should load into the player
    // without unexpectedly starting playback.
    setShouldAutoplaySelected(false);
  }, [videos]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleVideoClick = useCallback(
    (video: VideoItem) => {
      const isSameVideo = selectedVideo?.id === video.id;

      if (isSameVideo) {
        return;
      }

      setSelectedVideo(video);

      /*
       * Important playback behavior:
       * - Before the user has played anything: cue the selected video.
       * - After the user has started playback: autoplay newly selected videos.
       */
      setShouldAutoplaySelected(hasUserStartedRef.current);
    },
    [selectedVideo?.id]
  );

  const handleCategorySelect = useCallback((category: Category) => {
    setActiveCategory(category.id);
    setSearchInput("");
    setShouldAutoplaySelected(false);
  }, []);

  const handleSearch = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const value = searchInput.trim();

      if (!value) {
        setActiveCategory("all");
        setShouldAutoplaySelected(false);
        await refetchEnglish();
        return;
      }

      setShouldAutoplaySelected(false);
      await refetchEnglish();
    },
    [searchInput, refetchEnglish]
  );

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setActiveCategory("all");
    setShouldAutoplaySelected(false);
  }, []);

  /*
   * MUSIC TAB HANDLER — COMMENTED OUT
   *
   * const handleTabChange = useCallback(
   *   (tab: TabType) => {
   *     if (tab === activeTab) return;
   *
   *     setActiveTab(tab);
   *     setActiveCategory(tab === "english" ? "all" : "trending");
   *     setSearchInput("");
   *     setShouldAutoplaySelected(false);
   *   },
   *   [activeTab]
   * );
   */

  const displayedVideos = useMemo(() => {
    if (!selectedVideo) return videos;

    return videos.filter((video) => video.id !== selectedVideo.id);
  }, [videos, selectedVideo]);

  return (
    <>
      <style jsx global>
        {TOKENS}
      </style>

      <main className="min-h-screen bg-[#f7f8fa] text-[#10192b]">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {/* Header */}
          <header className="mb-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  aria-label="Go back"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e2e6ec] bg-white text-[#3d4a61] transition hover:bg-[#f7f8fa]"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1a365d] text-white">
                      <GraduationCap className="h-4 w-4" />
                    </div>

                    <h1 className="truncate text-xl font-semibold tracking-tight text-[#10192b] sm:text-2xl">
                      English Learning
                    </h1>
                  </div>

                  <p className="mt-1 text-sm text-[#6b7789]">
                    Improve your grammar, vocabulary, pronunciation and
                    everyday English.
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Search */}
          <section className="mb-5">
            <form onSubmit={handleSearch} className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />

              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search English lessons..."
                className="h-11 w-full rounded-xl border border-[#e2e6ec] bg-white pl-10 pr-24 text-sm text-[#10192b] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1a365d] focus:ring-2 focus:ring-[#1a365d]/10"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-16 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#6b7789] hover:bg-[#f7f8fa]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-1.5 top-1/2 flex h-8 -translate-y-1/2 items-center gap-1.5 rounded-lg bg-[#1a365d] px-3 text-xs font-semibold text-white transition hover:bg-[#14294a]"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>
          </section>

          {/* English category navigation */}
          <section className="mb-6">
            <CategoryNavigation
              categories={ENGLISH_CATEGORIES}
              activeCategory={activeCategory}
              onSelect={handleCategorySelect}
            />
          </section>

          {/* MUSIC TAB / NAVIGATION — COMMENTED OUT */}
          {/*
          <section className="mb-6">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTabChange("english")}
              >
                English
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("music")}
              >
                Music
              </button>
            </div>
          </section>
          */}

          {/* Player */}
          <section className="mb-7">
            <VideoPlayer
              video={selectedVideo}
              hasUserStartedRef={hasUserStartedRef}
              shouldAutoplay={shouldAutoplaySelected}
              onStarted={handleStarted}
              onPlayingStateChange={handlePlayingStateChange}
            />
          </section>

          {/* Current category heading */}
          <section className="mb-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#1a365d]" />
                  <h2 className="text-base font-semibold text-[#10192b]">
                    {searchInput.trim()
                      ? `Search results for "${searchInput.trim()}"`
                      : englishCategory.label}
                  </h2>
                </div>

                <p className="mt-1 text-xs text-[#6b7789]">
                  Select a video to load it into the player.
                  {playerHasStarted &&
                    " New videos will start automatically when selected."}
                </p>
              </div>

              {!isLoading && videos.length > 0 && (
                <span className="shrink-0 text-xs text-[#6b7789]">
                  {videos.length} videos
                </span>
              )}
            </div>
          </section>

          {/* Loading */}
          {isLoading && <LoadingGrid />}

          {/* Error */}
          {!isLoading && error && (
            <div className="rounded-xl border border-[#e2e6ec] bg-white px-5 py-10 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#fdeeee]">
                <X className="h-5 w-5 text-[#a52121]" />
              </div>

              <h3 className="mt-3 text-sm font-semibold text-[#10192b]">
                Unable to load videos
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#6b7789]">
                There was a problem loading the English learning videos.
                Please try again.
              </p>

              <button
                type="button"
                onClick={() => refetchEnglish()}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-[#1a365d] px-4 text-xs font-semibold text-white hover:bg-[#14294a]"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && videos.length === 0 && (
            <div className="rounded-xl border border-[#e2e6ec] bg-white px-5 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2f8]">
                <Search className="h-5 w-5 text-[#1a365d]" />
              </div>

              <h3 className="mt-3 text-sm font-semibold text-[#10192b]">
                No videos found
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#6b7789]">
                Try a different search term or choose another English
                learning category.
              </p>
            </div>
          )}

          {/* Video grid */}
          {!isLoading && !error && displayedVideos.length > 0 && (
            <section>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {displayedVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    selected={selectedVideo?.id === video.id}
                    onClick={() => handleVideoClick(video)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Small footer note */}
          {!isLoading && videos.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#98a2b3]">
              <Clock3 className="h-3.5 w-3.5" />
              <span>
                Choose a lesson and continue learning at your own pace.
              </span>
            </div>
          )}
        </div>
      </main>

      {/* Back to Top Button - Left Side */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 left-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#1a365d] text-white shadow-lg transition hover:bg-[#14294a] hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </>
  );
}