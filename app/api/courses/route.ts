import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import CourseRegistration from '@/models/CourseRegistration';
import User from '@/models/User';

interface Course {
  name: string;
  credits: string | number;
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const { userId, courses, takesReligion, email } = await request.json();

    // Validate required fields
    if (!userId || !email || !courses || !Array.isArray(courses)) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Validate user exists and email matches
    const user = await User.findById(userId);
    if (!user || user.email !== email) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 403 });
    }

    // Validate courses data
    const totalCredits = courses.reduce((sum: number, course: Course) => {
      if (!course.name || !course.credits) {
        throw new Error('All courses must have name and credits');
      }
      return sum + (typeof course.credits === 'string' ? parseInt(course.credits) : course.credits);
    }, 0);

    if (totalCredits === 0) {
      return NextResponse.json({
        success: false,
        message: 'At least one course with valid credits is required'
      }, { status: 400 });
    }

    // Check if user already has courses registered for current academic year
    const currentYear = new Date().getFullYear().toString();
    const existingRegistration = await CourseRegistration.findOne({
      userId,
      academicYear: currentYear
    });

    if (existingRegistration) {
      // Update existing registration
      existingRegistration.courses = courses;
      existingRegistration.takesReligion = takesReligion;
      existingRegistration.totalCredits = totalCredits;
      existingRegistration.lastUpdated = new Date();

      await existingRegistration.save();

      return NextResponse.json({
        success: true,
        message: 'Course registration updated successfully',
        data: {
          id: existingRegistration._id,
          courses: existingRegistration.courses,
          totalCredits: existingRegistration.totalCredits,
          takesReligion: existingRegistration.takesReligion,
          registrationDate: existingRegistration.registrationDate,
          lastUpdated: existingRegistration.lastUpdated
        }
      });
    } else {
      // Create new registration
      const newRegistration = new CourseRegistration({
        userId,
        courses,
        takesReligion,
        totalCredits,
        academicYear: currentYear,
        semester: 'Current'
      });

      await newRegistration.save();

      return NextResponse.json({
        success: true,
        message: 'Course registration saved successfully',
        data: {
          id: newRegistration._id,
          courses: newRegistration.courses,
          totalCredits: newRegistration.totalCredits,
          takesReligion: newRegistration.takesReligion,
          registrationDate: newRegistration.registrationDate
        }
      });
    }

  } catch (error: unknown) {
    console.error('Course registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save course registration';

    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId || !email) {
      return NextResponse.json({
        success: false,
        message: 'Missing required parameters'
      }, { status: 400 });
    }

    // Verify user exists and email matches
    const user = await User.findById(userId);
    if (!user || user.email !== email) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 403 });
    }

    // Get user's course registrations
    const currentYear = new Date().getFullYear().toString();
    const registration = await CourseRegistration.findOne({
      userId,
      academicYear: currentYear
    }).populate('userId', 'firstName lastName email');

    if (!registration) {
      return NextResponse.json({
        success: true,
        hasRegistration: false,
        message: 'No courses found for this user'
      });
    }

    return NextResponse.json({
      success: true,
      hasRegistration: true,
      data: {
        id: registration._id,
        courses: registration.courses,
        totalCredits: registration.totalCredits,
        takesReligion: registration.takesReligion,
        registrationDate: registration.registrationDate,
        lastUpdated: registration.lastUpdated,
        semester: registration.semester,
        academicYear: registration.academicYear
      }
    });

  } catch (error: unknown) {
    console.error('Get courses error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve course registration';

    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
