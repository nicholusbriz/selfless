// app/api/tech-centers/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  try {
    const techCenters = await prisma.techCenter.findMany({
      include: {
        country: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        }
      },
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(techCenters);
  } catch (error) {
    console.error('Error fetching tech centers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tech centers' },
      { status: 500 }
    );
  }
}