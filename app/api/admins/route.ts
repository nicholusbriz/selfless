import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

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

  const token = cookies['auth-token'];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.userId);
    if (!user) return null;

    // Check if user is admin (either hardcoded super admin or promoted admin)
    const isSuperAdmin = user.email === 'atbriz256@gmail.com';
    const promotedAdmin = await Admin.findOne({ userId: user._id.toString() });

    if (!isSuperAdmin && !promotedAdmin) return null;

    return { user, isSuperAdmin, promotedAdmin };
  } catch {
    return null;
  }
}

// GET - Fetch all admins
export async function GET(request: Request) {
  try {
    await connectDB();

    // Verify admin access
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 401 });
    }

    const { user } = adminData;

    // Any admin can view all admins
    const admins = await Admin.find({})
      .populate('userId', 'email firstName lastName')
      .populate('addedBy', 'firstName lastName email')
      .sort({ addedAt: -1 });

    return NextResponse.json({
      success: true,
      admins: admins.map(admin => ({
        id: admin._id,
        userId: admin.userId,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        fullName: admin.fullName,
        addedBy: admin.addedBy,
        addedAt: admin.addedAt,
        role: admin.role
      }))
    });

  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// POST - Add a new admin
export async function POST(request: Request) {
  try {
    await connectDB();

    // Verify admin access
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 401 });
    }

    const { user } = adminData;

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    // Find the user to make an admin
    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'User not found with this email' }, { status: 404 });
    }

    // Check if user is already an admin
    const existingAdmin = await Admin.findOne({ userId: targetUser._id.toString() });
    if (existingAdmin) {
      return NextResponse.json({ success: false, message: 'User is already an admin' }, { status: 400 });
    }

    // Don't allow promoting the super admin again
    if (targetUser.email === 'atbriz256@gmail.com') {
      return NextResponse.json({ success: false, message: 'This user is already a super admin' }, { status: 400 });
    }

    // Create new admin with full permissions (equal to super admin)
    const newAdmin = new Admin({
      userId: targetUser._id.toString(),
      email: targetUser.email,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      fullName: `${targetUser.firstName} ${targetUser.lastName}`,
      addedBy: user._id.toString(),
      permissions: {
        canManageUsers: true,
        canManageCourses: true,
        canManageAnnouncements: true,
        canManageTutors: true,
        canManageAdmins: true, // Can manage other admins
        canDeleteData: true, // Can delete data
      },
      role: 'admin'
    });

    await newAdmin.save();

    return NextResponse.json({
      success: true,
      message: 'Admin added successfully',
      admin: {
        id: newAdmin._id,
        userId: newAdmin.userId,
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        fullName: newAdmin.fullName,
        addedAt: newAdmin.addedAt,
        role: newAdmin.role
      }
    });

  } catch (error) {
    console.error('Error adding admin:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE - Remove an admin
export async function DELETE(request: Request) {
  try {
    await connectDB();

    // Verify admin access
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 401 });
    }

    const { user } = adminData;

    const { adminId } = await request.json();

    if (!adminId) {
      return NextResponse.json({ success: false, message: 'Admin ID is required' }, { status: 400 });
    }

    // Get the admin to be removed
    const adminToRemove = await Admin.findById(adminId);
    if (!adminToRemove) {
      return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 });
    }

    // Prevent removing the hardcoded super admin
    if (adminToRemove.email === 'atbriz256@gmail.com') {
      return NextResponse.json({ success: false, message: 'Cannot remove the super admin' }, { status: 403 });
    }

    // Hard delete - completely remove the admin from database
    const admin = await Admin.findByIdAndDelete(adminId);

    if (!admin) {
      return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin removed successfully from database'
    });

  } catch (error) {
    console.error('Error removing admin:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

