import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/overview - Get overview data (requires authentication only)
export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    // Middleware already verified authentication, just check if userId exists
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all students with their courses and religion status (optimized)
    const users = await prisma.user.findMany({
      where: {
        studentProfile: {
          isNot: null
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        roleId: true,
        role: {
          select: {
            name: true
          }
        },
        studentProfile: {
          select: {
            studentId: true,
            currentGPA: true,
            tuition: true,
            tuitionPaid: true,
            takesReligion: true,
            enrolledCourses: {
              select: {
                id: true,
                courseName: true,
                credits: true,
                status: true
              }
            }
          }
        },
        studentAssignments: {
          select: {
            status: true,
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImageUrl: true,
                role: {
                  select: {
                    name: true
                  }
                },
                teacherProfile: {
                  select: {
                    teacherId: true,
                    department: true
                  }
                }
              }
            }
          },
          where: {
            status: 'verified'
          },
          take: 1
        }
      }
    });

    // Transform to expected format including religion status
    const students = users.map((user: any) => {
      const profile = user.studentProfile;
      const tutorAssignment = user.studentAssignments[0] || null;
      const tutor = tutorAssignment?.teacher || null;
      
      // Calculate totalCredits from enrolled courses instead of using stored value
      const calculatedTotalCredits = (profile?.enrolledCourses || []).reduce(
        (sum: number, course: any) => sum + (course.credits || 0), 0
      );

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        studentId: profile?.studentId || '',
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        roleId: user.roleId,
        role: user.role?.name || 'Student',
        currentGPA: profile?.currentGPA || 0,
        totalCredits: calculatedTotalCredits,
        coursesCount: profile?.enrolledCourses?.length || 0,
        tuition: profile?.tuition || null,
        tuitionPaid: profile?.tuitionPaid || false,
        takesReligion: profile?.takesReligion || false,
        enrolledCourses: profile?.enrolledCourses || [],
        grades: profile?.grades || [],
        assignedTutor: tutor ? {
          id: tutor.id,
          firstName: tutor.firstName,
          lastName: tutor.lastName,
          profileImageUrl: tutor.profileImageUrl
        } : null,
        tutor: tutor ? {
          id: tutor.id,
          firstName: tutor.firstName,
          lastName: tutor.lastName,
          email: tutor.email,
          profileImageUrl: tutor.profileImageUrl,
          role: tutor.role?.name || 'teacher',
          teacherId: tutor.teacherProfile?.teacherId,
          department: tutor.teacherProfile?.department
        } : null,
        hasTutor: !!tutor
      };
    });

    // Calculate statistics for enhanced dashboard
    const totalStudents = students.length;
    const studentsWithTutor = students.filter(s => s.hasTutor).length;
    const studentsWithoutTutor = totalStudents - studentsWithTutor;
    const tuitionPaidCount = students.filter(s => s.tuitionPaid).length;
    const tuitionUnpaidCount = totalStudents - tuitionPaidCount;
    
    // GPA distribution
    const gpaRanges = {
      '3.5-4.0': students.filter(s => s.currentGPA >= 3.5).length,
      '3.0-3.49': students.filter(s => s.currentGPA >= 3.0 && s.currentGPA < 3.5).length,
      '2.5-2.99': students.filter(s => s.currentGPA >= 2.5 && s.currentGPA < 3.0).length,
      '2.0-2.49': students.filter(s => s.currentGPA >= 2.0 && s.currentGPA < 2.5).length,
      'Below 2.0': students.filter(s => s.currentGPA < 2.0).length,
    };
    
    // Course enrollment by department (extract from course names)
    const courseDepartments: { [key: string]: number } = {};
    students.forEach(student => {
      student.enrolledCourses.forEach((course: any) => {
        const dept = course.department || 'General';
        courseDepartments[dept] = (courseDepartments[dept] || 0) + 1;
      });
    });

    // Group students by tutor for assignment display
    const tutorGroups: { [key: string]: any } = {};
    students.forEach(student => {
      if (student.tutor) {
        const tutorKey = `${student.tutor.firstName} ${student.tutor.lastName}`;
        if (!tutorGroups[tutorKey]) {
          tutorGroups[tutorKey] = {
            tutor: student.tutor,
            students: [],
            studentCount: 0,
            averageGPA: 0
          };
        }
        tutorGroups[tutorKey].students.push(student);
        tutorGroups[tutorKey].studentCount++;
      }
    });

    // Calculate average GPA per tutor
    Object.keys(tutorGroups).forEach((tutorKey: string) => {
      const group = tutorGroups[tutorKey];
      const totalGPA = group.students.reduce((sum: number, s: any) => sum + s.currentGPA, 0);
      group.averageGPA = totalGPA / group.studentCount;
    });

    // Calculate average GPA across all students
    const averageGPA = students.length > 0 
      ? students.reduce((sum: number, s: any) => sum + s.currentGPA, 0) / students.length 
      : 0;

    // Fetch attendance data in parallel (optimized)
    const [totalRegistrations, attendanceCount] = await Promise.all([
      prisma.cleaningRegistration.count(),
      prisma.attendanceRecord.count({
        where: {
          status: 'ATTENDED'
        }
      })
    ]);

    const attendanceRate = totalRegistrations > 0 
      ? ((attendanceCount / totalRegistrations) * 100).toFixed(1)
      : '0';

    const statistics = {
      totalStudents,
      studentsWithTutor,
      studentsWithoutTutor,
      tuitionPaidCount,
      tuitionUnpaidCount,
      gpaDistribution: gpaRanges,
      courseDepartments,
      tutorGroups,
      averageGPA: averageGPA.toFixed(2),
      attendanceRate,
      totalRegistrations,
      totalAttended: attendanceCount
    };

    return NextResponse.json({ students, statistics });
  } catch (error) {
    console.error('Error fetching overview data:', error);
    return NextResponse.json({ error: 'Failed to fetch overview data' }, { status: 500 });
  }
}