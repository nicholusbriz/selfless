"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoplay?: boolean;
  title?: string;
  description?: string;
  onEnded?: () => void;
  playRef?: React.RefObject<{ play: () => void } | null>;
  onPrevious?: () => void;
  onNext?: () => void;
  videoIndex?: number;  // 0-based
  videoCount?: number;
}

/* ─────────────────────────────────────────────────────────────
   Global singleton — ensures only one video plays at a time
───────────────────────────────────────────────────────────── */
class VideoManager {
  private static instance: VideoManager;
  private currentPlayingId: string | null = null;
  private callbacks: Map<string, () => void> = new Map();

  static getInstance(): VideoManager {
    if (!VideoManager.instance) {
      VideoManager.instance = new VideoManager();
    }
    return VideoManager.instance;
  }

  register(id: string, onPause: () => void) {
    this.callbacks.set(id, onPause);
  }

  unregister(id: string) {
    this.callbacks.delete(id);
    if (this.currentPlayingId === id) this.currentPlayingId = null;
  }

  requestPlay(id: string) {
    if (this.currentPlayingId && this.currentPlayingId !== id) {
      this.callbacks.get(this.currentPlayingId)?.();
    }
    this.currentPlayingId = id;
  }
}

/* ─────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────── */
export function VideoPlayer({
  src,
  poster,
  className = "",
  title,
  description,
  onEnded,
  playRef,
  onPrevious,
  onNext,
  videoIndex,
  videoCount,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const instanceId = useRef(`video-${Math.random().toString(36).substr(2, 9)}`);
  const onEndedRef = useRef(onEnded);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* ── expose play() via ref ── */
  useEffect(() => {
    if (playRef) {
      playRef.current = {
        play: () => {
          if (videoRef.current) {
            VideoManager.getInstance().requestPlay(instanceId.current);
            videoRef.current.play().catch((e) => console.warn("Autoplay failed:", e));
          }
        },
      };
    }
    return () => { if (playRef) playRef.current = null; };
  }, [playRef]);

  useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);

  /* ── helpers ── */
  const formatTime = useCallback((t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      VideoManager.getInstance().requestPlay(instanceId.current);
      videoRef.current.play();
    }
    setIsPlaying((p) => !p);
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  }, [duration]);

  const handleTouchSeek = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const pos = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
      videoRef.current.currentTime = pos * duration;
    }
  }, [duration]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted((m) => !m);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, [isFullscreen]);

  /* ── video event listeners ── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onMeta = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    const onEnded = () => {
      setIsPlaying(false);
      onEndedRef.current?.();
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("ended", onEnded);
    document.addEventListener("fullscreenchange", onFsChange);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("ended", onEnded);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [src]);

  /* ── reset on src change ── */
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsBuffering(false);
  }, [src]);

  /* ── mobile detection ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── VideoManager registration ── */
  useEffect(() => {
    const pauseFn = () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };
    VideoManager.getInstance().register(instanceId.current, pauseFn);
    return () => VideoManager.getInstance().unregister(instanceId.current);
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const marqueeText = [title, description].filter(Boolean).join(" • ");

  /* ─────────────────────────────────────────────────────────
     Layout:
       flex-col
       ├── video area  (pure, clean, no overlays except
       │                buffering spinner + centre play btn)
       └── footer bar  (progress + controls + marquee)
  ───────────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-black rounded-xl overflow-hidden ${className}`}
    >
      {/* ══════════════════════════════════════════════
          VIDEO — completely clean, no gradient overlay
      ══════════════════════════════════════════════ */}
      <div className="relative bg-black">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full aspect-video object-contain"
          onClick={togglePlay}
          playsInline
        />

        {/* Buffering spinner */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Centre play button — shown only when paused, no gradient */}
        {!isPlaying && !isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-2xl"
              aria-label="Play"
            >
              <Play className="w-8 h-8 text-black ml-1" fill="black" />
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          FOOTER — lives below the video, not on top
      ══════════════════════════════════════════════ */}
      <div className="shrink-0 bg-[#0F1923]">

        {/* Progress bar */}
        <div
          ref={progressRef}
          className={`relative bg-white/15 cursor-pointer group/progress transition-all duration-200 ${isMobile ? "h-2" : "h-1.5 hover:h-2.5"
            }`}
          onClick={handleSeek}
          onTouchMove={handleTouchSeek}
        >
          <div
            className="absolute left-0 top-0 h-full bg-[#C59B4C] transition-colors group-hover/progress:bg-[#D4A84F]"
            style={{ width: `${progressPercent}%` }}
          >
            <div
              className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg transition-opacity ${isMobile
                ? "w-3.5 h-3.5 opacity-100"
                : "w-2.5 h-2.5 opacity-0 group-hover/progress:opacity-100"
                }`}
            />
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3 px-3 py-2.5">

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="shrink-0 text-white hover:text-[#C59B4C] transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying
              ? <Pause className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
              : <Play className={`ml-0.5 ${isMobile ? "w-5 h-5" : "w-4 h-4"}`} />
            }
          </button>

          {/* Time */}
          <span className={`shrink-0 tabular-nums text-white/70 font-medium ${isMobile ? "text-xs" : "text-[11px]"}`}>
            {formatTime(currentTime)}<span className="text-white/40 mx-0.5">/</span>{formatTime(duration)}
          </span>

          {/* Mute */}
          <button
            onClick={toggleMute}
            className="shrink-0 text-white/70 hover:text-[#C59B4C] transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted
              ? <VolumeX className={isMobile ? "w-4 h-4" : "w-3.5 h-3.5"} />
              : <Volume2 className={isMobile ? "w-4 h-4" : "w-3.5 h-3.5"} />
            }
          </button>

          {/* Marquee title — fills the space between left and right controls */}
          {marqueeText ? (
            <div className="flex-1 overflow-hidden mx-1">
              <div className="flex whitespace-nowrap animate-marquee">
                <span className={`text-white/75 font-medium ${isMobile ? "text-xs" : "text-[11px]"}`}>
                  {marqueeText}
                </span>
                <span className={`mx-3 text-[#C59B4C] ${isMobile ? "text-xs" : "text-[11px]"}`}>•</span>
                <span className={`text-white/75 font-medium ${isMobile ? "text-xs" : "text-[11px]"}`}>
                  {marqueeText}
                </span>
                <span className={`mx-3 text-[#C59B4C] ${isMobile ? "text-xs" : "text-[11px]"}`}>•</span>
                <span className={`text-white/75 font-medium ${isMobile ? "text-xs" : "text-[11px]"}`}>
                  {marqueeText}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Prev */}
          {onPrevious && (
            <button
              onClick={onPrevious}
              disabled={videoCount !== undefined && videoIndex === 0}
              className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] text-white/70 transition-all hover:bg-white/[0.15] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous video"
            >
              <ChevronLeft className="w-3 h-3" strokeWidth={2.5} />
            </button>
          )}

          {/* Counter */}
          {videoCount !== undefined && videoIndex !== undefined && (
            <span className="shrink-0 text-[10px] text-white/50 tabular-nums select-none">
              <span className="text-white/80 font-medium">{videoIndex + 1}</span>
              <span className="mx-0.5">/</span>
              {videoCount}
            </span>
          )}

          {/* Next */}
          {onNext && (
            <button
              onClick={onNext}
              disabled={videoCount !== undefined && videoIndex === videoCount - 1}
              className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] text-white/70 transition-all hover:bg-white/[0.15] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next video"
            >
              <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="shrink-0 text-white/70 hover:text-[#C59B4C] transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen
              ? <Minimize className={isMobile ? "w-4 h-4" : "w-3.5 h-3.5"} />
              : <Maximize className={isMobile ? "w-4 h-4" : "w-3.5 h-3.5"} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
