'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface CourseGrade {
  id: string;
  week: number;
  gradeLetter: string;
  gradePoints: number;
  score: number | null;
  assignedAt: string;
  teacher?: {
    firstName: string;
    lastName: string;
  } | null;
}

interface StudentCourse {
  id: string;
  name: string;
  courseUnit: string;
  credits: number;
  grades: CourseGrade[];
}

interface GradeMonitorStudent {
  id: string;
  firstName: string;
  lastName: string;
  techCenter: { id: string; name: string } | null;
  submittedCourses: StudentCourse[];
}

interface GradeMonitorData {
  techCenters: Array<{ id: string; name: string }>;
  students: GradeMonitorStudent[];
}

type GpaFilter = 'all' | 'below-3' | '3-to-3.5' | '3.5-to-4';
type GradePresenceFilter = 'all' | 'with-grades' | 'without-grades';

const PAGE_SIZE = 50;
const WEEKS = [1, 2, 3, 4, 5, 6, 7];

function GradeMonitorSkeleton() {
  return (
    <div
      className="animate-pulse space-y-6"
      role="status"
      aria-label="Loading grade monitor"
      aria-busy="true"
    >
      <div className="h-8 w-56 bg-[#E5E7EB]" />
      <div className="h-10 w-full max-w-md bg-[#E5E7EB]" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-16 bg-[#E5E7EB]" />
        ))}
      </div>
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="space-y-3 border-t border-[#D1D5DB] py-4">
            <div className="h-5 w-2/3 bg-[#E5E7EB]" />
            <div className="h-4 w-1/2 bg-[#E5E7EB]" />
            <div className="h-4 w-full bg-[#E5E7EB]" />
            <div className="h-4 w-4/5 bg-[#E5E7EB]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function getStudentWeekGrades(student: GradeMonitorStudent, week: number) {
  return student.submittedCourses.flatMap((course) => {
    const grade = course.grades.find((item) => item.week === week);
    return grade ? [{ course, grade }] : [];
  });
}

function getWeekGpa(
  grades: ReturnType<typeof getStudentWeekGrades>,
): number | null {
  const totalCredits = grades.reduce(
    (total, item) => total + Math.max(0, item.course.credits),
    0,
  );
  if (totalCredits <= 0) return null;

  const weightedPoints = grades.reduce(
    (total, item) =>
      total + item.grade.gradePoints * Math.max(0, item.course.credits),
    0,
  );
  return weightedPoints / totalCredits;
}

