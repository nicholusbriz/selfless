// /hooks/useYouTube.ts

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  categoryId: string;
}

interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
}

/**
 * Hook for fetching English learning videos with pagination
 */
export function useEnglishLearningVideos(query: string = 'English language learning', maxResults: number = 12) {
  return useQuery({
    queryKey: ['youtube', 'search', query, maxResults],
    queryFn: async () => {
      const response = await fetch(`/api/youtube/search?query=${encodeURIComponent(query)}&maxResults=${maxResults}`);
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      return response.json() as Promise<YouTubeSearchResult>;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (renamed from cacheTime in v5)
  });
}

/**
 * Hook for fetching music videos with pagination
 * This is what your music tab will call
 */
export function useMusicVideos(query: string = 'trending music videos', maxResults: number = 12) {
  return useQuery({
    queryKey: ['youtube', 'music', 'search', query, maxResults],
    queryFn: async () => {
      // Adding videoCategoryId=10 for music content
      const response = await fetch(
        `/api/youtube/search?query=${encodeURIComponent(query)}&maxResults=${maxResults}&videoCategoryId=10`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch music videos');
      }
      return response.json() as Promise<YouTubeSearchResult>;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook for fetching music videos with lyrics
 * Specifically searches for music videos with lyrics
 */
export function useMusicVideosWithLyrics(query: string = 'music videos with lyrics', maxResults: number = 12) {
  return useQuery({
    queryKey: ['youtube', 'music', 'lyrics', query, maxResults],
    queryFn: async () => {
      const response = await fetch(
        `/api/youtube/search?query=${encodeURIComponent(query + ' lyrics')}&maxResults=${maxResults}&videoCategoryId=10`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch music videos with lyrics');
      }
      return response.json() as Promise<YouTubeSearchResult>;
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook for fetching trending music videos
 */
export function useTrendingMusicVideos(maxResults: number = 12) {
  return useQuery({
    queryKey: ['youtube', 'music', 'trending', maxResults],
    queryFn: async () => {
      const response = await fetch(
        `/api/youtube/search?query=trending music videos 2026&maxResults=${maxResults}&videoCategoryId=10`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch trending music videos');
      }
      return response.json() as Promise<YouTubeSearchResult>;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - more frequent for trending
    gcTime: 20 * 60 * 1000,
  });
}

/**
 * Hook for fetching music by genre
 */
export function useMusicByGenre(genre: string, maxResults: number = 12) {
  return useQuery({
    queryKey: ['youtube', 'music', 'genre', genre, maxResults],
    queryFn: async () => {
      const response = await fetch(
        `/api/youtube/search?query=${encodeURIComponent(genre + ' music videos')}&maxResults=${maxResults}&videoCategoryId=10`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch ${genre} music videos`);
      }
      return response.json() as Promise<YouTubeSearchResult>;
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!genre, // Only run if genre is provided
  });
}

/**
 * Hook for fetching specific music categories
 */
export function useMusicCategory(category: 'rnb' | 'hiphop' | 'gospel' | 'pop' | 'afrobeats' | 'reggae' | 'classic', maxResults: number = 12) {
  const categoryQueries = {
    rnb: 'R&B music videos lyrics',
    hiphop: 'hip hop music videos lyrics',
    gospel: 'gospel music videos lyrics',
    pop: 'pop music videos lyrics',
    afrobeats: 'afrobeats music videos',
    reggae: 'reggae music videos lyrics',
    classic: 'classic music videos lyrics',
  };

  return useQuery({
    queryKey: ['youtube', 'music', 'category', category, maxResults],
    queryFn: async () => {
      const query = categoryQueries[category] || category + ' music videos';
      const response = await fetch(
        `/api/youtube/search?query=${encodeURIComponent(query)}&maxResults=${maxResults}&videoCategoryId=10`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch ${category} music videos`);
      }
      return response.json() as Promise<YouTubeSearchResult>;
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook for infinite scroll of music videos
 */
export function useInfiniteMusicVideos(query: string = 'music videos', maxResults: number = 12) {
  return useInfiniteQuery({
    queryKey: ['youtube', 'music', 'infinite', query, maxResults],
    queryFn: async ({ pageParam }) => {
      const pageToken = pageParam as string | undefined;
      const response = await fetch(
        `/api/youtube/search?query=${encodeURIComponent(query)}&maxResults=${maxResults}&pageToken=${pageToken || ''}&videoCategoryId=10`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch music videos');
      }
      return response.json() as Promise<YouTubeSearchResult>;
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Hook for infinite scroll of English learning videos
 */
export function useInfiniteEnglishVideos(query: string = 'English language learning', maxResults: number = 12) {
  return useInfiniteQuery({
    queryKey: ['youtube', 'infinite', query, maxResults],
    queryFn: async ({ pageParam }) => {
      const pageToken = pageParam as string | undefined;
      const response = await fetch(
        `/api/youtube/search?query=${encodeURIComponent(query)}&maxResults=${maxResults}&pageToken=${pageToken || ''}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      return response.json() as Promise<YouTubeSearchResult>;
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Hook for fetching video details by IDs
 */
export function useVideoDetails(videoIds: string) {
  return useQuery({
    queryKey: ['youtube', 'videos', videoIds],
    queryFn: async () => {
      const response = await fetch(`/api/youtube/videos?ids=${videoIds}`);
      if (!response.ok) {
        throw new Error('Failed to fetch video details');
      }
      return response.json() as Promise<{ videos: YouTubeVideo[] }>;
    },
    enabled: !!videoIds,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook for fetching educational videos
 */
export function useEducationalVideos(maxResults: number = 12) {
  return useQuery({
    queryKey: ['youtube', 'educational', maxResults],
    queryFn: async () => {
      const response = await fetch(`/api/youtube/educational?maxResults=${maxResults}`);
      if (!response.ok) {
        throw new Error('Failed to fetch educational videos');
      }
      return response.json() as Promise<YouTubeSearchResult>;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook for fetching live streams
 */
export function useLiveStreams(maxResults: number = 12) {
  return useQuery({
    queryKey: ['youtube', 'live', maxResults],
    queryFn: async () => {
      const response = await fetch(`/api/youtube/live?maxResults=${maxResults}`);
      if (!response.ok) {
        throw new Error('Failed to fetch live streams');
      }
      return response.json() as Promise<{ videos: YouTubeVideo[] }>;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent updates for live content
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  });
}

/**
 * Hook for fetching popular music videos (by view count)
 */
export function usePopularMusicVideos(maxResults: number = 12) {
  return useQuery({
    queryKey: ['youtube', 'music', 'popular', maxResults],
    queryFn: async () => {
      const response = await fetch(
        `/api/youtube/search?query=most viewed music videos&maxResults=${maxResults}&videoCategoryId=10&order=viewCount`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch popular music videos');
      }
      return response.json() as Promise<YouTubeSearchResult>;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook for fetching new music releases
 */
export function useNewMusicReleases(maxResults: number = 12) {
  return useQuery({
    queryKey: ['youtube', 'music', 'new', maxResults],
    queryFn: async () => {
      const response = await fetch(
        `/api/youtube/search?query=new music releases 2026&maxResults=${maxResults}&videoCategoryId=10&order=date`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch new music releases');
      }
      return response.json() as Promise<YouTubeSearchResult>;
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}