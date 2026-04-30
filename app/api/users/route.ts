import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import Registration from '@/models/Registration';

// Cache configuration for PWA performance
export const revalidate = 30; // Revalidate every 30 seconds

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (userId) {
      // Fetch single user by ID
      const user = await User.findById(userId).select('-password');

      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        users: [{
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          fullName: `${user.firstName} ${user.lastName}`,
          createdAt: user.createdAt
        }]
      });
    } else {
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
    }

  } catch (error) {
    
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
    
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
