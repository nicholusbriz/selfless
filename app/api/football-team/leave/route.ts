import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// POST - Remove user from football team
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Find the team membership using TeamMembership
    const teamMembership = await prisma.teamMembership.findUnique({
      where: { id: teamId },
      include: {
        user: true,
        techCenter: true
      }
    });

    if (!teamMembership) {
      return NextResponse.json({ error: 'Team membership not found' }, { status: 404 });
    }

    // Check if user is removing themselves or is admin/super_admin
    const isOwnMembership = teamMembership.userId === session.user.id;
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';

    if (!isOwnMembership && !isAdmin) {
      return NextResponse.json({ error: 'You can only remove yourself or be an admin' }, { status: 403 });
    }

    // Remove from team using TeamMembership
    await prisma.teamMembership.delete({
      where: { id: teamId }
    });

    return NextResponse.json({
      message: 'Successfully removed from football team',
      removedUser: `${teamMembership.user.firstName} ${teamMembership.user.lastName}`
    });
  } catch (error) {
    console.error('Error removing from football team:', error);
    return NextResponse.json(
      { error: 'Failed to remove from football team' },
      { status: 500 }
    );
  }
}
