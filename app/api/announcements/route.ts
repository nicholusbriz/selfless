import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch all active announcements (filtered by user's tech center)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with tech center
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        techCenterId: true,
        role: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Filter: Global announcements OR announcements for user's tech center
    const whereClause: any = {
      isActive: true,
      OR: [
        { isGlobal: true },
        { techCenterId: user.techCenterId }
      ]
    };

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: {
              select: {
                name: true,
                displayName: true
              }
            }
          }
        },
        techCenter: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ 
      announcements,
      currentUser: {
        id: session.user.id,
        isAdmin: user.role?.name === 'admin' || user.role?.name === 'super_admin',
        techCenterId: user.techCenterId
      }
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// POST - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, deadline, isGlobal, techCenterId } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    // Get user with role and tech center
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine tech center ID
    const finalTechCenterId = isGlobal ? null : (techCenterId || user.techCenterId);

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        authorId: session.user.id,
        title,
        content,
        deadline: deadline ? new Date(deadline) : null,
        isGlobal: isGlobal || false,
        techCenterId: finalTechCenterId
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: {
              select: {
                name: true,
                displayName: true
              }
            }
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
      message: 'Announcement created successfully',
      announcement
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}