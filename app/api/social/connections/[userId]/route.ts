// app/api/social/connections/[userId]/route.ts
/**
 * USER CONNECTIONS API ROUTE
 * 
 * Fetches a user's followers and following lists.
 * Requires authentication.
 * 
 * GET /api/social/connections/[userId]?type=followers - Get user's followers
 * GET /api/social/connections/[userId]?type=following - Get user's following
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

interface ConnectionUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  techCenter: {
    id: string;
    name: string;
  } | null;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  connectedAt: Date;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { userId: targetUserId } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'followers';

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let connections: ConnectionUser[] = [];

    if (type === 'followers') {
      // Get users who follow the target user
      const followers = await prisma.follow.findMany({
        where: { followingId: targetUserId },
        include: {
          follower: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              techCenter: {
                select: {
                  id: true,
                  name: true
                }
              },
              followersCount: true,
              followingCount: true,
              likesReceivedCount: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      connections = followers.map(follow => ({
        id: follow.follower.id,
        firstName: follow.follower.firstName,
        lastName: follow.follower.lastName,
        profileImageUrl: follow.follower.profileImageUrl,
        techCenter: follow.follower.techCenter,
        followersCount: follow.follower.followersCount,
        followingCount: follow.follower.followingCount,
        likesReceivedCount: follow.follower.likesReceivedCount,
        connectedAt: follow.createdAt
      }));
    } else if (type === 'following') {
      // Get users the target user follows
      const following = await prisma.follow.findMany({
        where: { followerId: targetUserId },
        include: {
          following: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              techCenter: {
                select: {
                  id: true,
                  name: true
                }
              },
              followersCount: true,
              followingCount: true,
              likesReceivedCount: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      connections = following.map(follow => ({
        id: follow.following.id,
        firstName: follow.following.firstName,
        lastName: follow.following.lastName,
        profileImageUrl: follow.following.profileImageUrl,
        techCenter: follow.following.techCenter,
        followersCount: follow.following.followersCount,
        followingCount: follow.following.followingCount,
        likesReceivedCount: follow.following.likesReceivedCount,
        connectedAt: follow.createdAt
      }));
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter. Use "followers" or "following"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      connections,
      type,
      count: connections.length
    });
  } catch (error: unknown) {
    console.error('Connections API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}
