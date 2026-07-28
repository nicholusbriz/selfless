import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// PATCH - Update tech center details
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or super_admin
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    // Get the user with their tech center
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { techCenter: true }
    });

    if (!user || !user.techCenter) {
      return NextResponse.json(
        { error: 'No tech center assigned to this admin' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, countryId, city, address, phone, email } = body;

    // Validate - at least one field to update
    if (!name && !description && !countryId && !city && !address && !phone && !email) {
      return NextResponse.json(
        { error: 'At least one field is required to update' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (countryId !== undefined) updateData.countryId = countryId || null;
    if (city !== undefined) updateData.city = city || null;
    if (address !== undefined) updateData.address = address || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (email !== undefined) updateData.email = email || null;
    
    updateData.updatedById = session.user.id;

    // Update the tech center
    const updatedTechCenter = await prisma.techCenter.update({
      where: { id: user.techCenter.id },
      data: updateData,
      include: {
        country: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'update_tech_center',
        entityType: 'techCenter',
        entityId: updatedTechCenter.id,
        details: { 
          name: updatedTechCenter.name,
          updatedFields: Object.keys(updateData).filter(key => key !== 'updatedById')
        },
        techCenterId: updatedTechCenter.id,
      }
    });

    return NextResponse.json({
      message: 'Tech center updated successfully',
      techCenter: updatedTechCenter
    });
  } catch (error) {
    console.error('Error updating tech center:', error);
    return NextResponse.json(
      { error: 'Failed to update tech center' },
      { status: 500 }
    );
  }
}