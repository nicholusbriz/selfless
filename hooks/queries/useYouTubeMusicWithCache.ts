// hooks/queries/useYouTubeMusicWithCache.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

export interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  category: string;
  searchQuery?: string;
  publishedAt?: string;
  duration?: string;
  views?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  { id: 'all', name: 'All', icon: '🎵', color: 'from-purple-500 to-pink-500' },
  { id: 'trending', name: 'Trending', icon: '🔥', color: 'from-red-500 to-orange-500' },
  { id: 'afrobeat', name: 'Afrobeat', icon: '🌍', color: 'from-yellow-500 to-orange-500' },
  { id: 'rnb', name: 'R&B', icon: '💜', color: 'from-purple-500 to-pink-500' },
  { id: 'gospel', name: 'Gospel', icon: '🙏', color: 'from-blue-500 to-cyan-500' },
  { id: 'hiphop', name: 'Hip Hop', icon: '🎤', color: 'from-green-500 to-emerald-500' },
  { id: 'local', name: 'Local UG', icon: '🇺🇬', color: 'from-yellow-600 to-red-600' },
  { id: 'workout', name: 'Workout', icon: '💪', color: 'from-orange-500 to-red-500' },
  { id: 'chill', name: 'Chill', icon: '😌', color: 'from-teal-500 to-blue-500' },
];

// Helper: Get or create anonymous user ID
const getAnonymousUserId = (): string => {
  if (typeof window === 'undefined') return 'server_user';
  
  let userId = localStorage.getItem('vibe_anonymous_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('vibe_anonymous_id', userId);
  }
  return userId;
};

// API functions
const fetchVideosByCategory = async (category: string): Promise<YouTubeVideo[]> => {
  const userId = getAnonymousUserId();
  const endpoint = category==='all'
    ? `/api/youtube/cache?category=mixed&userId=${userId}`
    : `/api/youtube/cache?category=${category}&userId=${userId}`;
  const response = await axios.get(endpoint);
  if (response.data.success) {
    return response.data.videos;
  }
  throw new Error(response.data.error || 'Failed to fetch videos');
};

const searchVideosAPI = async (query: string): Promise<YouTubeVideo[]> => {
  if (!query.trim()) return [];
  const userId = getAnonymousUserId();
  const response = await axios.get(`/api/youtube/cache?query=${encodeURIComponent(query)}&userId=${userId}`);
  if (response.data.success) {
    return response.data.videos;
  }
  throw new Error(response.data.error || 'Search failed');
};

const refreshCategoryCacheAPI = async (category: string) => {
  const response = await axios.post('/api/youtube/cache', { category });
  return response.data;
};

// Record watch history
export const recordWatch = async (videoId: string) => {
  const userId = getAnonymousUserId();
  try {
    await axios.post('/api/youtube/cache', { 
      userId, 
      videoId, 
      action: 'watch' 
    });
    console.log(`📺 Recorded watch: ${userId} watched ${videoId}`);
  } catch (error) {
    console.error('Failed to record watch:', error);
  }
};

// Main hook for YouTube music with caching
export function useYouTubeMusic() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('all'); // Default to mixed feed
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Query for category videos
  const {
    data: videos = [],
    isLoading: isLoadingVideos,
    error: videosError,
    refetch: refetchVideos,
    isFetching: isFetchingVideos,
  } = useQuery({
    queryKey: ['youtube-videos', activeCategory],
    queryFn: () => fetchVideosByCategory(activeCategory),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
  });

  // Query for search results
  const {
    data: searchResults = [],
    isLoading: isSearching,
  } = useQuery({
    queryKey: ['youtube-search', debouncedSearch],
    queryFn: () => searchVideosAPI(debouncedSearch),
    enabled: debouncedSearch.length > 2,
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  // Mutation for refreshing cache
  const refreshMutation = useMutation({
    mutationFn: refreshCategoryCacheAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-videos', activeCategory] });
    },
  });

  // Prefetch adjacent categories for faster navigation
  const prefetchCategory = async (categoryId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['youtube-videos', categoryId],
      queryFn: () => fetchVideosByCategory(categoryId),
      staleTime: 30 * 60 * 1000,
    });
  };

  // Auto-prefetch next/prev categories
  useEffect(() => {
    const currentIndex = categories.findIndex(c => c.id === activeCategory);
    const nextCategory = categories[currentIndex + 1]?.id;
    const prevCategory = categories[currentIndex - 1]?.id;
    
    if (nextCategory) prefetchCategory(nextCategory);
    if (prevCategory) prefetchCategory(prevCategory);
  }, [activeCategory]);

  const changeCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const search = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
  };

  const refreshCache = () => {
    refreshMutation.mutate(activeCategory);
  };

  // Get fresh content (pull to refresh)
  const getFreshContent = async () => {
    await queryClient.invalidateQueries({ queryKey: ['youtube-videos', activeCategory] });
    return refetchVideos();
  };

  return {
    videos,
    categories,
    activeCategory,
    searchResults,
    searchQuery,
    debouncedSearch,
    isLoadingVideos: isLoadingVideos || isFetchingVideos,
    isSearching,
    videosError,
    changeCategory,
    search,
    clearSearch,
    refetchVideos,
    refreshCache,
    getFreshContent,
    isRefreshing: refreshMutation.isPending,
    prefetchCategory,
    getAnonymousUserId,
    recordWatch,
  };
}

