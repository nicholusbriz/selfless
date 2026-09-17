import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// DELETE - Delete a video request (only by the request owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: requestId } = await params;

    // Check if the request exists and belongs to the user
    const existingRequest = await prisma.videoRequest.findUnique({
      where: { id: requestId },
      select: { userId: true }
    });

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    // Only the owner can delete their request
    if (existingRequest.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own requests' },
        { status: 403 }
      );
    }

    // Delete the request
    await prisma.videoRequest.delete({
      where: { id: requestId }
    });

    return NextResponse.json({
      success: true,
      message: 'Request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting video request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete request' },
      { status: 500 }
    );
  }
}