import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import Tutor from '@/models/Tutor';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';
import { isSuperAdminEmail } from '@/config/admin';
import { AUTH_CONSTANTS } from '@/config/constants';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
    const promotedAdmin = await Admin.findOne({ userId: user._id.toString(), isActive: true });

    if (!isSuperAdmin && !promotedAdmin) return null;

    return { user, isSuperAdmin, promotedAdmin };
  } catch {
    return null;
  }
}

// Helper function to verify user token (for tutor checking)
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

    return { user };
  } catch {
    return null;
  }
}

// GET - Fetch all tutors
export async function GET(request: Request) {
  try {
    await connectDB();

    // Verify admin access
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 401 });
    }

    const { user } = adminData;

    const tutors = await Tutor.find({ isActive: true })
      .populate('userId', 'email firstName lastName')
      .populate('addedBy', 'firstName lastName email')
      .sort({ addedAt: -1 });

    return NextResponse.json({
      success: true,
      tutors: tutors.map(tutor => ({
        id: tutor._id,
        userId: tutor.userId,
        email: tutor.email,
        firstName: tutor.firstName,
        lastName: tutor.lastName,
        fullName: tutor.fullName,
        addedBy: tutor.addedBy,
        addedAt: tutor.addedAt,
        permissions: tutor.permissions
      }))
    });

  } catch (error) {

    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// POST - Add a new tutor
export async function POST(request: Request) {
  try {
    await connectDB();

    // Verify admin access
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 401 });
    }

    const { user } = adminData;

    const { email, permissions } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    // Find the user to make a tutor
    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'User not found with this email' }, { status: 404 });
    }

    // Check if user is already a tutor
    const existingTutor = await Tutor.findOne({ userId: targetUser._id.toString() });
    if (existingTutor) {
      return NextResponse.json({ success: false, message: 'User is already a tutor' }, { status: 400 });
    }

    // Create new tutor
    const newTutor = new Tutor({
      userId: targetUser._id.toString(),
      email: targetUser.email,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      fullName: `${targetUser.firstName} ${targetUser.lastName}`,
      addedBy: user._id.toString(),
      permissions: {
        canViewAnnouncements: permissions?.canViewAnnouncements ?? true,
        canPostAnnouncements: permissions?.canPostAnnouncements ?? true,
        canManageUsers: permissions?.canManageUsers ?? false
      }
    });

    await newTutor.save();

    return NextResponse.json({
      success: true,
      message: 'Tutor added successfully',
      tutor: {
        id: newTutor._id,
        userId: newTutor.userId,
        email: newTutor.email,
        firstName: newTutor.firstName,
        lastName: newTutor.lastName,
        fullName: newTutor.fullName,
        addedAt: newTutor.addedAt,
        permissions: newTutor.permissions
      }
    });

  } catch (error) {

    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE - Remove a tutor
export async function DELETE(request: Request) {
  try {
    await connectDB();

    // Verify admin access
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 401 });
    }

    const { user } = adminData;

    const { tutorId } = await request.json();

    if (!tutorId) {
      return NextResponse.json({ success: false, message: 'Tutor ID is required' }, { status: 400 });
    }

    // Hard delete - completely remove the tutor from database
    const tutor = await Tutor.findByIdAndDelete(tutorId);

    if (!tutor) {
      return NextResponse.json({ success: false, message: 'Tutor not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Tutor removed successfully from database'
    });

  } catch (error) {

    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
