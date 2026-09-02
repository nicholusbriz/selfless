import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch a single tech center by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is super admin or dev
    if (!session?.user?.id || (session.user.role !== 'super_admin' && session.user.role !== 'dev')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const techCenter = await prisma.techCenter.findUnique({
      where: { id },
      include: {
        country: true,
        users: {
          select: { id: true }
        },
        _count: {
          select: {
            users: true,
            studentCourses: true,
            weeks: true,
            cleaningDays: true,
            announcements: true,
          }
        }
      }
    });

    if (!techCenter) {
      return NextResponse.json({ error: 'Tech center not found' }, { status: 404 });
    }

    return NextResponse.json(techCenter);
  } catch (error) {
    console.error('Error fetching tech center:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tech center' },
      { status: 500 }
    );
  }
}

// PATCH - Update a tech center
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is super admin or dev
    if (!session?.user?.id || (session.user.role !== 'super_admin' && session.user.role !== 'dev')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, code, description, countryId, city, address, phone, email, isActive } = body;

    // Check if tech center exists
    const existingCenter = await prisma.techCenter.findUnique({
      where: { id }
    });

    if (!existingCenter) {
      return NextResponse.json({ error: 'Tech center not found' }, { status: 404 });
    }

    // If code is being changed, check if new code already exists
    if (code && code !== existingCenter.code) {
      const codeExists = await prisma.techCenter.findUnique({
        where: { code }
      });

      if (codeExists) {
        return NextResponse.json(
          { error: 'A tech center with this code already exists' },
          { status: 400 }
        );
      }
    }

    // Update tech center
    const techCenter = await prisma.techCenter.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
        ...(description !== undefined && { description }),
        ...(countryId !== undefined && { countryId }),
        ...(city !== undefined && { city }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(isActive !== undefined && { isActive }),
        updatedById: session.user.id,
      },
      include: {
        country: true,
      }
    });

    return NextResponse.json(techCenter);
  } catch (error) {
    console.error('Error updating tech center:', error);
    return NextResponse.json(
      { error: 'Failed to update tech center' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a tech center
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is super admin or dev
    if (!session?.user?.id || (session.user.role !== 'super_admin' && session.user.role !== 'dev')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if tech center exists
    const existingCenter = await prisma.techCenter.findUnique({
      where: { id }
    });

    if (!existingCenter) {
      return NextResponse.json({ error: 'Tech center not found' }, { status: 404 });
    }

    // Delete tech center
    await prisma.techCenter.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Tech center deleted successfully' });
  } catch (error) {
    console.error('Error deleting tech center:', error);
    return NextResponse.json(
      { error: 'Failed to delete tech center' },
      { status: 500 }
    );
  }
}
