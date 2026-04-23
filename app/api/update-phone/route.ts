import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';

export async function PUT(request: Request) {
  try {
    await connectDB();
    const { userId, phoneNumber } = await request.json();

    // Validation
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    if (phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(phoneNumber)) {
      return NextResponse.json({ success: false, message: 'Invalid phone number format' }, { status: 400 });
    }

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Update phone number (can be empty string to remove)
    user.phoneNumber = phoneNumber || undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Phone number updated successfully',
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || ''
      }
    });

  } catch (error) {
    console.error('Update phone number error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
