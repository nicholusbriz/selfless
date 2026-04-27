import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';

export async function PUT(request: Request) {
  try {
    await connectDB();
    const { userId, phoneNumber } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    // Update user's phone number
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { phoneNumber: phoneNumber || '' },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number updated successfully',
      user: {
        id: updatedUser._id.toString(),
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber || ''
      }
    });

  } catch (error) {
    console.error('Update phone error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update phone number' 
    }, { status: 500 });
  }
}
