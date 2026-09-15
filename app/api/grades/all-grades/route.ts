import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getServerAuthUser } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerAuthUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view grades (admin or teacher)
    const hasPermission = user.role?.name === 'admin' || user.role?.name === 'teacher' || user.role?.name === 'super_admin';
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Only teachers and admins can access the grading interface' }, { status: 403 });
    }

    // Get tech center ID from query or use user's tech center
    const searchParams = request.nextUrl.searchParams;
    const techCenterId = searchParams.get('techCenterId') || user.techCenterId;

    if (!techCenterId) {
      return NextResponse.json({ error: 'Tech center ID required' }, { status: 400 });
    }

    // If teacher, only show their assigned students
    let studentIds: string[] = [];
    if (user.role?.name === 'teacher') {
      const assignedStudents = await prisma.user.findMany({
        where: { teacherId: user.id },
        select: { id: true }
      });
      studentIds = assignedStudents.map(s => s.id);
    }

    // Fetch all grades for the tech center (or assigned students if teacher)
    const grades = await prisma.grade.findMany({
      where: {
        student: {
          techCenterId,
          ...(user.role?.name === 'teacher' && studentIds.length > 0 ? { id: { in: studentIds } } : {})
        }
      },
      include: {
        studentCourse: true,
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { week: 'asc' },
        { assignedAt: 'desc' }
      ]
    });

    return NextResponse.json({ grades });
  } catch (error) {
    console.error('Error fetching all grades:', error);
    return NextResponse.json({ error: 'Failed to fetch grades' }, { status: 500 });
  }
}
