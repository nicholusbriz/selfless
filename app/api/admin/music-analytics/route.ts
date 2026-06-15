import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/music-analytics - Get music player analytics (admin only)
export async function GET(request: NextRequest) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check for admin role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d'; // 7d, 30d, 90d, all
    const limit = parseInt(searchParams.get('limit') || '100');

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Get total sessions count
    const totalSessions = await prisma.musicPlayerSession.count({
      where: {
        startedAt: { gte: startDate }
      }
    });

    // Get total play events count
    const totalPlayEvents = await prisma.musicPlayEvent.count({
      where: {
        playedAt: { gte: startDate }
      }
    });

    // Get unique users who opened music player
    const uniqueUsers = await prisma.musicPlayerSession.groupBy({
      by: ['anonymousId'],
      where: {
        startedAt: { gte: startDate }
      }
    });

    // Get most played videos
    const mostPlayedVideos = await prisma.musicPlayEvent.groupBy({
      by: ['videoId', 'videoTitle', 'channelTitle'],
      where: {
        playedAt: { gte: startDate }
      },
      _count: {
        videoId: true
      },
      orderBy: {
        _count: {
          videoId: 'desc'
        }
      },
      take: limit
    });

    // Get sessions by location
    const sessionsByLocation = await prisma.musicPlayerSession.groupBy({
      by: ['location'],
      where: {
        startedAt: { gte: startDate },
        location: { not: null }
      },
      _count: {
        location: true
      },
      orderBy: {
        _count: {
          location: 'desc'
        }
      },
      take: 20
    });

    // Get sessions over time (daily)
    const sessionsOverTime = await prisma.musicPlayerSession.groupBy({
      by: ['startedAt'],
      where: {
        startedAt: { gte: startDate }
      },
      _count: {
        startedAt: true
      },
      orderBy: {
        startedAt: 'asc'
      }
    });

    // Get recent sessions with user info
    const recentSessions = await prisma.musicPlayerSession.findMany({
      where: {
        startedAt: { gte: startDate }
      },
      include: {
        playEvents: {
          take: 5,
          orderBy: {
            playedAt: 'desc'
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: 20
    });

    // Get average session duration
    const avgSessionDuration = await prisma.musicPlayerSession.aggregate({
      where: {
        startedAt: { gte: startDate },
        duration: { not: null }
      },
      _avg: {
        duration: true
      }
    });

    // Format the response
    const analytics = {
      summary: {
        totalSessions,
        totalPlayEvents,
        uniqueUsers: uniqueUsers.length,
        avgSessionDuration: Math.round(avgSessionDuration._avg.duration || 0),
        timeframe
      },
      mostPlayedVideos: mostPlayedVideos.map((item: any) => ({
        videoId: item.videoId,
        videoTitle: item.videoTitle,
        channelTitle: item.channelTitle,
        playCount: item._count.videoId
      })),
      sessionsByLocation: sessionsByLocation.map((item: any) => ({
        location: item.location,
        count: item._count.location
      })),
      sessionsOverTime: sessionsOverTime.map((item: any) => ({
        date: item.startedAt,
        count: item._count.startedAt
      })),
      recentSessions: recentSessions.map((session: any) => ({
        id: session.id,
        sessionId: session.sessionId,
        anonymousId: session.anonymousId,
        location: session.location,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        duration: session.duration,
        playEventsCount: session.playEvents.length
      }))
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching music analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
