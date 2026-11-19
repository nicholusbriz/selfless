'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Maximize2, Volume2, VolumeX, X } from 'lucide-react';

const DISMISS_KEY = 'featured-video-dismissed-session';

export function FeaturedVideoCard() {
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fsVideoRef = useRef<HTMLVideoElement>(null);
  const isInitialMount = useRef(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Mount: autoplay unmuted attempt, replay timer, modal watcher
  useEffect(() => {
    sessionStorage.removeItem(DISMISS_KEY);
    setDismissed(pathname !== '/dashboard');

    const video = videoRef.current;
    if (video && pathname === '/dashboard') {
      video.muted = false;
      video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      });
    }

    // Replay every 2 minutes on dashboard
    const replay = window.setInterval(() => {
      if (pathname !== '/dashboard') return;
      sessionStorage.removeItem(DISMISS_KEY);
      setDismissed(false);
      const v = videoRef.current;
      if (v) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
    }, 120000);

    // Hide while trivia modal is open
    const checkModal = window.setInterval(() => {
      setModalOpen(document.body.dataset.triviaModal === 'open');
    }, 800);

    isInitialMount.current = false;
    return () => {
      window.clearInterval(replay);
      window.clearInterval(checkModal);
    };
  }, [pathname]);

  // On client-side navigation to /dashboard: show card paused so user presses play
  useEffect(() => {
    if (pathname === '/dashboard') {
      sessionStorage.removeItem(DISMISS_KEY);
      setDismissed(false);
      const v = videoRef.current;
      if (v && !isInitialMount.current) {
        v.pause();
        setIsPlaying(false);
      }
    }
  }, [pathname]);

  // Sync fullscreen position once when it opens
  useEffect(() => {
    if (isFullscreen && fsVideoRef.current && videoRef.current) {
      fsVideoRef.current.currentTime = videoRef.current.currentTime;
      fsVideoRef.current.muted = videoRef.current.muted;
    }
  }, [isFullscreen]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  const openFullscreen = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    const v = videoRef.current;
    if (v && fsVideoRef.current) {
      v.currentTime = fsVideoRef.current.currentTime;
      v.muted = fsVideoRef.current.muted;
      v.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  if (dismissed || modalOpen || pathname !== '/dashboard') return null;

  return (
    <>
      {/* Floating card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.6 }}
        className="fixed bottom-24 right-3 z-[90] w-[85vw] max-w-xs touch-none select-none overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/40 sm:bottom-28 sm:right-6 sm:w-96 sm:max-w-none"
      >
        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            src="/xmas.mp4"
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="h-full w-full object-cover"
            onClick={togglePlay}
          />
          {/* Top bar: title + dismiss */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent px-2.5 pb-4 pt-2">
            <p className="truncate text-[10px] font-semibold text-white/90">
              Christmas message from the First Presidency
            </p>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss video"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/50 text-white/80 transition hover:bg-black/70 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {/* Bottom controls */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-2.5 pb-2 pt-4">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={openFullscreen}
                aria-label="Open fullscreen"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95"
            onClick={closeFullscreen}
          >
            <video
              ref={fsVideoRef}
              src="/xmas.mp4"
              autoPlay
              controls
              playsInline
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              aria-label="Close fullscreen"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                closeFullscreen();
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
