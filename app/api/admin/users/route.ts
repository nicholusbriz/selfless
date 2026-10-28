import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import type { Prisma } from '@prisma/client';

// GET - Fetch all users with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is super admin or dev
    if (!session?.user?.id || (session.user.role !== 'super_admin' && session.user.role !== 'dev')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const requestedPage = Number(searchParams.get('page') || '1');
    const requestedLimit = Number(searchParams.get('limit') || '50');
    const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 50)
      : 50;
    const search = searchParams.get('search')?.trim() || '';
    const techCenterId = searchParams.get('techCenterId') || '';
    const country = searchParams.get('country') || '';
    const role = searchParams.get('role') || '';
    const requestedStatus = searchParams.get('status');
    const status = (['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const)
      .find((value) => value === requestedStatus);
    const requestedSortBy = searchParams.get('sortBy');
    const sortBy = requestedSortBy === 'firstName' ||
      requestedSortBy === 'lastName' ||
      requestedSortBy === 'email'
      ? requestedSortBy
      : 'createdAt';
    const sortOrder: 'asc' | 'desc' = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    const conditions: Prisma.UserWhereInput[] = [];

    if (session.user.role === 'super_admin') {
      conditions.push({ role: { name: { not: 'dev' } } });
    }

    if (search) {
      const searchConditions: Prisma.UserWhereInput[] = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        {
          techCenter: {
            is: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
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

      conditions.push({ OR: searchConditions });
    }

    if (techCenterId) {
      where.techCenterId = techCenterId;
    }

    if (country) {
      where.country = country;
    }

    if (role) {
      conditions.push({ role: { name: role } });
    }

    if (status) {
      where.status = status;
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = sortBy === 'firstName'
      ? { firstName: sortOrder }
      : sortBy === 'lastName'
        ? { lastName: sortOrder }
        : sortBy === 'email'
          ? { email: sortOrder }
          : { createdAt: sortOrder };

    const [users, groupedStatuses] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          country: true,
          city: true,
          techCenterId: true,
          isActive: true,
          profileImageUrl: true,
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
            },
          },
          status: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
    ]);

    const stats = { active: 0, inactive: 0, suspended: 0 };
    let total = 0;
    for (const group of groupedStatuses) {
      total += group._count._all;
      if (group.status === 'ACTIVE') stats.active = group._count._all;
      if (group.status === 'INACTIVE') stats.inactive = group._count._all;
      if (group.status === 'SUSPENDED') stats.suspended = group._count._all;
    }

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}