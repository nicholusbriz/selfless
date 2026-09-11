// lib/gpa-calculator.ts
// GPA = Σ(gradePoints × credits) / Σ(credits)

export interface GradedCourseInput {
  credits: number;
  gradePoints: number;
}

export interface GradeScaleEntry {
  gradeLetter: string;
  minScore: number;
  maxScore: number;
  gradePoints: number;
  isActive?: boolean;
}

/** Standard weighted GPA: total quality points / total credits */
export function calculateGPA(courses: GradedCourseInput[]): number {
  let totalPoints = 0;
  let totalCredits = 0;

  for (const course of courses) {
    if (!course.credits || course.credits <= 0) continue;
    totalPoints += course.gradePoints * course.credits;
    totalCredits += course.credits;
  }

  if (totalCredits <= 0) return 0;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

export function resolveGradeFromScore(
  score: number,
  scales: GradeScaleEntry[]
): { gradeLetter: string; gradePoints: number } | null {
  const active = scales
    .filter((s) => s.isActive !== false)
    .sort((a, b) => b.minScore - a.minScore);

  const match = active.find(
    (s) => score >= s.minScore && score <= s.maxScore
  );

  if (!match) return null;
  return {
    gradeLetter: match.gradeLetter,
    gradePoints: match.gradePoints,
  };
}

export function calculateGradePoints(
  gradeLetter: string,
  scales?: GradeScaleEntry[]
): number {
  if (scales?.length) {
    const found = scales.find((s) => s.gradeLetter === gradeLetter);
    if (found) return found.gradePoints;
  }

  const FALLBACK: Record<string, number> = {
    A: 4.0,
    'A-': 3.7,
    'B+': 3.4,
    B: 3.0,
    'B-': 2.7,
    'C+': 2.4,
    C: 2.0,
    'C-': 1.7,
    'D+': 1.4,
    D: 1.0,
    'D-': 0.7,
    E: 0.0,
    F: 0.0,
  };

  return FALLBACK[gradeLetter] ?? 0;
}
