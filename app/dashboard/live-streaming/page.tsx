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
import Image from "next/image";
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
  Radio,
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
    --ink: #0f172a;
    --ink-2: #334155;
    --ink-3: #64748b;
    --ink-4: #94a3b8;
    --surface: #ffffff;
    --surface-2: #f8fafc;
    --surface-3: #f1f5f9;
    --line: #e2e8f0;
    --line-strong: #cbd5e1;
    --brand: #1a365d;
    --brand-hover: #14294a;
    --brand-soft: #eef2f8;
    --radius: 12px;
    --radius-sm: 8px;
  }
`;

const ENGLISH_CATEGORIES: Category[] = [
  { id: "all", label: "University English", query: "advanced English communication for university students" },
  { id: "presentations", label: "Presentations", query: "university student presentations public speaking in English" },
  { id: "academic-discussion", label: "Academic Discussion", query: "academic discussion debate seminar English speaking skills" },
  { id: "academic-writing", label: "Academic Writing", query: "academic English writing university essays lectures" },
  { id: "vocabulary", label: "Academic Vocabulary", query: "academic English vocabulary university students" },
  { id: "listening", label: "Listening", query: "university lecture listening comprehension English" },
  { id: "pronunciation", label: "Clear Speech", query: "English pronunciation clarity public speaking university" },
  { id: "lectures", label: "Lectures & Seminars", query: "university lecture seminar in English communication" },
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
  if (value === undefined || value === null || value === "") return "";
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return String(value);
  if (numeric >= 1_000_000_000) return `${(numeric / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (numeric >= 1_000_000) return `${(numeric / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (numeric >= 1_000) return `${(numeric / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(numeric);
}

function loadYouTubeAPI() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("YouTube player is only available in the browser."));
      return;
    }
    if (window.YT?.Player) { resolve(); return; }
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previousCallback?.(); resolve(); };
    if (existingScript) return;
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("Unable to load the YouTube player."));
    document.head.appendChild(script);
  });
}

