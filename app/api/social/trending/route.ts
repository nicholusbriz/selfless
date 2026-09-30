// app/api/social/trending/route.ts
/**
 * TRENDING STUDENTS API ROUTE
 *
 * Fetches ALL users with their live follower/like counters,
 * sorts them by score = (followersCount × 2) + likesReceivedCount,
 * and returns the top N.
 *
 * No filters. No exclusions. Every user from every tech center
 * is a candidate.
 *
 * GET /api/social/trending?limit=10
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';

const FOLLOWERS_WEIGHT = 2;
const LIKES_WEIGHT = 1;

interface TrendingStudent {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  techCenter: { id: string; name: string } | null;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  score: number;
  isFollowing: boolean;
  isLiked: boolean;
}

interface CandidateRow {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  techCenter: { id: string; name: string } | null;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
}

interface ScoredRow extends CandidateRow {
  score: number;
}

export async function GET(request: Request) {
  try {
    let currentUserId: string | null = null;
    try {
      const currentUser = await requireAuth();
      currentUserId = currentUser.id;
    } catch {
      currentUserId = null;
    }

    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get('limit') ?? '10');
    const limit = Math.min(
      Math.max(Number.isFinite(limitParam) ? limitParam : 10, 1),
      100,
    );

    // -------- Fetch ALL users, no filters --------
    const candidates: CandidateRow[] = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        techCenter: {
          select: { id: true, name: true },
        },
        followersCount: true,
        followingCount: true,
        likesReceivedCount: true,
      },
    });

    if (candidates.length === 0) {
      return NextResponse.json(
        {
          students: [],
          generatedAt: new Date().toISOString(),
          meta: {
            weights: { followers: FOLLOWERS_WEIGHT, likes: LIKES_WEIGHT },
            limit,
          },
        },
        {
          headers: {
            'Cache-Control': 'private, max-age=0, must-revalidate',
          },
        },
      );
    }

    // -------- Score and rank --------
    const scored: ScoredRow[] = candidates
      .map((u: CandidateRow): ScoredRow => ({
        ...u,
        score:
          u.followersCount * FOLLOWERS_WEIGHT +
          u.likesReceivedCount * LIKES_WEIGHT,
      }))
      .sort((a: ScoredRow, b: ScoredRow): number => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.followersCount !== a.followersCount)
          return b.followersCount - a.followersCount;
        if (b.likesReceivedCount !== a.likesReceivedCount)
          return b.likesReceivedCount - a.likesReceivedCount;
        return `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        );
      })
      .slice(0, limit);

    const topIds = scored.map((u: ScoredRow) => u.id);

    // -------- Overlay live follow/like state for current user --------
    let followingSet = new Set<string>();
    let likingSet = new Set<string>();

    if (currentUserId && topIds.length > 0) {
      const [follows, likes] = await Promise.all([
        prisma.follow.findMany({
          where: { followerId: currentUserId, followingId: { in: topIds } },
          select: { followingId: true },
        }),
        prisma.like.findMany({
          where: { likerId: currentUserId, likedUserId: { in: topIds } },
          select: { likedUserId: true },
        }),
      ]);
      followingSet = new Set(follows.map((f) => f.followingId));
      likingSet = new Set(likes.map((l) => l.likedUserId));
    }

    const students: TrendingStudent[] = scored.map(
      (u: ScoredRow): TrendingStudent => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        profileImageUrl: u.profileImageUrl,
        techCenter: u.techCenter,
        followersCount: u.followersCount,
        followingCount: u.followingCount,
        likesReceivedCount: u.likesReceivedCount,
        score: u.score,
        isFollowing: followingSet.has(u.id),
        isLiked: likingSet.has(u.id),
      }),
    );

    return NextResponse.json(
      {
        students,
        generatedAt: new Date().toISOString(),
        meta: {
          weights: { followers: FOLLOWERS_WEIGHT, likes: LIKES_WEIGHT },
          limit,
        },
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=0, must-revalidate',
        },
      },
    );
  } catch (error: unknown) {
    console.error('[trending] error', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending students' },
      { status: 500 },
    );
  }
}