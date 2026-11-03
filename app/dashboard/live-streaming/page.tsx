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
  Music2,
  Play,
  Search,
  Volume2,
  X,
  ArrowUp,
} from "lucide-react";
import {
  useEnglishLearningVideos,
  useMusicVideos,
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

type TabType = "english" | "music";

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
    playerVars?: Record<string, string | number>;
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
    label: "University English",
    query: "advanced English communication for university students",
  },
  {
    id: "presentations",
    label: "Presentations",
    query: "university student presentations public speaking in English",
  },
  {
    id: "academic-discussion",
    label: "Academic Discussion",
    query: "academic discussion debate seminar English speaking skills",
  },
  {
    id: "academic-writing",
    label: "Academic Writing",
    query: "academic English writing university essays lectures",
  },
  {
    id: "vocabulary",
    label: "Academic Vocabulary",
    query: "academic English vocabulary university students",
  },
  {
    id: "listening",
    label: "Listening",
    query: "university lecture listening comprehension English",
  },
  {
    id: "pronunciation",
    label: "Clear Speech",
    query: "English pronunciation clarity public speaking university",
  },
  {
    id: "lectures",
    label: "Lectures & Seminars",
    query: "university lecture seminar in English communication",
  },
];

const MUSIC_CATEGORIES: Category[] = [
  { id: "trending", label: "Trending", query: "trending music videos lyrics" },
  { id: "popular", label: "Popular", query: "popular music videos lyrics" },
  { id: "gospel", label: "Gospel", query: "gospel music video lyrics" },
  { id: "old-school", label: "Old School", query: "old school hits music video lyrics" },
  { id: "rnb", label: "R&B", query: "R&B music video lyrics" },
  { id: "hiphop", label: "Hip Hop", query: "hip hop music video lyrics" },
  { id: "afrobeats", label: "Afrobeats", query: "Afrobeats music video lyrics" },
  { id: "pop", label: "Pop", query: "pop music video lyrics" },
  { id: "reggae", label: "Reggae", query: "reggae music video lyrics" },
  { id: "classic", label: "Classics", query: "classic hits music video lyrics" },
  { id: "rock", label: "Rock", query: "rock music video lyrics" },
  { id: "jazz", label: "Jazz", query: "jazz music video lyrics" },
  { id: "country", label: "Country", query: "country music video lyrics" },
  { id: "electronic", label: "Electronic", query: "electronic dance music videos lyrics" },
];

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
        "group flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm",
        "transition duration-200",
        "hover:-translate-y-1 hover:shadow-lg",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30",
        selected
          ? "border-[#1a365d] shadow-md ring-2 ring-[#1a365d]/10"
          : "border-[#e2e6ec]",
      ].join(" ")}
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[#eef1f5]">
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

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="break-words text-base font-semibold leading-6 text-[#10192b] sm:text-[17px]">
          {safeText(video.title, "Untitled video")}
        </h3>

        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-[#eef1f5] pt-3 text-sm text-[#6b7789]">
          {video.channelTitle && (
            <span className="min-w-0 break-words font-medium text-[#3d4a61]">
              {safeText(video.channelTitle)}
            </span>
          )}

          {video.viewCount !== undefined && (
            <span className="flex shrink-0 items-center gap-1.5">
                <Eye className="h-3 w-3" />
                {formatViews(video.viewCount)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function VideoPlayer({
  video,
  contentLabel,
  hasUserStartedRef,
  playVideoRef,
  shouldAutoplay,
  onStarted,
  onEnded,
  onPlayingStateChange,
}: {
  video: VideoItem | null;
  contentLabel: string;
  hasUserStartedRef: MutableRefObject<boolean>;
  playVideoRef: MutableRefObject<(videoId: string) => void>;
  shouldAutoplay: boolean;
  onStarted: () => void;
  onEnded: () => void;
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
  const playerIsPlayingRef = useRef(false);
  const onEndedRef = useRef(onEnded);

  const handlePlayingStateChange = useCallback(
    (playing: boolean) => {
      playerIsPlayingRef.current = playing;
      setPlayerIsPlaying(playing);
      onPlayingStateChange(playing);
    },
    [onPlayingStateChange]
  );

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    playVideoRef.current = (videoId) => {
      latestVideoIdRef.current = videoId;
      latestAutoplayRef.current = true;
      loadedVideoIdRef.current = videoId;
      setPlayerError(false);

      if (readyRef.current && playerRef.current) {
        playerRef.current.loadVideoById(videoId);
      }
    };

    return () => {
      playVideoRef.current = () => {};
    };
  }, [playVideoRef]);

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

        playerRef.current = new window.YT.Player(playerHostRef.current, {
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            playsinline: 1,
            cc_load_policy: 1,
            cc_lang_pref: "en",
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

              if (latestAutoplayRef.current || playerIsPlayingRef.current) {
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

              if (state === window.YT.PlayerState.ENDED) {
                handlePlayingStateChange(false);
                onEndedRef.current();
                return;
              }

              if (
                state === window.YT.PlayerState.PAUSED ||
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

    if (shouldAutoplay || playerIsPlayingRef.current) {
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

        {!video && !playerError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f7f8fa]">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2f8]">
                <Play className="h-5 w-5 text-[#1a365d]" />
              </div>
              <p className="mt-3 text-sm font-medium text-[#3d4a61]">
                Select a video to start watching
              </p>
            </div>
          </div>
        )}
      </div>

      {video && (
        <div className="border-t border-[#e2e6ec] px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-[#1a365d]">
                <BookOpen className="h-3.5 w-3.5" />
                {contentLabel}
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
      )}
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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

  const [activeTab, setActiveTab] = useState<TabType>("english");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeMusicCategory, setActiveMusicCategory] = useState("gospel");
  const [searchInput, setSearchInput] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const playVideoRef = useRef<(videoId: string) => void>(() => {});

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

  const musicCategory = useMemo(
    () =>
      MUSIC_CATEGORIES.find(
        (category) => category.id === activeMusicCategory
      ) ?? MUSIC_CATEGORIES[0],
    [activeMusicCategory]
  );

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

  const musicQuery = searchInput.trim()
    ? `${searchInput.trim()} music video lyrics`
    : musicCategory.query;
  const {
    data: musicData,
    isLoading: musicLoading,
    error: musicError,
    refetch: refetchMusic,
  } = useMusicVideos(
    musicQuery,
    12,
    activeTab === "music",
    searchInput.trim() ? undefined : musicCategory.id
  );

  const videos = useMemo(() => {
    return ((activeTab === "english"
      ? englishData?.videos
      : musicData?.videos) ?? []) as VideoItem[];
  }, [activeTab, englishData, musicData]);

  const isLoading = activeTab === "english" ? englishLoading : musicLoading;
  const error = activeTab === "english" ? englishError : musicError;
  const activeCategoryLabel =
    activeTab === "english" ? englishCategory.label : musicCategory.label;
  const contentLabel = activeTab === "english" ? "English Learning" : "Music";
  const activeVideo =
    activeTab === "music"
      ? selectedVideo ?? musicData?.randomVideo ?? null
      : selectedVideo ?? englishData?.videos[0] ?? null;

  const handleStarted = useCallback(() => {
    hasUserStartedRef.current = true;
    setPlayerHasStarted(true);
  }, []);

  const handlePlayingStateChange = useCallback((playing: boolean) => {
    setPlayerIsPlaying(playing);
  }, []);

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

      playVideoRef.current(video.id);
      setSelectedVideo(video);

      setShouldAutoplaySelected(true);
    },
    [selectedVideo?.id]
  );

  const handleVideoEnded = useCallback(() => {
    const currentIndex = videos.findIndex(
      (video) => video.id === activeVideo?.id
    );
    const nextVideo = currentIndex >= 0 ? videos[currentIndex + 1] : undefined;

    if (nextVideo) {
      playVideoRef.current(nextVideo.id);
      setSelectedVideo(nextVideo);
      setShouldAutoplaySelected(true);
      return;
    }

    const categories =
      activeTab === "music" ? MUSIC_CATEGORIES : ENGLISH_CATEGORIES;
    const currentCategoryId =
      activeTab === "music" ? activeMusicCategory : activeCategory;
    const currentCategoryIndex = categories.findIndex(
      (category) => category.id === currentCategoryId
    );
    const nextCategory =
      categories[(currentCategoryIndex + 1 + categories.length) % categories.length];

    if (activeTab === "music") {
      setActiveMusicCategory(nextCategory.id);
    } else {
      setActiveCategory(nextCategory.id);
    }

    setSearchInput("");
    setSelectedVideo(null);
    setShouldAutoplaySelected(true);
  }, [
    activeCategory,
    activeMusicCategory,
    activeTab,
    activeVideo?.id,
    videos,
  ]);

  const handleCategorySelect = useCallback((category: Category) => {
    if (activeVideo) {
      setSelectedVideo(activeVideo);
    }

    if (activeTab === "english") {
      setActiveCategory(category.id);
    } else {
      setActiveMusicCategory(category.id);
    }
    setSearchInput("");
    setShouldAutoplaySelected(false);
  }, [activeTab, activeVideo]);

  const handleSearch = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const value = searchInput.trim();

      if (!value) {
        if (activeTab === "english") setActiveCategory("all");
        setShouldAutoplaySelected(false);
        await (activeTab === "english" ? refetchEnglish() : refetchMusic());
        return;
      }

      setShouldAutoplaySelected(false);
      await (activeTab === "english" ? refetchEnglish() : refetchMusic());
    },
    [activeTab, searchInput, refetchEnglish, refetchMusic]
  );

  const clearSearch = useCallback(() => {
    setSearchInput("");
    if (activeTab === "english") setActiveCategory("all");
    setShouldAutoplaySelected(false);
  }, [activeTab]);

  const handleTabChange = useCallback(
    (tab: TabType) => {
      if (tab === activeTab) return;

      if (tab === "music" && activeTab !== "music") {
        setActiveMusicCategory("gospel");
      }

      if (activeVideo) {
        setSelectedVideo(activeVideo);
      }

      setActiveTab(tab);
      setSearchInput("");
      setSearchOpen(false);
      setShouldAutoplaySelected(false);
    },
    [activeTab, activeVideo]
  );

  const displayedVideos = useMemo(() => {
    if (!activeVideo) return videos;

    return videos.filter((video) => video.id !== activeVideo.id);
  }, [videos, activeVideo]);

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
                      {activeTab === "english" ? (
                        <GraduationCap className="h-4 w-4" />
                      ) : (
                        <Music2 className="h-4 w-4" />
                      )}
                    </div>

                    <h1 className="truncate text-xl font-semibold tracking-tight text-[#10192b] sm:text-2xl">
                      {contentLabel}
                    </h1>
                  </div>

                  <p className="mt-1 text-sm text-[#6b7789]">
                    {activeTab === "english"
                      ? "Improve your grammar, vocabulary, pronunciation and everyday English."
                      : "Stream music videos with captions when available."}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <section
            aria-label="Streaming sections"
            className="mb-5 flex items-center justify-between gap-3"
          >
            <div className="flex min-w-0 gap-2">
              {(["english", "music"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  aria-pressed={activeTab === tab}
                  className={[
                    "inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition",
                    activeTab === tab
                      ? "border-[#1a365d] bg-[#1a365d] text-white"
                      : "border-[#e2e6ec] bg-white text-[#3d4a61] hover:bg-[#f7f8fa]",
                  ].join(" ")}
                >
                  {tab === "english" ? (
                    <GraduationCap className="h-4 w-4" />
                  ) : (
                    <Music2 className="h-4 w-4" />
                  )}
                  {tab === "english" ? "English" : "Music"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e2e6ec] bg-white text-[#3d4a61] transition hover:bg-[#f7f8fa] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30"
            >
              {searchOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </section>

          {/* Expandable search */}
          <section
            aria-hidden={!searchOpen}
            className={[
              "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out",
              searchOpen
                ? "mb-5 grid-rows-[1fr] opacity-100"
                : "mb-0 grid-rows-[0fr] opacity-0",
            ].join(" ")}
          >
            <div className="min-h-0 overflow-hidden">
              <form onSubmit={handleSearch} className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />

                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={
                    activeTab === "english"
                      ? "Search academic English skills..."
                      : "Search music videos and lyrics..."
                  }
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
            </div>
          </section>

          {/* Category navigation */}
          <section className="mb-6">
            <CategoryNavigation
              categories={
                activeTab === "english"
                  ? ENGLISH_CATEGORIES
                  : MUSIC_CATEGORIES
              }
              activeCategory={
                activeTab === "english"
                  ? activeCategory
                  : activeMusicCategory
              }
              onSelect={handleCategorySelect}
            />
          </section>

          {/* Player */}
          <section className="mb-7">
            <VideoPlayer
              video={activeVideo}
              contentLabel={contentLabel}
              hasUserStartedRef={hasUserStartedRef}
              playVideoRef={playVideoRef}
              shouldAutoplay={shouldAutoplaySelected}
              onStarted={handleStarted}
              onEnded={handleVideoEnded}
              onPlayingStateChange={handlePlayingStateChange}
            />
            {activeTab === "music" && (
              <p className="mt-2 text-xs text-[#6b7789]">
                Use the YouTube CC control for captions when the video
                provides them. Lyrics are not available for every video.
              </p>
            )}
          </section>

          {/* Current category heading */}
          <section className="mb-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  {activeTab === "english" ? (
                    <BookOpen className="h-4 w-4 text-[#1a365d]" />
                  ) : (
                    <Music2 className="h-4 w-4 text-[#1a365d]" />
                  )}
                  <h2 className="text-base font-semibold text-[#10192b]">
                    {searchInput.trim()
                      ? `Search results for "${searchInput.trim()}"`
                      : activeCategoryLabel}
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
                There was a problem loading these videos. Please try again.
              </p>

              <button
                type="button"
                onClick={() =>
                  activeTab === "english"
                    ? refetchEnglish()
                    : refetchMusic()
                }
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
                Try a different search term or choose another category.
              </p>
            </div>
          )}

          {/* Video grid */}
          {!isLoading && !error && displayedVideos.length > 0 && (
            <section>
              <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {displayedVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    selected={activeVideo?.id === video.id}
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
                {activeTab === "english"
                  ? "Choose a lesson and continue learning at your own pace."
                  : "Choose a video to watch; captions depend on the video."}
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