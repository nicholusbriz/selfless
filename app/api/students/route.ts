// app/api/students/route.ts
/**
 * STUDENTS DIRECTORY API ROUTE
 *
 * Returns a paginated student directory grouped by tech center, WITH social counts
 * (followersCount, followingCount, likesReceivedCount, profileViewsCount)
 * AND the viewer's relationship (isFollowing, isLiked).
 *
 * Uses the centralized getStatsForUsers function to compute LIVE stats
 * from Follow/Like/ProfileView tables, ensuring consistency with the
 * Connections page.
 *
 * Pages are requested independently for each directory category.
 */

import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import { getStatsForUsers, EMPTY_STATS } from '@/lib/social/attachStats';

export const dynamic = 'force-dynamic';
export const revalidate = 120; // Cache for 2 minutes

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
  isVerified: boolean;
  verificationStatus: string;
  createdAt: Date;
  studentCourses: Array<{
    id: string;
    code: string;
    courseUnit: string;
    credits: number;
    status: string;
  }>;
  profileViewsCount: number;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  isFollowing: boolean;
  isLiked: boolean;
}

function popularityComparator(a: GroupedStudent, b: GroupedStudent): number {
  const aHasImage = Boolean(a.profileImageUrl?.trim());
  const bHasImage = Boolean(b.profileImageUrl?.trim());
  if (aHasImage !== bHasImage) return bHasImage ? 1 : -1;

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

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    const searchParams = new URL(request.url).searchParams;
    const search = searchParams.get('search')?.trim().slice(0, 100) || '';
    const techCenterId = searchParams.get('techCenterId')?.trim() || '';
    const category = searchParams.get('category') || 'all';
    const requestedLimit = Number(searchParams.get('limit') ?? '20');
    const requestedOffset = Number(searchParams.get('offset') ?? '0');
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 50)
      : 20;
    const offset = Number.isSafeInteger(requestedOffset) && requestedOffset >= 0
      ? Math.min(requestedOffset, 100_000)
      : 0;
    const sortBy = searchParams.get('sortBy') || 'trending';
    const metadataOnly = searchParams.get('metadata') === 'true';

    if (category !== 'all' && category !== 'trending') {
      return NextResponse.json({ error: 'Invalid student category' }, { status: 400 });
    }

    if (metadataOnly) {
      const techCenters = await prisma.techCenter.findMany({
        select: {
          id: true,
          name: true,
          country: { select: { name: true } },
        },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json({ techCenters });
    }

    const filters: Prisma.UserWhereInput[] = [
      {
        OR: [
          { techCenterId: { not: null } },
          {
            previousTechCenterId: { not: null },
            role: { is: { name: 'super_admin' } },
          },
        ],
      },
      { isVerified: true, verificationStatus: 'APPROVED' },
      {
        OR: [
          { role: { isNot: { name: 'dev' } } },
          { role: null },
        ],
      },
    ];

    if (techCenterId) {
      filters.push({
        OR: [
          { techCenterId },
          {
            previousTechCenterId: techCenterId,
            role: { is: { name: 'super_admin' } },
          },
        ],
      });
    }

    if (search) {
      const nameParts = search.split(/\s+/).filter(Boolean);
      const searchConditions: Prisma.UserWhereInput[] = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { generalCourse: { contains: search, mode: 'insensitive' } },
        {
          techCenter: {
            is: { name: { contains: search, mode: 'insensitive' } },
          },
        },
        {
          submittedCourses: {
            some: {
              OR: [
                { code: { contains: search, mode: 'insensitive' } },
                { courseUnit: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];

      if (nameParts.length > 1) {
        searchConditions.push({
          AND: [
            {
              firstName: {
                contains: nameParts[0],
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: nameParts.slice(1).join(' '),
                mode: 'insensitive',
              },
            },
          ],
        });
      }

      filters.push({
        OR: searchConditions,
      });
    }

    if (category === 'trending') {
      filters.push(
        { profileImageUrl: { not: null } },
        { profileImageUrl: { not: '' } },
        { followersCount: { gte: 5 } },
      );
    }

    const orderBy: Prisma.UserOrderByWithRelationInput[] =
      sortBy === 'newest'
        ? [{ createdAt: 'desc' }, { id: 'asc' }]
        : sortBy === 'active'
          ? [{ isActive: 'desc' }, { lastName: 'asc' }, { firstName: 'asc' }, { id: 'asc' }]
          : sortBy === 'mostFollowed'
            ? [{ profileImageUrl: 'desc' }, { followersCount: 'desc' }, { lastName: 'asc' }, { firstName: 'asc' }, { id: 'asc' }]
            : sortBy === 'mostLiked'
              ? [{ profileImageUrl: 'desc' }, { likesReceivedCount: 'desc' }, { lastName: 'asc' }, { firstName: 'asc' }, { id: 'asc' }]
              : sortBy === 'name'
                ? [{ profileImageUrl: 'desc' }, { firstName: 'asc' }, { lastName: 'asc' }, { id: 'asc' }]
                : [{ profileImageUrl: 'desc' }, { followersCount: 'desc' }, { likesReceivedCount: 'desc' }, { lastName: 'asc' }, { firstName: 'asc' }, { id: 'asc' }];

    // -------- Fetch metadata and a single student page --------
    const studentCandidates = await prisma.user.findMany({
        where: { AND: filters },
        skip: offset,
        take: limit + 1,
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
          isVerified: true,
          verificationStatus: true,
          createdAt: true,
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
        orderBy,
      });

    const hasMore = studentCandidates.length > limit;
    const students = studentCandidates.slice(0, limit);
    const studentIds = students.map((student) => student.id);
    const previousTechCenterIds = Array.from(
      new Set(
        students
          .filter((student) => student.role?.name === 'super_admin')
          .map((student) => student.previousTechCenterId)
            .filter((id): id is string => typeof id === 'string' && id.length > 0),
      ),
    );

    // -------- Get live stats and previous centers for this page --------
    const [statsMap, previousTechCenters] = await Promise.all([
      getStatsForUsers(currentUser.id, studentIds),
      previousTechCenterIds.length > 0
        ? prisma.techCenter.findMany({
            where: { id: { in: previousTechCenterIds } },
            select: {
              id: true,
              name: true,
              country: { select: { name: true } },
            },
          })
        : Promise.resolve([]),
    ]);
    const previousTechCentersById = new Map(
      previousTechCenters.map((center) => [center.id, center]),
    );

    // -------- Build flat list with live stats --------
    const rankedStudents: GroupedStudent[] = students
      .map((student) => {
        const previousTechCenter =
          student.role?.name === 'super_admin' && student.previousTechCenterId
            ? previousTechCentersById.get(student.previousTechCenterId) ?? null
            : null;

        const studentTechCenter = student.techCenter ?? previousTechCenter;
        const stats = statsMap.get(student.id) ?? EMPTY_STATS;

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
          isVerified: student.isVerified,
          verificationStatus: student.verificationStatus,
          createdAt: student.createdAt,
          studentCourses: student.submittedCourses,
          profileViewsCount: stats.profileViewsCount,
          followersCount: stats.followersCount,
          followingCount: stats.followingCount,
          likesReceivedCount: stats.likesReceivedCount,
          isFollowing: stats.isFollowing,
          isLiked: stats.isLiked,
        };
      })
      .sort(popularityComparator);

    // -------- 5. Group the ranked directory by tech center --------
    const studentsByTechCenter: Record<string, GroupedStudent[]> = {};

    for (const student of rankedStudents) {
      const techCenterName = student.techCenter?.name || 'No Tech Center';

      if (!studentsByTechCenter[techCenterName]) {
        studentsByTechCenter[techCenterName] = [];
      }

      studentsByTechCenter[techCenterName].push(student);
    }

    return NextResponse.json(
      {
        students: rankedStudents,
        studentsByTechCenter,
        hasMore,
        nextOffset: offset + students.length,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
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