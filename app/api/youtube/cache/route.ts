// app/api/youtube/cache/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to generate unique IDs without mongodb dependency
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

const CACHE_EXPIRY_HOURS = 24;

// All genres for mixed feed
const ALL_GENRES = [
  { id: 'trending', query: 'trending music 2026 uganda', maxResults: 15, duration: 'short' },
  { id: 'afrobeat', query: 'afrobeat music 2026', maxResults: 15, duration: 'medium' },
  { id: 'rnb', query: 'rnb music 2026', maxResults: 15, duration: 'short' },
  { id: 'gospel', query: 'gospel music 2026', maxResults: 10, duration: 'short' },
  { id: 'hiphop', query: 'hip hop music 2026', maxResults: 15, duration: 'short' },
  { id: 'local', query: 'ugandan music 2026', maxResults: 15, duration: 'short' },
];

const CATEGORIES: Record<string, { query: string; maxResults: number; duration?: string }> = {
  trending: { query: 'trending music 2026 uganda', maxResults: 20, duration: 'short' },
  afrobeat: { query: 'afrobeat music 2026', maxResults: 20, duration: 'medium' },
  rnb: { query: 'rnb music 2026', maxResults: 20, duration: 'short' },
  gospel: { query: 'gospel music 2026', maxResults: 20, duration: 'short' },
  hiphop: { query: 'hip hop music 2026', maxResults: 20, duration: 'short' },
  local: { query: 'ugandan music 2026', maxResults: 20, duration: 'short' },
  workout: { query: 'workout music 2026', maxResults: 15, duration: 'medium' },
  chill: { query: 'chill music 2026', maxResults: 20, duration: 'short' },
};

// ──────────────────────────────────────────────────────────────────────────
// HELPERS (defined once)
// ──────────────────────────────────────────────────────────────────────────

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function getUserWatchHistory(userId: string): Promise<string[]> {
  try {
    const history = await prisma.userWatchHistory.findMany({
      where: { userId },
      orderBy: { watchedAt: 'desc' },
      take: 50,
    });
    return history.map(h => h.videoId);
  } catch (error) {
    console.error('Error fetching watch history:', error);
    return [];
  }
}

async function getMixedGenreFeed(forceFresh: boolean = false, userId: string = 'anonymous') {
  const now = new Date();
  
  // Get user's watch history to avoid repeats
  const watchHistory = await getUserWatchHistory(userId);
  const watchedIds = new Set(watchHistory);
  
  let allVideos: any[] = [];
  
  // Fetch videos from each genre
  for (const genre of ALL_GENRES) {
    const cached = await prisma.youTubeVideo.findMany({
      where: {
        category: genre.id,
        expiresAt: { gt: now },
      },
      take: genre.maxResults,
    });
    
    if (cached.length > 0 && !forceFresh) {
      allVideos.push(...cached);
    } else {
      // Fetch fresh from YouTube
      const freshVideos = await fetchFromYouTube(genre.query, genre.maxResults, genre.duration);
      await saveToCache(freshVideos, genre.id, 'category');
      allVideos.push(...freshVideos);
    }
  }
  
  // Filter out watched videos
  const unwatchedVideos = allVideos.filter(v => !watchedIds.has(v.videoId));
  
  // Mix: 70% unwatched, 30% watched (for variety)
  const shuffledUnwatched = shuffleArray([...unwatchedVideos]);
  const shuffledWatched = shuffleArray([...allVideos.filter(v => watchedIds.has(v.videoId))]);
  
  const finalVideos = [
    ...shuffledUnwatched.slice(0, 20),
    ...shuffledWatched.slice(0, 8),
    ...shuffledUnwatched.slice(20, 25),
  ].slice(0, 30);
  
  return shuffleArray(finalVideos);
}

