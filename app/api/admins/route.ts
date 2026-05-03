import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
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

    // Prevent removing the super admin
    if (isSuperAdminEmail(adminToRemove.email)) {
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

    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// POST - Check admin status or add new admin (type-based routing)
export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { type, email, userId, firstName, lastName, role, permissions } = body;

    if (type === 'check') {
      // Check admin status (from check/route.ts)
      if (!email || !userId) {
        return NextResponse.json(
          { success: false, message: 'Email and userId are required' },
          { status: 400 }
        );
      }

      // First check if super admin
      if (isSuperAdminEmail(email)) {
        return NextResponse.json({
          success: true,
          admin: {
            id: userId,
            email: email,
            role: 'super-admin',
            isActive: true,
            permissions: {
              canManageUsers: true,
              canManageCourses: true,
              canManageAnnouncements: true,
              canManageTutors: true,
              canManageAdmins: true,
              canDeleteData: true
            }
          }
        });
      }

      // Check if promoted admin in database
      const admin = await Admin.findOne({
        $or: [
          { email: email.toLowerCase() },
          { userId: userId }
        ]
      });

      if (!admin || !admin.isActive) {
        return NextResponse.json(
          { success: false, message: 'Admin not found or inactive' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        admin: {
          id: admin.userId,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          fullName: admin.fullName,
          role: admin.role,
          permissions: admin.permissions,
          isActive: admin.isActive
        }
      });

    } else if (type === 'add') {
      // Add new admin (original POST functionality)
      // Verify admin access
      const adminData = await verifyAdminToken(request);
      if (!adminData) {
        return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 401 });
      }

      const { user } = adminData;
      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }

      // Only super admin can add new admins
      if (!adminData.isSuperAdmin) {
        return NextResponse.json({ success: false, message: 'Super admin access required' }, { status: 403 });
      }

      const { targetUserId, targetEmail, targetFirstName, targetLastName, targetRole } = body;

      if (!targetUserId || !targetEmail) {
        return NextResponse.json({ success: false, message: 'User ID and email are required' }, { status: 400 });
      }

      // Check if user exists
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }

      // Check if user is already an admin
      const existingAdmin = await Admin.findOne({ userId: targetUserId });
      if (existingAdmin) {
        return NextResponse.json({ success: false, message: 'User is already an admin' }, { status: 400 });
      }

      // Create new admin
      const newAdmin = new Admin({
        userId: targetUserId,
        email: targetEmail.toLowerCase(),
        firstName: targetFirstName || targetUser.firstName,
        lastName: targetLastName || targetUser.lastName,
        fullName: `${targetFirstName || targetUser.firstName} ${targetLastName || targetUser.lastName}`,
        role: targetRole || 'admin',
        permissions: permissions || {
          canManageUsers: true,
          canManageCourses: true,
          canManageAnnouncements: true,
          canManageTutors: false,
          canManageAdmins: false,
          canDeleteData: false
        },
        isActive: true,
        createdBy: user._id.toString(),
        createdAt: new Date()
      });

      await newAdmin.save();

      return NextResponse.json({
        success: true,
        message: 'Admin added successfully',
        admin: {
          id: newAdmin.userId,
          email: newAdmin.email,
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          fullName: newAdmin.fullName,
          role: newAdmin.role,
          permissions: newAdmin.permissions,
          isActive: newAdmin.isActive
        }
      });

    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid operation type. Use "check" or "add"' },
        { status: 400 }
      );
    }

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

