import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch team members by tech center and team type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ techCenterId: string; teamType: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { techCenterId, teamType } = await params;

    // Validate team type
    const validTeamTypes = ['FOOTBALL', 'VOLLEYBALL', 'NETBALL', 'BASKETBALL', 'ATHLETICS'];
    if (!validTeamTypes.includes(teamType)) {
      return NextResponse.json({ error: 'Invalid team type' }, { status: 400 });
    }

    // Fetch all team members for this tech center and team type
    const teamMembers = await prisma.teamMembership.findMany({
      where: {
        techCenterId,
        teamType: teamType as any,
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
    const currentUserMembership = await prisma.teamMembership.findFirst({
      where: {
        userId: session.user.id,
        techCenterId,
        teamType: teamType as any
      }
    });

    return NextResponse.json({
      teamMembers,
      currentUserMembership: currentUserMembership || null,
      totalMembers: teamMembers.length
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}