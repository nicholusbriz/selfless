// app/api/youtube/cache/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma, batchSaveVideosOptimized as batchSaveVideos, getCachedVideosOptimized as getCachedVideosWithFallback } from '@/lib/prisma';

const CACHE_EXPIRY_HOURS = 24;

// All genres for mixed feed
const ALL_GENRES = [
  { id: 'trending', query: 'trending music 2026 uganda', maxResults: 15 },
  { id: 'afrobeat', query: 'afrobeat music 2026', maxResults: 15 },
  { id: 'rnb', query: 'rnb music 2026', maxResults: 15 },
  { id: 'gospel', query: 'gospel music 2026', maxResults: 10 },
  { id: 'hiphop', query: 'hip hop music 2026', maxResults: 15 },
  { id: 'local', query: 'ugandan music 2026', maxResults: 15 },
];

const CATEGORIES: Record<string, { query: string; maxResults: number }> = {
  trending: { query: 'trending music 2026 uganda', maxResults: 20 },
  afrobeat: { query: 'afrobeat music 2026', maxResults: 20 },
  rnb: { query: 'rnb music 2026', maxResults: 20 },
  gospel: { query: 'gospel music 2026', maxResults: 20 },
  hiphop: { query: 'hip hop music 2026', maxResults: 20 },
  local: { query: 'ugandan music 2026', maxResults: 20 },
  workout: { query: 'workout music 2026', maxResults: 15 },
  chill: { query: 'chill music 2026', maxResults: 20 },
};

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 🆕 Optimized mixed feed with better caching
async function getMixedGenreFeed(forceFresh: boolean = false, userId: string = 'anonymous') {
  console.log('🎵 [getMixedGenreFeed] START:', { forceFresh, userId });
  const now = new Date();
  
  const allVideos = await Promise.all(
    ALL_GENRES.map(async (genre) => {
      console.log(`🎵 [getMixedGenreFeed] Fetching genre: ${genre.id}`);
      const cached = await prisma.youTubeVideo.findMany({
        where: {
          category: genre.id,
          expiresAt: { gt: now },
        },
        take: genre.maxResults,
        orderBy: { accessCount: 'desc' },
      });
      
      if (cached.length > 0 && !forceFresh) {
        console.log(`🎵 [getMixedGenreFeed] Using cached for ${genre.id}: ${cached.length} videos`);
        return cached;
      }
      
      console.log(`🎵 [getMixedGenreFeed] Fetching fresh for ${genre.id}`);
      const freshVideos = await fetchFromYouTube(genre.query, genre.maxResults);
      await batchSaveVideos(freshVideos, genre.id, 'category');
      console.log(`🎵 [getMixedGenreFeed] Fresh videos for ${genre.id}: ${freshVideos.length}`);
      return freshVideos;
    })
  );
  
  const flatVideos = allVideos.flat();
  const shuffled = shuffleArray(flatVideos).slice(0, 50);
  console.log(`🎵 [getMixedGenreFeed] FINAL: ${shuffled.length} videos mixed`);
  return shuffled;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 [API] GET /api/youtube/cache CALLED');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    const fresh = searchParams.get('fresh') === 'true';
    const userId = searchParams.get('userId') || 'anonymous';

    console.log('📊 [API] Request params:', {
      category,
      query,
      fresh,
      userId,
      url: request.url,
    });

    // Handle search query - DO NOT use database cache for searches
    if (query) {
      console.log(`🔍 [API] SEARCH MODE: query="${query}"`);
      
      // Skip database cache entirely for search - always fetch fresh from YouTube
      const videos = await fetchFromYouTube(query, 30);
      
      // Return videos immediately - don't wait for cache save
      console.log(`✅ [API] Search complete: ${videos.length} videos`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return NextResponse.json({ 
        success: true, 
        source: 'api', 
        videos,
        count: videos.length,
        searchTerm: query
      });
    }

    // Handle single category
    if (category && CATEGORIES[category]) {
      console.log(`📁 [API] CATEGORY MODE: ${category}`);
      
      // Try cache first with optimized query
      const cached = await getCachedVideosWithFallback(category, 30);
      
      if (cached && !fresh) {
        console.log(`✅ [API] Category cache HIT: ${cached.length} videos for ${category}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return NextResponse.json({ 
          success: true, 
          source: 'cache', 
          videos: cached,
          count: cached.length,
          duration: `${Date.now() - startTime}ms`,
        });
      }

      console.log(`🔄 [API] Category cache MISS, fetching from YouTube for ${category}`);
      const videos = await fetchFromYouTube(CATEGORIES[category].query, CATEGORIES[category].maxResults);
      await batchSaveVideos(videos, category, 'category');
      
      console.log(`✅ [API] Category complete: ${videos.length} videos for ${category}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return NextResponse.json({ 
        success: true, 
        source: 'api', 
        videos,
        count: videos.length,
        duration: `${Date.now() - startTime}ms`,
      });
    }

    // Default: Mixed genre feed
    console.log(`🎲 [API] MIXED MODE (no category specified)`);
    const mixedVideos = await getMixedGenreFeed(fresh, userId);
    
    console.log(`✅ [API] Mixed feed complete: ${mixedVideos.length} videos`);
    console.log(`⏱️ [API] Total duration: ${Date.now() - startTime}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return NextResponse.json({ 
      success: true, 
      source: fresh ? 'fresh' : 'mixed',
      videos: mixedVideos,
      count: mixedVideos.length,
      duration: `${Date.now() - startTime}ms`,
    });
    
  } catch (error) {
    console.error('❌ [API] ERROR:', error);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// 🆕 Batch watch recording endpoint
export async function POST(request: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 [API] POST /api/youtube/cache CALLED');
  
  try {
    const body = await request.json();
    const { userId, videoId, videos, action, category } = body;

    console.log('📊 [API] POST body:', { userId, videoId, action, category, batchSize: videos?.length });

    // Batch watch recording
    if (action === 'batchWatch' && userId && videos) {
      console.log(`📊 [API] Batch watch recording: ${videos.length} videos for user ${userId}`);
      await prisma.$transaction(
        videos.map((videoId: string) =>
          prisma.userWatchHistory.upsert({
            where: { userId_videoId: { userId, videoId } },
            update: { watchedAt: new Date() },
            create: { userId, videoId, watchedAt: new Date() },
          })
        )
      );
      
      console.log(`✅ [API] Batch watch recorded successfully`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return NextResponse.json({ success: true });
    }

    // Single watch record
    if (userId && videoId) {
      console.log(`📊 [API] Single watch recording: user=${userId}, video=${videoId}`);
      await prisma.userWatchHistory.upsert({
        where: { userId_videoId: { userId, videoId } },
        update: { watchedAt: new Date() },
        create: { userId, videoId, watchedAt: new Date() },
      });
      
      console.log(`✅ [API] Watch recorded successfully`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return NextResponse.json({ success: true });
    }

    // Cache refresh
    if (category && CATEGORIES[category]) {
      console.log(`🔄 [API] Cache refresh for category: ${category}`);
      await prisma.youTubeVideo.deleteMany({ where: { category } });
      const videos = await fetchFromYouTube(CATEGORIES[category].query, CATEGORIES[category].maxResults);
      await batchSaveVideos(videos, category, 'category');
      
      console.log(`✅ [API] Cache refreshed: ${videos.length} videos for ${category}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return NextResponse.json({ 
        success: true, 
        message: `Cache refreshed for ${category}`,
        count: videos.length 
      });
    }

    console.log('❌ [API] Invalid request - missing required fields');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return NextResponse.json(
      { error: 'Invalid request. Provide userId+videoId or category' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('❌ [API] POST Error:', error);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// YouTube API functions
async function fetchFromYouTube(query: string, maxResults: number = 25) {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  
  console.log(`📺 [YouTube] Fetching: "${query}" (max: ${maxResults})`);
  
  if (!apiKey) {
    console.error('❌ [YouTube] API key not configured');
    throw new Error('YouTube API key is not configured');
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${apiKey}`;
  
  const response = await fetch(url, {
    headers: { 'Cache-Control': 'no-cache' }
  });

  if (!response.ok) {
    console.error(`❌ [YouTube] API error: ${response.status}`);
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    console.log(`⚠️ [YouTube] No results for "${query}"`);
    return [];
  }

  console.log(`📺 [YouTube] Got ${data.items.length} results, fetching durations...`);

  // Fetch durations
  const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`;
  const detailsResponse = await fetch(detailsUrl);
  const detailsData = await detailsResponse.json();
  
  const durationMap = new Map();
  detailsData.items?.forEach((item: any) => {
    durationMap.set(item.id, item.contentDetails.duration);
  });

  const videos = data.items.map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    duration: durationMap.get(item.id.videoId) || null,
  }));

  console.log(`✅ [YouTube] Successfully fetched ${videos.length} videos`);
  return videos;
}