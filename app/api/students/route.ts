// app/api/students/route.ts
/**
 * STUDENTS LIST API ROUTE
 *
 * Fetches users grouped by tech center, with counters read directly
 * from the User model (no JS aggregation, no N+1 relations).
 *
 * Ranking:
 *   - Users are sorted by followersCount DESC, then likesReceivedCount DESC,
 *     then lastName/firstName ASC — both globally and inside each tech center.
 *   - Tech centers are ordered by total followers DESC so the most popular
 *     center floats to the top of the grouped response.
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

/**
 * Comparator used both globally and inside each tech center bucket.
 * Bigger followersCount first; tie-break by likesReceivedCount; then
 * alphabetically by lastName / firstName so the order is stable.
 */
function popularityComparator(a: GroupedStudent, b: GroupedStudent): number {
  if (b.followersCount !== a.followersCount) {
    return b.followersCount - a.followersCount;
  }
  if (b.likesReceivedCount !== a.likesReceivedCount) {
    return b.likesReceivedCount - a.likesReceivedCount;
  }
  const last = a.lastName.localeCompare(b.lastName);
  if (last !== 0) return last;
  return a.firstName.localeCompare(b.firstName);
}

export async function GET(_request: Request) {
  try {
    const currentUser = await requireAuth();

    // -------- 1. Fetch tech centers + candidate users in parallel --------
    // Note: we no longer rely on Prisma's orderBy for final ranking — the
    // grouping + super_admin previousTechCenter resolution happens in JS,
    // so the final sort is applied after the buckets are built.
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
        // Pre-sort by popularity at the DB level so the MAX_STUDENTS cap
        // keeps the most-followed users if the table ever exceeds the cap.
        orderBy: [
          { followersCount: 'desc' },
          { likesReceivedCount: 'desc' },
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
    const [myFollows, myLikes, viewGroups] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: currentUser.id },
        select: { followingId: true },
      }),
      prisma.like.findMany({
        where: { likerId: currentUser.id },
        select: { likedUserId: true },
      }),
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

    // -------- 4. Build a FLAT ranked list first --------
    // This is the authoritative ordering: biggest followers → biggest likes
    // → alphabetical. Used as the source of truth for the global ordering
    // AND as the insertion order when we bucket into tech centers.
    const rankedStudents: GroupedStudent[] = students
      .map((student) => {
        const previousTechCenter =
          student.role?.name === 'super_admin' && student.previousTechCenterId
            ? techCenters.find(
                (center) => center.id === student.previousTechCenterId,
              ) ?? null
            : null;

        const studentTechCenter = student.techCenter ?? previousTechCenter;

        return {
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
          followersCount: student.followersCount,
          followingCount: student.followingCount,
          likesReceivedCount: student.likesReceivedCount,
          profileViewsCount: profileViewCounts.get(student.id) ?? 0,
          studentCourses: student.submittedCourses,
          isFollowing: followingIds.has(student.id),
          isLiked: likedUserIds.has(student.id),
        };
      })
      // 🔥 GLOBAL RANKING: most-followed users first, across all tech centers.
      .sort(popularityComparator);

    // -------- 5. Group by tech center (preserving the ranked order) --------
    // Because we iterate the already-sorted `rankedStudents`, each tech
    // center bucket inherits the same popularity-first ordering.
    const studentsByTechCenter: Record<string, GroupedStudent[]> = {};
    const techCenterTotals: Record<string, number> = {};

    for (const student of rankedStudents) {
      const techCenterName = student.techCenter?.name || 'No Tech Center';

      if (!studentsByTechCenter[techCenterName]) {
        studentsByTechCenter[techCenterName] = [];
        techCenterTotals[techCenterName] = 0;
      }

      studentsByTechCenter[techCenterName].push(student);
      techCenterTotals[techCenterName] += student.followersCount;
    }

    // -------- 6. Order tech centers by total popularity --------
    // So the tech center with the most-followed users appears first.
    // (Swap the comparator for `a.localeCompare(b)` if you'd rather keep
    // them strictly alphabetical.)
    const sortedTechCenterNames = Object.keys(studentsByTechCenter).sort(
      (a, b) => {
        const diff = techCenterTotals[b] - techCenterTotals[a];
        if (diff !== 0) return diff;
        return a.localeCompare(b);
      },
    );

    const orderedStudentsByTechCenter: Record<string, GroupedStudent[]> = {};
    for (const name of sortedTechCenterNames) {
      orderedStudentsByTechCenter[name] = studentsByTechCenter[name];
    }

    // -------- 7. Also expose a flat global leaderboard slice --------
    // Convenient for a "Top students" section without re-sorting client-side.
    const topStudents = rankedStudents.slice(0, 50);

    // Keep the techCenters response sorted the same way as the grouping,
    // so a client that renders the filter dropdown in-order matches the
    // bucket order.
    const orderedTechCenters: TechCenterWithCountry[] = [...techCenters].sort(
      (a, b) => {
        const diff =
          (techCenterTotals[b.name] ?? 0) - (techCenterTotals[a.name] ?? 0);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name);
      },
    );

    return NextResponse.json(
      {
        studentsByTechCenter: orderedStudentsByTechCenter,
        techCenters: orderedTechCenters,
        topStudents, // 🔥 flat, popularity-first, across all tech centers
        totalStudents: rankedStudents.length,
      },
      {
        headers: {
          // 30s cache — students list doesn't need to be real-time.
          // Bump this to 300 if the client refetches on every nav.
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