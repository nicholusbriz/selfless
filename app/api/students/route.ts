// app/api/students/route.ts
/**
 * STUDENTS DIRECTORY API ROUTE
 *
 * Returns users grouped by tech center, WITH social counts
 * (followersCount, followingCount, likesReceivedCount, profileViewsCount)
 * AND the viewer's relationship (isFollowing, isLiked).
 *
 * Uses the centralized getStatsForUsers function to compute LIVE stats
 * from Follow/Like/ProfileView tables, ensuring consistency with the
 * Connections page.
 *
 * One endpoint. One response. No client-side merging.
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import { getStatsForUsers, EMPTY_STATS } from '@/lib/social/attachStats';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
          AND: [
            {
              OR: [
                { techCenterId: { not: null } },
                { previousTechCenterId: { not: null } },
              ],
            },
            {
              isVerified: true,
              verificationStatus: 'APPROVED',
            },
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
        orderBy: [
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

    // -------- 3. Get live stats using centralized function --------
    const statsMap = await getStatsForUsers(currentUser.id, studentIds);

    // -------- 4. Build flat list with live stats --------
    const rankedStudents: GroupedStudent[] = students
      .map((student) => {
        const previousTechCenter =
          student.role?.name === 'super_admin' && student.previousTechCenterId
            ? techCenters.find(
                (center) => center.id === student.previousTechCenterId,
              ) ?? null
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