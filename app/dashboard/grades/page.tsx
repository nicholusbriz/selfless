'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Clock3,
  GraduationCap,
  TrendingUp,
  BookOpen,
  Award,
  Calendar,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  calculateGPA,
  calculateWeeklyGPAs,
} from '@/lib/gpa-calculator';

interface StudentCourse {
  id: string;
  name: string;
  code: string;
  courseUnit: string;
  credits: number;
}

interface Grade {
  id: string;
  gradeLetter: string;
  gradePoints: number;
  score: number | null;
  week: number;
  assignedAt: string;
  notes: string | null;
  studentCourse: {
    id: string;
    name: string;
    code: string;
    credits: number;
  };
  teacher: {
    firstName: string;
    lastName: string;
  };
}

const fetchMyGrades = async () => {
  const response = await fetch('/api/grades/my-grades');

  if (!response.ok) {
    throw new Error('Failed to fetch grades');
  }

  return response.json();
};

const weeks = [1, 2, 3, 4, 5, 6, 7];

function GradesPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] px-3 py-4 text-[#12203B] sm:px-5 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl animate-pulse">
        {/* Header */}
        <div className="mb-7 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#E5E7EB]" />

          <div className="h-6 w-px bg-[#E1E4E8]" />

          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-[#E5E7EB]" />
            <div className="h-6 w-28 rounded bg-[#E5E7EB]" />
          </div>
        </div>

        {/* Overview */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[#DADDE3] bg-white p-5 sm:p-6"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#E8EBEF]" />

                <div className="space-y-2">
                  <div className="h-3 w-24 rounded bg-[#E8EBEF]" />
                  <div className="h-7 w-16 rounded bg-[#E8EBEF]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Week filter */}
        <div className="mb-7 rounded-2xl border border-[#DADDE3] bg-white p-4 sm:p-5">
          <div className="mb-4 h-4 w-28 rounded bg-[#E8EBEF]" />

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {[1, 2, 3, 4, 5, 6, 7].map((item) => (
              <div key={item} className="h-9 rounded-lg bg-[#E8EBEF]" />
            ))}
          </div>
        </div>

        {/* GPA chart */}
        <div className="mb-7 rounded-2xl border border-[#DADDE3] bg-white p-5 sm:p-6">
          <div className="mb-6 space-y-2">
            <div className="h-5 w-36 rounded bg-[#E8EBEF]" />
            <div className="h-3 w-56 rounded bg-[#E8EBEF]" />
          </div>

          <div className="flex h-40 items-end gap-2 sm:gap-4">
            {[55, 70, 45, 80, 62, 74, 50].map((height, index) => (
              <div
                key={index}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className="w-full max-w-16 rounded-t-md bg-[#E8EBEF]"
                  style={{ height: `${height}%` }}
                />
                <div className="h-3 w-8 rounded bg-[#E8EBEF]" />
              </div>
            ))}
          </div>
        </div>

        {/* Grades */}
        <div className="mb-7 overflow-hidden rounded-2xl border border-[#DADDE3] bg-white">
          <div className="border-b border-[#DADDE3] px-5 py-5 sm:px-6">
            <div className="h-5 w-32 rounded bg-[#E8EBEF]" />
          </div>

          <div className="divide-y divide-[#E8EBEF]">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-5 sm:p-6">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-48 rounded bg-[#E8EBEF]" />
                    <div className="h-3 w-72 max-w-full rounded bg-[#E8EBEF]" />
                    <div className="h-3 w-56 max-w-full rounded bg-[#E8EBEF]" />
                  </div>

                  <div className="h-12 w-14 rounded-lg bg-[#E8EBEF]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course summary */}
        <div className="overflow-hidden rounded-2xl border border-[#DADDE3] bg-white">
          <div className="border-b border-[#DADDE3] px-5 py-5 sm:px-6">
            <div className="h-5 w-36 rounded bg-[#E8EBEF]" />
          </div>

          <div className="divide-y divide-[#E8EBEF]">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between gap-4 p-5 sm:p-6"
              >
                <div className="space-y-2">
                  <div className="h-4 w-44 rounded bg-[#E8EBEF]" />
                  <div className="h-3 w-32 rounded bg-[#E8EBEF]" />
                </div>

                <div className="h-9 w-12 rounded-lg bg-[#E8EBEF]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyGradesPage() {
  const router = useRouter();

  // Week 1 is the default.
  // There is intentionally no "All Weeks" state.
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['my-grades'],
    queryFn: fetchMyGrades,
    staleTime: 5 * 60 * 1000,
  });

  const grades: Grade[] = data?.grades || [];
  const courses: StudentCourse[] = data?.courses || [];

  /*
   * GPA calculation
   */
  const courseData = courses.map((course: StudentCourse) => ({
    id: course.id,
    courseName: course.name,
    credits: course.credits,
  }));

  const gradeData = grades.map((grade: Grade) => ({
    id: grade.id,
    courseId: grade.studentCourse.id,
    week: grade.week,
    gradeLetter: grade.gradeLetter,
    gradePoints: grade.gradePoints,
  }));

  const currentGPA = calculateGPA(courseData, gradeData);
  const weeklyGPAs = calculateWeeklyGPAs(courseData, gradeData);

  /*
   * Grade styling
   */
  const getGradeColor = (gradeLetter: string) => {
    const colors: Record<string, string> = {
      A: 'border-[#BFD9C7] bg-[#EEF7F0] text-[#2F6840]',
      'A-': 'border-[#BFD9C7] bg-[#EEF7F0] text-[#2F6840]',

      'B+': 'border-[#C7D5E5] bg-[#EEF3F8] text-[#315A82]',
      B: 'border-[#C7D5E5] bg-[#EEF3F8] text-[#315A82]',
      'B-': 'border-[#C7D5E5] bg-[#EEF3F8] text-[#315A82]',

      'C+': 'border-[#E4D7AE] bg-[#FBF7E9] text-[#806322]',
      C: 'border-[#E4D7AE] bg-[#FBF7E9] text-[#806322]',
      'C-': 'border-[#E4D7AE] bg-[#FBF7E9] text-[#806322]',

      'D+': 'border-[#E5C8BA] bg-[#FBF0EC] text-[#98513D]',
      D: 'border-[#E5C8BA] bg-[#FBF0EC] text-[#98513D]',
      'D-': 'border-[#E5C8BA] bg-[#FBF0EC] text-[#98513D]',

      E: 'border-[#E7C0C0] bg-[#FBEDED] text-[#A4462F]',
      F: 'border-[#E7C0C0] bg-[#FBEDED] text-[#A4462F]',
    };

    return (
      colors[gradeLetter] ||
      'border-[#DADDE3] bg-[#F5F6F7] text-[#526075]'
    );
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-[#2F6840]';
    if (gpa >= 3.0) return 'text-[#315A82]';
    if (gpa >= 2.0) return 'text-[#806322]';
    if (gpa >= 1.0) return 'text-[#98513D]';

    return 'text-[#A4462F]';
  };

  /*
   * Selected week grades
   */
  const filteredGrades = grades.filter(
    (grade) => grade.week === selectedWeek
  );

  /*
   * Selected week GPA
   */
  const selectedWeekGPA =
    weeklyGPAs.find((item) => item.week === selectedWeek)?.gpa ?? 0;

  /*
   * Number of courses that have grades in selected week.
   */
  const gradedCoursesThisWeek = new Set(
    filteredGrades.map((grade) => grade.studentCourse.id)
  ).size;

  /*
   * Grade completion percentage for selected week.
   */
  const gradeCompletion =
    courses.length > 0
      ? Math.round((gradedCoursesThisWeek / courses.length) * 100)
      : 0;

  if (isLoading) {
    return <GradesPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] px-4 py-8 text-[#12203B]">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center justify-center">
          <div className="w-full rounded-2xl border border-[#DADDE3] bg-white p-8 text-center shadow-[0_8px_30px_rgba(18,32,59,0.04)]">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#FBEDED]">
              <GraduationCap className="h-6 w-6 text-[#A4462F]" />
            </div>

            <h2 className="text-lg font-semibold text-[#12203B]">
              We couldn't load your grades
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#6B7268]">
              Something went wrong while retrieving your academic records.
              Please try again.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#12203B] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1C2E4A] focus:outline-none focus:ring-2 focus:ring-[#12203B]/20"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#12203B]">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">

        {/* =========================================================
            PAGE HEADER
        ========================================================= */}
        <header className="mb-6 sm:mb-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DADDE3] bg-white text-[#526075] shadow-sm transition-all hover:border-[#C7CCD4] hover:bg-[#F3F5F7] hover:text-[#12203B] focus:outline-none focus:ring-2 focus:ring-[#12203B]/10"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="h-6 w-px bg-[#DADDE3]" />

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A8495]">
                Academic Records
              </p>

              <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-[#12203B] sm:text-2xl">
                My Grades
              </h1>
            </div>
          </div>

          <div className="mt-5 border-b border-[#DADDE3]" />
        </header>

        {/* =========================================================
            ACADEMIC OVERVIEW
        ========================================================= */}
        <section
          aria-label="Academic overview"
          className="mb-6 grid grid-cols-1 gap-4 sm:mb-7 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* Current GPA */}
          <div className="rounded-2xl border border-[#DADDE3] bg-white p-5 shadow-[0_6px_24px_rgba(18,32,59,0.035)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7A8495]">
                  Current GPA
                </p>

                <p
                  className={`mt-2 text-3xl font-bold tracking-tight ${getGPAColor(
                    currentGPA
                  )}`}
                >
                  {currentGPA.toFixed(2)}
                </p>

                <p className="mt-1 text-xs text-[#8A9088]">
                  Cumulative academic performance
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3F8]">
                <Award className="h-5 w-5 text-[#315A82]" />
              </div>
            </div>
          </div>

          {/* Courses */}
          <div className="rounded-2xl border border-[#DADDE3] bg-white p-5 shadow-[0_6px_24px_rgba(18,32,59,0.035)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7A8495]">
                  Total Courses
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-[#12203B]">
                  {courses.length}
                </p>

                <p className="mt-1 text-xs text-[#8A9088]">
                  Courses in your academic record
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBF5E9]">
                <BookOpen className="h-5 w-5 text-[#A67A34]" />
              </div>
            </div>
          </div>

          {/* Grades */}
          <div className="rounded-2xl border border-[#DADDE3] bg-white p-5 shadow-[0_6px_24px_rgba(18,32,59,0.035)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7A8495]">
                  Grades Recorded
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-[#12203B]">
                  {grades.length}
                </p>

                <p className="mt-1 text-xs text-[#8A9088]">
                  Assessments recorded so far
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3F8]">
                <TrendingUp className="h-5 w-5 text-[#315A82]" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            WEEK FILTER
        ========================================================= */}
        <section className="mb-6 rounded-2xl border border-[#DADDE3] bg-white p-4 shadow-[0_6px_24px_rgba(18,32,59,0.035)] sm:mb-7 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F8]">
                <Calendar className="h-4 w-4 text-[#315A82]" />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#12203B]">
                  Academic Week
                </h2>
                <p className="hidden text-xs text-[#8A9088] sm:block">
                  Select a week to view your grades
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-full bg-[#F3F5F7] px-3 py-1.5 text-xs font-semibold text-[#526075]">
              Week {selectedWeek}
            </div>
          </div>

          {/* Grid layout — no horizontal scroll on mobile */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {weeks.map((week) => {
              const isActive = selectedWeek === week;
              const weekGrades = grades.filter(
                (grade) => grade.week === week
              );

              return (
                <button
                  key={week}
                  type="button"
                  onClick={() => setSelectedWeek(week)}
                  aria-pressed={isActive}
                  className={`relative inline-flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#12203B]/10 sm:flex-row sm:gap-1.5 sm:px-3.5 ${
                    isActive
                      ? 'border-[#12203B] bg-[#12203B] text-white shadow-sm'
                      : 'border-[#DADDE3] bg-white text-[#526075] hover:border-[#B8BEC7] hover:bg-[#F8F9FA] hover:text-[#12203B]'
                  }`}
                >
                  <span className="whitespace-nowrap">W{week}</span>

                  {weekGrades.length > 0 && (
                    <span
                      className={`text-[10px] font-semibold ${
                        isActive
                          ? 'text-white/70'
                          : 'text-[#8A9088]'
                      }`}
                    >
                      {weekGrades.length}
                    </span>
                  )}

                  {/* Active indicator dot on mobile */}
                  {isActive && (
                    <span className="absolute -bottom-px left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-white/60 sm:hidden" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================
            SELECTED WEEK SUMMARY
        ========================================================= */}
        <section className="mb-6 grid grid-cols-2 gap-3 sm:mb-7 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-2xl border border-[#DADDE3] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7A8495] sm:text-xs">
                  Week GPA
                </p>

                <p
                  className={`mt-1.5 text-xl font-bold sm:mt-2 sm:text-2xl ${getGPAColor(
                    selectedWeekGPA
                  )}`}
                >
                  {selectedWeekGPA.toFixed(2)}
                </p>
              </div>

              <BarChart3 className="hidden h-5 w-5 shrink-0 text-[#7A8495] sm:block" />
            </div>
          </div>

          <div className="rounded-2xl border border-[#DADDE3] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7A8495] sm:text-xs">
                  Grades
                </p>

                <p className="mt-1.5 text-xl font-bold text-[#12203B] sm:mt-2 sm:text-2xl">
                  {filteredGrades.length}
                </p>
              </div>

              <CheckCircle2 className="hidden h-5 w-5 shrink-0 text-[#55705B] sm:block" />
            </div>
          </div>

          <div className="col-span-2 rounded-2xl border border-[#DADDE3] bg-white p-4 sm:col-span-1 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7A8495] sm:text-xs">
                  Course Coverage
                </p>

                <p className="mt-1.5 text-xl font-bold text-[#12203B] sm:mt-2 sm:text-2xl">
                  {gradeCompletion}%
                </p>
              </div>

              <GraduationCap className="hidden h-5 w-5 shrink-0 text-[#A67A34] sm:block" />
            </div>

            {/* Progress bar for visual clarity */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF0F2]">
              <div
                className="h-full rounded-full bg-[#12203B] transition-all duration-300"
                style={{ width: `${gradeCompletion}%` }}
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            WEEKLY GPA TREND
        ========================================================= */}
        <section className="mb-6 rounded-2xl border border-[#DADDE3] bg-white p-5 shadow-[0_6px_24px_rgba(18,32,59,0.035)] sm:mb-7 sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#12203B] sm:text-lg">
                Weekly GPA Trend
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#7A8495] sm:text-sm">
                Your academic performance across the seven-week period.
              </p>
            </div>

            <BarChart3 className="hidden h-5 w-5 shrink-0 text-[#7A8495] sm:block" />
          </div>

          <div className="relative">
            <div className="absolute inset-x-0 top-0 border-t border-dashed border-[#E2E5E8]" />
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#E2E5E8]" />

            <div className="flex h-44 items-end gap-2 sm:h-48 sm:gap-4">
              {weeks.map((week) => {
                const weekGPA =
                  weeklyGPAs.find((item) => item.week === week)?.gpa ?? 0;

                const isSelected = selectedWeek === week;

                const barHeight =
                  weekGPA > 0
                    ? Math.max((weekGPA / 4) * 100, 7)
                    : 5;

                return (
                  <button
                    key={week}
                    type="button"
                    onClick={() => setSelectedWeek(week)}
                    className="group flex h-full flex-1 flex-col items-center justify-end gap-2 focus:outline-none"
                    aria-label={`View Week ${week}, GPA ${weekGPA.toFixed(
                      2
                    )}`}
                  >
                    <span
                      className={`text-[10px] font-semibold sm:text-xs ${
                        isSelected
                          ? 'text-[#12203B]'
                          : 'text-[#7A8495]'
                      }`}
                    >
                      {weekGPA.toFixed(2)}
                    </span>

                    <div
                      className={`w-full max-w-14 rounded-t-md transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#12203B]'
                          : 'bg-[#AAB2BC] group-hover:bg-[#7C8794]'
                      }`}
                      style={{
                        height: `${barHeight}%`,
                      }}
                    />

                    <span
                      className={`text-[10px] font-semibold sm:text-xs ${
                        isSelected
                          ? 'text-[#12203B]'
                          : 'text-[#7A8495]'
                      }`}
                    >
                      W{week}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            COURSE GRADES
        ========================================================= */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-[#DADDE3] bg-white shadow-[0_6px_24px_rgba(18,32,59,0.035)] sm:mb-7">
          <div className="border-b border-[#DADDE3] bg-[#FBFBFA] px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-[#12203B] sm:text-lg">
                  Course Grades
                </h2>

                <p className="mt-1 text-xs text-[#7A8495] sm:text-sm">
                  Grades recorded for Week {selectedWeek}.
                </p>
              </div>

              <div className="shrink-0 rounded-full border border-[#DADDE3] bg-white px-3 py-1.5 text-xs font-semibold text-[#526075]">
                {filteredGrades.length}{' '}
                {filteredGrades.length === 1 ? 'grade' : 'grades'}
              </div>
            </div>
          </div>

          {filteredGrades.length === 0 ? (
            <div className="px-5 py-14 text-center sm:px-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F5F7]">
                <GraduationCap className="h-6 w-6 text-[#7A8495]" />
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#12203B]">
                No grades for Week {selectedWeek}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7A8495]">
                Your grades will appear here once they are assigned by your
                teachers.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E4E6E9]">
              {filteredGrades.map((grade) => (
                <article
                  key={grade.id}
                  className="p-5 transition-colors hover:bg-[#FBFBFA] sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    {/* Course information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-sm font-semibold leading-6 text-[#12203B] sm:text-base">
                          {grade.studentCourse.name}
                        </h3>

                        <span className="rounded-md bg-[#F1F3F5] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#667085]">
                          {grade.studentCourse.code}
                        </span>

                        <span className="text-xs text-[#8A9088]">
                          {grade.studentCourse.credits}{' '}
                          {grade.studentCourse.credits === 1
                            ? 'credit'
                            : 'credits'}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#7A8495] sm:text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          Week {grade.week}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5 shrink-0" />
                          {new Date(
                            grade.assignedAt
                          ).toLocaleDateString()}
                        </span>

                        <span>
                          Graded by{' '}
                          <span className="font-medium text-[#526075]">
                            {grade.teacher.firstName}{' '}
                            {grade.teacher.lastName}
                          </span>
                        </span>
                      </div>

                      {grade.notes && (
                        <div className="mt-4 border-l-2 border-[#DADDE3] pl-3">
                          <p className="text-xs leading-5 text-[#6B7268]">
                            {grade.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Grade result */}
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div
                        className={`flex h-12 min-w-[58px] items-center justify-center rounded-lg border px-3 font-bold text-lg ${getGradeColor(
                          grade.gradeLetter
                        )}`}
                      >
                        {grade.gradeLetter}
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8A9088]">
                            Points
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-[#12203B]">
                            {grade.gradePoints}
                          </p>
                        </div>

                        {grade.score !== null && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8A9088]">
                              Score
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-[#12203B]">
                              {grade.score}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* =========================================================
            COURSE SUMMARY
        ========================================================= */}
        <section className="overflow-hidden rounded-2xl border border-[#DADDE3] bg-white shadow-[0_6px_24px_rgba(18,32,59,0.035)]">
          <div className="border-b border-[#DADDE3] bg-[#FBFBFA] px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-[#12203B] sm:text-lg">
                  Course Summary
                </h2>

                <p className="mt-1 text-xs text-[#7A8495] sm:text-sm">
                  Latest recorded result for each course.
                </p>
              </div>

              <BookOpen className="hidden h-5 w-5 text-[#7A8495] sm:block" />
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-[#8A9088]" />

              <p className="mt-3 text-sm font-medium text-[#526075]">
                No courses available
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E4E6E9]">
              {courses.map((course) => {
                const courseGrades = grades.filter(
                  (grade) => grade.studentCourse.id === course.id
                );

                const latestGrade =
                  courseGrades.length > 0
                    ? courseGrades.reduce((latest, current) =>
                        new Date(current.assignedAt) >
                        new Date(latest.assignedAt)
                          ? current
                          : latest
                      )
                    : null;

                return (
                  <article
                    key={course.id}
                    className="p-5 transition-colors hover:bg-[#FBFBFA] sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-[#12203B] sm:text-base">
                            {course.name}
                          </h3>

                          <span className="rounded-md bg-[#F1F3F5] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#667085]">
                            {course.code}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#7A8495]">
                          <span>
                            {course.credits}{' '}
                            {course.credits === 1
                              ? 'credit'
                              : 'credits'}
                          </span>

                          <span>
                            {courseGrades.length}{' '}
                            {courseGrades.length === 1
                              ? 'grade'
                              : 'grades'}{' '}
                            recorded
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        {latestGrade ? (
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8A9088]">
                                Latest
                              </p>

                              <p className="mt-0.5 text-xs text-[#7A8495]">
                                Week {latestGrade.week}
                              </p>
                            </div>

                            <div
                              className={`flex h-10 min-w-[50px] items-center justify-center rounded-lg border px-3 font-bold ${getGradeColor(
                                latestGrade.gradeLetter
                              )}`}
                            >
                              {latestGrade.gradeLetter}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-[#8A9088]">
                            No grade recorded
                          </span>
                        )}

                        <ChevronRight className="h-4 w-4 text-[#A0A7B0]" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}