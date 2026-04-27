import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import CourseRegistration from '@/models/CourseRegistration';

export async function GET() {
  try {
    await connectDB();

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
    console.error('Fetch all course registrations error:', error);

    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retrieve course registrations'
    }, { status: 500 });
  }
}
