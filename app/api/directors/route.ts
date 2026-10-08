import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch all superadmin users (directors)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') || 'super_admin';

    const users = await prisma.user.findMany({
      where: {
        role: {
          name: role,
        },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      directors: users,
    });
  } catch (error) {
    console.error('Error fetching directors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch directors' },
      { status: 500 }
    );
  }
}
