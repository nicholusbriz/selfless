import { NextRequest, NextResponse } from 'next/server';
import { verifyUserToken } from '@/lib/auth-server';
import connectToDatabase from '@/models/database';
import { MessageModel } from '@/models/Message';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Verify user authentication
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    // Find message
    const message = await MessageModel.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify user can delete this message (sender only)
    if (message.senderId !== user.id) {
      return NextResponse.json({ error: 'Only sender can delete messages' }, { status: 403 });
    }

    console.log(`Deleting message ${messageId} for user ${user.id}`);

    // Delete message for everyone
    await MessageModel.findByIdAndDelete(messageId);

    return NextResponse.json({
      success: true,
      message: 'Message deleted for everyone'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
