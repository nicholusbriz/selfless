import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import CourseRegistration from '@/models/CourseRegistration';
import User from '@/models/User';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';
import { isSuperAdminEmail } from '@/config/admin';

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

// Cache configuration for PWA performance
export const revalidate = 120; // Revalidate every 2 minutes for course registrations

export async function GET(request: Request) {
  try {
    await connectDB();

    // Verify admin access
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 401 });
    }

    // Get all course registrations for current academic year
    const currentYear = new Date().getFullYear().toString();
    const registrations = await CourseRegistration.find({
      academicYear: currentYear
    })
      .populate('userId', 'firstName lastName email phoneNumber')
      .sort({ registrationDate: -1 });

    // Format the response
    const formattedRegistrations = registrations
      .filter(registration => registration.userId) // Filter out registrations with null userId
      .map(registration => {
        const regObj = registration.toObject();
        return {
          id: registration._id,
          userId: registration.userId._id, // Add userId for clear functionality
          user: registration.userId,
          courses: registration.courses,
          totalCredits: registration.totalCredits,
          takesReligion: registration.takesReligion,
          religion: registration.religion || regObj.religion, // Include any religion field if it exists
          registrationDate: registration.registrationDate,
          lastUpdated: registration.lastUpdated,
          semester: registration.semester,
          academicYear: registration.academicYear,
          // Include all other fields to see what's available
          ...regObj
        };
      });

    return NextResponse.json({
      success: true,
      registrations: formattedRegistrations,
      totalRegistrations: formattedRegistrations.length,
      academicYear: currentYear
    });

  } catch (error) {


    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retrieve course registrations'
    }, { status: 500 });
  }
}
