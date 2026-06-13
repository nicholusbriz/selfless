import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Update message status
export async function PATCH(
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
    
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['unread', 'read', 'replied'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be unread, read, or replied' },
        { status: 400 }
      );
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id: id },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      message: 'Message status updated successfully',
      data: updatedMessage
    });

  } catch (error) {
    console.error('Error updating message status:', error);
    return NextResponse.json(
      { error: 'Failed to update message status' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a message
export async function DELETE(
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
    
    const { id } = await params;
    
    await prisma.contactMessage.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}