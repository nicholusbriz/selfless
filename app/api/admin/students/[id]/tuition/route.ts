import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/students/[id]/tuition - Mark tuition as paid/unpaid
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    // Proxy already verified authentication, just check if userId exists
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check for admin role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }

    const { tuitionPaid } = await request.json();
    const { id } = await params;

    const updatedProfile = await prisma.studentProfile.update({
      where: { id },
      data: { tuitionPaid }
    });

    return NextResponse.json({ 
      success: true, 
      profile: updatedProfile 
    });
  } catch (error) {
    console.error('Error updating tuition status:', error);
    return NextResponse.json({ error: 'Failed to update tuition status' }, { status: 500 });
  }
}