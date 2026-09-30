// app/api/students/route.ts
/**
 * STUDENTS LIST API ROUTE
 *
 * Fetches users grouped by tech center, with counters read directly
 * from the User model (no JS aggregation, no N+1 relations).
 *
 * Optimizations:
 *   - Uses User.followersCount / followingCount / likesReceivedCount
 *     counters instead of scanning the whole Follow / Like collections
 *   - Uses a single groupBy for profile views (not N+1)
 *   - Uses `select` on every relation
 *   - Hard cap on the number of users returned
 *
 * GET /api/students
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

// Hard cap so the endpoint can never return an unbounded payload.
const MAX_STUDENTS = 1000;

interface TechCenterWithCountry {
  id: string;
  name: string;
  country: { name: string } | null;
}

interface GroupedStudent {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  role: { name: string } | null;
  techCenter: {
    id: string;
    name: string;
    country: { name: string } | null;
  } | null;
  generalCourse: string | null;
  takesReligion: boolean | null;
  status: string;
  isActive: boolean;
  createdAt: Date;
  studentCourses: Array<{
    id: string;
    code: string;
    courseUnit: string;
    credits: number;
    status: string;
  }>;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  profileViewsCount: number;
  isFollowing: boolean;
  isLiked: boolean;
}

export async function GET(_request: Request) {
  try {
    const currentUser = await requireAuth();

    // -------- 1. Fetch tech centers + candidate users in parallel --------
    const [techCenters, studentCandidates] = await Promise.all([
      prisma.techCenter.findMany({
        select: {
          id: true,
          name: true,
          country: { select: { name: true } },
        },
        orderBy: { name: 'asc' },
      }),

      prisma.user.findMany({
        where: {
          OR: [
            { techCenterId: { not: null } },
            { previousTechCenterId: { not: null } },
          ],
        },
        select: {
          id: true,
          techCenterId: true,
          previousTechCenterId: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
          role: { select: { name: true } },
          techCenter: {
            select: {
              id: true,
              name: true,
              country: { select: { name: true } },
            },
          },
          generalCourse: true,
          takesReligion: true,
          status: true,
          isActive: true,
          createdAt: true,
          // ✅ Read counters directly from the User row.
          //    These are maintained by the follow/like endpoints.
          followersCount: true,
          followingCount: true,
          likesReceivedCount: true,
          // Course units — this is a bounded array per user, safe to include.
          //    Each user typically has 3-8 courses.
          submittedCourses: {
            select: {
              id: true,
              code: true,
              courseUnit: true,
              credits: true,
              status: true,
            },
          },
        },
        orderBy: [
          { techCenter: { name: 'asc' } },
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
        take: MAX_STUDENTS,
      }),
    ]);

    // -------- 2. Apply the same filter logic as before --------
    const students = studentCandidates.filter(
      (student) =>
        student.role?.name !== 'dev' &&
        (student.techCenterId !== null ||
          (student.role?.name === 'super_admin' &&
            student.previousTechCenterId !== null &&
            techCenters.some(
              (center) => center.id === student.previousTechCenterId,
            ))),
    );

    const studentIds = students.map((s) => s.id);

    // -------- 3. Only fetch the calling user's own follow/like state --------
    // These two queries are naturally small (bounded by how many people
    // this one user follows / likes).
    const [myFollows, myLikes, viewGroups] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: currentUser.id },
        select: { followingId: true },
      }),
      prisma.like.findMany({
        where: { likerId: currentUser.id },
        select: { likedUserId: true },
      }),
      // Profile view counts — DB-side groupBy, one row per profile
      studentIds.length > 0
        ? prisma.profileView.groupBy({
            by: ['profileUserId'],
            where: { profileUserId: { in: studentIds } },
            _count: { _all: true },
          })
        : Promise.resolve([]),
    ]);

    const followingIds = new Set(myFollows.map((f) => f.followingId));
    const likedUserIds = new Set(myLikes.map((l) => l.likedUserId));

    const profileViewCounts = new Map<string, number>();
    for (const row of viewGroups) {
      profileViewCounts.set(row.profileUserId, row._count._all);
    }

    // -------- 4. Group by tech center --------
    const studentsByTechCenter: Record<string, GroupedStudent[]> = {};

    for (const student of students) {
      const previousTechCenter =
        student.role?.name === 'super_admin' && student.previousTechCenterId
          ? techCenters.find(
              (center) => center.id === student.previousTechCenterId,
            ) ?? null
          : null;

      const studentTechCenter = student.techCenter ?? previousTechCenter;
      const techCenterName = studentTechCenter?.name || 'No Tech Center';

      if (!studentsByTechCenter[techCenterName]) {
        studentsByTechCenter[techCenterName] = [];
      }

      studentsByTechCenter[techCenterName].push({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        profileImageUrl: student.profileImageUrl,
        role: student.role,
        techCenter: studentTechCenter,
        generalCourse: student.generalCourse,
        takesReligion: student.takesReligion,
        status: student.status,
        isActive: student.isActive,
        createdAt: student.createdAt,
        // ✅ Use the counters on User directly
        followersCount: student.followersCount,
        followingCount: student.followingCount,
        likesReceivedCount: student.likesReceivedCount,
        profileViewsCount: profileViewCounts.get(student.id) ?? 0,
        studentCourses: student.submittedCourses,
        isFollowing: followingIds.has(student.id),
        isLiked: likedUserIds.has(student.id),
      });
    }

    return NextResponse.json(
      {
        studentsByTechCenter,
        techCenters,
        totalStudents: students.length,
      },
      {
        headers: {
          // 30s cache — students list doesn't need to be real-time
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      },
    );
  } catch (error: unknown) {
    console.error('Students list API error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 },
    );
  }
}