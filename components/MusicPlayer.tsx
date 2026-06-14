// components/MusicPlayer.tsx
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Pause, ChevronDown, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useYouTubeMusic,
  useVideoPlayer,
  YouTubeVideo,
  recordWatch,
  categories,
} from '@/hooks/queries/useYouTubeMusicWithCache';

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseIsoDuration(iso?: string): number | null {
  if (!iso) return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const h = parseInt(match[1] ?? '0', 10);
  const m = parseInt(match[2] ?? '0', 10);
  const s = parseInt(match[3] ?? '0', 10);
  return h * 3600 + m * 60 + s;
}

function formatTime(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

const MAX_DURATION_SECONDS = 8 * 60;

export default function MusicPlayer({ isOpen, onClose }: MusicPlayerProps) {
  const {
    videos,
    searchResults,
    searchQuery,
    isLoadingVideos,
    isSearching,
    activeCategory,
    search,
    clearSearch,
    changeCategory,
  } = useYouTubeMusic();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [playerFeed, setPlayerFeed] = useState<YouTubeVideo[]>([]);
  const [showTapHint, setShowTapHint] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [selectedSearchVideo, setSelectedSearchVideo] = useState<YouTubeVideo | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tapHintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const infoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const swipeHintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track watch history
  const [hasRecordedWatch, setHasRecordedWatch] = useState(false);
  const currentVideoIdRef = useRef<string | null>(null);

  // Filter videos
  const feedVideos = useMemo(
    () =>
      videos.filter((v: YouTubeVideo) => {
        const secs = parseIsoDuration(v.duration);
        return secs === null || secs <= MAX_DURATION_SECONDS;
      }),
    [videos]
  );

  // Search suggestions filtered
  const searchSuggestions = useMemo(
    () =>
      searchResults.filter((v: YouTubeVideo) => {
        const secs = parseIsoDuration(v.duration);
        return secs === null || secs <= MAX_DURATION_SECONDS;
      }),
    [searchResults]
  );

  // Seed player feed
  useEffect(() => {
    if (feedVideos.length > 0 && playerFeed.length === 0) {
      setPlayerFeed(feedVideos);
    }
  }, [feedVideos]);

  // Reset feed when category changes
  useEffect(() => {
    setPlayerFeed(feedVideos);
    setCurrentIndex(0);
    setProgress(0);
    setDuration(0);
    setPlayerReady(false);
    setHasRecordedWatch(false);
    currentVideoIdRef.current = null;
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
  }, [activeCategory]);

  // Auto-hide video info after 2 seconds
  useEffect(() => {
    if (showInfo) {
      if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
      infoTimeoutRef.current = setTimeout(() => {
        setShowInfo(false);
      }, 2000);
    }
    return () => {
      if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
    };
  }, [currentIndex, showInfo]);

  // Hide swipe hint after first scroll or 5 seconds
  useEffect(() => {
    if (!showSwipeHint) return;
    if (swipeHintTimeoutRef.current) clearTimeout(swipeHintTimeoutRef.current);
    swipeHintTimeoutRef.current = setTimeout(() => {
      setShowSwipeHint(false);
    }, 5000);
    return () => {
      if (swipeHintTimeoutRef.current) clearTimeout(swipeHintTimeoutRef.current);
    };
  }, []);

  // Record watch history
  useEffect(() => {
    const currentVideo = playerFeed[currentIndex];
    if (!currentVideo?.videoId) return;
    
    const isNewVideo = currentVideo.videoId !== currentVideoIdRef.current;
    
    if (isNewVideo && playerReady && !isPaused && !hasRecordedWatch) {
      recordWatch(currentVideo.videoId);
      setHasRecordedWatch(true);
      currentVideoIdRef.current = currentVideo.videoId;
    }
    
    if (isNewVideo && hasRecordedWatch) {
      setHasRecordedWatch(false);
    }
  }, [currentIndex, playerFeed, playerReady, isPaused, hasRecordedWatch]);

  // YouTube IFrame API
  useEffect(() => {
    if (typeof window === 'undefined' || window.YT) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }, []);

  const currentIndexRef = useRef(currentIndex);
  const playerFeedRef = useRef(playerFeed);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { playerFeedRef.current = playerFeed; }, [playerFeed]);

  const initPlayer = useCallback((videoId: string) => {
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch (_) {}
      playerRef.current = null;
    }
    if (!playerContainerRef.current) return;

    playerContainerRef.current.innerHTML = '';
    const div = document.createElement('div');
    playerContainerRef.current.appendChild(div);

    playerRef.current = new window.YT.Player(div, {
      videoId,
      height: '100%',
      width: '100%',
      playerVars: {
        autoplay: 1,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        showinfo: 0,
        playsinline: 1,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        origin: window.location.origin,
      },
      events: {
        onReady: (e: any) => {
          e.target.playVideo();
          setDuration(e.target.getDuration());
          setPlayerReady(true);
          setIsPaused(false);
          setShowInfo(true);

          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = setInterval(() => {
            if (!playerRef.current?.getCurrentTime || isScrollingRef.current) return;
            const cur = playerRef.current.getCurrentTime();
            const dur = playerRef.current.getDuration();
            if (dur && !isNaN(dur)) setProgress((cur / dur) * 100);
          }, 500);
        },
        onStateChange: (e: any) => {
          if (e.data === window.YT.PlayerState.ENDED) {
            const next = currentIndexRef.current + 1;
            const feed = playerFeedRef.current;
            if (next < feed.length && scrollContainerRef.current) {
              scrollContainerRef.current.scrollTo({
                top: next * window.innerHeight,
                behavior: 'smooth',
              });
            }
          }
          if (e.data === window.YT.PlayerState.PLAYING) {
            setIsPaused(false);
            const currentVideo = playerFeedRef.current[currentIndexRef.current];
            if (currentVideo?.videoId && currentVideo.videoId !== currentVideoIdRef.current) {
              recordWatch(currentVideo.videoId);
              setHasRecordedWatch(true);
              currentVideoIdRef.current = currentVideo.videoId;
            }
          }
          if (e.data === window.YT.PlayerState.PAUSED) setIsPaused(true);
        },
      },
    });
  }, []);

  useEffect(() => {
    if (!isOpen || playerFeed.length === 0) return;
    const start = () => {
      setCurrentIndex(0);
      requestAnimationFrame(() => {
        initPlayer(playerFeed[0].videoId);
      });
    };
    if (window.YT?.Player) { start(); }
    else { window.onYouTubeIframeAPIReady = start; }
    return () => { if (progressIntervalRef.current) clearInterval(progressIntervalRef.current); };
  }, [isOpen, playerFeed]);

  // Scroll handler for vertical scrolling with auto-play
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        // Hide swipe hint after first scroll
        if (showSwipeHint) setShowSwipeHint(false);
      }, 200);

      const scrollPosition = container.scrollTop;
      const viewportHeight = window.innerHeight;
      const newIndex = Math.floor((scrollPosition + viewportHeight * 0.45) / viewportHeight);

      if (newIndex !== currentIndexRef.current && newIndex >= 0 && newIndex < playerFeedRef.current.length) {
        setCurrentIndex(newIndex);
        const vid = playerFeedRef.current[newIndex];
        if (vid && playerRef.current?.loadVideoById) {
          playerRef.current.stopVideo();
          playerRef.current.loadVideoById({
            videoId: vid.videoId,
            startSeconds: 0,
          });
          playerRef.current.playVideo();
          setProgress(0);
          setDuration(0);
          setIsPaused(false);
          setHasRecordedWatch(false);
          setShowInfo(true);
          
          if ('vibrate' in navigator) {
            navigator.vibrate(5);
          }
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [showSwipeHint]);

  // Tap to play/pause
  const handleScreenTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isScrollingRef.current) return;
    if (!playerRef.current) return;
    
    if (isPaused) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
    
    setShowTapHint(true);
    if (tapHintTimeoutRef.current) clearTimeout(tapHintTimeoutRef.current);
    tapHintTimeoutRef.current = setTimeout(() => setShowTapHint(false), 800);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [isPaused]);

  // Handle seek on progress bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    if (playerRef.current?.seekTo) {
      const seekTime = (pct / 100) * duration;
      playerRef.current.seekTo(seekTime, true);
      setProgress(pct);
    }
  };

  // Handle search result click
  const handleSearchResultClick = (video: YouTubeVideo) => {
    setSelectedSearchVideo(video);
    const newFeed = [video, ...playerFeed.filter(v => v.videoId !== video.videoId)];
    setPlayerFeed(newFeed);
    setCurrentIndex(0);
    setProgress(0);
    setDuration(0);
    setPlayerReady(false);
    setHasRecordedWatch(false);
    currentVideoIdRef.current = null;
    setShowSearchBar(false);
    setShowSwipeHint(false);
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    setTimeout(() => {
      if (window.YT?.Player) initPlayer(video.videoId);
      setSelectedSearchVideo(null);
    }, 80);
  };

  // Swipe to close (pull down on first video)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startY = touch.clientY;
    let isClosing = false;
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentY = moveEvent.touches[0].clientY;
      const diff = currentY - startY;
      
      if (diff > 80 && currentIndex === 0 && !isScrollingRef.current && !isClosing) {
        isClosing = true;
        onClose();
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [currentIndex, onClose]);

  const currentTime = (progress / 100) * duration;
  const currentVideo = playerFeed[currentIndex];
  const isLoading = isLoadingVideos && playerFeed.length === 0;
  const hasNext = currentIndex < playerFeed.length - 1;

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div style={centeredOverlay}>
        <div style={spinnerStyle} />
        <div style={subtleText}>Loading vibes...</div>
      </div>
    );
  }

  if (playerFeed.length === 0) {
    return (
      <div style={centeredOverlay}>
        <div style={subtleText}>No videos available</div>
        <button onClick={onClose} style={{ marginTop: 20, ...headerBtn(true) }}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: '#000',
        overflow: 'hidden',
        userSelect: 'none',
      }}
      onClick={handleScreenTap}
      onTouchStart={handleTouchStart}
    >
      {/* YouTube Player Container */}
      <div
        ref={playerContainerRef}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 1,
        }}
      />

      {/* Fixed Header with Branding */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 20,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
          paddingTop: 'env(safe-area-inset-top, 20px)',
        }}
      >
        {/* Top Bar - Branding and Close */}
        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px',
          }}
        >
          <div>
            <div style={{ color: 'white', fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px' }}>
              The Vibe Room
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: '0.5px' }}>
              by Atbriz DJ
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setShowSearchBar(!showSearchBar)}
              style={iconButton(showSearchBar)}
            >
              <Search size={20} color="white" />
            </button>
            <button onClick={onClose} style={iconButton(false)}>
              <X size={20} color="white" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {showSearchBar && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ padding: '0 16px 12px 16px' }}
            >
              <div style={{ position: 'relative' }}>
                <Search size={16} color="rgba(255,255,255,0.5)" style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)',
                }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => search(e.target.value)}
                  placeholder="Search songs, artists, or vibes..."
                  style={{
                    width: '100%', padding: '12px 40px',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(124,58,237,0.3)',
                    borderRadius: 30,
                    color: 'white', fontSize: 14,
                    outline: 'none',
                  }}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                    }}
                  >
                    <X size={14} color="rgba(255,255,255,0.5)" />
                  </button>
                )}
              </div>

              {/* Search Results */}
              {searchSuggestions.length > 0 && !isSearching && (
                <div style={{
                  marginTop: 8, maxHeight: 300, overflowY: 'auto',
                  background: 'rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 16,
                  border: '1px solid rgba(124,58,237,0.2)',
                }}>
                  {searchSuggestions.map((video) => (
                    <button
                      key={video.videoId}
                      onClick={() => handleSearchResultClick(video)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer', textAlign: 'left',
                        background: selectedSearchVideo?.videoId === video.videoId ? 'rgba(124,58,237,0.2)' : 'transparent',
                      }}
                    >
                      <img src={video.thumbnail} alt="" style={{ width: 48, height: 32, borderRadius: 8, objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: 'white', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {video.title}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{video.channelTitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Tabs - Fixed */}
        <div style={{
          display: 'flex', gap: 8, padding: '0 16px 12px 16px',
          overflowX: 'auto', scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                changeCategory(cat.id);
                setShowSearchBar(false);
                setShowSwipeHint(true);
              }}
              style={{
                flexShrink: 0, padding: '6px 16px', borderRadius: 30,
                fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
                background: activeCategory === cat.id 
                  ? 'linear-gradient(135deg, #7C3AED, #EC4899)'
                  : 'rgba(255,255,255,0.1)',
                color: activeCategory === cat.id ? 'white' : 'rgba(255,255,255,0.7)',
                border: activeCategory === cat.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll Container - Vertical Scroll with Snap */}
      <div
        ref={scrollContainerRef}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 2,
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
          overscrollBehaviorY: 'contain',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {playerFeed.map((video, i) => (
          <div
            key={video.videoId}
            style={{
              height: '100vh',
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
            }}
          />
        ))}
      </div>

      {/* Progress Bar - Seekable */}
      <div
        onClick={handleSeek}
        onTouchStart={handleSeek}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 3, background: 'rgba(255,255,255,0.15)',
          zIndex: 15, cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: `${progress}%`, height: '100%',
            background: 'linear-gradient(90deg, #7C3AED, #EC4899)',
            borderRadius: 3,
          }}
        />
      </div>

      {/* Video Info */}
      <AnimatePresence>
        {showInfo && currentVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', bottom: 40, left: 20, right: 20,
              zIndex: 10,
            }}
          >
            <div style={{ color: 'white', fontSize: 16, fontWeight: 600, marginBottom: 4, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              {currentVideo.title}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              {currentVideo.channelTitle}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4 }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Down Hint Animation */}
      <AnimatePresence>
        {showSwipeHint && hasNext && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'fixed', bottom: 80, left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 15,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4,
              pointerEvents: 'none',
            }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown size={28} color="rgba(255,255,255,0.7)" />
            </motion.div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: '0.5px' }}>
              Scroll for more
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap to Play/Pause Hint */}
      <AnimatePresence>
        {showTapHint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 20, pointerEvents: 'none',
              width: 60, height: 60, borderRadius: 30,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {isPaused ? (
              <Play size={24} color="white" fill="white" />
            ) : (
              <Pause size={24} color="white" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pull down to close indicator */}
      {currentIndex === 0 && (
        <div
          style={{
            position: 'fixed', top: 10, left: '50%',
            transform: 'translateX(-50%)',
            width: 40, height: 4, borderRadius: 2,
            background: 'rgba(255,255,255,0.3)',
            zIndex: 15,
          }}
        />
      )}

      <style>{`
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

function iconButton(active: boolean): React.CSSProperties {
  return {
    width: 36, height: 36, borderRadius: '50%',
    background: active ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${active ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)'}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  };
}

function headerBtn(active: boolean): React.CSSProperties {
  return {
    padding: '10px 20px',
    borderRadius: 30,
    background: active ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${active ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)'}`,
    color: 'white',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
  };
}

const centeredOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 20,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  background: '#080810',
};

const spinnerStyle: React.CSSProperties = {
  width: 44, height: 44, borderRadius: '50%',
  border: '2px solid rgba(124,58,237,0.15)',
  borderTopColor: '#7C3AED',
  animation: 'spin 0.75s linear infinite',
};

const subtleText: React.CSSProperties = {
  marginTop: 14,
  color: 'rgba(255,255,255,0.38)',
  fontSize: 13,
  letterSpacing: '0.04em',
};