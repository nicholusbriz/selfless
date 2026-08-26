// YouTube API Service for fetching English learning and Music content

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

interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId?: string;
      channelId?: string;
      playlistId?: string;
    };
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
      channelTitle: string;
      channelId: string;
      publishedAt: string;
    };
  }>;
  nextPageToken?: string;
  prevPageToken?: string;
}

interface YouTubeVideoDetailsResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
      channelTitle: string;
      channelId: string;
      publishedAt: string;
      categoryId: string;
    };
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
    };
  }>;
}

const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// YouTube Category IDs
const CATEGORIES = {
  MUSIC: '10',
  EDUCATION: '27',
  ENTERTAINMENT: '24',
  FILM: '1',
  GAMING: '20',
} as const;

export class YouTubeService {
  /**
   * Search for English learning content
   */
  static async searchEnglishLearning(
    query: string = 'English language learning',
    maxResults: number = 12,
    pageToken?: string
  ): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string; prevPageToken?: string }> {
    try {
      // English learning specific search terms
      const searchQueries = [
        'English language lessons',
        'English grammar tutorial',
        'English pronunciation guide',
        'conversational English',
        'English for beginners',
        'English speaking practice',
        'English vocabulary',
        'English listening practice',
        'English TV series educational',
        'English shows for learning'
      ];

      const searchQuery = query || searchQueries[Math.floor(Math.random() * searchQueries.length)];

      const url = new URL(`${BASE_URL}/search`);
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('q', searchQuery);
      url.searchParams.append('maxResults', maxResults.toString());
      url.searchParams.append('type', 'video');
      url.searchParams.append('order', 'relevance');
      url.searchParams.append('videoDuration', 'medium'); // Medium length videos (4-20 minutes)
      url.searchParams.append('relevanceLanguage', 'en');
      url.searchParams.append('key', API_KEY || '');

      if (pageToken) {
        url.searchParams.append('pageToken', pageToken);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data: YouTubeSearchResponse = await response.json();

      // Get video IDs to fetch detailed information
      const videoIds = data.items
        .filter(item => item.id.videoId)
        .map(item => item.id.videoId!)
        .join(',');

      if (!videoIds) {
        return { videos: [], nextPageToken: data.nextPageToken, prevPageToken: data.prevPageToken };
      }

      // Fetch video details
      const details = await this.getVideoDetails(videoIds);

      return {
        videos: details,
        nextPageToken: data.nextPageToken,
        prevPageToken: data.prevPageToken
      };
    } catch (error) {
      console.error('Error searching YouTube:', error);
      throw error;
    }
  }

  /**
   * Search for music videos
   * This is the main method your music tab will call
   */
  static async searchMusicVideos(
    query: string = 'trending music videos',
    maxResults: number = 12,
    pageToken?: string,
    videoCategoryId: string = CATEGORIES.MUSIC
  ): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string; prevPageToken?: string }> {
    try {
      const url = new URL(`${BASE_URL}/search`);
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('q', query);
      url.searchParams.append('maxResults', maxResults.toString());
      url.searchParams.append('type', 'video');
      url.searchParams.append('videoCategoryId', videoCategoryId);
      url.searchParams.append('order', 'relevance');
      url.searchParams.append('relevanceLanguage', 'en');
      url.searchParams.append('key', API_KEY || '');

      if (pageToken) {
        url.searchParams.append('pageToken', pageToken);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data: YouTubeSearchResponse = await response.json();

      // Get video IDs to fetch detailed information
      const videoIds = data.items
        .filter(item => item.id.videoId)
        .map(item => item.id.videoId!)
        .join(',');

      if (!videoIds) {
        return { videos: [], nextPageToken: data.nextPageToken, prevPageToken: data.prevPageToken };
      }

      // Fetch video details
      const details = await this.getVideoDetails(videoIds);

      return {
        videos: details,
        nextPageToken: data.nextPageToken,
        prevPageToken: data.prevPageToken
      };
    } catch (error) {
      console.error('Error searching music videos:', error);
      throw error;
    }
  }

  /**
   * Get music videos by genre
   */
  static async getMusicByGenre(
    genre: string,
    maxResults: number = 12,
    pageToken?: string
  ): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string; prevPageToken?: string }> {
    const genreQueries: Record<string, string> = {
      rnb: 'R&B music videos lyrics',
      hiphop: 'hip hop music videos lyrics',
      gospel: 'gospel music videos lyrics',
      pop: 'pop music videos lyrics',
      afrobeats: 'afrobeats music videos',
      reggae: 'reggae music videos lyrics',
      classic: 'classic music videos lyrics',
      trending: 'trending music videos 2026',
      rock: 'rock music videos',
      jazz: 'jazz music videos',
      country: 'country music videos',
      electronic: 'electronic dance music videos',
    };

    const query = genreQueries[genre.toLowerCase()] || `${genre} music videos`;
    return this.searchMusicVideos(query, maxResults, pageToken);
  }

  /**
   * Get music videos with lyrics
   */
  static async getMusicWithLyrics(
    query: string,
    maxResults: number = 12,
    pageToken?: string
  ): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string; prevPageToken?: string }> {
    const searchQuery = `${query} lyrics`;
    return this.searchMusicVideos(searchQuery, maxResults, pageToken);
  }

  /**
   * Get trending music videos
   */
  static async getTrendingMusic(
    maxResults: number = 12,
    pageToken?: string
  ): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string; prevPageToken?: string }> {
    return this.searchMusicVideos('trending music videos 2026', maxResults, pageToken);
  }

  /**
   * Get popular music videos (by view count)
   */
  static async getPopularMusic(
    maxResults: number = 12,
    pageToken?: string
  ): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string; prevPageToken?: string }> {
    try {
      const url = new URL(`${BASE_URL}/search`);
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('q', 'most viewed music videos');
      url.searchParams.append('maxResults', maxResults.toString());
      url.searchParams.append('type', 'video');
      url.searchParams.append('videoCategoryId', CATEGORIES.MUSIC);
      url.searchParams.append('order', 'viewCount');
      url.searchParams.append('relevanceLanguage', 'en');
      url.searchParams.append('key', API_KEY || '');

      if (pageToken) {
        url.searchParams.append('pageToken', pageToken);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data: YouTubeSearchResponse = await response.json();

      const videoIds = data.items
        .filter(item => item.id.videoId)
        .map(item => item.id.videoId!)
        .join(',');

      if (!videoIds) {
        return { videos: [], nextPageToken: data.nextPageToken, prevPageToken: data.prevPageToken };
      }

      const details = await this.getVideoDetails(videoIds);

      return {
        videos: details,
        nextPageToken: data.nextPageToken,
        prevPageToken: data.prevPageToken
      };
    } catch (error) {
      console.error('Error fetching popular music:', error);
      throw error;
    }
  }

  /**
   * Get new music releases
   */
  static async getNewMusicReleases(
    maxResults: number = 12,
    pageToken?: string
  ): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string; prevPageToken?: string }> {
    try {
      const url = new URL(`${BASE_URL}/search`);
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('q', 'new music releases 2026');
      url.searchParams.append('maxResults', maxResults.toString());
      url.searchParams.append('type', 'video');
      url.searchParams.append('videoCategoryId', CATEGORIES.MUSIC);
      url.searchParams.append('order', 'date');
      url.searchParams.append('relevanceLanguage', 'en');
      url.searchParams.append('key', API_KEY || '');

      if (pageToken) {
        url.searchParams.append('pageToken', pageToken);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data: YouTubeSearchResponse = await response.json();

      const videoIds = data.items
        .filter(item => item.id.videoId)
        .map(item => item.id.videoId!)
        .join(',');

      if (!videoIds) {
        return { videos: [], nextPageToken: data.nextPageToken, prevPageToken: data.prevPageToken };
      }

      const details = await this.getVideoDetails(videoIds);

      return {
        videos: details,
        nextPageToken: data.nextPageToken,
        prevPageToken: data.prevPageToken
      };
    } catch (error) {
      console.error('Error fetching new music releases:', error);
      throw error;
    }
  }

  /**
   * Get video details by IDs
   */
  static async getVideoDetails(videoIds: string): Promise<YouTubeVideo[]> {
    try {
      const url = new URL(`${BASE_URL}/videos`);
      url.searchParams.append('part', 'snippet,contentDetails,statistics');
      url.searchParams.append('id', videoIds);
      url.searchParams.append('key', API_KEY || '');

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data: YouTubeVideoDetailsResponse = await response.json();

      return data.items.map(item => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        duration: this.formatDuration(item.contentDetails.duration),
        viewCount: this.formatViewCount(item.statistics.viewCount),
        categoryId: item.snippet.categoryId
      }));
    } catch (error) {
      console.error('Error fetching video details:', error);
      throw error;
    }
  }

  /**
   * Get videos by category
   */
  static async getVideosByCategory(
    categoryId: string,
    maxResults: number = 12,
    pageToken?: string
  ): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string; prevPageToken?: string }> {
    try {
      const url = new URL(`${BASE_URL}/search`);
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('categoryId', categoryId);
      url.searchParams.append('maxResults', maxResults.toString());
      url.searchParams.append('type', 'video');
      url.searchParams.append('order', 'viewCount');
      url.searchParams.append('relevanceLanguage', 'en');
      url.searchParams.append('key', API_KEY || '');

      if (pageToken) {
        url.searchParams.append('pageToken', pageToken);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data: YouTubeSearchResponse = await response.json();

      const videoIds = data.items
        .filter(item => item.id.videoId)
        .map(item => item.id.videoId!)
        .join(',');

      if (!videoIds) {
        return { videos: [], nextPageToken: data.nextPageToken, prevPageToken: data.prevPageToken };
      }

      const details = await this.getVideoDetails(videoIds);

      return {
        videos: details,
        nextPageToken: data.nextPageToken,
        prevPageToken: data.prevPageToken
      };
    } catch (error) {
      console.error(`Error fetching videos for category ${categoryId}:`, error);
      throw error;
    }
  }

  /**
   * Get educational videos (Category ID: 27)
   */
  static async getEducationalVideos(
    maxResults: number = 12,
    pageToken?: string
  ): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string; prevPageToken?: string }> {
    return this.getVideosByCategory(CATEGORIES.EDUCATION, maxResults, pageToken);
  }

  /**
   * Get live streams related to English learning
   */
  static async getLiveStreams(
    maxResults: number = 12
  ): Promise<YouTubeVideo[]> {
    try {
      const url = new URL(`${BASE_URL}/search`);
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('q', 'English learning live');
      url.searchParams.append('maxResults', maxResults.toString());
      url.searchParams.append('type', 'video');
      url.searchParams.append('eventType', 'live');
      url.searchParams.append('order', 'relevance');
      url.searchParams.append('key', API_KEY || '');

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data: YouTubeSearchResponse = await response.json();

      const videoIds = data.items
        .filter(item => item.id.videoId)
        .map(item => item.id.videoId!)
        .join(',');

      if (!videoIds) {
        return [];
      }

      return await this.getVideoDetails(videoIds);
    } catch (error) {
      console.error('Error fetching live streams:', error);
      throw error;
    }
  }

  /**
   * Format YouTube duration (PT4M13S -> 4:13)
   */
  private static formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format view count (1500 -> 1.5K)
   */
  private static formatViewCount(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}

// Export category constants for use in other files
export const YOUTUBE_CATEGORIES = CATEGORIES;