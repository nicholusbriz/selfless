import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// PUT - Update user's football team membership (jersey number, position)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('Update API: No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { teamId, jerseyNumber, position } = body;

    if (!teamId || !jerseyNumber || !position) {
      return NextResponse.json({ error: 'Team ID, jersey number, and position are required' }, { status: 400 });
    }

    // Verify that the team membership belongs to the current user using TeamMembership
    const existingMembership = await prisma.teamMembership.findUnique({
      where: { id: teamId },
      select: { userId: true, techCenterId: true }
    });

    if (!existingMembership) {
      console.log('Update API: Team membership not found for ID:', teamId);
      return NextResponse.json({ error: 'Team membership not found' }, { status: 404 });
    }

    console.log('Update API: Session user ID:', session.user.id, 'Team membership user ID:', existingMembership.userId);

    if (existingMembership.userId !== session.user.id) {
      console.log('Update API: User ID mismatch - Session:', session.user.id, 'Membership:', existingMembership.userId);
      return NextResponse.json({ error: 'You can only update your own team membership' }, { status: 403 });
    }

    // Update the team membership using TeamMembership
    const updatedMembership = await prisma.teamMembership.update({
      where: { id: teamId },
      data: {
        jerseyNumber: jerseyNumber,
        position: position,
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