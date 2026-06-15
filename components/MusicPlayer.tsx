// components/MusicPlayer.tsx
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Pause, Search, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useYouTubeMusic,
  YouTubeVideo,
  recordWatch,
  categories,
  Category,
} from '@/hooks/queries/useYouTubeMusicWithCache';

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helpers
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
  const [playerFeed, setPlayerFeed] = useState<YouTubeVideo[]>([]);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [selectedSearchVideo, setSelectedSearchVideo] = useState<YouTubeVideo | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [hasRecordedWatch, setHasRecordedWatch] = useState(false);
  const currentVideoIdRef = useRef<string | null>(null);
  const previousCategoryRef = useRef<string>('');
  
  // Analytics tracking
  const analyticsSessionIdRef = useRef<string | null>(null);
  const analyticsTrackingRef = useRef(false);
  const anonymousIdRef = useRef<string | null>(null);

  // Generate or get anonymous ID from local storage
  useEffect(() => {
    let anonymousId = localStorage.getItem('music_anonymous_id');
    if (!anonymousId) {
      anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('music_anonymous_id', anonymousId);
    }
    anonymousIdRef.current = anonymousId;
  }, []);

  // Get user location (IP-based fallback if GPS denied)
  const getUserLocation = useCallback(async (): Promise<{ location: string; latitude: number; longitude: number } | null> => {
    try {
      // Try GPS first (requires permission)
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 5000,
              maximumAge: 300000 // 5 minutes cache
            });
          });

          const { latitude, longitude } = position.coords;
          
          // Get location name using reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          const location = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Unknown';
          const country = data.address?.country || '';
          
          return {
            location: `${location}, ${country}`,
            latitude,
            longitude
          };
        } catch (geoError: any) {
          console.log('GPS location denied or unavailable, falling back to IP-based location:', geoError.message || geoError.code);
        }
      }
      
      // Fallback to IP-based geolocation (no permission required, less accurate)
      const ipResponse = await fetch('https://ipapi.co/json/');
      const ipData = await ipResponse.json();
      
      if (ipData.city && ipData.country_name) {
        return {
          location: `${ipData.city}, ${ipData.country_name}`,
          latitude: ipData.latitude || 0,
          longitude: ipData.longitude || 0
        };
      }
      
      return null;
    } catch (error: any) {
      console.error('Error getting location:', error.message || error);
      return null;
    }
  }, []);

  // Create analytics session
  const createAnalyticsSession = useCallback(async () => {
    if (analyticsTrackingRef.current || !anonymousIdRef.current) return;
    
    try {
      const locationData = await getUserLocation();
      
      const deviceInfo = `${navigator.userAgent}`;
      const response = await fetch('/api/music-analytics/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          anonymousId: anonymousIdRef.current,
          deviceInfo,
          ipAddress: null, // IP will be captured server-side
          userAgent: navigator.userAgent,
          location: locationData?.location || null,
          latitude: locationData?.latitude || null,
          longitude: locationData?.longitude || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        analyticsSessionIdRef.current = data.sessionId;
        analyticsTrackingRef.current = true;
      }
    } catch (error) {
      console.error('Error creating analytics session:', error);
    }
  }, [getUserLocation]);

  // End analytics session
  const endAnalyticsSession = useCallback(async () => {
    if (!analyticsSessionIdRef.current || !anonymousIdRef.current) return;
    
    try {
      await fetch('/api/music-analytics/session', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: analyticsSessionIdRef.current,
          anonymousId: anonymousIdRef.current
        })
      });
      
      analyticsSessionIdRef.current = null;
      analyticsTrackingRef.current = false;
    } catch (error) {
      console.error('Error ending analytics session:', error);
    }
  }, []);

  // Track play event
  const trackPlayEvent = useCallback(async (video: YouTubeVideo, duration?: number, completed?: boolean) => {
    if (!analyticsSessionIdRef.current || !anonymousIdRef.current) return;
    
    try {
      await fetch('/api/music-analytics/play-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: analyticsSessionIdRef.current,
          anonymousId: anonymousIdRef.current,
          videoId: video.videoId,
          videoTitle: video.title,
          channelTitle: video.channelTitle,
          category: activeCategory,
          duration,
          completed
        })
      });
    } catch (error) {
      console.error('Error tracking play event:', error);
    }
  }, [activeCategory]);

  // Filter videos by duration
  const feedVideos = useMemo(
    () => videos.filter((v: YouTubeVideo) => {
      const secs = parseIsoDuration(v.duration);
      return secs === null || secs <= MAX_DURATION_SECONDS;
    }),
    [videos]
  );

  const searchSuggestions = useMemo(
    () => searchResults.filter((v: YouTubeVideo) => {
      const secs = parseIsoDuration(v.duration);
      return secs === null || secs <= MAX_DURATION_SECONDS;
    }),
    [searchResults]
  );

  // Initialize player feed
  useEffect(() => {
    if (feedVideos.length > 0 && playerFeed.length === 0) {
      setPlayerFeed(feedVideos);
    }
  }, [feedVideos]);

  // Reset on category change
  useEffect(() => {
    if (previousCategoryRef.current !== activeCategory) {
      setPlayerFeed(feedVideos);
      setCurrentIndex(0);
      setProgress(0);
      setDuration(0);
      setPlayerReady(false);
      setHasRecordedWatch(false);
      currentVideoIdRef.current = null;
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      setShowScrollHint(true); // Show scroll hint when category changes
      previousCategoryRef.current = activeCategory;
    }
  }, [activeCategory, feedVideos]);

  // Debug: Log index changes for video info updates
  useEffect(() => {
    console.log('🔄 [INDEX] Current index changed to:', {
      index: currentIndex,
      videoTitle: playerFeed[currentIndex]?.title,
      videoId: playerFeed[currentIndex]?.videoId,
    });
  }, [currentIndex, playerFeed]);

  // Keep scroll hint always visible

  // Record watch history
  useEffect(() => {
    const currentVideo = playerFeed[currentIndex];
    if (!currentVideo?.videoId) return;
    
    const isNewVideo = currentVideo.videoId !== currentVideoIdRef.current;
    
    if (isNewVideo && playerReady && !isPaused && !hasRecordedWatch) {
      recordWatch(currentVideo.videoId);
      // Track analytics play event
      trackPlayEvent(currentVideo);
      setHasRecordedWatch(true);
      currentVideoIdRef.current = currentVideo.videoId;
    }
    
    if (isNewVideo && hasRecordedWatch) {
      setHasRecordedWatch(false);
    }
  }, [currentIndex, playerFeed, playerReady, isPaused, hasRecordedWatch, trackPlayEvent]);

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

  // Smooth video transition with fade effect
  const smoothVideoTransition = useCallback((newVideoId: string) => {
    if (!playerContainerRef.current || !playerRef.current) return;
    
    console.log('🎬 [TRANSITION] Starting smooth transition to:', newVideoId);
    setIsTransitioning(true);
    
    // Add fade to black effect
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = 'black';
    overlay.style.zIndex = '5';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.pointerEvents = 'none';
    playerContainerRef.current.appendChild(overlay);
    
    // Fade to black
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
    
    // Load new video after fade
    transitionTimeoutRef.current = setTimeout(() => {
      if (playerRef.current?.loadVideoById) {
        console.log('🎬 [TRANSITION] Loading video:', newVideoId);
        playerRef.current.loadVideoById({
          videoId: newVideoId,
          startSeconds: 0,
        });
        playerRef.current.playVideo();
      }
      
      // Fade back in
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          if (overlay.parentNode) overlay.remove();
          setIsTransitioning(false);
          console.log('🎬 [TRANSITION] Transition complete');
        }, 300);
      }, 100);
    }, 300);
  }, []);

  const initPlayer = useCallback((videoId: string, startPosition: number = 0) => {
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
          if (startPosition > 0) {
            e.target.seekTo(startPosition, true);
          }
          e.target.playVideo();
          setDuration(e.target.getDuration());
          setPlayerReady(true);
          setIsPaused(false);

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
                top: next * (scrollContainerRef.current.clientHeight),
                behavior: 'smooth',
              });
            }
          }
          if (e.data === window.YT.PlayerState.PLAYING) {
            setIsPaused(false);
          }
          if (e.data === window.YT.PlayerState.PAUSED) {
            setIsPaused(true);
          }
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
    return () => { 
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, [isOpen, playerFeed, initPlayer]);

  // Create analytics session when player opens
  useEffect(() => {
    if (isOpen) {
      createAnalyticsSession();
    }
    return () => {
      if (analyticsSessionIdRef.current) {
        endAnalyticsSession();
      }
    };
  }, [isOpen, createAnalyticsSession, endAnalyticsSession]);

  // Scroll handler with smooth transition - improved for mobile
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let lastScrollTop = 0;
    let scrollDirection: 'up' | 'down' | null = null;
    let scrollEndTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        scrollDirection = null;
      }, 300); // Increased timeout for mobile momentum

      const scrollTop = container.scrollTop;
      const scrollDiff = scrollTop - lastScrollTop;
      
      // Determine scroll direction
      if (Math.abs(scrollDiff) > 5) {
        scrollDirection = scrollDiff > 0 ? 'down' : 'up';
      }
      
      lastScrollTop = scrollTop;

      // Clear previous timeout
      if (scrollEndTimeout) clearTimeout(scrollEndTimeout);
      
      // Wait for scroll to settle before changing video (better for mobile)
      scrollEndTimeout = setTimeout(() => {
        const scrollPosition = container.scrollTop;
        const itemHeight = container.clientHeight;
        const newIndex = Math.round(scrollPosition / itemHeight);

        if (newIndex !== currentIndexRef.current && newIndex >= 0 && newIndex < playerFeedRef.current.length && !isTransitioning) {
          const vid = playerFeedRef.current[newIndex];
          if (vid && playerRef.current) {
            setCurrentIndex(newIndex);
            smoothVideoTransition(vid.videoId);
            setProgress(0);
            setDuration(0);
            setIsPaused(false);
            setHasRecordedWatch(false);
          }
        }
      }, 150); // Wait 150ms for scroll to settle
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollEndTimeout) clearTimeout(scrollEndTimeout);
    };
  }, [isTransitioning, smoothVideoTransition]);

  // Tap to play/pause - FIXED: Check if tap target is not an input or button
  const handleScreenTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Don't pause/play if clicking on search input, search results, category buttons, or header buttons
    const target = e.target as HTMLElement;
    const isInteractive = 
      target.tagName === 'INPUT' ||
      target.tagName === 'BUTTON' ||
      target.closest('input') ||
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('.search-container') ||
      target.closest('.categories-container') ||
      target.closest('.header-buttons');
    
    if (isInteractive || isScrollingRef.current || isTransitioning) return;
    if (!playerRef.current) return;
    
    if (isPaused) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPaused, isTransitioning]);

  // Seek on progress bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isTransitioning || !playerReady) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    if (playerRef.current?.seekTo && duration > 0) {
      const seekTime = (pct / 100) * duration;
      playerRef.current.seekTo(seekTime, true);
      setProgress(pct);
    }
  };

  // Start seeking (mouse down / touch start)
  const handleSeekStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isTransitioning || !playerReady) return;
    setIsSeeking(true);
    handleSeek(e);
  };

  // Update seeking (mouse move / touch move)
  const handleSeekMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isSeeking || isTransitioning || !playerReady) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    if (playerRef.current?.seekTo && duration > 0) {
      const seekTime = (pct / 100) * duration;
      playerRef.current.seekTo(seekTime, true);
      setProgress(pct);
    }
  };

  // Stop seeking (mouse up / touch end)
  const handleSeekEnd = () => {
    setIsSeeking(false);
  };

  // Handle search result click - Play selected video immediately
  const handleSearchResultClick = (video: YouTubeVideo, e?: React.MouseEvent) => {
    if (isTransitioning) return;
    
    console.log('🎵 [SEARCH] User selected video:', video.title);
    
    // Prevent default behavior to ensure video plays in custom player
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 1. Create new feed with this video at the top
    const newFeed = [video, ...playerFeed.filter(v => v.videoId !== video.videoId)];
    setPlayerFeed(newFeed);
    
    // 2. Set current index to 0 (first video)
    setCurrentIndex(0);
    
    // 3. Reset player state
    setProgress(0);
    setDuration(0);
    setPlayerReady(false);
    setHasRecordedWatch(false);
    currentVideoIdRef.current = null;
    
    // 4. Close search bar and clear search
    setShowSearchBar(false);
    clearSearch();
    setSelectedSearchVideo(null);
    
    // 5. Scroll to top of feed
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    
    // 6. Show scroll hint after search
    setShowScrollHint(true);
    
    // 7. Play the selected video with smooth transition
    setTimeout(() => {
      if (window.YT?.Player) {
        smoothVideoTransition(video.videoId);
      }
    }, 100);
  };

  // Toggle search bar - DON'T pause video
  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    // Clear search when closing
    if (showSearchBar) {
      clearSearch();
    }
  };


  const currentTime = (progress / 100) * duration;
  const currentVideo = playerFeed[currentIndex];
  const isLoading = isLoadingVideos && playerFeed.length === 0;

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div style={styles.centeredOverlay}>
        <div style={styles.spinner} />
        <div style={styles.subtleText}>Loading vibes...</div>
      </div>
    );
  }

  if (playerFeed.length === 0) {
    return (
      <div style={styles.centeredOverlay}>
        <div style={styles.subtleText}>No videos available</div>
        <button onClick={onClose} style={styles.closeButton}>Close</button>
      </div>
    );
  }

  return (
    <motion.div
      style={styles.container}
      onClick={handleScreenTap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* YouTube Player - Full background */}
      <div ref={playerContainerRef} style={styles.playerContainer} />

      {/* Dark overlay for better text readability */}
      <div style={styles.overlay} />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.topBar}>
          <div style={styles.brandContainer}>
            <div style={styles.brand}>The Vibe Room</div>
            <div style={styles.brandSub}>Presented by Atbriz DJ</div>
            <div style={styles.brandSub}>Freedom City Tech Center</div>
            <div style={styles.announcement}>Students on duty & all tech center announcements will be announced here</div>
            <div style={styles.downloadNotice}>Soon: Download music to your phone</div>
          </div>
          <div style={styles.headerButtons} className="header-buttons">
            <button
              onClick={toggleSearchBar}
              style={styles.iconButton(showSearchBar)}
            >
              <Search size={20} color="white" />
            </button>
            <button onClick={onClose} style={styles.iconButton(false)}>
              <X size={20} color="white" />
            </button>
          </div>
        </div>


        {/* Search Bar */}
        <AnimatePresence>
          {showSearchBar && (
            <motion.div
              className="search-container"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={styles.searchContainer}
              onClick={(e) => e.stopPropagation()} // Prevent tap from pausing video
            >
              <div style={styles.searchInputWrapper}>
                <Search size={16} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => search(e.target.value)}
                  placeholder="Search songs, artists, or vibes..."
                  style={styles.searchInput}
                  autoFocus
                  onClick={(e) => e.stopPropagation()} // Prevent tap from pausing video
                />
                {searchQuery && (
                  <button onClick={clearSearch} style={styles.clearSearch}>
                    <X size={14} color="rgba(255,255,255,0.5)" />
                  </button>
                )}
              </div>

              {/* Show loading indicator while searching */}
              {isSearching && searchQuery.length > 2 && (
                <div style={styles.searchLoading}>
                  <div style={styles.searchSpinner} />
                  <span>Searching for "{searchQuery}"...</span>
                </div>
              )}

              {/* Only show results when not loading */}
              {!isSearching && searchSuggestions.length > 0 && searchQuery.length > 2 && (
                <div 
                  style={styles.searchResults}
                  onClick={(e) => e.stopPropagation()} // Prevent tap from pausing video
                >
                  {searchSuggestions.map((video: YouTubeVideo) => (
                    <button
                      key={video.videoId}
                      type="button"
                      onClick={(e) => handleSearchResultClick(video, e)}
                      style={styles.searchResultItem(
                        selectedSearchVideo?.videoId === video.videoId
                      )}
                    >
                      <img src={video.thumbnail} alt="" style={styles.searchThumbnail} />
                      <div style={styles.searchResultInfo}>
                        <div style={styles.searchResultTitle}>{video.title}</div>
                        <div style={styles.searchResultChannel}>{video.channelTitle}</div>
                      </div>
                      <Play size={16} color="rgba(255,255,255,0.5)" />
                    </button>
                  ))}
                </div>
              )}

              {/* Show no results message when search returns empty */}
              {!isSearching && searchQuery.length > 2 && searchSuggestions.length === 0 && (
                <div style={styles.searchNoResults}>
                  <span>No results found for "{searchQuery}"</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories */}
        <motion.div 
          className="categories-container"
          style={styles.categoriesContainer}
          onClick={(e) => e.stopPropagation()} // Prevent tap from pausing video
        >
          {categories.map((cat: Category, index) => (
            <motion.span
              key={cat.id}
              whileHover={{ scale: 1.1 }}
              onClick={() => {
                changeCategory(cat.id);
                setShowSearchBar(false);
              }}
              style={styles.categoryText(activeCategory === cat.id)}
            >
                {cat.icon} {cat.name}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Scroll Container - Fixed container for video feed */}
      <div ref={scrollContainerRef} style={styles.scrollContainer}>
        {playerFeed.map((video, idx) => (
          <div key={video.videoId} style={styles.scrollItem} data-index={idx} />
        ))}
      </div>


      {/* Progress Bar - Fixed at bottom */}
      <div 
        onMouseDown={handleSeekStart}
        onMouseMove={handleSeekMove}
        onMouseUp={handleSeekEnd}
        onMouseLeave={handleSeekEnd}
        onTouchStart={handleSeekStart}
        onTouchMove={handleSeekMove}
        onTouchEnd={handleSeekEnd}
        style={styles.progressBarContainer}
      >
        <div style={{ ...styles.progressBarFill, width: `${progress}%` }} />
        <div style={{ ...styles.progressBarThumb, left: `${progress}%` }} />
      </div>

      {/* Time display */}
      <div style={styles.timeDisplay}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* DJ attribution */}
      <div style={styles.djAttribution}>Freedom City Tech Center</div>

      {/* Scroll hint - shows on first load */}
      <AnimatePresence>
        {showScrollHint && playerFeed.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            style={{ ...styles.scrollHint, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <motion.button
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={() => {
                if (currentIndex < playerFeed.length - 1) {
                  const nextIndex = currentIndex + 1;
                  const nextVideo = playerFeed[nextIndex];
                  setCurrentIndex(nextIndex);
                  smoothVideoTransition(nextVideo.videoId);
                  setProgress(0);
                  setDuration(0);
                  setIsPaused(false);
                  setHasRecordedWatch(false);
                }
              }}
              whileTap={{ scale: 0.85, rotate: 180 }}
              whileHover={{ scale: 1.15, boxShadow: '0 0 40px rgba(255,107,53,0.8)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <motion.div
                animate={{ 
                  y: [0, 12, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown size={40} color="rgba(255,255,255,1)" />
              </motion.div>
            </motion.button>
            <motion.span
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 11,
                fontWeight: 500,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                letterSpacing: 0.5
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Click for next
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transition overlay for smooth video changes */}
      {isTransitioning && (
        <div style={styles.transitionOverlay} />
      )}

      {/* Hide ALL YouTube UI elements */}
      <style>{`
        ::-webkit-scrollbar { display: none; }
        * { -webkit-tap-highlight-color: transparent; }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Hide ALL YouTube UI elements */
        .ytp-chrome-top,
        .ytp-watermark,
        .ytp-title,
        .ytp-cards-teaser,
        .ytp-iv-player-content,
        .ytp-related-video-preview,
        .ytp-paid-content-overlay,
        .ytp-gradient-top,
        .ytp-gradient-bottom,
        .ytp-chrome-bottom,
        .ytp-chrome-controls,
        .ytp-player-content,
        .ytp-youtube-button,
        .ytp-caption-window-container,
        .ytp-tooltip,
        .ytp-webgl-spherical-control,
        .ytp-iv-video-content,
        .ytp-card,
        .ytp-related-video,
        .ytp-expand-pause-overlay,
        .ytp-pause-overlay,
        .ytp-ce-element,
        .ytp-chrome-top-buttons,
        .ytp-chrome-top-btn,
        .ytp-fullscreen-button,
        .ytp-settings-button,
        .ytp-play-button,
        .ytp-volume-panel,
        .ytp-time-display,
        .ytp-progress-bar-container,
        .ytp-progress-bar,
        .ytp-progress-list,
        .ytp-ad-image-overlay,
        .ytp-ad-text-overlay,
        .ytp-ad-player-overlay,
        .ytp-ad-overlay-slot,
        .ytp-ad-simple-ad-badge,
        .ytp-ad-action-interstitial,
        .html5-video-player .ytp-cards-button,
        .html5-video-player .ytp-cards-teaser,
        .html5-video-player .ytp-chrome-top,
        .html5-video-player .ytp-chrome-bottom {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        
        /* Ensure video covers full area */
        .html5-video-player {
          background: black !important;
        }
        
        video {
          object-fit: cover !important;
        }
      `}</style>
    </motion.div>
  );
}

// Styles (same as before)
const styles = {
  container: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    background: '#000',
    overflow: 'hidden',
    userSelect: 'none' as const,
  },
  playerContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(0,0,0,0.5) 100%)',
    pointerEvents: 'none' as const,
  },
  transitionOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    backgroundColor: 'black',
    opacity: 0.8,
    pointerEvents: 'none' as const,
  },
  header: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
    paddingTop: 'env(safe-area-inset-top, 20px)',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
  },
  brand: {
    color: 'white',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: '-0.3px',
    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
  },
  brandSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: 500,
  },
  announcement: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: 400,
    marginTop: 2,
  },
  downloadNotice: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: 400,
    marginTop: 2,
  },
  brandContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  brandLaunch: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: 600,
    marginTop: 2,
  },
  brandDate: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    marginTop: 1,
  },
  brandDeveloper: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    marginTop: 1,
    fontStyle: 'italic',
  },
  djBanner: {
    margin: '8px 16px 12px 16px',
    padding: '16px 20px',
    background: 'linear-gradient(135deg, rgba(255,107,53,0.5), rgba(255,69,0,0.4), rgba(124,58,237,0.3))',
    backdropFilter: 'blur(30px)',
    borderRadius: 20,
    border: '2px solid rgba(255,107,53,0.7)',
    boxShadow: '0 0 40px rgba(255,107,53,0.4), inset 0 0 30px rgba(255,69,0,0.15)',
  },
  djServices: {
    display: 'flex',
    gap: 12,
    marginBottom: 14,
    flexWrap: 'wrap' as const,
  },
  djServiceItem: {
    padding: '8px 16px',
    background: 'rgba(255,107,53,0.3)',
    borderRadius: 20,
    color: 'white',
    fontSize: 12,
    fontWeight: 700,
    border: '1px solid rgba(255,107,53,0.5)',
    backdropFilter: 'blur(10px)',
    textShadow: '0 0 10px rgba(255,107,53,0.5)',
  },
  djLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    padding: '10px 14px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    border: '1px solid rgba(255,107,53,0.4)',
  },
  djLocationIcon: {
    fontSize: 18,
  },
  djLocationText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.4,
  },
  djContact: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    background: 'linear-gradient(135deg, rgba(255,107,53,0.4), rgba(255,69,0,0.3))',
    borderRadius: 12,
    border: '1px solid rgba(255,107,53,0.6)',
  },
  djContactIcon: {
    fontSize: 18,
  },
  djContactText: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  djPhone: {
    color: 'white',
    fontSize: 14,
    fontWeight: 800,
    textShadow: '0 0 15px rgba(255,107,53,0.8)',
  },
  djName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: 600,
  },
  announcementText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 4,
  },
  announcementSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  announcementFire: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: 700,
    marginTop: 6,
    textShadow: '0 0 10px rgba(255,107,53,0.5)',
  },
  announcementNext: {
    color: '#FF4500',
    fontSize: 14,
    fontWeight: 800,
    marginTop: 4,
    textShadow: '0 0 15px rgba(255,69,0,0.7)',
    letterSpacing: '1px',
  },
  headerButtons: {
    display: 'flex',
    gap: 12,
  },
  iconButton: (active: boolean) => ({
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: active 
      ? 'rgba(255,255,255,0.2)' 
      : 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${active ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }),
  searchContainer: {
    padding: '0 16px 12px 16px',
  },
  searchInputWrapper: {
    position: 'relative' as const,
  },
  searchIcon: {
    position: 'absolute' as const,
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px',
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(25px)',
    border: '2px solid rgba(255,107,53,0.6)',
    borderRadius: 30,
    color: 'white',
    fontSize: 14,
    outline: 'none',
    boxShadow: '0 0 15px rgba(255,107,53,0.3)',
  },
  clearSearch: {
    position: 'absolute' as const,
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  searchResults: {
    marginTop: 8,
    maxHeight: 300,
    overflowY: 'auto' as const,
    background: 'rgba(0,0,0,0.95)',
    backdropFilter: 'blur(25px)',
    borderRadius: 16,
    border: '2px solid rgba(255,107,53,0.5)',
    boxShadow: '0 0 20px rgba(255,107,53,0.3)',
  },
  searchResultItem: (isSelected: boolean) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,107,53,0.2)',
    cursor: 'pointer',
    textAlign: 'left' as const,
    background: isSelected ? 'rgba(255,107,53,0.4)' : 'transparent',
    transition: 'all 0.3s ease',
    borderLeft: isSelected ? '3px solid rgba(255,107,53,1)' : '3px solid transparent',
  }),
  searchThumbnail: {
    width: 48,
    height: 32,
    borderRadius: 8,
    objectFit: 'cover' as const,
  },
  searchResultInfo: {
    flex: 1,
    minWidth: 0,
  },
  searchResultTitle: {
    color: 'white',
    fontSize: 13,
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  searchResultChannel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  searchLoading: {
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px',
    background: 'rgba(0,0,0,0.95)',
    backdropFilter: 'blur(25px)',
    borderRadius: 16,
    border: '2px solid rgba(255,107,53,0.5)',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    boxShadow: '0 0 20px rgba(255,107,53,0.3)',
  },
  searchSpinner: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: '2px solid rgba(255,107,53,0.3)',
    borderTopColor: '#FF6B35',
    animation: 'spin 1s linear infinite',
  },
  searchNoResults: {
    marginTop: 8,
    padding: '16px',
    background: 'rgba(0,0,0,0.95)',
    backdropFilter: 'blur(25px)',
    borderRadius: 16,
    border: '2px solid rgba(255,107,53,0.5)',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    textAlign: 'center' as const,
    boxShadow: '0 0 20px rgba(255,107,53,0.3)',
  },
  categoriesContainer: {
    display: 'flex',
    gap: 8,
    padding: '0 16px 12px 16px',
    overflowX: 'auto' as const,
    scrollbarWidth: 'none' as const,
    WebkitOverflowScrolling: 'touch' as const,
  },
  categoryText: (isActive: boolean) => ({
    marginRight: 16,
    fontSize: 13,
    fontWeight: isActive ? 700 : 500,
    color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap' as const,
  }),
  scrollContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    overflowY: 'auto' as const,
    scrollSnapType: 'y mandatory' as const,
    scrollBehavior: 'smooth' as const,
    overscrollBehaviorY: 'contain' as const,
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
    WebkitOverflowScrolling: 'touch' as const,
  },
  scrollItem: {
    height: '100vh',
    scrollSnapAlign: 'start' as const,
    scrollSnapStop: 'always' as const,
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoThumbnail: {
    position: 'absolute' as const,
    width: '80%',
    maxWidth: 400,
    aspectRatio: 16/9,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(255,107,53,0.3)',
    border: '2px solid rgba(255,107,53,0.5)',
    opacity: 0.6,
    transform: 'scale(0.9)',
    transition: 'all 0.5s ease',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  thumbnailOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: '16px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
  },
  thumbnailTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
  },
  thumbnailDuration: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: 600,
  },
  videoInfo: {
    position: 'absolute' as const,
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 15,
    background: 'linear-gradient(135deg, rgba(255,107,53,0.4), rgba(124,58,237,0.3), rgba(0,0,0,0.9))',
    padding: '20px 20px 40px 20px',
    borderRadius: 20,
    border: '2px solid rgba(255,107,53,0.5)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 0 30px rgba(255,107,53,0.4), inset 0 0 20px rgba(255,107,53,0.1)',
  },
  videoTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 800,
    marginBottom: 6,
    textShadow: '0 0 15px rgba(255,107,53,0.6), 0 2px 4px rgba(0,0,0,0.5)',
  },
  videoArtist: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: 600,
    textShadow: '0 0 10px rgba(255,107,53,0.4)',
  },
  progressBarContainer: {
    position: 'absolute' as const,
    bottom: 60,
    left: 20,
    right: 20,
    height: 8,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    zIndex: 50,
    cursor: 'pointer',
  },
  progressBarFill: {
    height: '100%',
    background: 'rgba(255,255,255,0.8)',
    borderRadius: 2,
    position: 'relative' as const,
  },
  progressBarThumb: {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: 'white',
    pointerEvents: 'none' as const,
  },
  timeDisplay: {
    position: 'absolute' as const,
    bottom: 70,
    left: 20,
    right: 20,
    display: 'flex',
    justifyContent: 'space-between',
    zIndex: 15,
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'monospace',
    pointerEvents: 'none' as const,
  },
  djAttribution: {
    position: 'absolute' as const,
    bottom: 40,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 15,
    fontSize: 16,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.9)',
    pointerEvents: 'none' as const,
    textShadow: '0 0 15px rgba(0,0,0,0.8)',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  scrollHint: {
    position: 'absolute' as const,
    bottom: 30,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
    cursor: 'pointer',
    padding: 10,
  },
  scrollHintText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1,
    textShadow: '0 0 15px rgba(255,107,53,0.8), 0 1px 2px rgba(0,0,0,0.5)',
  },
  pullDownIndicator: {
    position: 'absolute' as const,
    top: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 20,
  },
  pullDownBar: {
    width: 50,
    height: 5,
    borderRadius: 3,
    background: 'rgba(255,107,53,0.6)',
    boxShadow: '0 0 15px rgba(255,107,53,0.5)',
  },
  centeredOverlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: '#080810',
  },
  spinner: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: '2px solid rgba(255,107,53,0.3)',
    borderTopColor: '#FF6B35',
    animation: 'spin 0.75s linear infinite',
  },
  subtleText: {
    marginTop: 14,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    letterSpacing: '0.04em',
  },
  closeButton: {
    marginTop: 20,
    padding: '10px 20px',
    borderRadius: 30,
    background: 'rgba(255,107,53,0.4)',
    backdropFilter: 'blur(12px)',
    border: '2px solid rgba(255,107,53,0.6)',
    color: 'white',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    boxShadow: '0 0 15px rgba(255,107,53,0.4)',
  },
  footer: {
    position: 'absolute' as const,
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 15,
    textAlign: 'center' as const,
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 4,
    textShadow: '0 0 10px rgba(255,107,53,0.4)',
  },
  footerDev: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontStyle: 'italic',
  },
};