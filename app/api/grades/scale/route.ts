import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const gradeScale = await prisma.gradeScale.findMany({
      where: { isActive: true },
      orderBy: [
        { minScore: 'desc' } // Order from highest to lowest grade
      ]
    });

    return NextResponse.json({ gradeScale });
  } catch (error) {
    console.error('Error fetching grade scale:', error);
    return NextResponse.json({ error: 'Failed to fetch grade scale' }, { status: 500 });
  }
}
