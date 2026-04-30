import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/models/database';
import CourseRegistration from '@/models/CourseRegistration';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find and delete the user's course registration
    const deletedRegistration = await CourseRegistration.findOneAndDelete({ userId });

    if (!deletedRegistration) {
      return NextResponse.json(
        { success: false, message: 'No course registration found for this user' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course registrations cleared successfully',
      data: {
        deletedRegistration: {
          userId: deletedRegistration.userId,
          coursesCount: deletedRegistration.courses.length,
          totalCredits: deletedRegistration.totalCredits,
          takesReligion: deletedRegistration.takesReligion
        }
      }
    });

  } catch (error) {
    
    return NextResponse.json(
      { success: false, message: 'Failed to clear course registrations' },
      { status: 500 }
    );
  }
}
