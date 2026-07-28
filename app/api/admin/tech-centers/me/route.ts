import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch admin's assigned tech center
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or super_admin
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    // Get the user with their tech center
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        techCenter: {
          include: {
            country: true,
            users: {
              select: { id: true }
            },
            studentCourses: {
              select: { id: true }
            },
            weeks: {
              select: { id: true }
            },
            cleaningDays: {
              select: { id: true }
            },
            announcements: {
              select: { id: true }
            },
            _count: {
              select: {
                users: true,
                studentCourses: true,
                weeks: true,
                cleaningDays: true,
                announcements: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.techCenter) {
      return NextResponse.json({ 
        error: 'No tech center assigned to this admin',
        techCenter: null 
      }, { status: 404 });
    }

    return NextResponse.json(user.techCenter);
  } catch (error) {
    console.error('Error fetching tech center:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tech center' },
      { status: 500 }
    );
  }
}