import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { createActivityLog } from '@/lib/logger';

// POST - Register user as football team member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { techCenterId, jerseyNumber, position, teamRole } = body;

    if (!techCenterId) {
      return NextResponse.json({ error: 'Tech center ID is required' }, { status: 400 });
    }

    // Check if user already belongs to this tech center's football team
    const existingMember = await prisma.teamMembership.findFirst({
      where: {
        userId: session.user.id,
        techCenterId,
        teamType: 'FOOTBALL'
      }
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this football team' }, { status: 400 });
    }

    // Check if user belongs to this tech center
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { techCenterId: true }
    });

    if (!user || user.techCenterId !== techCenterId) {
      return NextResponse.json({ error: 'User must belong to this tech center to join the team' }, { status: 400 });
    }

    // Register user as team member using TeamMembership
    const teamMember = await prisma.teamMembership.create({
      data: {
        userId: session.user.id,
        techCenterId,
        teamType: 'FOOTBALL',
        teamRole: teamRole || 'PLAYER',
        jerseyNumber,
        position
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true
          }
        },
        techCenter: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    await createActivityLog({
      userId: session.user.id,
      action: 'football_team_joined',
      entityType: 'team_membership',
      entityId: teamMember.id,
      techCenterId,
      details: {
        teamType: 'FOOTBALL',
        teamRole: teamMember.teamRole,
        position,
        jerseyNumber,
      },
    });

    return NextResponse.json({
      message: 'Successfully joined football team',
      teamMember
    });
  } catch (error) {
    console.error('Error registering for football team:', error);
    return NextResponse.json(
      { error: 'Failed to register for football team' },
      { status: 500 }
    );
  }
}
