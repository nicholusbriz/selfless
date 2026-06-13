import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

// GET /api/admin/reports/gpa-distribution - GPA stats
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

    const students = await (prisma as any).studentProfile.findMany({
      select: {
        currentGPA: true,
        totalCredits: true
      }
    });

    const distribution = {
      excellent: students.filter((s: any) => s.currentGPA >= 3.5).length,
      good: students.filter((s: any) => s.currentGPA >= 3.0 && s.currentGPA < 3.5).length,
      satisfactory: students.filter((s: any) => s.currentGPA >= 2.5 && s.currentGPA < 3.0).length,
      fair: students.filter((s: any) => s.currentGPA >= 2.0 && s.currentGPA < 2.5).length,
      needsImprovement: students.filter((s: any) => s.currentGPA < 2.0).length,
      averageGPA: students.length > 0 
        ? students.reduce((sum: number, s: any) => sum + s.currentGPA, 0) / students.length 
        : 0,
      totalStudents: students.length
    };

    return NextResponse.json({ distribution });
  } catch (error) {
    console.error('Error fetching GPA distribution:', error);
    return NextResponse.json({ error: 'Failed to fetch GPA distribution' }, { status: 500 });
  }
}
