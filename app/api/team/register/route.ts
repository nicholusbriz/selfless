import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { createNotificationForTechCenter } from '@/lib/notifications';
import { createActivityLog } from '@/lib/logger';
import { TeamRole, TeamType } from '@prisma/client';
import {
  invalidJsonBodyResponse,
  isString,
  isStringOrNumber,
  parseJsonBody,
  type JsonGuard,
} from '@/app/api/_lib/request-validation';

const isTeamType: JsonGuard<TeamType> = (
  value,
): value is TeamType =>
  value === TeamType.FOOTBALL ||
  value === TeamType.VOLLEYBALL ||
  value === TeamType.NETBALL ||
  value === TeamType.BASKETBALL ||
  value === TeamType.ATHLETICS;

const isTeamRole: JsonGuard<TeamRole> = (
  value,
): value is TeamRole =>
  value === TeamRole.PLAYER ||
  value === TeamRole.COACH ||
  value === TeamRole.KIT_MANAGER ||
  value === TeamRole.CHEERLEADER ||
  value === TeamRole.TEAM_MANAGER ||
  value === TeamRole.MEDICAL ||
  value === TeamRole.REFEREE;

// POST - Register user as team member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await parseJsonBody(request, {
      techCenterId: isString,
      teamType: isTeamType,
      teamRole: isTeamRole,
      jerseyNumber: isStringOrNumber,
      position: isString,
    });
    if (!body) return invalidJsonBodyResponse();
    const { techCenterId, teamType, teamRole, jerseyNumber, position } = body;
    const parsedJerseyNumber =
      typeof jerseyNumber === 'string' ? Number(jerseyNumber) : jerseyNumber;

    if (
      !techCenterId ||
      !teamType ||
      !teamRole ||
      !position ||
      !Number.isInteger(parsedJerseyNumber) ||
      parsedJerseyNumber < 0
    ) {
      return NextResponse.json({ error: 'Tech center, team type, team role, jersey number, and position are required' }, { status: 400 });
    }

    // Check if user already belongs to this tech center's team
    const existingMember = await prisma.teamMembership.findFirst({
      where: {
        userId: session.user.id,
        techCenterId,
        teamType,
        teamRole
      }
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this team with this role' }, { status: 400 });
    }

    // Check if user belongs to this tech center
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        techCenterId: true,
        previousTechCenterId: true,
        role: { select: { name: true } },
      }
    });

    const allowedTechCenterId = user?.role?.name === 'super_admin'
      ? user.previousTechCenterId
      : user?.techCenterId;

    if (!user || allowedTechCenterId !== techCenterId) {
      return NextResponse.json({ error: 'User must belong to this tech center to join the team' }, { status: 400 });
    }

    // Register user as team member using TeamMembership
    const teamMember = await prisma.teamMembership.create({
      data: {
        userId: session.user.id,
        techCenterId,
        teamType,
        teamRole,
        jerseyNumber: parsedJerseyNumber,
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

    const teamName = teamType.charAt(0) + teamType.slice(1).toLowerCase();

    if (teamType === 'FOOTBALL') {
      await createActivityLog({
        userId: session.user.id,
        action: 'football_team_joined',
        entityType: 'team_membership',
        entityId: teamMember.id,
        techCenterId,
        details: {
          teamType,
          teamRole,
          position,
          jerseyNumber,
        },
      });
    } else {
      try {
        const notificationResult = await createNotificationForTechCenter({
          techCenterId,
          title: `New ${teamName} Team Member!`,
          message: `${teamMember.user.firstName} ${teamMember.user.lastName} has joined the ${teamMember.techCenter.name} ${teamName} team as ${teamRole.charAt(0) + teamRole.slice(1).toLowerCase()}!`,
          type: 'team_registration',
          link: `/dashboard/team/${teamType.toLowerCase()}`,
          generatedBy: session.user.id,
          entityType: 'team_membership',
          entityId: teamMember.id,
        });
        console.log('Notification created:', notificationResult);
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
      }
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