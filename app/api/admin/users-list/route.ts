// app/api/admin/users-list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/server';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    if (!user || (user.role?.name !== 'super_admin' && user.role?.name !== 'admin' && user.role?.name !== 'dev')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        status: true,
        role: {
          select: {
            name: true,
          },
        },
        techCenter: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
