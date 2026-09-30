// app/api/students/route.ts
/**
 * STUDENTS LIST API ROUTE
 * 
 * Fetches all users grouped by tech center.
 * Requires authentication.
 * 
 * Endpoint: GET /api/students
 * Response: { studentsByTechCenter: { [techCenterName]: User[] }, techCenters: TechCenter[] }
 */

import {  NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

// Define types for better type safety
interface StudentWithTechCenter {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  role: { name: string } | null;
  techCenter: {
    id: string;
    name: string;
    country: {
      name: string;
    } | null;
  } | null;
  generalCourse: string | null;
  takesReligion: boolean | null;
  status: string;
  isActive: boolean;
  createdAt: Date;
  submittedCourses: Array<{
    id: string;
    code: string;
    courseUnit: string;
    credits: number;
    status: string;
  }>;
  isFollowing?: boolean;
  isLiked?: boolean;
}

interface TechCenterWithCountry {
  id: string;
  name: string;
  country: {
    name: string;
  } | null;
}

// Type for the grouped student (without submittedCourses, with studentCourses)
type GroupedStudent = Omit<StudentWithTechCenter, 'submittedCourses'> & {
  studentCourses: StudentWithTechCenter['submittedCourses'];
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  profileViewsCount: number;
  isFollowing?: boolean;
  isLiked?: boolean;
};

export async function GET(request: Request) {
  try {
    // Get authenticated user
    const currentUser = await requireAuth();

    // Fetch all tech centers for filter
    const techCenters: TechCenterWithCountry[] = await prisma.techCenter.findMany({
      select: {
        id: true,
        name: true,
        country: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' }
    });

    // Fetch all users with tech center info and course data
    const studentCandidates = await prisma.user.findMany({
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
        role: {
          select: {
            name: true
          }
        },
        techCenter: {
          select: {
            id: true,
            name: true,
            country: {
              select: {
                name: true,
              },
            },
          },
        },
        generalCourse: true,
        takesReligion: true,
        status: true,
        isActive: true,
        createdAt: true,
        submittedCourses: {
          select: {
            id: true,
            code: true,
            courseUnit: true,
            credits: true,
            status: true
          }
        }
      },
      orderBy: [
        { techCenter: { name: 'asc' } },
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });

    const students = studentCandidates.filter(
      (student) =>
        student.role?.name !== 'dev' &&
        (student.techCenterId !== null ||
          (student.role?.name === 'super_admin' &&
            student.previousTechCenterId !== null &&
            techCenters.some((center) => center.id === student.previousTechCenterId))),
    );

    // Fetch current user's follows and likes in a single query
    const [userFollows, userLikes, allFollows, allLikes, profileViews] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: currentUser.id },
        select: { followingId: true }
      }),
      prisma.like.findMany({
        where: { likerId: currentUser.id },
        select: { likedUserId: true }
      }),
      prisma.follow.findMany({
        select: { followerId: true, followingId: true }
      }),
      prisma.like.findMany({
        select: { likerId: true, likedUserId: true }
      }),
      prisma.profileView.findMany({
        where: { profileUserId: { in: students.map((student) => student.id) } },
        select: { profileUserId: true }
      })
    ]);

    // Create sets for quick lookup
    const followingIds = new Set(userFollows.map(f => f.followingId));
    const likedUserIds = new Set(userLikes.map(l => l.likedUserId));

    // Calculate dynamic counts for all users
    const followerCounts = new Map<string, number>();
    const followingCounts = new Map<string, number>();
    const likeCounts = new Map<string, number>();
    const profileViewCounts = new Map<string, number>();

    allFollows.forEach(follow => {
      followerCounts.set(follow.followingId, (followerCounts.get(follow.followingId) || 0) + 1);
      followingCounts.set(follow.followerId, (followingCounts.get(follow.followerId) || 0) + 1);
    });

    allLikes.forEach(like => {
      likeCounts.set(like.likedUserId, (likeCounts.get(like.likedUserId) || 0) + 1);
    });

    profileViews.forEach(view => {
      profileViewCounts.set(
        view.profileUserId,
        (profileViewCounts.get(view.profileUserId) || 0) + 1,
      );
    });

    // Group students by tech center
    const studentsByTechCenter: Record<string, GroupedStudent[]> = {};
    
    students.forEach((student) => {
      const previousTechCenter =
        student.role?.name === 'super_admin' && student.previousTechCenterId
          ? techCenters.find((center) => center.id === student.previousTechCenterId) ?? null
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
        followersCount: followerCounts.get(student.id) || 0,
        followingCount: followingCounts.get(student.id) || 0,
        likesReceivedCount: likeCounts.get(student.id) || 0,
        profileViewsCount: profileViewCounts.get(student.id) || 0,
        studentCourses: student.submittedCourses,
        isFollowing: followingIds.has(student.id),
        isLiked: likedUserIds.has(student.id)
      });
    });

    return NextResponse.json({
      studentsByTechCenter,
      techCenters,
      totalStudents: students.length,
    });
  } catch (error: unknown) {
    console.error('Students list API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}