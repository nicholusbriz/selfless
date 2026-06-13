import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

// GET /api/admin/students - Get all students with filters
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true }
    });

    if (!user || user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const gpaMin = searchParams.get('gpaMin');
    const gpaMax = searchParams.get('gpaMax');
    const search = searchParams.get('search');
    const roleFilter = searchParams.get('role');

    const where: any = {};

    if (gpaMin !== null || gpaMax !== null) {
      where.studentProfile = {};
      if (gpaMin) where.studentProfile.currentGPA = { ...where.studentProfile.currentGPA, gte: parseFloat(gpaMin) };
      if (gpaMax) where.studentProfile.currentGPA = { ...where.studentProfile.currentGPA, lte: parseFloat(gpaMax) };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filter by role (student, teacher, admin, or all)
    if (roleFilter && roleFilter !== 'all') {
      where.role = {
        name: roleFilter
      };
    }

    // Fetch all users (not just students) as potential students for assignment
    const users = await prisma.user.findMany({
      where,
      include: {
        role: true,
        studentProfile: {
          include: {
            enrolledCourses: true,
            grades: true
          }
        },
        teacherProfile: true,
        adminProfile: true
      }
    });

    const formattedStudents = users.map((user: any) => {
      const profile = user.studentProfile;
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        studentId: profile?.studentId || '',
        email: user.email,
        roleId: user.roleId,
        role: user.role,
        currentGPA: profile?.currentGPA || 0,
        totalCredits: profile?.totalCredits || 0,
        coursesCount: profile?.enrolledCourses?.length || 0,
        tuition: profile?.tuition || null,
        tuitionPaid: profile?.tuitionPaid || false,
        enrolledCourses: profile?.enrolledCourses || [],
        grades: profile?.grades || []
      };
    });

    return NextResponse.json({ students: formattedStudents });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
