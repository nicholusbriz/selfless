import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import CourseRegistration from '@/models/CourseRegistration';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    // Get all course registrations for current academic year
    const currentYear = new Date().getFullYear().toString();
    const registrations = await CourseRegistration.find({
      academicYear: currentYear
    })
    .populate('userId', 'firstName lastName email')
    .sort({ registrationDate: -1 });

    // Format the response
    const formattedRegistrations = registrations.map(registration => ({
      id: registration._id,
      user: registration.userId,
      courses: registration.courses,
      totalCredits: registration.totalCredits,
      takesReligion: registration.takesReligion,
      registrationDate: registration.registrationDate,
      lastUpdated: registration.lastUpdated,
      semester: registration.semester,
      academicYear: registration.academicYear
    }));

    return NextResponse.json({
      success: true,
      registrations: formattedRegistrations,
      totalRegistrations: formattedRegistrations.length,
      academicYear: currentYear
    });

  } catch (error: any) {
    console.error('Fetch all course registrations error:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to retrieve course registrations' 
    }, { status: 500 });
  }
}
