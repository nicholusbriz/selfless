import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/models/database';
import Announcement from '@/models/Announcement';
import User from '@/models/User';
import Tutor from '@/models/Tutor';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';
import { isSuperAdminEmail } from '@/config/admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to verify admin (super admin or promoted admin)
async function verifyAdmin(userId: string) {
  const user = await User.findById(userId);
  if (!user) return null;

  // Check if user is admin using admin.ts config
  const isSuperAdmin = isSuperAdminEmail(user.email);
  const promotedAdmin = await Admin.findOne({ userId: user._id.toString() });

  if (!isSuperAdmin && !promotedAdmin) return null;

  return { user, isSuperAdmin, promotedAdmin };
}

// DELETE announcement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const announcementId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!announcementId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing announcement ID or user ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get the announcement
    const announcement = await Announcement.findOne({
      _id: announcementId
    });

    if (!announcement) {
      return NextResponse.json(
        { success: false, message: 'Announcement not found' },
        { status: 404 }
      );
    }

    // Get the admin data for the user trying to delete
    const adminData = await verifyAdmin(userId);
    if (!adminData) {
      return NextResponse.json(
        { success: false, message: 'User not found or not authorized' },
        { status: 404 }
      );
    }

    const { user, isSuperAdmin } = adminData;

    // If not super admin, check if user is promoted admin or tutor
    if (!isSuperAdmin) {
      // Check if user is a promoted admin - if so, they can delete any announcement
      if (adminData.promotedAdmin) {
        // Promoted admins can delete any announcement
      } else {
        // Check if user is a tutor
        const tutor = await Tutor.findOne({ userId: user._id.toString() });
        if (!tutor) {
          return NextResponse.json(
            { success: false, message: 'Unauthorized: Only admins and tutors can delete announcements' },
            { status: 403 }
          );
        }

        // Check if tutor owns this announcement
        if (announcement.adminId !== user._id.toString()) {
          return NextResponse.json(
            { success: false, message: 'Unauthorized: You can only delete your own announcements' },
            { status: 403 }
          );
        }
      }
    }

    // Delete the announcement
    await Announcement.deleteOne({
      _id: announcementId
    });

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    
    return NextResponse.json(
      { success: false, message: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}
