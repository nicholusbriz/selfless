import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch tutors from user's tech center
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user with their tech center
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { techCenter: true }
    });

    if (!user || !user.techCenter) {
      return NextResponse.json(
        { error: 'No tech center assigned to this user' },
        { status: 404 }
      );
    }

    const techCenterId = user.techCenter.id;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch teachers from the user's tech center
    const tutors = await prisma.user.findMany({
      where: {
        techCenterId: techCenterId,
        role: {
          name: 'teacher'
        },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        techCenter: {
          select: {
            id: true,
            name: true
          }
        },
        role: {
          select: {
            name: true
          }
        }
      },
      take: limit,
      orderBy: {
        firstName: 'asc'
      }
    });

    return NextResponse.json({
      tutors,
      total: tutors.length
    });
  } catch (error) {
    console.error('Error fetching tutors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutors' },
      { status: 500 }
    );
  }
}