// Hook for video player state with working playlist
export function useVideoPlayer() {
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<YouTubeVideo[]>([]);
  const [playlist, setPlaylist] = useState<YouTubeVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [isShuffling, setIsShuffling] = useState(false);
  const [history, setHistory] = useState<YouTubeVideo[]>([]);

  const playVideo = (video: YouTubeVideo, playlistVideos?: YouTubeVideo[]) => {
    setCurrentVideo(video);
    setIsPlaying(true);
    setProgress(0);
    
    if (playlistVideos) {
      setPlaylist(playlistVideos);
      const index = playlistVideos.findIndex(v => v.videoId === video.videoId);
      setCurrentIndex(index);
    }
    
    setHistory(prev => {
      const newHistory = [video, ...prev.filter(v => v.videoId !== video.videoId)];
      return newHistory.slice(0, 50);
    });
  };
  
  const togglePlay = () => setIsPlaying(prev => !prev);
  
  const playNext = () => {
    if (queue.length > 0) {
      const nextVideo = queue[0];
      setQueue(prev => prev.slice(1));
      playVideo(nextVideo, playlist);
      return;
    }
    
    if (playlist.length === 0) return;
    
    let nextIndex = currentIndex + 1;
    if (nextIndex >= playlist.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }
    
    const nextVideo = playlist[nextIndex];
    setCurrentIndex(nextIndex);
    playVideo(nextVideo, playlist);
  };
  
  const playPrevious = () => {
    if (history.length > 1) {
      const previousVideo = history[1];
      playVideo(previousVideo, playlist);
      return;
    }
    
    if (playlist.length === 0) return;
    
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = playlist.length - 1;
      } else {
        return;
      }
    }
    
    const prevVideo = playlist[prevIndex];
    setCurrentIndex(prevIndex);
    playVideo(prevVideo, playlist);
  };
  
  const seekTo = (value: number) => setProgress(value);
  
  const adjustVolume = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  const toggleMute = () => setIsMuted(prev => !prev);
  
  const addToQueue = (video: YouTubeVideo) => {
    setQueue(prev => [...prev, video]);
  };
  
  const removeFromQueue = (videoId: string) => {
    setQueue(prev => prev.filter(v => v.videoId !== videoId));
  };
  
  const clearQueue = () => setQueue([]);
  
  const toggleRepeat = () => {
    setRepeatMode(current => {
      if (current === 'off') return 'one';
      if (current === 'one') return 'all';
      return 'off';
    });
  };
  
  const toggleShuffle = () => {
    if (!isShuffling && playlist.length > 0) {
      const shuffled = [...playlist];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setPlaylist(shuffled);
    }
    setIsShuffling(prev => !prev);
  };
  
  const setDurationFromPlayer = (newDuration: number) => setDuration(newDuration);

  return {
    currentVideo,
    isPlaying,
    volume,
    isMuted,
    progress,
    setProgress,
    duration,
    queue,
    playlist,
    repeatMode,
    isShuffling,
    history,
    playVideo,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    adjustVolume,
    toggleMute,
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleRepeat,
    toggleShuffle,
    setDurationFromPlayer,
  };
}