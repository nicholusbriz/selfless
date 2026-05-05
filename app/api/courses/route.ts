import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/models/database';
import CourseRegistration from '@/models/CourseRegistration';
import User from '@/models/User';
import { verifyAdminToken, verifyUserToken } from '@/lib/auth-server';

/**
 * Unified Course API - Handles all course operations in one file
 * 
 * Methods supported:
 * - GET: Fetch courses (all students or specific user)
 * - POST: Create new course registration
 * - PUT: Update course registration
 * - DELETE: Remove course registration
 */

// GET - Fetch courses
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const submissionId = searchParams.get('submissionId');

    // Determine current academic year
    const currentYear = new Date().getFullYear().toString();

    // Build query based on request type
    let query: any = { academicYear: currentYear };

    if (submissionId) {
      // Get specific submission by ID
      query._id = submissionId;
    } else if (isAdmin) {
      // Admin request: verify admin privileges
      const adminData = await verifyAdminToken(request);
      if (!adminData) {
        return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 401 });
      }
      // Don't filter - show all courses for admin
    } else if (userId && email) {
      // User-specific request: verify user identity
      const user = await verifyUserToken(request);
      if (!user || (user.id !== userId && user.email !== decodeURIComponent(email))) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      }
      query.userId = userId;
    } else {
      // Regular user request: verify user is logged in (for viewing all courses)
      const user = await verifyUserToken(request);
      if (!user) {
        return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
      }
      // Don't filter by userId - show all courses for all authenticated users
    }

    const registrations = await CourseRegistration.find(query)
      .populate('userId', 'firstName lastName email phoneNumber')
      .sort({ registrationDate: -1 });

    // Format response
    const formattedRegistrations = registrations
      .filter(registration => registration.userId)
      .map(registration => {
        const regObj = registration.toObject();
        return {
          id: registration._id,
          userId: registration.userId._id,
          user: registration.userId,
          courses: registration.courses,
          totalCredits: registration.totalCredits,
          takesReligion: registration.takesReligion,
          academicYear: registration.academicYear,
          registrationDate: registration.registrationDate,
          createdAt: registration.createdAt,
          updatedAt: registration.updatedAt
        };
      });

    return NextResponse.json({
      success: true,
      registrations: formattedRegistrations,
      count: formattedRegistrations.length
    });

  } catch (error) {
    console.error('GET /api/courses error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch courses',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}

// POST - Create new course registration
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify user is logged in
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { courses, takesReligion } = body;

    // Validate input
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json({ success: false, message: 'Courses array is required' }, { status: 400 });
    }

    // Check if user already has a registration for current year
    const currentYear = new Date().getFullYear().toString();
    const existingRegistration = await CourseRegistration.findOne({
      userId: user.id,
      academicYear: currentYear
    });

    if (existingRegistration) {
      return NextResponse.json({
        success: false,
        message: 'You have already registered for courses this year'
      }, { status: 400 });
    }

    // Calculate total credits
    const totalCredits = courses.reduce((sum: number, course: any) => sum + (course.credits || 0), 0);

    // Create new registration
    const registration = new CourseRegistration({
      userId: user.id,
      courses,
      takesReligion: takesReligion || false,
      totalCredits,
      academicYear: currentYear,
      registrationDate: new Date().toISOString()
    });

    await registration.save();

    // Update user registration status
    await User.findByIdAndUpdate(user.id, { isRegistered: true });

    return NextResponse.json({
      success: true,
      message: 'Course registration successful',
      registration: {
        id: registration._id,
        courses: registration.courses,
        totalCredits: registration.totalCredits,
        takesReligion: registration.takesReligion,
        academicYear: registration.academicYear,
        registrationDate: registration.registrationDate
      }
    });

  } catch (error) {
    console.error('POST /api/courses error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create course registration',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}

// PUT - Update course registration
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Verify user is logged in
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { submissionId, courses, takesReligion } = body;

    if (!submissionId) {
      return NextResponse.json({ success: false, message: 'Submission ID is required' }, { status: 400 });
    }

    // Find the registration
    const registration = await CourseRegistration.findById(submissionId);
    if (!registration) {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
    }

    // Check if user owns this registration or is admin
    const isAdmin = await verifyAdminToken(request);
    if (registration.userId.toString() !== user.id && !isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    // Update registration
    if (courses) {
      const totalCredits = courses.reduce((sum: number, course: any) => sum + (course.credits || 0), 0);
      registration.courses = courses;
      registration.totalCredits = totalCredits;
    }

    if (takesReligion !== undefined) {
      registration.takesReligion = takesReligion;
    }

    registration.updatedAt = new Date();
    await registration.save();

    return NextResponse.json({
      success: true,
      message: 'Course registration updated successfully',
      registration: {
        id: registration._id,
        courses: registration.courses,
        totalCredits: registration.totalCredits,
        takesReligion: registration.takesReligion,
        updatedAt: registration.updatedAt
      }
    });

  } catch (error) {
    console.error('PUT /api/courses error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update course registration',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}

// DELETE - Remove course registration
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');

    if (!submissionId) {
      return NextResponse.json({ success: false, message: 'Submission ID is required' }, { status: 400 });
    }

    // Verify user is logged in
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    // Find the registration
    const registration = await CourseRegistration.findById(submissionId);
    if (!registration) {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
    }

    // Check if user owns this registration or is admin
    const isAdmin = await verifyAdminToken(request);
    if (registration.userId.toString() !== user.id && !isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    // Delete the registration
    await CourseRegistration.findByIdAndDelete(submissionId);

    // Check if user has other registrations
    const remainingRegistrations = await CourseRegistration.findOne({
      userId: registration.userId
    });

    // Update user registration status if no more registrations
    if (!remainingRegistrations) {
      await User.findByIdAndUpdate(registration.userId, { isRegistered: false });
    }

    return NextResponse.json({
      success: true,
      message: 'Course registration deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/courses error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete course registration',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}
