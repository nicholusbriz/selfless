import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/reports/gpa-distribution - GPA stats
export async function GET(request: NextRequest) {
  try {
    // Get user info from proxy headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    // Proxy already verified authentication, just check if userId exists
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check for admin role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }

    const students = await prisma.studentProfile.findMany({
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