"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Play,
  Pause,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoplay?: boolean;
  title?: string;
  description?: string;
  onEnded?: () => void;
}

// Global video manager to ensure only one video plays at a time
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
    if (this.currentPlayingId === id) {
      this.currentPlayingId = null;
    }
  }

  requestPlay(id: string) {
    if (this.currentPlayingId && this.currentPlayingId !== id) {
      const onPause = this.callbacks.get(this.currentPlayingId);
      if (onPause) {
        onPause();
      }
    }
    this.currentPlayingId = id;
  }
}

export function VideoPlayer({
  src,
  poster,
  className = "",
  autoplay = false,
  title,
  description,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const instanceId = useRef<string>(`video-${Math.random().toString(36).substr(2, 9)}`);
  const onEndedRef = useRef(onEnded);

  // Update the ref when onEnded changes
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        VideoManager.getInstance().requestPlay(instanceId.current);
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
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
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEndedRef.current) {
        onEndedRef.current();
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [src]);

  // --- FIX: Auto Play with Error Handling ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset state for the new video
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsBuffering(true);

    let isPlayPending = true;

    const playNewVideo = async () => {
      // Check if component is still mounted and src hasn't changed again
      if (!videoRef.current || !isPlayPending) return;

      try {
        // Notify manager to pause other videos
        VideoManager.getInstance().requestPlay(instanceId.current);
        
        // Attempt to play
        await video.play();
        
        // If successful, update state only if this play request wasn't cancelled
        if (isPlayPending) {
          setIsPlaying(true);
          setIsBuffering(false);
        }
      } catch (error: any) {
        // If the error is an AbortError, it means pause() was called intentionally.
        // We should ignore it and not try to mute/retry.
        if (error.name === 'AbortError') {
          console.log('Play request was interrupted by a pause call, ignoring.');
          return;
        }

        console.warn("Autoplay blocked, attempting to mute and play:", error);
        video.muted = true;
        setIsMuted(true);
        
        try {
          await video.play();
          if (isPlayPending) {
            setIsPlaying(true);
            setIsBuffering(false);
          }
        } catch (retryError: any) {
          if (retryError.name !== 'AbortError') {
            console.error("Autoplay failed even when muted:", retryError);
            setIsPlaying(false);
            setIsBuffering(false);
          }
        }
      }
    };

    // Small delay to ensure the browser has registered the new source
    const timer = setTimeout(() => {
        playNewVideo();
    }, 100);

    return () => {
      isPlayPending = false; // Prevent state updates if src changes again
      clearTimeout(timer);
    };
  }, [src]);
  // ---------------------------------------

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- FIX: VideoManager Callback ---
  useEffect(() => {
    const onPause = () => {
      // Only pause if the video is actually playing and not in the middle of a play request
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };
    VideoManager.getInstance().register(instanceId.current, onPause);
    return () => VideoManager.getInstance().unregister(instanceId.current);
  }, []);
  // ---------------------------------------

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const marqueeText = [title, description].filter(Boolean).join(" • ");

  return (
    <div
      ref={containerRef}
      className={`relative group bg-black rounded-xl overflow-hidden ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        autoPlay={autoplay}
        playsInline
      />

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {!isPlaying && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-2xl"
            aria-label="Play"
          >
            <Play className="w-8 h-8 text-black ml-1" fill="black" />
          </button>
        </div>
      )}

      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"
      >
        <div
          ref={progressRef}
          className={`relative bg-white/20 cursor-pointer group/progress transition-all duration-200 ${
            isMobile ? "h-2" : "h-1.5 hover:h-2"
          }`}
          onClick={handleSeek}
          onTouchMove={handleTouchSeek}
        >
          <div
            className="absolute left-0 top-0 h-full bg-[#C59B4C] group-hover/progress:bg-[#B08A3E] transition-colors"
            style={{ width: `${progressPercent}%` }}
          >
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full transition-opacity shadow-lg ${
              isMobile ? "w-4 h-4 opacity-100" : "w-3 h-3 opacity-0 group-hover/progress:opacity-100"
            }`} />
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 gap-4">
          
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={togglePlay}
              className="text-white hover:text-[#C59B4C] transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className={`w-5 h-5 ${isMobile ? "w-6 h-6" : ""}`} />
              ) : (
                <Play className={`w-5 h-5 ml-0.5 ${isMobile ? "w-6 h-6" : ""}`} />
              )}
            </button>

            <div className={`text-white/90 font-medium tabular-nums ${isMobile ? "text-sm" : "text-xs"}`}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <button
              onClick={toggleMute}
              className="text-white/80 hover:text-[#C59B4C] transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className={`w-4 h-4 ${isMobile ? "w-5 h-5" : ""}`} />
              ) : (
                <Volume2 className={`w-4 h-4 ${isMobile ? "w-5 h-5" : ""}`} />
              )}
            </button>
          </div>

          {marqueeText && (
            <div className="flex-1 overflow-hidden relative mx-2">
              <div className="flex whitespace-nowrap animate-marquee">
                <span className={`text-white/80 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>
                  {marqueeText}
                </span>
                <span className={`mx-4 text-[#C59B4C] ${isMobile ? "text-xs" : "text-sm"}`}>•</span>
                <span className={`text-white/80 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>
                  {marqueeText}
                </span>
                <span className={`mx-4 text-[#C59B4C] ${isMobile ? "text-xs" : "text-sm"}`}>•</span>
                <span className={`text-white/80 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>
                  {marqueeText}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleFullscreen}
              className="text-white/80 hover:text-[#C59B4C] transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className={`w-4 h-4 ${isMobile ? "w-5 h-5" : ""}`} />
              ) : (
                <Maximize className={`w-4 h-4 ${isMobile ? "w-5 h-5" : ""}`} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;