import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import Registration from '@/models/Registration';

export async function GET() {
  try {
    await connectDB();

    // For GET requests, we need to get user from session or token
    // For now, we'll return a response that requires proper authentication
    return NextResponse.json({
      success: false,
      message: 'Authentication required for user status'
    }, { status: 401 });

  } catch (error) {
    console.error('User status GET error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ success: false, message: 'Missing required parameters' }, { status: 400 });
    }

    // Find user by ID and verify email matches
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Verify email matches to prevent unauthorized access
    if (user.email !== email) {
      return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 403 });
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
        phoneNumber: user.phoneNumber || '',
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
