import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import Registration from '@/models/Registration';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';
import { isSuperAdminEmail } from '@/config/admin';
import { AUTH_CONSTANTS } from '@/config/constants';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to verify admin/tutor token
async function verifyAuthorizedUser(request: Request) {
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

    // Check if user is admin, super admin, or tutor
    const isSuperAdmin = isSuperAdminEmail(user.email);
    const promotedAdmin = await Admin.findOne({ userId: user._id.toString() });
    const isTutor = user.isTutor || false;

    if (!isSuperAdmin && !promotedAdmin && !isTutor) return null;

    return { user, isSuperAdmin, promotedAdmin, isTutor };
  } catch {
    return null;
  }
}

// PUT - Update attendance status
export async function PUT(request: Request) {
  try {
    await connectDB();

    const authorizedUser = await verifyAuthorizedUser(request);
    if (!authorizedUser) {
      return NextResponse.json({ success: false, message: 'Access denied. Admin, tutor, or super admin access required.' }, { status: 401 });
    }

    const { registrationId, attendanceStatus, userId } = await request.json();

    if (!registrationId || !attendanceStatus || !['attended', 'no-show', 'pending'].includes(attendanceStatus)) {
      return NextResponse.json({ success: false, message: 'Invalid request data' }, { status: 400 });
    }

    // Find and update the registration
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
    }

    // Update attendance
    registration.attendanceStatus = attendanceStatus;
    registration.markedBy = authorizedUser.user._id.toString();
    registration.markedAt = new Date();
    await registration.save();

    // Get user details for response
    const studentUser = await User.findById(userId);
    const markedByUser = await User.findById(authorizedUser.user._id.toString());

    const actionMessage = attendanceStatus === 'pending' ? 'cleared' : `marked as ${attendanceStatus}`;

    return NextResponse.json({
      success: true,
      message: `Attendance ${actionMessage}`,
      data: {
        registrationId: registration._id,
        attendanceStatus: registration.attendanceStatus,
        markedBy: {
          id: markedByUser?._id,
          name: markedByUser?.firstName + ' ' + markedByUser?.lastName,
          email: markedByUser?.email
        },
        markedAt: registration.markedAt,
        student: {
          id: studentUser?._id,
          name: studentUser?.firstName + ' ' + studentUser?.lastName,
          email: studentUser?.email
        }
      }
    });

  } catch (error) {
    console.error('Attendance update error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// GET - Get attendance statistics
export async function GET(request: Request) {
  try {
    await connectDB();

    const authorizedUser = await verifyAuthorizedUser(request);
    if (!authorizedUser) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cleaningDayId = searchParams.get('cleaningDayId');

    let query = {};
    if (cleaningDayId) {
      query = { cleaningDayId: parseInt(cleaningDayId) };
    }

    const registrations = await Registration.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('markedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      total: registrations.length,
      pending: registrations.filter(reg => reg.attendanceStatus === 'pending').length,
      attended: registrations.filter(reg => reg.attendanceStatus === 'attended').length,
      noShow: registrations.filter(reg => reg.attendanceStatus === 'no-show').length
    };

    return NextResponse.json({
      success: true,
      stats,
      registrations
    });

  } catch (error) {
    console.error('Attendance fetch error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
