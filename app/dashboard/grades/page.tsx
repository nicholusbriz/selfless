'use client';

import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  GraduationCap,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';

interface CourseGrade {
  id: string;
  gradeLetter: string;
  gradePoints: number;
  score: number | null;
  notes: string | null;
  assignedAt: string;
}

interface CourseRow {
  id: string;
  name: string;
  code: string;
  courseUnit: string;
  credits: number;
  status: string;
  grade: CourseGrade | null;
}

interface MyGradesResponse {
  courses: CourseRow[];
  gpa: number;
  totalPoints: number;
  totalCredits: number;
  gradedCredits: number;
  gradedCourses: number;
}

export default function MyGradesPage() {
  const router = useRouter();
  const { isAdmin, isTeacher, isSuperAdmin, isLoading: authLoading } = useAuth();
  const canManage = isAdmin() || isTeacher() || isSuperAdmin();

  const { data, isLoading, error } = useQuery<MyGradesResponse>({
    queryKey: ['my-grades'],
    queryFn: async () => {
      const res = await fetch('/api/grades/me');
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to load grades');
      return body;
    },
  });

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#12203B]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DADDE3] bg-white text-[#526075] transition-colors hover:bg-[#F3F5F7]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-6 w-px bg-[#DADDE3]" />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#7A8495]">
              Academic
            </p>
            <h1 className="text-xl font-semibold tracking-tight">My Grades</h1>
          </div>
        </div>

        {canManage && (
          <Link
            href="/dashboard/teacher/grades"
            className="inline-flex items-center gap-2 rounded-xl border border-[#DADDE3] bg-white px-3.5 py-2 text-sm font-medium text-[#1A365D] hover:bg-[#F4F7FA]"
          >
            <GraduationCap className="h-4 w-4" />
            Assign grades
          </Link>
        )}
      </div>

      {authLoading || isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#DADDE3] bg-white text-[#7A8495]">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-[#F0D9D2] bg-[#FDF6F4] px-5 py-4 text-sm text-[#A4462F]">
          {error instanceof Error ? error.message : 'Failed to load grades'}
        </div>
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-[#DADDE3] bg-white px-4 py-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#7A8495]">
                GPA
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {(data?.gpa ?? 0).toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-[#7A8495]">
                points ÷ credits
              </p>
            </div>
            <div className="rounded-2xl border border-[#DADDE3] bg-white px-4 py-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#7A8495]">
                Total points
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {(data?.totalPoints ?? 0).toFixed(1)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#DADDE3] bg-white px-4 py-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#7A8495]">
                Graded credits
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {data?.gradedCredits ?? 0}
                <span className="text-base font-normal text-[#7A8495]">
                  /{data?.totalCredits ?? 0}
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-[#DADDE3] bg-white px-4 py-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#7A8495]">
                Courses graded
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {data?.gradedCourses ?? 0}
                <span className="text-base font-normal text-[#7A8495]">
                  /{data?.courses.length ?? 0}
                </span>
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#DADDE3] bg-white">
            {!data?.courses.length ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
                <BarChart3 className="mb-3 h-8 w-8 text-[#1A365D]" />
                <p className="text-sm font-medium">No courses yet</p>
                <p className="mt-1 max-w-md text-sm text-[#7A8495]">
                  Enroll in courses first. Grades will show here once a tutor or
                  admin enters your marks.
                </p>
                <Link
                  href="/dashboard/courses"
                  className="mt-4 text-sm font-medium text-[#1A365D] hover:underline"
                >
                  Go to Courses
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#F0F2F5]">
                {data.courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 shrink-0 text-[#1A365D]" />
                        <p className="truncate text-sm font-semibold">
                          {course.code} · {course.name || course.courseUnit}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-[#7A8495]">
                        {course.credits} credit
                        {course.credits === 1 ? '' : 's'} · {course.status}
                        {course.grade?.notes
                          ? ` · ${course.grade.notes}`
                          : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      {course.grade ? (
                        <>
                          <div>
                            <p className="text-[10px] uppercase text-[#7A8495]">
                              Mark
                            </p>
                            <p className="text-sm font-semibold tabular-nums">
                              {course.grade.score != null
                                ? course.grade.score
                                : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-[#7A8495]">
                              Letter
                            </p>
                            <p className="text-sm font-semibold">
                              {course.grade.gradeLetter}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-[#7A8495]">
                              Points
                            </p>
                            <p className="text-sm font-semibold tabular-nums">
                              {course.grade.gradePoints.toFixed(1)}
                            </p>
                          </div>
                        </>
                      ) : (
                        <span className="rounded-full border border-[#E5D8BC] bg-[#FBF7EE] px-3 py-1 text-xs font-medium text-[#80652F]">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
