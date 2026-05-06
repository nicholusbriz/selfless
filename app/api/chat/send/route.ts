import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/models/database';
import { IUser } from '@/models/User';
import mongoose from 'mongoose';
import { verifyUserToken } from '@/lib/auth-server';
import { MessageModel } from '@/models/Message';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { receiverId, content } = body;

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user details for names
    const UserModel = mongoose.model<IUser>('User');
    const [sender, receiver] = await Promise.all([
      UserModel.findById(user.id),
      UserModel.findById(receiverId)
    ]);

    if (!sender || !receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create new message
    const message = new MessageModel({
      senderId: user.id,
      receiverId,
      content,
      messageType: 'text',
      senderName: (sender as any).fullName || `${sender.firstName} ${sender.lastName}`,
      receiverName: (receiver as any).fullName || `${receiver.firstName} ${receiver.lastName}`,
    });

    await message.save();

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
