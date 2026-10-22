import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const user = await getServerAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role?.name !== 'super_admin' && user.role?.name !== 'dev') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const requestedTechCenterId =
      request.nextUrl.searchParams.get('techCenterId');
    const [techCenters, students] = await Promise.all([
      prisma.techCenter.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.user.findMany({
        where: {
          techCenterId: requestedTechCenterId
            ? requestedTechCenterId
            : { not: null },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          techCenter: {
            select: { id: true, name: true },
          },
          submittedCourses: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              name: true,
              courseUnit: true,
              credits: true,
              grades: {
                select: {
                  id: true,
                  week: true,
                  gradeLetter: true,
                  gradePoints: true,
                  score: true,
                  assignedAt: true,
                  teacher: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
                orderBy: { week: 'asc' },
              },
            },
            orderBy: { name: 'asc' },
          },
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
    ]);

    if (
      requestedTechCenterId &&
      !techCenters.some((center) => center.id === requestedTechCenterId)
    ) {
      return NextResponse.json(
        { error: 'Tech center not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { techCenters, students },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  } catch (error) {
    console.error('Grade monitor data error:', error);
    return NextResponse.json(
      { error: 'Failed to load grade monitoring data' },
      { status: 500 },
    );
  }
}
