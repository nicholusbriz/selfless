// app/api/students/route.ts
/**
 * STUDENTS DIRECTORY API ROUTE
 *
 * Returns users grouped by tech center, WITH social counts
 * (followersCount, followingCount, likesReceivedCount, profileViewsCount)
 * AND the viewer's relationship (isFollowing, isLiked).
 *
 * One endpoint. One response. No client-side merging.
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

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
  profileViewsCount: number;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  isFollowing: boolean;
  isLiked: boolean;
}

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

    // -------- 1. Fetch tech centers + candidate users --------
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
          // Social counters — read directly from User row
          followersCount: true,
          followingCount: true,
          likesReceivedCount: true,
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
          { followersCount: 'desc' },
          { likesReceivedCount: 'desc' },
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
        take: MAX_STUDENTS,
      }),
    ]);

    // -------- 2. Filter --------
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

    // -------- 3. Viewer state + profile views --------
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

    // -------- 4. Build flat list --------
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
          studentCourses: student.submittedCourses,
          profileViewsCount: profileViewCounts.get(student.id) ?? 0,
          followersCount: student.followersCount,
          followingCount: student.followingCount,
          likesReceivedCount: student.likesReceivedCount,
          isFollowing: followingIds.has(student.id),
          isLiked: likedUserIds.has(student.id),
        };
      })
      .sort(popularityComparator);

    // -------- 5. Group by tech center --------
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

    // -------- 6. Order tech centers --------
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
        totalStudents: rankedStudents.length,
      },
      {
        headers: {
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