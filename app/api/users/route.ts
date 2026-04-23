import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import Registration from '@/models/Registration';

export async function GET() {
  try {
    await connectDB();

    // Fetch all users from database
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        fullName: `${user.firstName} ${user.lastName}`,
        createdAt: user.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 });
    }

    // First, find the user to get their information
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Delete all registrations associated with this user (but keep the user account)
    const deletedRegistrations = await Registration.deleteMany({ userId });
    console.log(`Deleted ${deletedRegistrations.deletedCount} registrations for user ${user.email}`);
    console.log(`User account ${user.email} preserved for future login access`);

    return NextResponse.json({
      success: true,
      message: 'User registrations deleted successfully. User account preserved for future login.',
      deletedRegistrations: deletedRegistrations.deletedCount,
      preservedUser: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
