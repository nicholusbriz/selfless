import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/models/database';
import CourseRegistration from '@/models/CourseRegistration';
import User from '@/models/User';
import StudentGrade from '@/models/StudentGrade';

/**
 * GET /api/grades/students
 * 
 * Returns all students with their course registrations and existing grades
 * Accessible by tutors and admins only
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get all course registrations with student info
    const courseRegistrations = await CourseRegistration.find({})
      .populate('userId', 'firstName lastName email')
      .sort({ 'userId.lastName': 1, 'userId.firstName': 1 });

    // Get all existing grades
    const allGrades = await StudentGrade.find({})
      .populate('tutorId', 'firstName lastName');

    // Combine course registrations with grades
    const studentsData = courseRegistrations.map(registration => {
      const studentGrades = allGrades.filter(grade =>
        grade.studentId.toString() === registration.userId._id.toString()
      );

      const coursesWithGrades = registration.courses.map((course: any) => {
        const existingGrade = studentGrades.find((grade: any) =>
          grade.studentId.toString() === registration.userId._id.toString()
        );

        return {
          name: course.name,
          credits: course.credits,
          grade: existingGrade?.gradeLetter || '',
          gradedBy: existingGrade?.tutorId ? {
            id: existingGrade.tutorId._id,
            name: `${existingGrade.tutorId.firstName} ${existingGrade.tutorId.lastName}`
          } : null,
          gradedAt: existingGrade?.gradedAt || null
        };
      });

      return {
        id: registration.userId._id,
        firstName: registration.userId.firstName,
        lastName: registration.userId.lastName,
        email: registration.userId.email,
        courses: coursesWithGrades,
        takesReligion: registration.takesReligion,
        totalCredits: registration.totalCredits,
        semester: registration.semester,
        academicYear: registration.academicYear,
        registrationDate: registration.registrationDate,
        gradedCoursesCount: coursesWithGrades.filter((c: any) => c.grade !== '').length,
        totalCoursesCount: coursesWithGrades.length,
        isFullyGraded: coursesWithGrades.every((c: any) => c.grade !== '')
      };
    });

    return NextResponse.json({
      success: true,
      data: studentsData
    });

  } catch (error) {
    console.error('Error fetching students with grades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
