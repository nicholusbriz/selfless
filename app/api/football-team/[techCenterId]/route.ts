import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch football team members by tech center
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ techCenterId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { techCenterId } = await params;

    // Fetch all team members for this tech center
    const teamMembers = await prisma.footballTeam.findMany({
      where: {
        techCenterId,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true,
            phoneNumber: true
          }
        },
        techCenter: {
          select: {
            id: true,
            name: true,
            country: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'asc'
      }
    });

    // Check if current user is a member
    const currentUserMembership = await prisma.footballTeam.findUnique({
      where: {
        userId_techCenterId: {
          userId: session.user.id,
          techCenterId
        }
      }
    });

    return NextResponse.json({
      teamMembers,
      currentUserMembership: currentUserMembership || null,
      totalMembers: teamMembers.length
    });
  } catch (error) {
    console.error('Error fetching football team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch football team' },
      { status: 500 }
    );
  }
}
