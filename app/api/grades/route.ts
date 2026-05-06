import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/models/database';
import CourseRegistration from '@/models/CourseRegistration';
import User from '@/models/User';
import StudentGrade from '@/models/StudentGrade';

/**
 * API Route: /api/grades
 * 
 * Handles all grade management operations:
 * - GET: Get all students with their courses and grades
 * - POST: Save/update student grades
 * - PUT: Update multiple grades at once
 * - DELETE: Delete grade records
 */

/**
 * GET /api/grades
 * 
 * Returns all students with their course registrations and existing grades
 * Query parameters:
 * - studentId: Get specific student's grades
 * - tutorId: Get grades assigned by specific tutor
 * - semester: Filter by semester
 * - academicYear: Filter by academic year
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const tutorId = searchParams.get('tutorId');
    const semester = searchParams.get('semester');
    const academicYear = searchParams.get('academicYear');

    // Build query filter
    const gradeFilter: any = {};
    if (studentId) gradeFilter.studentId = studentId;
    if (tutorId) gradeFilter.tutorId = tutorId;
    if (semester) gradeFilter.semester = semester;
    if (academicYear) gradeFilter.academicYear = academicYear;

    // If specific student requested
    if (studentId) {
      const courseRegistration = await CourseRegistration.findOne({ userId: studentId })
        .populate('userId', 'firstName lastName email');

      if (!courseRegistration || !courseRegistration.userId) {
        return NextResponse.json(
          { success: false, error: 'Student course registration not found' },
          { status: 404 }
        );
      }

      const studentGrades = await StudentGrade.find({ studentId })
        .populate('tutorId', 'firstName lastName')
        .sort({ courseName: 1 });

      const coursesWithGrades = courseRegistration.courses.map((course: any) => {
        const existingGrade = studentGrades.find((grade: any) =>
          grade.courseName === course.name
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

      return NextResponse.json({
        success: true,
        data: {
          student: {
            id: courseRegistration.userId._id,
            firstName: courseRegistration.userId.firstName,
            lastName: courseRegistration.userId.lastName,
            email: courseRegistration.userId.email
          },
          courses: coursesWithGrades,
          takesReligion: courseRegistration.takesReligion,
          totalCredits: courseRegistration.totalCredits,
          semester: courseRegistration.semester,
          academicYear: courseRegistration.academicYear
        }
      });
    }

    // Get all students with grades
    const courseRegistrations = await CourseRegistration.find({})
      .populate('userId', 'firstName lastName email')
      .sort({ 'userId.lastName': 1, 'userId.firstName': 1 });

    const allGrades = await StudentGrade.find(gradeFilter)
      .populate('tutorId', 'firstName lastName');

    // Filter out registrations with null userId and map to students data
    const studentsData = courseRegistrations
      .filter(registration => registration.userId) // Filter out null userId
      .map(registration => {
        const studentGrades = allGrades.filter(grade =>
          grade.studentId.toString() === registration.userId._id.toString()
        );

        const coursesWithGrades = registration.courses.map((course: any) => {
          const existingGrade = studentGrades.find(grade =>
            grade.courseName === course.name
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
    console.error('Error in GET /api/grades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch grades' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/grades
 * 
 * Save or update a single student grade
 * Request body:
 * {
 *   studentId: string,
 *   courseName: string,
 *   gradeLetter: string,
 *   tutorId: string,
 *   credits: number,
 *   semester?: string,
 *   academicYear?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { studentId, courseName, gradeLetter, tutorId, credits, semester, academicYear } = body;

    // Validate required fields
    if (!studentId || !courseName || !gradeLetter || !tutorId || !credits) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: studentId, courseName, gradeLetter, tutorId, credits' },
        { status: 400 }
      );
    }

    // Validate grade letter
    const validGrades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E', 'F', 'UW', 'CR', 'I', 'IP', 'NC', 'NR', 'P', 'T', 'W', 'AU', 'V'];
    if (!validGrades.includes(gradeLetter.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid grade letter' },
        { status: 400 }
      );
    }

    // Verify student exists and has course registration
    const studentRegistration = await CourseRegistration.findOne({ userId: studentId });
    if (!studentRegistration) {
      return NextResponse.json(
        { success: false, error: 'Student course registration not found' },
        { status: 404 }
      );
    }

    // Verify course exists in student's registration
    const courseExists = studentRegistration.courses.some((course: any) =>
      course.name === courseName
    );
    if (!courseExists) {
      return NextResponse.json(
        { success: false, error: 'Course not found in student registration' },
        { status: 404 }
      );
    }

    // Generate course code
    const courseCode = courseName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .substring(0, 6)
      .toUpperCase()
      .trim() + Math.floor(Math.random() * 100);

    // Update or create grade record
    const gradeRecord = await StudentGrade.findOneAndUpdate(
      {
        studentId,
        courseName,
        academicYear: academicYear || new Date().getFullYear().toString()
      },
      {
        studentId,
        courseName,
        courseCode,
        credits,
        gradeLetter: gradeLetter.toUpperCase(),
        tutorId,
        gradedAt: new Date(),
        semester: semester || 'Current',
        academicYear: academicYear || new Date().getFullYear().toString()
      },
      { upsert: true, returnDocument: 'after' }
    ).populate('tutorId', 'firstName lastName');

    return NextResponse.json({
      success: true,
      data: gradeRecord,
      message: 'Grade saved successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/grades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save grade' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/grades
 * 
 * Update multiple grades at once
 * Request body:
 * {
 *   grades: [
 *     {
 *       studentId: string,
 *       courseName: string,
 *       gradeLetter: string,
 *       tutorId: string,
 *       credits: number
 *     }
 *   ]
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { grades } = body;

    if (!grades || !Array.isArray(grades)) {
      return NextResponse.json(
        { success: false, error: 'Grades array is required' },
        { status: 400 }
      );
    }

    const validGrades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E', 'F', 'UW', 'CR', 'I', 'IP', 'NC', 'NR', 'P', 'T', 'W', 'AU', 'V'];
    const results = [];

    for (const gradeData of grades) {
      const { studentId, courseName, gradeLetter, tutorId, credits, semester, academicYear } = gradeData as any;

      // Validate required fields
      if (!studentId || !courseName || !gradeLetter || !tutorId || !credits) {
        results.push({
          success: false,
          courseName,
          error: 'Missing required fields'
        });
        continue;
      }

      // Validate grade letter
      if (!validGrades.includes(gradeLetter.toUpperCase())) {
        results.push({
          success: false,
          courseName,
          error: 'Invalid grade letter'
        });
        continue;
      }

      try {
        // Generate course code
        const courseCode = courseName
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .substring(0, 6)
          .toUpperCase()
          .trim() + Math.floor(Math.random() * 100);

        const gradeRecord = await StudentGrade.findOneAndUpdate(
          {
            studentId,
            courseName,
            academicYear: academicYear || new Date().getFullYear().toString()
          },
          {
            studentId,
            courseName,
            courseCode,
            credits,
            gradeLetter: gradeLetter.toUpperCase(),
            tutorId,
            gradedAt: new Date(),
            semester: semester || 'Current',
            academicYear: academicYear || new Date().getFullYear().toString()
          },
          { upsert: true, returnDocument: 'after' }
        );

        results.push({
          success: true,
          courseName,
          data: gradeRecord
        });

      } catch (error) {
        results.push({
          success: false,
          courseName,
          error: 'Failed to save grade'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: failureCount === 0,
      data: results,
      message: `Updated ${successCount} grades${failureCount > 0 ? ` (${failureCount} failed)` : ''}`
    });

  } catch (error) {
    console.error('Error in PUT /api/grades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update grades' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/grades
 * 
 * Delete grade records
 * Query parameters:
 * - studentId: Delete all grades for a student
 * - gradeId: Delete specific grade record
 * - tutorId: Delete all grades assigned by a tutor
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const gradeId = searchParams.get('gradeId');
    const tutorId = searchParams.get('tutorId');

    let deleteResult;

    if (gradeId) {
      // Delete specific grade record
      deleteResult = await StudentGrade.findByIdAndDelete(gradeId);
    } else if (studentId) {
      // Delete all grades for a student with timeout and better error handling
      try {
        // Set a shorter timeout for the delete operation
        deleteResult = await Promise.race([
          StudentGrade.deleteMany({ studentId }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Database operation timeout')), 5000)
          )
        ]);
      } catch (timeoutError) {
        console.error('Delete operation timeout:', timeoutError);
        return NextResponse.json(
          { success: false, error: 'Database operation timed out. Please try again.' },
          { status: 408 }
        );
      }
    } else if (tutorId) {
      // Delete all grades assigned by a tutor
      deleteResult = await StudentGrade.deleteMany({ tutorId });
    } else {
      return NextResponse.json(
        { success: false, error: 'Must specify gradeId, studentId, or tutorId' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deleteResult,
      message: 'Grade(s) deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/grades:', error);

    // Handle specific timeout errors
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { success: false, error: 'Database operation timed out. Please try again.' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete grades' },
      { status: 500 }
    );
  }
}
