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

    const contact = await prisma.user.findFirst({
      where: {
        role: { is: { name: 'dev' } },
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'asc' },
      ],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        techCenter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'No active support account is configured' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      contact,
    });
  } catch (error) {
    console.error('Error fetching support contact:', error);
    return NextResponse.json(
      { error: 'Failed to load the support contact' },
      { status: 500 }
    );
  }
}
