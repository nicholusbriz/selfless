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

    // Check if user is admin or super_admin
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    // Get the admin user with their tech center
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { techCenter: true }
    });

    if (!adminUser || !adminUser.techCenter) {
      return NextResponse.json(
        { error: 'No tech center assigned to this admin' },
        { status: 404 }
      );
    }

    const techCenterId = adminUser.techCenter.id;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
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

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get status counts for all users in tech center
    const baseWhere = {
      techCenterId: techCenterId,
    };

    // Get all users with their courses and tuition info
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        status: true,
        isActive: true,
        tuitionAmount: true,
        profileImageUrl: true,
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
      techCenter: adminUser.techCenter
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}