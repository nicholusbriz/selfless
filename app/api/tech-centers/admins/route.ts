import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { techCenterId: true },
    });

    if (!user?.techCenterId) {
      return NextResponse.json(
        { error: 'No tech center assigned to this user' },
        { status: 404 },
      );
    }

    const admins = await prisma.user.findMany({
      where: {
        techCenterId: user.techCenterId,
        status: 'ACTIVE',
        role: { name: 'admin' },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      take: 100,
    });

    return NextResponse.json({ admins, total: admins.length });
  } catch (error) {
    console.error('Error fetching tech center admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tech center admins' },
      { status: 500 },
    );
  }
}