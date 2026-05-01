import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import Registration from '@/models/Registration';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to verify user token
async function verifyUserToken(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc: { [key: string]: string }, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  const token = cookies['auth-token'];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user) return null;

    return user;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Verify user authentication
    const authenticatedUser = await verifyUserToken(request);
    if (!authenticatedUser) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const { cleaningDayId, userId } = await request.json();

    // Security: Ensure user can only register themselves
    if (userId !== authenticatedUser._id.toString()) {
      return NextResponse.json({ success: false, message: 'Unauthorized: You can only register yourself' }, { status: 403 });
    }



    // Validation
    if (!cleaningDayId || !userId) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Find user

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found. Please log in again.',
        error: `User ID "${userId}" not found in database`
      }, { status: 404 });
    }

    // Check if user is already registered for any day
    const existingRegistration = await Registration.findOne({ userId });
    if (existingRegistration) {
      return NextResponse.json({ success: false, message: 'You have already registered for a cleaning day' }, { status: 400 });
    }

    // Check if the day is already full (5 students max per day)
    const dayRegistrations = await Registration.countDocuments({ cleaningDayId });
    if (dayRegistrations >= 5) {
      return NextResponse.json({ success: false, message: 'This cleaning day is already full' }, { status: 400 });
    }

    // Check if this email has already registered for any day
    const existingEmailRegistration = await Registration.findOne({ email: user.email.toLowerCase() });
    if (existingEmailRegistration) {
      return NextResponse.json({
        success: false,
        message: 'This email has already registered for a cleaning day. Each email can only register once.'
      }, { status: 400 });
    }

    // Create new registration
    const newRegistration = new Registration({
      userId: user._id.toString(),
      email: user.email.toLowerCase(),
      cleaningDayId,
      cleaningDayName: getDayName(cleaningDayId),
      cleaningDayDate: getDayDate(cleaningDayId)
    });

    await newRegistration.save();

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`
      }
    });

  } catch (error) {

    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// Helper functions
function getDayName(dayId: number): string {
  const days = {
    1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday',
    6: 'Monday', 7: 'Tuesday', 8: 'Wednesday', 9: 'Thursday', 10: 'Friday',
    11: 'Monday', 12: 'Tuesday', 13: 'Wednesday', 14: 'Thursday', 15: 'Friday'
  };
  return days[dayId as keyof typeof days] || 'Unknown';
}

function getDayDate(dayId: number): string {
  // Exact dates for May 2026 cleaning days
  const dates = {
    1: '2026-05-04', // Week 1 Monday
    2: '2026-05-05', // Week 1 Tuesday
    3: '2026-05-06', // Week 1 Wednesday
    4: '2026-05-07', // Week 1 Thursday
    5: '2026-05-08', // Week 1 Friday
    6: '2026-05-11', // Week 2 Monday
    7: '2026-05-12', // Week 2 Tuesday
    8: '2026-05-13', // Week 2 Wednesday
    9: '2026-05-14', // Week 2 Thursday
    10: '2026-05-15', // Week 2 Friday
    11: '2026-05-18', // Week 3 Monday
    12: '2026-05-19', // Week 3 Tuesday
    13: '2026-05-20', // Week 3 Wednesday
    14: '2026-05-21', // Week 3 Thursday
    15: '2026-05-22', // Week 3 Friday
  };
  return dates[dayId as keyof typeof dates] || 'Unknown';
}
