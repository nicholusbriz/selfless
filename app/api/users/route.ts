import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import type { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    const where: Prisma.UserWhereInput = {
      id: { not: session.user.id },
      OR: [
        { status: 'ACTIVE' },
        { role: { is: { name: 'dev' } } },
      ],
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        role: {
          select: {
            name: true,
            displayName: true,
          },
        },
        previousTechCenterId: true,
        techCenter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    // Super admins keep their previous tech center — resolve it for display
    const prevIds = Array.from(
      new Set(
        users
          .filter((u) => u.role?.name === 'super_admin' && !u.techCenter && u.previousTechCenterId)
          .map((u) => u.previousTechCenterId as string),
      ),
    );
    const prevCenters = prevIds.length
      ? await prisma.techCenter.findMany({
          where: { id: { in: prevIds } },
          select: { id: true, name: true },
        })
      : [];
    const prevById = new Map(prevCenters.map((c) => [c.id, c]));

    // Map profileImageUrl to image for frontend compatibility
    const usersWithImage = users
      .map((user) => {
        const techCenter =
          user.techCenter ??
          (user.role?.name === 'super_admin' && user.previousTechCenterId
            ? prevById.get(user.previousTechCenterId) ?? null
            : null);
        return {
          ...user,
          techCenter,
          image: user.profileImageUrl,
          roleName: user.role?.name ?? '',
          roleDisplayName: user.role?.displayName ?? '',
        };
      })
      .sort((a, b) => {
        const aIsSupport = a.roleName === 'dev';
        const bIsSupport = b.roleName === 'dev';
        if (aIsSupport !== bIsSupport) return aIsSupport ? -1 : 1;
        return a.firstName.localeCompare(b.firstName);
      });

    return NextResponse.json({ users: usersWithImage });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}