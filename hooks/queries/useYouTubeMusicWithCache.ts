// hooks/queries/useYouTubeMusicWithCache.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from '@/lib/axios';
import { indexedDBCache } from '@/lib/indexedDB';



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

// 🆕 Prefetch adjacent categories in background
const prefetchQueue = new Map<string, Promise<any>>();

export async function fetchWithPrefetch(category: string, userId: string): Promise<YouTubeVideo[]> {
  // Check if already prefetching
  if (prefetchQueue.has(category)) {
    return prefetchQueue.get(category)!
  }
  
  const promise = (async () => {
    // Try IndexedDB first (instant)
    const cached = await indexedDBCache.getVideos(category)
    if (cached && cached.length > 0) {
      // Return cached instantly, then refresh in background
      setTimeout(() => {
        fetchFromAPI(category, userId).catch(() => {})
      }, 0)
      // Map cached videos to ensure they have the required id field
      return cached.map((v: any) => ({
        ...v,
        id: v.videoId || v.id,
      })) as YouTubeVideo[]
    }
    
    // Fall back to API
    return fetchFromAPI(category, userId)
  })()
  
  prefetchQueue.set(category, promise)
  const result = await promise
  prefetchQueue.delete(category)
  return result
}

async function fetchFromAPI(category: string, userId: string): Promise<YouTubeVideo[]> {
  const endpoint = category === 'all'
    ? `/api/youtube/cache?category=mixed&userId=${userId}`
    : `/api/youtube/cache?category=${category}&userId=${userId}`;
  
  const response = await axios.get(endpoint);
  if (response.data.success) {
    const videos = response.data.videos;
    // Save to IndexedDB for next time
    await indexedDBCache.saveVideos(category, videos);
    return videos;
  }
  throw new Error(response.data.error || 'Failed to fetch videos');
}

// 🆕 Optimized search with caching
const searchCache = new Map<string, { data: YouTubeVideo[]; timestamp: number }>();

async function searchVideosAPI(query: string): Promise<YouTubeVideo[]> {
  if (!query.trim()) return [];
  
  const userId = getAnonymousUserId();
  // Add timestamp to prevent any CDN or browser caching
  const timestamp = Date.now();
  const response = await axios.get(
    `/api/youtube/cache?query=${encodeURIComponent(query)}&userId=${userId}&_t=${timestamp}`
  );
  
  if (response.data.success) {
    return response.data.videos;
  }
  throw new Error(response.data.error || 'Search failed');
}

// Record watch history (optimized with debounce)
const watchQueue = new Set<string>();
let watchTimeout: NodeJS.Timeout | null = null;

export const recordWatch = async (videoId: string) => {
  const userId = getAnonymousUserId();
  const key = `${userId}:${videoId}`;
  
  watchQueue.add(key);
  
  if (watchTimeout) clearTimeout(watchTimeout);
  watchTimeout = setTimeout(async () => {
    const toSend = Array.from(watchQueue);
    watchQueue.clear();
    
    try {
      await axios.post('/api/youtube/cache', { 
        userId, 
        videos: toSend.map(k => k.split(':')[1]),
        action: 'batchWatch' 
      });
    } catch (error) {
      console.error('Failed to record watch:', error);
    }
  }, 2000);
};