/* ---------- Compact List Item (Matches "Up Next" style) ---------- */
function VideoListItem({
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
        "group flex w-full gap-3 rounded-xl p-2 text-left transition",
        selected ? "bg-[#eef2f8] ring-1 ring-[#1a365d]/20" : "hover:bg-[#f8fafc]",
      ].join(" ")}
    >
      <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-[#f1f5f9] sm:w-40">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 640px) 128px, 160px"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Play className="h-5 w-5 text-[#94a3b8]" />
          </div>
        )}
        {video.duration && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {video.duration}
          </span>
        )}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Volume2 className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#0f172a]">
          {safeText(video.title, "Untitled video")}
        </h3>
        
        {video.channelTitle && (
          <p className="mt-1 truncate text-xs text-[#64748b]">
            {safeText(video.channelTitle)}
          </p>
        )}
        
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#94a3b8]">
          {video.viewCount !== undefined && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {formatViews(video.viewCount)} views
            </span>
          )}
          {video.publishedAt && (
            <span>•</span>
          )}
          {video.publishedAt && (
            <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
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

  useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);

  useEffect(() => {
    playVideoRef.current = (videoId) => {
      latestVideoIdRef.current = videoId;
      latestAutoplayRef.current = true;
      loadedVideoIdRef.current = videoId;
      setPlayerError(false);
      if (readyRef.current && playerRef.current) playerRef.current.loadVideoById(videoId);
    };
    return () => { playVideoRef.current = () => {}; };
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
        if (cancelled || !playerHostRef.current || !window.YT?.Player) return;
        if (playerRef.current) return;
        playerRef.current = new window.YT.Player(playerHostRef.current, {
          playerVars: {
            autoplay: 0, controls: 1, rel: 0, modestbranding: 1,
            iv_load_policy: 3, playsinline: 1, cc_load_policy: 1, cc_lang_pref: "en",
          },
          events: {
            onReady: () => {
              readyRef.current = true;
              setPlayerReady(true);
              setPlayerError(false);
              const currentVideoId = latestVideoIdRef.current;
              if (!currentVideoId || !playerRef.current) return;
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
              if (state === window.YT.PlayerState.PAUSED || state === window.YT.PlayerState.CUED) {
                handlePlayingStateChange(false);
              }
            },
            onError: () => { setPlayerError(true); handlePlayingStateChange(false); },
          },
        });
      } catch {
        if (!cancelled) setPlayerError(true);
      }
    }
    createPlayer();
    return () => { cancelled = true; };
  }, [handlePlayingStateChange, onStarted, hasUserStartedRef]);

  useEffect(() => {
    if (!readyRef.current || !playerRef.current || !video?.id) return;
    const nextVideoId = video.id;
    if (loadedVideoIdRef.current === nextVideoId) return;
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
    <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-black">
      <div className="relative aspect-video w-full bg-black">
        <div ref={playerHostRef} className="absolute inset-0 h-full w-full" />

        {!playerReady && !playerError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f172a]">
            <div className="text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-white" />
              <p className="mt-2 text-xs text-white/70">Loading video...</p>
            </div>
          </div>
        )}

        {playerError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f172a] px-5">
            <div className="text-center">
              <p className="text-sm font-medium text-white">Unable to load this video</p>
              <p className="mt-1 text-xs text-white/60">Please select another video.</p>
            </div>
          </div>
        )}

        {!video && !playerError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f8fafc]">
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2f8]">
                <Play className="h-4 w-4 text-[#1a365d]" />
              </div>
              <p className="mt-2 text-xs font-medium text-[#334155]">Select a video to start watching</p>
            </div>
          </div>
        )}
      </div>

      {video && (
        <div className="flex items-start justify-between gap-3 border-t border-[#e2e8f0] bg-white px-3 py-2.5">
          <div className="min-w-0">
            <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-medium text-[#1a365d]">
              <BookOpen className="h-3 w-3" /> {contentLabel}
            </div>
            <h2 className="line-clamp-1 text-sm font-semibold leading-5 text-[#0f172a]">
              {safeText(video.title, "Untitled video")}
            </h2>
            {video.channelTitle && (
              <p className="mt-0.5 truncate text-[11px] text-[#64748b]">{safeText(video.channelTitle)}</p>
            )}
          </div>
          <div className="hidden shrink-0 items-center gap-1 rounded bg-[#f8fafc] px-2 py-1 text-[11px] text-[#64748b] sm:flex">
            <Play className="h-3 w-3" />
            {playerIsPlaying ? "Playing" : playerHasStarted ? "Paused" : "Ready"}
          </div>
        </div>
      )}
    </div>
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
    scrollRef.current.scrollBy({ left: direction === "left" ? -260 : 260, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Scroll categories left"
        className="absolute left-0 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#334155] shadow-sm hover:bg-[#f8fafc] sm:flex"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <div ref={scrollRef} className="flex gap-1.5 overflow-x-auto px-0 pb-0.5 scrollbar-none sm:px-9">
        {categories.map((category) => {
          const active = category.id === activeCategory;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category)}
              className={[
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "border-[#1a365d] bg-[#1a365d] text-white"
                  : "border-[#e2e8f0] bg-white text-[#334155] hover:border-[#cbd5e1] hover:bg-[#f8fafc]",
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
        className="absolute right-0 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#334155] shadow-sm hover:bg-[#f8fafc] sm:flex"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function LoadingList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-xl p-2">
          <div className="aspect-video w-32 shrink-0 animate-pulse rounded-lg bg-[#f1f5f9] sm:w-40" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-full animate-pulse rounded bg-[#f1f5f9]" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-[#f1f5f9]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[#f1f5f9]" />
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
  const [shouldAutoplaySelected, setShouldAutoplaySelected] = useState(false);
  const hasUserStartedRef = useRef(false);
  const [playerHasStarted, setPlayerHasStarted] = useState(false);
  const [, setPlayerIsPlaying] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const englishCategory = useMemo(
    () => ENGLISH_CATEGORIES.find((c) => c.id === activeCategory) ?? ENGLISH_CATEGORIES[0],
    [activeCategory]
  );
  const musicCategory = useMemo(
    () => MUSIC_CATEGORIES.find((c) => c.id === activeMusicCategory) ?? MUSIC_CATEGORIES[0],
    [activeMusicCategory]
  );

  const query = useMemo(() => {
    if (searchInput.trim()) return searchInput.trim();
    return englishCategory.query;
  }, [searchInput, englishCategory.query]);

  const { data: englishData, isLoading: englishLoading, error: englishError, refetch: refetchEnglish } =
    useEnglishLearningVideos(query, 12);

  const musicQuery = searchInput.trim()
    ? `${searchInput.trim()} music video lyrics`
    : musicCategory.query;
  const { data: musicData, isLoading: musicLoading, error: musicError, refetch: refetchMusic } =
    useMusicVideos(
      musicQuery,
      12,
      activeTab === "music",
      searchInput.trim() ? undefined : musicCategory.id
    );

  const videos = useMemo(() => {
    return ((activeTab === "english" ? englishData?.videos : musicData?.videos) ?? []) as VideoItem[];
  }, [activeTab, englishData, musicData]);

  const isLoading = activeTab === "english" ? englishLoading : musicLoading;
  const error = activeTab === "english" ? englishError : musicError;
  const activeCategoryLabel = activeTab === "english" ? englishCategory.label : musicCategory.label;
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
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleVideoClick = useCallback(
    (video: VideoItem) => {
      if (selectedVideo?.id === video.id) return;
      playVideoRef.current(video.id);
      setSelectedVideo(video);
      setShouldAutoplaySelected(true);
    },
    [selectedVideo?.id]
  );

  const handleVideoEnded = useCallback(() => {
    const currentIndex = videos.findIndex((v) => v.id === activeVideo?.id);
    const nextVideo = currentIndex >= 0 ? videos[currentIndex + 1] : undefined;
    if (nextVideo) {
      playVideoRef.current(nextVideo.id);
      setSelectedVideo(nextVideo);
      setShouldAutoplaySelected(true);
      return;
    }
    const categories = activeTab === "music" ? MUSIC_CATEGORIES : ENGLISH_CATEGORIES;
    const currentCategoryId = activeTab === "music" ? activeMusicCategory : activeCategory;
    const currentCategoryIndex = categories.findIndex((c) => c.id === currentCategoryId);
    const nextCategory = categories[(currentCategoryIndex + 1 + categories.length) % categories.length];
    if (activeTab === "music") setActiveMusicCategory(nextCategory.id);
    else setActiveCategory(nextCategory.id);
    setSearchInput("");
    setSelectedVideo(null);
    setShouldAutoplaySelected(true);
  }, [activeCategory, activeMusicCategory, activeTab, activeVideo?.id, videos]);

  const handleCategorySelect = useCallback((category: Category) => {
    if (activeVideo) setSelectedVideo(activeVideo);
    if (activeTab === "english") setActiveCategory(category.id);
    else setActiveMusicCategory(category.id);
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
      if (tab === "music" && activeTab !== "music") setActiveMusicCategory("gospel");
      if (activeVideo) setSelectedVideo(activeVideo);
      setActiveTab(tab);
      setSearchInput("");
      setSearchOpen(false);
      setShouldAutoplaySelected(false);
    },
    [activeTab, activeVideo]
  );

  const displayedVideos = useMemo(() => {
    if (!activeVideo) return videos;
    return videos.filter((v) => v.id !== activeVideo.id);
  }, [videos, activeVideo]);

  return (
    <>
      <style jsx global>{TOKENS}</style>

      <main className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
        <div className="mx-auto w-full max-w-[1200px] px-3 pt-12 pb-3 sm:px-4 lg:px-6">
          
          {/* ---- Page Title ---- */}
          <div className="mb-6 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Radio className="h-4 w-4 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
                Live Streaming
              </h1>
            </div>
            <p className="text-sm text-[#64748b]">
              Watch and learn with curated English lessons and music lyrics.
            </p>
          </div>

          {/* ---- Top bar ---- */}
          <header className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Go back"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#334155] transition hover:bg-[#f8fafc]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSearchOpen((o) => !o)}
                aria-label={searchOpen ? "Close search" : "Open search"}
                aria-expanded={searchOpen}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#334155] transition hover:bg-[#f8fafc]"
              >
                {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </button>
            </div>
          </header>

          {/* ---- Search (expandable) ---- */}
          <section
            aria-hidden={!searchOpen}
            className={[
              "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out",
              searchOpen ? "mb-3 grid-rows-[1fr] opacity-100" : "mb-0 grid-rows-[0fr] opacity-0",
            ].join(" ")}
          >
            <div className="min-h-0 overflow-hidden">
              <form onSubmit={handleSearch} className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={activeTab === "english" ? "Search academic English skills..." : "Search music lyrics..."}
                  className="h-10 w-full rounded-lg border border-[#e2e8f0] bg-white pl-9 pr-24 text-sm outline-none transition placeholder:text-[#94a3b8] focus:border-[#1a365d] focus:ring-2 focus:ring-[#1a365d]/10"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    className="absolute right-16 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-[#64748b] hover:bg-[#f8fafc]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 flex h-8 -translate-y-1/2 items-center gap-1 rounded-md bg-[#1a365d] px-2.5 text-xs font-semibold text-white transition hover:bg-[#14294a]"
                >
                  <Search className="h-3 w-3" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </form>
            </div>
          </section>

          {/* ---- Main Layout: Player + Full-Width List ---- */}
          <div className="flex flex-col gap-4">
            
            {/* Player */}
            <div className="w-full">
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
                <p className="mt-1.5 text-[11px] text-[#64748b]">
                  Use YouTube CC for captions when available.
                </p>
              )}
            </div>

            {/* Main content tabs */}
            <div
              role="tablist"
              aria-label="Streaming categories"
              className="grid grid-cols-2 gap-2 rounded-xl border border-[#e2e6ec] bg-white p-1.5 shadow-sm"
            >
              {(["english", "music"] as const).map((tab) => {
                const isActive = activeTab === tab;
                const Icon = tab === "english" ? GraduationCap : Music2;
                const label = tab === "english" ? "English Learning" : "Music";
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleTabChange(tab)}
                    className={[
                      "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30",
                      isActive
                        ? "border-[#1a365d] bg-[#1a365d] text-white shadow-sm"
                        : "border-transparent text-[#3d4a61] hover:bg-[#f7f8fa]",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Categories */}
            <div aria-label={`${contentLabel} categories`}>
              <CategoryNavigation
                categories={activeTab === "english" ? ENGLISH_CATEGORIES : MUSIC_CATEGORIES}
                activeCategory={activeTab === "english" ? activeCategory : activeMusicCategory}
                onSelect={handleCategorySelect}
              />
            </div>

            {/* Video List Header */}
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  {activeTab === "english" ? (
                    <BookOpen className="h-3.5 w-3.5 text-[#1a365d]" />
                  ) : (
                    <Music2 className="h-3.5 w-3.5 text-[#1a365d]" />
                  )}
                  <h2 className="truncate text-sm font-semibold text-[#0f172a]">
                    {searchInput.trim()
                      ? `Results for "${searchInput.trim()}"`
                      : activeCategoryLabel}
                  </h2>
                </div>
                <p className="mt-0.5 text-[11px] text-[#64748b]">
                  {playerHasStarted
                    ? "Selected videos start automatically."
                    : "Select a video to load it into the player."}
                </p>
              </div>
              {!isLoading && videos.length > 0 && (
                <span className="shrink-0 text-[11px] text-[#64748b]">{videos.length} videos</span>
              )}
            </div>

            {/* Video List */}
            {isLoading && <LoadingList />}

            {!isLoading && error && (
              <div className="rounded-lg border border-[#e2e8f0] bg-white px-4 py-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#fef2f2]">
                  <X className="h-4 w-4 text-[#b91c1c]" />
                </div>
                <h3 className="mt-2.5 text-sm font-semibold text-[#0f172a]">Unable to load videos</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#64748b]">
                  There was a problem loading these videos. Please try again.
                </p>
                <button
                  type="button"
                  onClick={() => (activeTab === "english" ? refetchEnglish() : refetchMusic())}
                  className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#1a365d] px-3 text-xs font-semibold text-white hover:bg-[#14294a]"
                >
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !error && videos.length === 0 && (
              <div className="rounded-lg border border-[#e2e8f0] bg-white px-4 py-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2f8]">
                  <Search className="h-4 w-4 text-[#1a365d]" />
                </div>
                <h3 className="mt-2.5 text-sm font-semibold text-[#0f172a]">No videos found</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#64748b]">
                  Try a different search term or choose another category.
                </p>
              </div>
            )}

            {!isLoading && !error && displayedVideos.length > 0 && (
              <div className="space-y-1">
                {displayedVideos.map((video) => (
                  <VideoListItem
                    key={video.id}
                    video={video}
                    selected={activeVideo?.id === video.id}
                    onClick={() => handleVideoClick(video)}
                  />
                ))}
              </div>
            )}

            {!isLoading && videos.length > 0 && (
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#94a3b8]">
                <Clock3 className="h-3 w-3" />
                <span>
                  {activeTab === "english"
                    ? "Continue learning at your own pace."
                    : "Captions depend on the video."}
                </span>
              </div>
            )}

          </div>
        </div>
      </main>

      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-5 left-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-[#1a365d] text-white shadow-lg transition hover:bg-[#14294a] hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </>
  );
}