import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import Registration from '@/models/Registration';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';
import { isSuperAdminEmail } from '@/config/admin';
import { AUTH_CONSTANTS } from '@/config/constants';

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

  const token = cookies[AUTH_CONSTANTS.TOKEN_NAME];
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

// Helper function to verify admin token
async function verifyAdminToken(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc: { [key: string]: string }, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  const token = cookies[AUTH_CONSTANTS.TOKEN_NAME];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user) return null;

    // Check if user is admin using admin.ts config
    const isSuperAdmin = isSuperAdminEmail(user.email);
    const promotedAdmin = await Admin.findOne({ userId: user._id.toString() });

    if (!isSuperAdmin && !promotedAdmin) return null;

    return { user, isSuperAdmin, promotedAdmin };
  } catch {
    return null;
  }
}

// GET - Fetch cleaning days data (admin or user)
export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin') === 'true';
    const userId = searchParams.get('userId');

    if (admin) {
      // Admin access - verify admin token
      const adminData = await verifyAdminToken(request);
      if (!adminData) {
        return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 401 });
      }

      // Fetch all registrations for admin view
      const registrations = await Registration.find({})
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      // Organize by weeks
      const weeks: { [key: number]: any[] } = {};

      // Generate weeks structure (same as cleaning-days API)
      for (let week = 1; week <= 3; week++) {
        weeks[week] = [];
        for (let day = 1; day <= 5; day++) {
          const dayId = (week - 1) * 5 + day;
          weeks[week].push({
            id: dayId.toString(),
            dayName: getDayName(dayId),
            date: getDayDate(dayId),
            week,
            registeredUsers: registrations
              .filter(reg => reg.cleaningDayId === dayId)
              .map(reg => ({
                id: reg.userId._id.toString(),
                firstName: reg.userId.firstName,
                lastName: reg.userId.lastName,
                fullName: `${reg.userId.firstName} ${reg.userId.lastName}`,
                email: reg.userId.email,
                createdAt: reg.createdAt,
                updatedAt: reg.updatedAt
              })),
            registeredCount: registrations.filter(reg => reg.cleaningDayId === dayId).length,
            maxSlots: 5,
            isFull: registrations.filter(reg => reg.cleaningDayId === dayId).length >= 5,
            formattedDate: new Date(getDayDate(dayId)).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })
          });
        }
      }

      return NextResponse.json({
        success: true,
        weeks
      });

    } else {
      // User access - verify user token
      const user = await verifyUserToken(request);
      if (!user) {
        return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
      }

      // Fetch all registrations and user's registration
      const registrations = await Registration.find({})
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      const userRegistration = await Registration.findOne({ userId: user._id.toString() });


      // Organize by weeks (same as admin view but without sensitive user data)
      const weeks: { [key: number]: any[] } = {};

      for (let week = 1; week <= 3; week++) {
        weeks[week] = [];
        for (let day = 1; day <= 5; day++) {
          const dayId = (week - 1) * 5 + day;
          const dayRegistrations = registrations.filter(reg => reg.cleaningDayId === dayId);

          weeks[week].push({
            id: dayId.toString(),
            dayName: getDayName(dayId),
            date: getDayDate(dayId),
            week,
            registeredUsers: dayRegistrations.map(reg => ({
              id: reg.userId._id.toString(),
              firstName: reg.userId.firstName,
              lastName: reg.userId.lastName,
              fullName: `${reg.userId.firstName} ${reg.userId.lastName}`,
              email: reg.userId.email,
              createdAt: reg.createdAt,
              updatedAt: reg.updatedAt
            })),
            registeredCount: dayRegistrations.length,
            maxSlots: 5,
            isFull: dayRegistrations.length >= 5,
            isUserRegistered: userRegistration?.cleaningDayId === dayId,
            formattedDate: new Date(getDayDate(dayId)).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })
          });
        }
      }

      return NextResponse.json({
        success: true,
        weeks,
        isRegistered: !!userRegistration,
        registration: userRegistration ? {
          id: userRegistration._id.toString(),
          cleaningDayId: userRegistration.cleaningDayId,
          cleaningDayName: userRegistration.cleaningDayName,
          cleaningDayDate: userRegistration.cleaningDayDate,
          registeredAt: userRegistration.createdAt
        } : null
      });
    }

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// POST - Type-based form operations
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { type, cleaningDayId, userId, targetUserId } = body;

    if (type === 'register') {
      // User registration (original form-submit logic)
      const authenticatedUser = await verifyUserToken(request);
      if (!authenticatedUser) {
        return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
      }

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

    } else if (type === 'admin_register') {
      // Admin registering a user
      const adminData = await verifyAdminToken(request);
      if (!adminData) {
        return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 401 });
      }

      if (!targetUserId || !cleaningDayId) {
        return NextResponse.json({ success: false, message: 'Target user ID and cleaning day ID are required' }, { status: 400 });
      }

      // Find target user
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return NextResponse.json({ success: false, message: 'Target user not found' }, { status: 404 });
      }

      // Check if user is already registered
      const existingRegistration = await Registration.findOne({ userId: targetUserId });
      if (existingRegistration) {
        return NextResponse.json({ success: false, message: 'User is already registered for a cleaning day' }, { status: 400 });
      }

      // Check capacity
      const dayRegistrations = await Registration.countDocuments({ cleaningDayId });
      if (dayRegistrations >= 5) {
        return NextResponse.json({ success: false, message: 'This cleaning day is already full' }, { status: 400 });
      }

      // Create registration
      const newRegistration = new Registration({
        userId: targetUser._id.toString(),
        email: targetUser.email.toLowerCase(),
        cleaningDayId,
        cleaningDayName: getDayName(cleaningDayId),
        cleaningDayDate: getDayDate(cleaningDayId),
        registeredBy: adminData.user._id.toString()
      });

      await newRegistration.save();

      return NextResponse.json({
        success: true,
        message: 'User registered successfully by admin',
        registration: {
          userId: targetUser._id.toString(),
          cleaningDayId,
          cleaningDayName: getDayName(cleaningDayId),
          user: {
            firstName: targetUser.firstName,
            lastName: targetUser.lastName,
            email: targetUser.email
          }
        }
      });

    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid operation type. Use "register" or "admin_register"' },
        { status: 400 }
      );
    }

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE - Remove registration (admin only)
export async function DELETE(request: Request) {
  try {
    await connectDB();

    // Verify admin access
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!registrationId && !userId) {
      return NextResponse.json({ success: false, message: 'Registration ID or User ID is required' }, { status: 400 });
    }

    let deletedRegistration;

    if (registrationId) {
      // Delete by registration ID
      deletedRegistration = await Registration.findByIdAndDelete(registrationId);
    } else {
      // Delete by user ID
      deletedRegistration = await Registration.findOneAndDelete({ userId });
    }

    if (!deletedRegistration) {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Registration removed successfully',
      deletedRegistration: {
        id: deletedRegistration._id,
        userId: deletedRegistration.userId,
        cleaningDayId: deletedRegistration.cleaningDayId,
        cleaningDayName: deletedRegistration.cleaningDayName
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