// ──────────────────────────────────────────────────────────────────────────
// GET handler
// ──────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    const fresh = searchParams.get('fresh') === 'true';
    const userId = searchParams.get('userId') || 'anonymous';

    console.log('📺 API called with:', { category, query, fresh, userId });

    // Handle search query
    if (query) {
      const cached = await prisma.youTubeVideo.findMany({
        where: {
          searchQuery: query,
          expiresAt: { gt: new Date() },
        },
        take: 50,
      });

      if (cached.length > 0 && !fresh) {
        return NextResponse.json({ 
          success: true, 
          source: 'cache', 
          videos: cached,
          count: cached.length 
        });
      }

      const videos = await fetchFromYouTube(query);
      await saveToCache(videos, query, 'search');
      
      return NextResponse.json({ 
        success: true, 
        source: 'api', 
        videos,
        count: videos.length 
      });
    }

    // Handle single category
    if (category && CATEGORIES[category]) {
      const cached = await prisma.youTubeVideo.findMany({
        where: {
          category: category,
          expiresAt: { gt: new Date() },
        },
        take: 50,
      });

      if (cached.length > 0 && !fresh) {
        return NextResponse.json({ 
          success: true, 
          source: 'cache', 
          videos: cached,
          count: cached.length 
        });
      }

      const videos = await fetchFromYouTube(CATEGORIES[category].query, CATEGORIES[category].maxResults, CATEGORIES[category].duration);
      await saveToCache(videos, category, 'category');
      
      return NextResponse.json({ 
        success: true, 
        source: 'api', 
        videos,
        count: videos.length 
      });
    }

    // DEFAULT: Mixed genre feed (TikTok style)
    const mixedVideos = await getMixedGenreFeed(fresh, userId);
    
    return NextResponse.json({ 
      success: true, 
      source: fresh ? 'fresh' : 'mixed',
      videos: mixedVideos,
      count: mixedVideos.length
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────
// POST handler - Handles both watch history AND cache refresh
// ──────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Failed to parse JSON body:', e);
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
    
    const { userId, videoId, action, category } = body;

    // 👇 CASE 1: Record watch history
    if (action === 'watch' && userId && videoId) {
      console.log(`📝 Recording watch: user=${userId}, video=${videoId}`);
      
      await prisma.userWatchHistory.upsert({
        where: { 
          userId_videoId: { userId, videoId } 
        },
        update: { 
          watchedAt: new Date() 
        },
        create: {
          userId,
          videoId,
          watchedAt: new Date(),
        },
      });
      
      return NextResponse.json({ success: true, message: 'Watch recorded' });
    }

    // 👇 CASE 2: Also handle watch history from the old format
    if (userId && videoId && !action) {
      console.log(`📝 Recording watch (legacy): user=${userId}, video=${videoId}`);
      
      await prisma.userWatchHistory.upsert({
        where: { 
          userId_videoId: { userId, videoId } 
        },
        update: { 
          watchedAt: new Date() 
        },
        create: {
          userId,
          videoId,
          watchedAt: new Date(),
        },
      });
      
      return NextResponse.json({ success: true });
    }

    // 👇 CASE 3: Cache refresh functionality
    if (category && CATEGORIES[category]) {
      console.log(`🔄 Refreshing cache for category: ${category}`);
      
      await prisma.youTubeVideo.deleteMany({
        where: { category: category }
      });

      const videos = await fetchFromYouTube(CATEGORIES[category].query, CATEGORIES[category].maxResults, CATEGORIES[category].duration);
      await saveToCache(videos, category, 'category');

      return NextResponse.json({ 
        success: true, 
        message: `Cache refreshed for ${category}`,
        count: videos.length 
      });
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide userId+videoId or category' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────
// YOUTUBE API FUNCTIONS
// ──────────────────────────────────────────────────────────────────────────

async function fetchFromYouTube(query: string, maxResults: number = 25, duration?: string) {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  
  if (!apiKey) {
    throw new Error('YouTube API key is not configured');
  }

  let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${apiKey}`;
  
  if (duration && ['short', 'medium', 'long'].includes(duration)) {
    url += `&videoDuration=${duration}`;
  }
  
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('YouTube API Error:', response.status, errorText);
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.items) {
    return [];
  }

  // Fetch video durations
  const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`;
  const detailsResponse = await fetch(detailsUrl);
  const detailsData = await detailsResponse.json();
  
  const durationMap = new Map();
  detailsData.items?.forEach((item: any) => {
    durationMap.set(item.id, item.contentDetails.duration);
  });

  return data.items.map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    duration: durationMap.get(item.id.videoId) || null,
  }));
}

async function saveToCache(videos: any[], categoryOrQuery: string, type: string) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + CACHE_EXPIRY_HOURS);

  for (const video of videos) {
    try {
      const existingVideo = await prisma.youTubeVideo.findUnique({
        where: { videoId: video.videoId }
      });

      if (existingVideo) {
        await prisma.youTubeVideo.update({
          where: { videoId: video.videoId },
          data: {
            title: video.title,
            thumbnail: video.thumbnail,
            channelTitle: video.channelTitle,
            category: type === 'category' ? categoryOrQuery : existingVideo.category,
            searchQuery: type === 'search' ? categoryOrQuery : existingVideo.searchQuery,
            expiresAt,
            lastAccessed: new Date(),
            accessCount: { increment: 1 },
          },
        });
      } else {
        await prisma.youTubeVideo.create({
          data: {
            videoId: video.videoId,
            title: video.title,
            thumbnail: video.thumbnail,
            channelTitle: video.channelTitle,
            category: type === 'category' ? categoryOrQuery : null,
            searchQuery: type === 'search' ? categoryOrQuery : null,
            publishedAt: video.publishedAt ? new Date(video.publishedAt) : null,
            cachedAt: new Date(),
            expiresAt,
            lastAccessed: new Date(),
            accessCount: 1,
          },
        });
        console.log(`✅ Saved new video: ${video.title}`);
      }
    } catch (error) {
      console.error('Error saving video:', error);
    }
  }
}