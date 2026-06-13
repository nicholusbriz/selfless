import { NextResponse } from 'next/server';
import { GRADE_POINTS, GRADE_LETTERS, WEEKS } from '@/lib/constants';

// GET /api/shared/grades/points - Get grade points mapping
export async function GET() {
  return NextResponse.json({
    gradePoints: GRADE_POINTS,
    gradeLetters: GRADE_LETTERS,
    weeks: WEEKS
  });
}
