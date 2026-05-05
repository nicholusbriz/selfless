import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import Registration from '@/models/Registration';
import Tutor from '@/models/Tutor';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';
import { isSuperAdminEmail } from '@/config/admin';
import { AUTH_CONSTANTS } from '@/config/constants';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    // Get auth token from cookies
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ success: false, message: 'No authentication token found' }, { status: 401 });
    }

    // Extract auth-token from cookies
    const cookies = cookieHeader.split(';').reduce((acc: { [key: string]: string }, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    const token = cookies[AUTH_CONSTANTS.TOKEN_NAME];
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    // Verify JWT token
    let decoded: { userId: string; email: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid authentication token' }, { status: 403 });
    }

    // Find user by ID from token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Verify email matches token
    if (user.email !== decoded.email) {
      return NextResponse.json({ success: false, message: 'Token mismatch' }, { status: 403 });
    }

    // Check if User has any registration
    const registration = await Registration.findOne({ userId: decoded.userId });
    const isRegistered = !!registration;

    // Check if User is a tutor
    const tutor = await Tutor.findOne({ userId: decoded.userId });
    const isTutor = !!tutor;

    // Check if User is an admin using admin.ts config
    const promotedAdmin = await Admin.findOne({ userId: decoded.userId, isActive: true });
    const isSuperAdmin = isSuperAdminEmail(user.email);
    const isAdmin = isSuperAdmin || !!promotedAdmin;

    // Get formatted date from registration data
    let formattedDate = '';
    if (isRegistered && registration.cleaningDayDate) {
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
        fullName: `${user.firstName} ${user.lastName}`,
        isAdmin,
        isSuperAdmin,
        adminPermissions: promotedAdmin ? promotedAdmin.permissions : null,
        adminRole: isSuperAdmin ? 'super-admin' : (promotedAdmin ? promotedAdmin.role : null),
        isTutor,
        tutorPermissions: isTutor ? tutor.permissions : null,
        isRegistered,
        registrations: isRegistered ? [
          {
            ...registration,
            formattedDate
          }
        ] : []
      }
    });
  } catch (error) {
    console.error('User status error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
