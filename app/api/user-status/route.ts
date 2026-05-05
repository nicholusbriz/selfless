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
      return NextResponse.json({ success: false, message: 'Invalid authentication token' }, { status: 401 });
    }

    // Find user by ID from token with timeout
    let user;
    try {
      user = await Promise.race([
        User.findById(decoded.userId),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database timeout')), 8000)
        )
      ]);
    } catch (error) {
      if (error instanceof Error && error.message === 'Database timeout') {
        return NextResponse.json({
          success: false,
          message: 'Database temporarily unavailable. Please try again.'
        }, { status: 503 });
      }
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Verify email matches token
    if (user.email !== decoded.email) {
      return NextResponse.json({ success: false, message: 'Token mismatch' }, { status: 403 });
    }

    // Check if user has any registration with timeout
    let registration = null;
    try {
      registration = await Promise.race([
        Registration.findOne({ userId: decoded.userId }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        )
      ]);
    } catch (error) {
      // Registration lookup failed, continue without it
      console.log('Registration lookup failed:', error);
    }
    const isRegistered = !!registration;

    // Check if user is a tutor with timeout
    let tutor = null;
    try {
      tutor = await Promise.race([
        Tutor.findOne({ userId: decoded.userId }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        )
      ]);
    } catch (error) {
      // Tutor lookup failed, continue without it
      console.log('Tutor lookup failed:', error);
    }
    const isTutor = !!tutor;

    // Check if user is an admin using admin.ts config with timeout
    let promotedAdmin = null;
    try {
      promotedAdmin = await Promise.race([
        Admin.findOne({ userId: decoded.userId }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        )
      ]);
    } catch (error) {
      // Admin lookup failed, continue without it
      console.log('Admin lookup failed:', error);
    }
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
