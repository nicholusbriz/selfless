import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import type { Prisma } from '@prisma/client';

// GET - Fetch users in admin's tech center with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin, super_admin, teacher, or student (read-only for teachers and students)
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin' && session.user.role !== 'teacher' && session.user.role !== 'student') {
      return NextResponse.json({ error: 'Access denied. Admin, teacher, or student privileges required.' }, { status: 403 });
    }

    // Get the user with their tech center
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { techCenter: true }
    });

    if (!user || !user.techCenter) {
      return NextResponse.json(
        { error: 'No tech center assigned to this user' },
        { status: 404 }
      );
    }

    const techCenterId = user.techCenter.id;
    const searchParams = request.nextUrl.searchParams;
    const requestedPage = Number(searchParams.get('page') || '1');
    const requestedLimit = Number(searchParams.get('limit') || '20');
    const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 1000)
      : 20;
    const search = searchParams.get('search')?.trim() || '';
    const requestedStatus = searchParams.get('status');
    const status = (['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const)
      .find((value) => value === requestedStatus);
    const role = searchParams.get('role') || '';
    const requestedSortBy = searchParams.get('sortBy');
    const sortBy = requestedSortBy === 'firstName' ||
      requestedSortBy === 'lastName' ||
      requestedSortBy === 'email'
      ? requestedSortBy
      : 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const skip = (page - 1) * limit;

    // Build where clause - only users in this tech center
    const where: Prisma.UserWhereInput = {
      techCenterId: techCenterId,
    };

    // Search across multiple fields
    if (search) {
      const searchConditions: Prisma.UserWhereInput[] = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ];
      const nameParts = search.split(/\s+/);
      if (nameParts.length > 1) {
        searchConditions.push({
          AND: [
            { firstName: { contains: nameParts[0], mode: 'insensitive' } },
            { lastName: { contains: nameParts.slice(1).join(' '), mode: 'insensitive' } },
          ],
        });
      }
      where.OR = searchConditions;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by role
    if (role) {
      where.role = {
        name: role
      };
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get status counts for all users in tech center
    const baseWhere = {
      techCenterId: techCenterId,
    };

    // Get all users with their courses and tuition info
    const users = await prisma.user.findMany({
      where,
      include: {
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
          }
        },
        techCenter: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true,
          }
        },
        submittedCourses: {
          select: {
            id: true,
            name: true,
            code: true,
            credits: true,
            courseUnit: true,
            tuition: true,
            takesReligion: true,
          }
        },
        _count: {
          select: {
            submittedCourses: true,
            assignedStudents: true,
            gradesGiven: true,
          }
        }
      },
      orderBy: sortBy === 'firstName'
        ? { firstName: sortOrder }
        : sortBy === 'lastName'
          ? { lastName: sortOrder }
          : sortBy === 'email'
            ? { email: sortOrder }
            : { createdAt: sortOrder },
      skip,
      take: limit,
    });

    // Add tuitionAmount to each user from their courses (use first course's tuition)
    const usersWithTuition = users.map(user => {
      const tuitionFromCourse = user.submittedCourses.length > 0
        ? user.submittedCourses[0].tuition
        : null;
      return {
        ...user,
        tuitionAmount: tuitionFromCourse
      };
    });

    // Calculate stats - now using student_courses for tuition
    const totalStudents = await prisma.user.count({ where: baseWhere });

    // Get all active student courses to calculate tuition stats
    const allStudentCourses = await prisma.studentCourse.findMany({
      where: {
        student: {
          techCenterId: techCenterId,
        },
        status: 'ACTIVE'
      },
      select: {
        tuition: true,
        studentId: true,
      }
    });

    // Count unique students with tuition (tuition > 0)
    const studentsWithTuition = new Set();
    const studentTuitionMap = new Map(); // Track tuition per student

    allStudentCourses.forEach(course => {
      if (course.tuition && course.tuition > 0) {
        studentsWithTuition.add(course.studentId);
        // Store tuition per student (use first course's tuition per student)
        if (!studentTuitionMap.has(course.studentId)) {
          studentTuitionMap.set(course.studentId, course.tuition);
        }
      }
    });

    const withTuition = studentsWithTuition.size;

    // Sum tuition across all unique students
    const totalTuitionSum = Array.from(studentTuitionMap.values()).reduce((sum, tuition) => sum + tuition, 0);

    // Calculate total credits across all users
    const allUsersWithCourses = await prisma.user.findMany({
      where: baseWhere,
      select: {
        submittedCourses: {
          select: {
            credits: true,
          }
        }
      }
    });

    let totalCreditsAllUsers = 0;
    allUsersWithCourses.forEach(user => {
      user.submittedCourses.forEach(course => {
        totalCreditsAllUsers += course.credits || 0;
      });
    });

    // Get status counts
    const [activeCount, inactiveCount, suspendedCount] = await Promise.all([
      prisma.user.count({ where: { ...baseWhere, status: 'ACTIVE' } }),
      prisma.user.count({ where: { ...baseWhere, status: 'INACTIVE' } }),
      prisma.user.count({ where: { ...baseWhere, status: 'SUSPENDED' } }),
    ]);

    const statuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

    // Get available roles for filtering (excluding dev role)
    const roles = await prisma.role.findMany({
      where: { name: { not: 'dev' } },
      select: {
        id: true,
        name: true,
        displayName: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      users: usersWithTuition,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalStudents,
        withTuition: withTuition,
        withoutTuition: totalStudents - withTuition,
        totalTuition: totalTuitionSum,
        totalCredits: totalCreditsAllUsers,
        active: activeCount,
        inactive: inactiveCount,
        suspended: suspendedCount,
      },
      statuses,
      filters: {
        roles,
        statuses,
      },
      techCenter: user.techCenter
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}