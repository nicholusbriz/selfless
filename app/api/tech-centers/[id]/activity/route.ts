// app/api/tech-centers/[id]/activity/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const activities = await prisma.activityLog.findMany({
      where: { 
        techCenterId: id,
        action: {
          in: ['course_submission', 'cleaning_registration', 'cleaning_day_change', 'cleaning_week_created', 'cleaning_day_created']
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching tech center activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}