import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { createNotificationForTechCenter } from '@/lib/notifications';

// POST - Register user as football team member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { techCenterId, jerseyNumber, position } = body;

    if (!techCenterId) {
      return NextResponse.json({ error: 'Tech center ID is required' }, { status: 400 });
    }

    // Check if user already belongs to this tech center's football team
    const existingMember = await prisma.footballTeam.findUnique({
      where: {
        userId_techCenterId: {
          userId: session.user.id,
          techCenterId
        }
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

    // Register user as team member
    const teamMember = await prisma.footballTeam.create({
      data: {
        userId: session.user.id,
        techCenterId,
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

    // Create notification for all tech center students (including the user who joined)
    try {
      const notificationResult = await createNotificationForTechCenter({
        techCenterId,
        title: 'New Football Team Member!',
        message: `${teamMember.user.firstName} ${teamMember.user.lastName} has joined the ${teamMember.techCenter.name} football team!`,
        type: 'football_team',
        link: '/dashboard/football-team',
        generatedBy: session.user.id,
        entityType: 'football_team',
        entityId: teamMember.id
        // Removed excludeUserIds so the user who joined also gets notified
      });
      console.log('Notification created:', notificationResult);
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't fail the registration if notification fails
    }

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
