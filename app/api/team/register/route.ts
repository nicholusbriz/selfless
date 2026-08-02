import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { createNotificationForTechCenter } from '@/lib/notifications';

// POST - Register user as team member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { techCenterId, teamType, teamRole, jerseyNumber, position } = body;

    if (!techCenterId || !teamType || !teamRole || !jerseyNumber || !position) {
      return NextResponse.json({ error: 'Tech center, team type, team role, jersey number, and position are required' }, { status: 400 });
    }

    // Validate team type
    const validTeamTypes = ['FOOTBALL', 'VOLLEYBALL', 'NETBALL', 'BASKETBALL', 'ATHLETICS'];
    if (!validTeamTypes.includes(teamType)) {
      return NextResponse.json({ error: 'Invalid team type' }, { status: 400 });
    }

    // Validate team role
    const validTeamRoles = ['PLAYER', 'COACH', 'KIT_MANAGER', 'CHEERLEADER', 'TEAM_MANAGER', 'MEDICAL', 'REFEREE'];
    if (!validTeamRoles.includes(teamRole)) {
      return NextResponse.json({ error: 'Invalid team role' }, { status: 400 });
    }

    // Check if user already belongs to this tech center's team
    const existingMember = await prisma.teamMembership.findFirst({
      where: {
        userId: session.user.id,
        techCenterId,
        teamType: teamType as any,
        teamRole: teamRole as any
      }
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this team with this role' }, { status: 400 });
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
        teamType: teamType as any,
        teamRole: teamRole as any,
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

    // Create notification for all tech center students
    try {
      const teamName = teamType.charAt(0) + teamType.slice(1).toLowerCase();
      const notificationResult = await createNotificationForTechCenter({
        techCenterId,
        title: `New ${teamName} Team Member!`,
        message: `${teamMember.user.firstName} ${teamMember.user.lastName} has joined the ${teamMember.techCenter.name} ${teamName} team as ${teamRole.charAt(0) + teamRole.slice(1).toLowerCase()}!`,
        type: 'team_registration',
        link: `/dashboard/team/${teamType.toLowerCase()}`,
        generatedBy: session.user.id,
        entityType: 'team_membership',
        entityId: teamMember.id
      });
      console.log('Notification created:', notificationResult);
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't fail the registration if notification fails
    }

    return NextResponse.json({
      message: 'Successfully joined team',
      teamMember
    });
  } catch (error) {
    console.error('Error registering for team:', error);
    return NextResponse.json(
      { error: 'Failed to register for team' },
      { status: 500 }
    );
  }
}