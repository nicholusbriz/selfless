import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch all users with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is super admin or dev
    if (!session?.user?.id || (session.user.role !== 'super_admin' && session.user.role !== 'dev')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const techCenterId = searchParams.get('techCenterId') || '';
    const country = searchParams.get('country') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Search across multiple fields
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by tech center
    if (techCenterId) {
      where.techCenterId = techCenterId;
    }

    // Filter by country
    if (country) {
      where.country = country;
    }

    // Filter by role
    if (role) {
      where.role = { name: role };
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Fetch users with relations
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
            country: {
              select: {
                id: true,
                name: true,
                code: true,
              }
            }
          }
        },
        _count: {
          select: {
            submittedCourses: true,
            activityLogs: true,
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    // Get filter options
    const techCenters = await prisma.techCenter.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' }
    });

    const countries = await prisma.country.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' }
    });

    const roles = await prisma.role.findMany({
      where: { name: { not: 'dev' } },
      select: { id: true, name: true, displayName: true },
      orderBy: { name: 'asc' }
    });

    const statuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        techCenters,
        countries,
        roles,
        statuses,
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}