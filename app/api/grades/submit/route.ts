import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getServerAuthUser } from '@/lib/auth/server';
import { createNotificationForUser } from '@/lib/notifications';
import {
  invalidJsonBodyResponse,
  isJsonObject,
  isNumber,
  isString,
  parseJsonBody,
  type JsonGuard,
} from '@/app/api/_lib/request-validation';

type GradeSubmission = {
  studentCourseId: string;
  studentId: string;
  week: string;
  gradeLetter: string;
  score?: number | null;
  notes?: string | null;
};

const isGradeSubmissionArray: JsonGuard<GradeSubmission[]> = (
  value,
): value is GradeSubmission[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      isJsonObject(item) &&
      isString(item.studentCourseId) &&
      isString(item.studentId) &&
      isString(item.week) &&
      item.week.trim() !== '' &&
      Number.isInteger(Number(item.week)) &&
      isString(item.gradeLetter) &&
      (item.score === undefined || item.score === null || isNumber(item.score)) &&
      (item.notes === undefined || item.notes === null || isString(item.notes)),
  );

export async function POST(request: NextRequest) {
  try {
    const user = await getServerAuthUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to assign grades (admin or teacher)
    const hasPermission = user.role?.name === 'admin' || user.role?.name === 'teacher' || user.role?.name === 'super_admin';
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await parseJsonBody(request, { grades: isGradeSubmissionArray });
    if (!body) return invalidJsonBodyResponse();
    const { grades } = body;

    if (!grades || !Array.isArray(grades)) {
      return NextResponse.json({ error: 'Invalid grades data' }, { status: 400 });
    }

    // Process each grade
    const results = [];
    for (const gradeData of grades) {
      const { studentCourseId, studentId, gradeLetter, score, notes } = gradeData;
      const week = Number(gradeData.week);

      // Validate required fields
      if (!studentCourseId || !studentId || !week || !gradeLetter) {
        results.push({ 
          success: false, 
          error: 'Missing required fields',
          data: gradeData 
        });
        continue;
      }

      // Get grade scale to determine grade points
      const gradeScale = await prisma.gradeScale.findUnique({
        where: { gradeLetter }
      });

      if (!gradeScale) {
        results.push({ 
          success: false, 
          error: 'Invalid grade letter',
          data: gradeData 
        });
        continue;
      }

      // Use upsert to handle both create and update in a single atomic operation
      const grade = await prisma.grade.upsert({
        where: {
          studentCourseId_studentId_week: {
            studentCourseId,
            studentId,
            week
          }
        },
        update: {
          gradeLetter,
          gradePoints: gradeScale.gradePoints,
          score: score || null,
          notes: notes || null,
          assignedBy: user.id,
          updatedAt: new Date()
        },
        create: {
          studentCourseId,
          studentId,
          assignedBy: user.id,
          week,
          gradeLetter,
          gradePoints: gradeScale.gradePoints,
          score: score || null,
          notes: notes || null
        }
      });

      const course = await prisma.studentCourse.findUnique({
        where: { id: studentCourseId },
        select: { name: true },
      });

      try {
        await createNotificationForUser({
          userId: studentId,
          title: 'A grade was assigned to your course',
          message: `${user.firstName} ${user.lastName} assigned you ${gradeLetter} for ${course?.name || 'your course'} (Week ${week}).`,
          type: 'grade_assigned',
          link: '/dashboard/grades',
          generatedBy: user.id,
          entityType: 'grade',
          entityId: grade.id,
        });
      } catch (notificationError) {
        console.error('Failed to notify student about grade:', notificationError);
      }

      results.push({ success: true, grade });
    }

    return NextResponse.json({ 
      success: true, 
      results,
      processed: grades.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });
  } catch (error) {
    console.error('Error submitting grades:', error);
    return NextResponse.json({ error: 'Failed to submit grades' }, { status: 500 });
  }
}
