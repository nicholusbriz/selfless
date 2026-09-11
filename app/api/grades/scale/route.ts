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

    const scales = await prisma.gradeScale.findMany({
      where: { isActive: true },
      orderBy: { minScore: 'desc' },
      select: {
        id: true,
        gradeLetter: true,
        minScore: true,
        maxScore: true,
        gradePoints: true,
        description: true,
      },
    });

    return NextResponse.json({ scales });
  } catch (error) {
    console.error('GET /api/grades/scale error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grade scale' },
      { status: 500 }
    );
  }
}
