import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import Admin from '@/models/Admin';
import { isSuperAdminEmail } from '@/config/admin';

export async function POST(request: Request) {
  try {
    await connectDB();

    const { email, userId } = await request.json();

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

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
