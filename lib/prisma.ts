// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with optimized settings for MongoDB
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.PRISMA_QUERY_LOGGING === 'true' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  errorFormat: 'pretty',
});

// 🆕 Helper: Get cached videos with fallback and automatic refresh
export async function getCachedVideosOptimized(
  category: string,
  limit: number = 30
): Promise<any[] | null> {
  const now = new Date();
  
  try {
    const cached = await prisma.youTubeVideo.findMany({
      where: {
        category: category === 'all' ? undefined : category,
        expiresAt: { gt: now },
      },
      orderBy: [
        { accessCount: 'desc' },
        { lastAccessed: 'desc' },
      ],
      take: limit,
    });
    
    if (cached.length > 0) {
      // Update access counts asynchronously (fire and forget)
      prisma.youTubeVideo.updateMany({
        where: { videoId: { in: cached.map(v => v.videoId) } },
        data: { 
          accessCount: { increment: 1 },
          lastAccessed: now 
        },
      }).catch(() => {});
      
      return cached;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching cached videos:', error);
    return null;
  }
}

// 🆕 FIXED: Batch save videos - using findFirst + upsert pattern for MongoDB
export async function batchSaveVideosOptimized(
  videos: any[], 
  categoryOrQuery: string,
  type: 'category' | 'search'
) {
  if (!videos || videos.length === 0) {
    console.log('⚠️ No videos to save');
    return false;
  }

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  let successCount = 0;
  let failCount = 0;
  
  // Process videos one by one
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    try {
      // First check if video exists by videoId
      const existingVideo = await prisma.youTubeVideo.findFirst({
        where: { videoId: video.videoId },
      });
      
      if (existingVideo) {
        // Update existing video
        await prisma.youTubeVideo.update({
          where: { id: existingVideo.id },
          data: {
            title: video.title,
            thumbnail: video.thumbnail,
            channelTitle: video.channelTitle,
            duration: video.duration,
            views: video.views,
            category: type === 'category' ? categoryOrQuery : existingVideo.category,
            searchQuery: type === 'search' ? categoryOrQuery : existingVideo.searchQuery,
            expiresAt,
            lastAccessed: new Date(),
            accessCount: { increment: 1 },
          },
        });
      } else {
        // Create new video
        await prisma.youTubeVideo.create({
          data: {
            videoId: video.videoId,
            title: video.title,
            thumbnail: video.thumbnail,
            channelTitle: video.channelTitle,
            duration: video.duration,
            views: video.views,
            category: type === 'category' ? categoryOrQuery : null,
            searchQuery: type === 'search' ? categoryOrQuery : null,
            cachedAt: new Date(),
            expiresAt,
            lastAccessed: new Date(),
            accessCount: 1,
          },
        });
      }
      successCount++;
    } catch (error) {
      failCount++;
      if (failCount <= 5) {
        console.error(`Failed to save video ${video.videoId}:`, error);
      }
    }
    
    // Small delay between operations to prevent connection overload
    if (i % 5 === 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  console.log(`✅ Batch save complete: ${successCount} saved, ${failCount} failed`);
  return successCount > 0;
}

// 🆕 Helper: Get or create user preferences
export async function getUserPreferences(userId: string) {
  try {
    let prefs = await prisma.userPreference.findUnique({
      where: { userId },
    });
    
    if (!prefs) {
      prefs = await prisma.userPreference.create({
        data: {
          userId,
          preferredCategories: ['all', 'trending', 'afrobeat'],
          muted: false,
          volume: 70,
          autoplayNext: true,
          lastActiveCategory: 'all',
        },
      });
    }
    
    return prefs;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
}

// 🆕 Helper: Update watch progress
export async function updateWatchProgress(userId: string, videoId: string, position: number) {
  try {
    const progress = (position / 100) * 100;
    
    return await prisma.watchProgress.upsert({
      where: { userId_videoId: { userId, videoId } },
      update: { 
        lastPosition: position,
        progress,
        updatedAt: new Date(),
      },
      create: {
        userId,
        videoId,
        lastPosition: position,
        progress,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating watch progress:', error);
    return null;
  }
}

// 🆕 Helper: Get watch progress
export async function getWatchProgress(userId: string, videoId: string) {
  try {
    const progress = await prisma.watchProgress.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });
    return progress?.lastPosition || 0;
  } catch (error) {
    console.error('Error getting watch progress:', error);
    return 0;
  }
}

// 🆕 FIXED: Record batch watch history
export async function batchRecordWatchHistory(
  userId: string, 
  videoIds: string[]
) {
  if (!videoIds || videoIds.length === 0) return false;
  
  const now = new Date();
  let successCount = 0;
  
  for (const videoId of videoIds) {
    try {
      await prisma.userWatchHistory.upsert({
        where: { userId_videoId: { userId, videoId } },
        update: { watchedAt: now },
        create: { userId, videoId, watchedAt: now },
      });
      successCount++;
    } catch (error) {
      console.error(`Failed to record watch for ${videoId}:`, error);
    }
  }
  
  console.log(`✅ Batch watch recorded: ${successCount}/${videoIds.length}`);
  return successCount > 0;
}

// 🆕 Helper: Cache search results
export async function cacheSearchResults(query: string, results: any[]) {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    return await prisma.searchCache.upsert({
      where: { query: query.toLowerCase() },
      update: {
        results,
        resultCount: results.length,
        expiresAt,
      },
      create: {
        query: query.toLowerCase(),
        results,
        resultCount: results.length,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Error caching search results:', error);
    return null;
  }
}

// 🆕 Helper: Get cached search results
export async function getCachedSearch(query: string) {
  try {
    const cached = await prisma.searchCache.findUnique({
      where: { query: query.toLowerCase() },
    });
    
    if (cached && cached.expiresAt > new Date()) {
      return cached.results as any[];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached search:', error);
    return null;
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;