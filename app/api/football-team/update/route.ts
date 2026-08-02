import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// PUT - Update user's football team membership (jersey number, position)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { teamId, jerseyNumber, position } = body;

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Verify that the team membership belongs to the current user
    const existingMembership = await prisma.footballTeam.findUnique({
      where: { id: teamId },
      select: { userId: true, techCenterId: true }
    });

    if (!existingMembership) {
      return NextResponse.json({ error: 'Team membership not found' }, { status: 404 });
    }

    if (existingMembership.userId !== session.user.id) {
      return NextResponse.json({ error: 'You can only update your own team membership' }, { status: 403 });
    }

    // Update the team membership
    const updatedMembership = await prisma.footballTeam.update({
      where: { id: teamId },
      data: {
        jerseyNumber: jerseyNumber !== undefined ? jerseyNumber : undefined,
        position: position !== undefined ? position : undefined,
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

    return NextResponse.json({
      message: 'Team membership updated successfully',
      teamMember: updatedMembership
    });
  } catch (error) {
    console.error('Error updating football team membership:', error);
    return NextResponse.json(
      { error: 'Failed to update team membership' },
      { status: 500 }
    );
  }
}