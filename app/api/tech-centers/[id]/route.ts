// app/api/tech-centers/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const techCenter = await prisma.techCenter.findFirst({
      where: { 
        id: id,
        isActive: true,
      },
      include: {
        country: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        }
      }
    });

    if (!techCenter) {
      return NextResponse.json(
        { error: 'Tech center not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(techCenter);
  } catch (error) {
    console.error('Error fetching tech center:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tech center' },
      { status: 500 }
    );
  }
}