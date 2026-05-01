import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/models/database';
import CourseRegistration from '@/models/CourseRegistration';

export async function DELETE(request: NextRequest) {
  try {
    // Get submission ID from query parameter or JSON body
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('id');

    let submissionIdToDelete;
    if (submissionId) {
      submissionIdToDelete = submissionId;
    } else {
      const body = await request.json();
      submissionIdToDelete = body.userId;
    }

    if (!submissionIdToDelete) {
      return NextResponse.json(
        { success: false, message: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find and delete the course registration by document ID
    const deletedRegistration = await CourseRegistration.findByIdAndDelete(submissionIdToDelete);

    if (!deletedRegistration) {
      return NextResponse.json(
        { success: false, message: 'No course registration found with this ID' },
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
