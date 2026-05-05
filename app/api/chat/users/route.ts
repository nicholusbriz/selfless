import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import { requireUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate user
    const authUser = await requireUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');

    if (!currentUserId) {
      return NextResponse.json({ success: false, message: 'Current user ID required' }, { status: 400 });
    }

    // Fetch all users except current user for chat
    const users = await User.find({ 
      _id: { $ne: currentUserId }
    }).select('firstName lastName email').sort({ firstName: 1, lastName: 1 });

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email
      }))
    });

  } catch (error) {
    console.error('Error fetching chat users:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