// Main hook - FIXED: Removed infinite query
export function useYouTubeMusic() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const userId = getAnonymousUserId();

  // Debounce search with 300ms for faster response
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ✅ FIXED: Regular query instead of infinite query
  const {
    data: videos = [],
    isLoading: isLoadingVideos,
    error: videosError,
    refetch: refetchVideos,
    isFetching: isFetchingVideos,
  } = useQuery({
    queryKey: ['youtube-videos', activeCategory],
    queryFn: () => fetchWithPrefetch(activeCategory, userId),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
  });

  // 🆕 Periodically refresh all genres in background to keep content fresh
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      // Refresh all categories in background
      for (const category of categories) {
        try {
          await queryClient.prefetchQuery({
            queryKey: ['youtube-videos', category.id],
            queryFn: () => fetchWithPrefetch(category.id, userId),
            staleTime: 30 * 60 * 1000,
          });
        } catch (error) {
          console.error(`Failed to refresh category ${category.id}:`, error);
        }
      }
    }, 30 * 60 * 1000); // Refresh every 30 minutes

    return () => clearInterval(refreshInterval);
  }, [queryClient, userId]);

  // 🆕 Prefetch next category immediately
  const prefetchCategory = useCallback(async (categoryId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['youtube-videos', categoryId],
      queryFn: () => fetchWithPrefetch(categoryId, userId),
      staleTime: 30 * 60 * 1000,
    });
  }, [queryClient, userId]);

  // Auto-prefetch adjacent categories
  useEffect(() => {
    const currentIndex = categories.findIndex(c => c.id === activeCategory);
    const nextCategory = categories[currentIndex + 1]?.id;
    const prevCategory = categories[currentIndex - 1]?.id;
    
    if (nextCategory) prefetchCategory(nextCategory);
    if (prevCategory) prefetchCategory(prevCategory);
  }, [activeCategory, prefetchCategory]);

  // Search query with no caching to prevent stale results
  const {
    data: searchResults = [],
    isLoading: isSearching,
  } = useQuery({
    queryKey: ['youtube-search', debouncedSearch],
    queryFn: () => searchVideosAPI(debouncedSearch),
    enabled: debouncedSearch.length > 2,
    staleTime: 0, // Don't cache search results at all
    gcTime: 30 * 1000, // Clear garbage collection faster (30 seconds)
    placeholderData: (previousData) => {
      // Only show previous data if it's from the EXACT SAME search query
      if (previousData && debouncedSearch.length > 2) {
        return undefined; // Don't show stale data - show loading instead
      }
      return undefined;
    },
  });

  const changeCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    // Prefetch next immediately after change
    const nextIndex = categories.findIndex(c => c.id === categoryId) + 1;
    if (nextIndex < categories.length) {
      prefetchCategory(categories[nextIndex].id);
    }
  };

  const search = (query: string) => {
    setSearchQuery(query);
    // Clear previous results immediately when query changes
    if (query.length === 0 || query !== debouncedSearch) {
      // Invalidate the query to force fresh fetch
      queryClient.invalidateQueries({ queryKey: ['youtube-search'] });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    // Clear search results from cache
    queryClient.invalidateQueries({ queryKey: ['youtube-search'] });
    queryClient.setQueryData(['youtube-search', ''], []);
  };

  // 🆕 Get fresh content with optimistic UI
  const getFreshContent = async () => {
    // Clear IndexedDB cache for this category
    await indexedDBCache.saveVideos(activeCategory, []);
    // Invalidate query
    await queryClient.invalidateQueries({ queryKey: ['youtube-videos', activeCategory] });
    return refetchVideos();
  };

  return {
    videos,
    categories,
    activeCategory,
    searchResults,
    searchQuery,
    isLoadingVideos: isLoadingVideos || isFetchingVideos,
    isSearching,
    videosError,
    changeCategory,
    search,
    clearSearch,
    refetchVideos,
    getFreshContent,
    prefetchCategory,
  };
}

// 🆕 Hook for watch progress (resume playback)
export function useWatchProgress() {
  const [progress, setProgress] = useState<Record<string, number>>({});

  const saveProgress = useCallback(async (videoId: string, position: number) => {
    const userId = getAnonymousUserId();
    setProgress(prev => ({ ...prev, [videoId]: position }));
    
    try {
      await axios.post('/api/youtube/progress', { userId, videoId, position });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, []);

  const getProgress = useCallback(async (videoId: string): Promise<number> => {
    if (progress[videoId]) return progress[videoId];
    
    const userId = getAnonymousUserId();
    try {
      const response = await axios.get(`/api/youtube/progress?userId=${userId}&videoId=${videoId}`);
      return response.data.progress || 0;
    } catch {
      return 0;
    }
  }, [progress]);

  return { saveProgress, getProgress };
}