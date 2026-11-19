import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  try {
    const gifts = await prisma.gift.findMany({
      where: { isActive: true },
      orderBy: [{ tier: 'asc' }, { cost: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      gifts,
    });
  } catch (error) {
    console.error('Error fetching gift catalog:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch gift catalog',
      },
      { status: 500 }
    );
  }
}
