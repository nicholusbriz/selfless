import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/models/database';
import { IUser } from '@/models/User';
import mongoose from 'mongoose';
import { verifyUserToken } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get all registered users except the current user
    const UserModel = mongoose.model<IUser>('User');
    const users = await UserModel.find({
      _id: { $ne: user.id },
      isRegistered: true
    }).select('_id firstName lastName fullName email isAdmin isTutor isRegistered phoneNumber createdAt');

    // Transform to ChatUser format
    const chatUsers = users.map((user: any) => ({
      id: user._id.toString(),
      name: user.fullName || `${user.firstName} ${user.lastName}`,
      email: user.email,
      isAdmin: user.isAdmin || false,
      isTutor: user.isTutor || false,
      isOnline: Math.random() > 0.7, // Simulate online status
      lastSeen: new Date(Date.now() - Math.random() * 86400000), // Random last seen within 24h
    }));

    return NextResponse.json(chatUsers);
  } catch (error) {
    console.error('Error fetching chat users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
