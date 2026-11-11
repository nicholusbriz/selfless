import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { getApiErrorMessage } from '@/lib/api-response';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is super admin or dev
    if (!session?.user?.id || (session.user.role !== 'super_admin' && session.user.role !== 'dev')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    // Fetch trivia game sessions with user data
    const [sessions, total] = await Promise.all([
      prisma.triviaGameSession.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImageUrl: true,
            },
          },
        },
        orderBy: {
          playedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.triviaGameSession.count({ where }),
    ]);

    // Calculate aggregate stats
    const stats = await prisma.triviaGameSession.aggregate({
      _count: {
        id: true,
      },
      _avg: {
        accuracy: true,
        points: true,
      },
      _sum: {
        points: true,
      },
    });

    return NextResponse.json({
      success: true,
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalGames: stats._count.id,
        averageAccuracy: stats._avg.accuracy ? Math.round(stats._avg.accuracy) : 0,
        averagePoints: stats._avg.points ? Math.round(stats._avg.points) : 0,
        totalPointsEarned: stats._sum.points || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching trivia sessions:', error);
    return NextResponse.json(
      {
        success: false,
        error: getApiErrorMessage(error, 'Failed to fetch trivia sessions'),
      },
      { status: 500 }
    );
  }
}