export default function ManageGradesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [selectedTechCenter, setSelectedTechCenter] = useState('all');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [gpaFilter, setGpaFilter] = useState<GpaFilter>('all');
  const [gradePresenceFilter, setGradePresenceFilter] =
    useState<GradePresenceFilter>('with-grades');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const canManageGrades =
    user?.role === 'super_admin' || user?.role === 'dev';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['gradeMonitor'],
    queryFn: async (): Promise<GradeMonitorData> => {
      const response = await fetch('/api/grades/monitor');
      if (!response.ok) {
        throw new Error('Failed to load grade monitoring data');
      }
      return response.json() as Promise<GradeMonitorData>;
    },
    enabled: canManageGrades,
    staleTime: 60_000,
  });

  const centerStudents = useMemo(
    () =>
      (data?.students ?? []).filter(
        (student) =>
          selectedTechCenter === 'all' ||
          student.techCenter?.id === selectedTechCenter,
      ),
    [data?.students, selectedTechCenter],
  );
  const weekStudents = useMemo(
    () =>
      centerStudents.map((student) => {
        const weekGrades = getStudentWeekGrades(student, selectedWeek);
        return {
          student,
          weekGrades,
          gpa: getWeekGpa(weekGrades),
        };
      }),
    [centerStudents, selectedWeek],
  );
  const gpaCounts = useMemo(
    () =>
      weekStudents.reduce(
        (counts, item) => {
          if (item.gpa === null) {
            counts.ungraded += 1;
          } else if (item.gpa < 3) {
            counts.below3 += 1;
          } else if (item.gpa < 3.5) {
            counts.between3And35 += 1;
          } else {
            counts.between35And4 += 1;
          }
          return counts;
        },
        { below3: 0, between3And35: 0, between35And4: 0, ungraded: 0 },
      ),
    [weekStudents],
  );
  const gradePresenceCounts = useMemo(
    () =>
      weekStudents.reduce(
        (counts, item) => {
          if (item.gpa === null) {
            counts.withoutGrades += 1;
          } else {
            counts.withGrades += 1;
          }
          return counts;
        },
        { withGrades: 0, withoutGrades: 0 },
      ),
    [weekStudents],
  );
  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return weekStudents.filter(({ student, gpa }) => {
      const matchesQuery =
        !query ||
        `${student.firstName} ${student.lastName}`
          .toLocaleLowerCase()
          .includes(query) ||
        (student.techCenter?.name.toLocaleLowerCase().includes(query) ?? false) ||
        student.submittedCourses.some(
          (course) =>
            course.name.toLocaleLowerCase().includes(query) ||
            course.courseUnit.toLocaleLowerCase().includes(query),
        );
      if (!matchesQuery) return false;

      // Searching is an independent lookup and should not be narrowed by
      // the default grade-presence or GPA tabs.
      if (query) return true;

      const matchesGradePresence =
        gradePresenceFilter === 'all' ||
        (gradePresenceFilter === 'with-grades' && gpa !== null) ||
        (gradePresenceFilter === 'without-grades' && gpa === null);
      if (!matchesGradePresence) return false;

      return (
        gpaFilter === 'all' ||
        (gpaFilter === 'below-3' && gpa !== null && gpa < 3) ||
        (gpaFilter === '3-to-3.5' && gpa !== null && gpa >= 3 && gpa < 3.5) ||
        (gpaFilter === '3.5-to-4' && gpa !== null && gpa >= 3.5 && gpa <= 4)
      );
    });
  }, [weekStudents, gradePresenceFilter, gpaFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleStudents = filteredStudents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const countFrom =
    filteredStudents.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const countTo = Math.min(currentPage * PAGE_SIZE, filteredStudents.length);

  const selectGpaFilter = (filter: GpaFilter) => {
    setGpaFilter(gpaFilter === filter ? 'all' : filter);
    if (filter !== 'all') {
      setGradePresenceFilter('with-grades');
    }
    setPage(1);
  };

  const selectGradePresenceFilter = (
    filter: Exclude<GradePresenceFilter, 'all'>,
  ) => {
    setGradePresenceFilter((current) =>
      current === filter ? 'all' : filter,
    );
    setPage(1);
  };

  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-[#F7F6F2] px-4 py-6 text-[#1A2B4C] sm:px-6">
        <GradeMonitorSkeleton />
      </main>
    );
  }

  if (!canManageGrades) {
    return (
      <main className="min-h-screen bg-[#F7F6F2] px-4 py-8 text-sm text-[#1A2B4C]">
        You do not have permission to monitor grades across tech centers.
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F6F2] text-[#1A2B4C]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <header className="mb-6 border-b border-[#D1D5DB] pb-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 shrink-0 text-[#B98A3E]" aria-hidden="true" />
            <h1 className="break-words text-xl font-bold sm:text-2xl">
              Manage Grades
            </h1>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-[#4B5646]">
            Monitor student performance based on weekly grades. Filter by tech
            center, choose a week, and use GPA ranges to focus on students in
            that range.
          </p>
        </header>

        <section className="mb-6 grid min-w-0 gap-4 md:grid-cols-2">
          <div className="min-w-0">
            <label
              htmlFor="grade-search"
              className="mb-1 block text-sm font-semibold"
            >
              Search students
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
                aria-hidden="true"
              />
              <input
                id="grade-search"
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by student or tech center"
                className="h-10 w-full min-w-0 border border-[#D1D5DB] bg-white py-2 pl-9 pr-3 text-sm focus:border-[#1A2B4C] focus:outline-none focus:ring-2 focus:ring-[#B98A3E]"
              />
            </div>
          </div>
          <div className="min-w-0">
            <label
              htmlFor="grade-tech-center"
              className="mb-1 block text-sm font-semibold"
            >
              Tech center
            </label>
            <select
              id="grade-tech-center"
              value={selectedTechCenter}
              onChange={(event) => {
                setSelectedTechCenter(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full min-w-0 border border-[#D1D5DB] bg-white px-3 text-sm focus:border-[#1A2B4C] focus:outline-none focus:ring-2 focus:ring-[#B98A3E]"
            >
              <option value="all">All tech centers</option>
              {(data?.techCenters ?? []).map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mb-6" aria-label="Filter by week">
          <p className="mb-2 text-sm font-semibold">Week</p>
          <nav className="flex flex-wrap gap-2" aria-label="Grade weeks">
            {WEEKS.map((week) => (
              <button
                key={week}
                type="button"
                aria-pressed={selectedWeek === week}
                onClick={() => {
                  setSelectedWeek(week);
                  setPage(1);
                }}
                className={`min-h-10 min-w-16 border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] ${
                  selectedWeek === week
                    ? 'border-[#1A2B4C] bg-[#1A2B4C] text-white'
                    : 'border-[#D1D5DB] bg-white text-[#1A2B4C] hover:border-[#B98A3E]'
                }`}
              >
                Week {week}
              </button>
            ))}
          </nav>
        </section>

        <section className="mb-5" aria-label="Filter students by grades">
          <nav
            className="flex flex-wrap gap-2"
            aria-label="Grade availability filters"
          >
            {(
              [
                {
                  id: 'with-grades',
                  label: 'With grades',
                  count: gradePresenceCounts.withGrades,
                },
                {
                  id: 'without-grades',
                  label: 'Without grades',
                  count: gradePresenceCounts.withoutGrades,
                },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={gradePresenceFilter === option.id}
                onClick={() => selectGradePresenceFilter(option.id)}
                className={`inline-flex min-h-11 items-center justify-between gap-4 border px-4 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] ${
                  gradePresenceFilter === option.id
                    ? 'border-[#1A2B4C] bg-[#1A2B4C] text-white'
                    : 'border-[#D1D5DB] bg-white text-[#1A2B4C] hover:border-[#B98A3E]'
                }`}
              >
                <span className="text-sm font-semibold">{option.label}</span>
                <span
                  className={`font-mono text-sm font-bold ${
                    gradePresenceFilter === option.id
                      ? 'text-[#F3D9A8]'
                      : 'text-[#55705B]'
                  }`}
                >
                  {option.count}
                </span>
              </button>
            ))}
          </nav>
        </section>

        <section className="mb-6" aria-label="Filter by weekly GPA">
          <nav
            className="flex flex-wrap gap-2"
            aria-label="Grade point average ranges"
          >
            {(
              [
                { id: 'all', label: 'All students', count: centerStudents.length },
                { id: 'below-3', label: 'Below 3.0', count: gpaCounts.below3 },
                {
                  id: '3-to-3.5',
                  label: '3.0 to 3.5',
                  count: gpaCounts.between3And35,
                },
                {
                  id: '3.5-to-4',
                  label: '3.5 to 4.0',
                  count: gpaCounts.between35And4,
                },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={gpaFilter === option.id}
                onClick={() => selectGpaFilter(option.id)}
                className={`inline-flex min-h-11 items-center justify-between gap-4 border px-4 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] ${
                  gpaFilter === option.id
                    ? 'border-[#1A2B4C] bg-[#1A2B4C] text-white'
                    : 'border-[#D1D5DB] bg-white text-[#1A2B4C] hover:border-[#B98A3E]'
                }`}
              >
                <span className="text-sm font-semibold">{option.label}</span>
                <span
                  className={`font-mono text-sm font-bold ${
                    gpaFilter === option.id
                      ? 'text-[#F3D9A8]'
                      : 'text-[#55705B]'
                  }`}
                >
                  {option.count}
                </span>
              </button>
            ))}
          </nav>
        </section>

        {isLoading ? (
          <GradeMonitorSkeleton />
        ) : error ? (
          <div className="py-6" role="alert">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#A4462F]">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              Could not load grades for monitoring.
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 text-sm font-semibold text-[#1A2B4C] underline underline-offset-2 hover:text-[#B98A3E]"
            >
              Try again
            </button>
          </div>
        ) : (
          <section aria-label="Student grades">
            <p className="mb-3 text-sm text-[#4B5646]" aria-live="polite">
              Showing {countFrom}–{countTo} of {filteredStudents.length}{' '}
              {filteredStudents.length === 1 ? 'student' : 'students'}
            </p>
            {filteredStudents.length === 0 ? (
              <p className="py-6 text-sm text-[#4B5646]">
                No students match the selected filters.
              </p>
            ) : (
              <ul className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
                {visibleStudents.map(({ student, weekGrades, gpa }) => (
                  <li
                    key={student.id}
                    className="min-w-0 border-t border-[#D1D5DB] py-4"
                  >
                    <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h2 className="min-w-0 break-words text-base font-bold">
                        {`${student.firstName} ${student.lastName}`.trim() ||
                          'Unnamed student'}
                      </h2>
                      <p className="shrink-0 text-sm font-semibold text-[#55705B]">
                        GPA: {gpa === null ? '—' : gpa.toFixed(2)}
                      </p>
                    </div>
                    <p className="mt-0.5 break-words text-xs text-[#6B7280]">
                      {student.techCenter?.name ?? 'No tech center'}
                    </p>
                    {weekGrades.length === 0 ? (
                      <p className="mt-3 text-sm text-[#6B7280]">
                        No course grades recorded for Week {selectedWeek}.
                      </p>
                    ) : (
                      <>
                        <ul className="mt-3 min-w-0 space-y-2">
                          {weekGrades.map(({ course, grade }) => (
                            <li
                              key={grade.id}
                              className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm"
                            >
                              <span className="min-w-0 break-words">
                                {course.courseUnit || course.name}
                                <span className="ml-1 text-xs text-[#6B7280]">
                                  ({course.credits} cr)
                                </span>
                              </span>
                              <span className="shrink-0 text-right font-semibold text-[#1A2B4C]">
                                {grade.gradeLetter}{' '}
                                <span className="font-normal text-[#6B7280]">
                                  {grade.gradePoints.toFixed(1)} pts
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 text-xs text-[#6B7280]">
                          Assigned by:{' '}
                          {Array.from(
                            new Set(
                              weekGrades.map(({ grade }) => {
                                const teacherName =
                                  `${grade.teacher?.firstName ?? ''} ${grade.teacher?.lastName ?? ''}`.trim();
                                return teacherName || 'Unknown';
                              }),
                            ),
                          ).join(', ')}
                        </p>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {filteredStudents.length > PAGE_SIZE && (
              <nav
                aria-label="Grade monitor pagination"
                className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#D1D5DB] pt-4"
              >
                <p className="text-sm text-[#4B5646]">
                  Showing {countFrom}–{countTo} of {filteredStudents.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex min-h-10 items-center gap-1 border border-[#D1D5DB] bg-white px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Previous
                  </button>
                  <span className="px-1 text-sm text-[#4B5646]" aria-live="polite">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="inline-flex min-h-10 items-center gap-1 border border-[#D1D5DB] bg-white px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </nav>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
