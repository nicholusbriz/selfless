import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const skip = (page - 1) * limit;

    // Build where clause - only users in this tech center
    const where: any = {
      techCenterId: techCenterId,
    };

    // Search across multiple fields
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
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
        submittedCourses: {
          select: {
            id: true,
            name: true,
            code: true,
            credits: true,
            courseUnit: true,
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
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    // Calculate stats
    const totalStudents = await prisma.user.count({ where: baseWhere });
    const withTuition = await prisma.user.count({ 
      where: { ...baseWhere, tuitionAmount: { gt: 0 } } 
    });
    
    const totalTuitionSum = await prisma.user.aggregate({
      where: baseWhere,
      _sum: {
        tuitionAmount: true,
      },
    });

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
      users,
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
        totalTuition: totalTuitionSum._sum.tuitionAmount || 0,
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