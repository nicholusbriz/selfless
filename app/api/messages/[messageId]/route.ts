import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Mark a message as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isRead } = await request.json();

    if (typeof isRead !== 'boolean') {
      return NextResponse.json(
        { error: 'isRead must be a boolean' },
        { status: 400 }
      );
    }

    // Find the message and verify it belongs to the current user as receiver
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Only allow marking own received messages as read
    if (message.receiverId !== userId) {
      return NextResponse.json(
        { error: 'Cannot modify this message' },
        { status: 403 }
      );
    }

    // Update message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead,
        readAt: isRead ? new Date() : null,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true
          }
        }
      }
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the message and verify sender
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Only allow sender to delete
    if (message.senderId !== userId) {
      return NextResponse.json(
        { error: 'Cannot delete this message' },
        { status: 403 }
      );
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: messageId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
