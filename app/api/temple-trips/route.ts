import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch all active temple trips
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with tech center and role
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

    const trips = await prisma.templeTrip.findMany({
      where: { isActive: true },
      include: {
        createdBy: {
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
        },
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                techCenter: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ 
      trips,
      currentUser: {
        id: session.user.id,
        isAdmin: user.role?.name === 'admin' || user.role?.name === 'super_admin' || user.role?.name === 'dev',
        techCenterId: user.techCenterId
      }
    });
  } catch (error) {
    console.error('Error fetching temple trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch temple trips' },
      { status: 500 }
    );
  }
}

// POST - Create new temple trip (admin/superadmin/dev only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      title: string;
      description: string;
      coordinatorName: string;
      requirements: string;
      closingText: string;
    };
    const { title, description, coordinatorName, requirements, closingText } = body;

    if (!title || !description || !coordinatorName || !requirements || !closingText) {
      return NextResponse.json({ error: 'Title, description, coordinator name, requirements, and closing text are required' }, { status: 400 });
    }

    // Get user with role
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

    // Check if user has permission to create trips
    const allowedRoles = ['admin', 'super_admin', 'dev'];
    if (!user.role || !allowedRoles.includes(user.role.name)) {
      return NextResponse.json({ error: 'Only admins, superadmins, and dev can create temple trips' }, { status: 403 });
    }

    // Create temple trip (global - no tech center restriction)
    const trip = await prisma.templeTrip.create({
      data: {
        title,
        description,
        coordinatorName,
        requirements: requirements.split('\n').filter((r) => r.trim()) || [],
        closingText: closingText || null,
        createdById: session.user.id,
        techCenterId: null, // Global trip - no tech center restriction
      },
      include: {
        createdBy: {
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
      message: 'Temple trip created successfully',
      trip
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating temple trip:', error);
    return NextResponse.json(
      { error: 'Failed to create temple trip' },
      { status: 500 }
    );
  }
}
