// app/api/admin/tech-centers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// PATCH - Update tech center (toggle active status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Tech center ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      );
    }

    // First check if the tech center exists
    const existingCenter = await prisma.techCenter.findUnique({
      where: { id }
    });

    if (!existingCenter) {
      return NextResponse.json(
        { error: 'Tech center not found' },
        { status: 404 }
      );
    }

    // Update the tech center
    const techCenter = await prisma.techCenter.update({
      where: { id },
      data: {
        isActive,
        updatedById: session.user.id,
      },
      include: {
        country: true,
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'update_tech_center_status',
        entityType: 'techCenter',
        entityId: techCenter.id,
        details: { 
          name: techCenter.name, 
          code: techCenter.code,
          isActive 
        },
        techCenterId: techCenter.id,
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

// DELETE - Delete tech center
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Tech center ID is required' },
        { status: 400 }
      );
    }

    // Check if tech center exists with all relations
    const existingCenter = await prisma.techCenter.findUnique({
      where: { id },
      include: {
        users: { select: { id: true } },
        studentCourses: { select: { id: true } },
        weeks: { select: { id: true } },
        cleaningDays: { select: { id: true } },
        announcements: { select: { id: true } },
        activityLogs: { select: { id: true } }, // Include activity logs
      }
    });

    if (!existingCenter) {
      return NextResponse.json(
        { error: 'Tech center not found' },
        { status: 404 }
      );
    }

    // Check if center has associated data
    const hasAssociatedData = 
      existingCenter.users.length > 0 ||
      existingCenter.studentCourses.length > 0 ||
      existingCenter.weeks.length > 0 ||
      existingCenter.cleaningDays.length > 0 ||
      existingCenter.announcements.length > 0;

    if (hasAssociatedData) {
      return NextResponse.json(
        { 
          error: 'Cannot delete tech center with associated data. Remove all users, courses, weeks, cleaning days, and announcements first.' 
        },
        { status: 400 }
      );
    }

    // Delete all associated activity logs first (since they have a required relation)
    if (existingCenter.activityLogs.length > 0) {
      await prisma.activityLog.deleteMany({
        where: { techCenterId: id }
      });
    }

    // Now delete the tech center
    await prisma.techCenter.delete({
      where: { id }
    });

    // Log activity (this will create a new log that doesn't have techCenterId)
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'delete_tech_center',
        entityType: 'techCenter',
        entityId: id,
        details: { 
          name: existingCenter.name, 
          code: existingCenter.code 
        },
        // Note: techCenterId is intentionally omitted here since the center is deleted
      }
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