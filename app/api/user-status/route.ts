import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import Registration from '@/models/Registration';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { userId } = await request.json();

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Check if user has any registration and get cleaning days data for formatted date
    const registration = await Registration.findOne({ userId });
    const isRegistered = !!registration;

    // Get formatted date from registration data
    let formattedDate = '';
    if (isRegistered && registration.cleaningDayDate) {
      // The registration already contains the formatted date
      formattedDate = registration.cleaningDayDate;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`
      },
      isRegistered,
      registrations: isRegistered ? [{
        ...registration,
        formattedDate
      }] : []
    });

  } catch (error) {
    console.error('User status error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
