'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';

interface StudentCourse {
  id: string;
  courseUnit: string;
  credits: number;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  role?: {
    name: string;
  } | null;
  techCenter: {
    id: string;
    name: string;
  } | null;
  studentCourses: StudentCourse[];
}

interface TechCenter {
  id: string;
  name: string;
}

interface StudentDirectoryData {
  studentsByTechCenter: Record<string, Student[]>;
  techCenters: TechCenter[];
}

type StudyLoad = 'all' | 'full-time' | 'half-time';
type CourseEnrollment = 'all' | 'with-courses' | 'without-courses';
const STUDENTS_PER_PAGE = 50;

function CourseUnitsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl animate-pulse px-4 py-6 sm:px-6" aria-label="Loading course units" aria-busy="true">
      <div className="mb-6 border-b border-[#D1D5DB] pb-4">
        <div className="h-7 w-48 bg-[#E5E7EB]" />
        <div className="mt-2 h-4 w-72 max-w-full bg-[#E5E7EB]" />
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-2 h-4 w-24 bg-[#E5E7EB]" />
          <div className="h-10 bg-[#E5E7EB]" />
        </div>
        <div>
          <div className="mb-2 h-4 w-24 bg-[#E5E7EB]" />
          <div className="h-10 bg-[#E5E7EB]" />
        </div>
      </div>
      <div className="mb-6 flex gap-2">
        <div className="h-11 w-32 bg-[#E5E7EB]" />
        <div className="h-11 w-32 bg-[#E5E7EB]" />
        <div className="h-11 w-32 bg-[#E5E7EB]" />
      </div>
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="border-t border-[#D1D5DB] py-4">
            <div className="h-5 w-2/3 bg-[#E5E7EB]" />
            <div className="mt-2 h-3 w-1/2 bg-[#E5E7EB]" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full bg-[#E5E7EB]" />
              <div className="h-4 w-4/5 bg-[#E5E7EB]" />
              <div className="h-4 w-3/4 bg-[#E5E7EB]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const getTotalCredits = (student: Student): number =>
  student.studentCourses.reduce((total, course) => {
    const credits = Number(course.credits);
    return total + (Number.isFinite(credits) ? credits : 0);
  }, 0);

const isVisibleStudent = (student: Student): boolean => {
  const roleName = student.role?.name?.toLowerCase();
  return (
    roleName !== 'dev' &&
    roleName !== 'super_admin' &&
    roleName !== 'superadmin'
  );
};

export default function CourseUnitsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [selectedTechCenter, setSelectedTechCenter] = useState('all');
  const [studyLoad, setStudyLoad] = useState<StudyLoad>('all');
  const [courseEnrollment, setCourseEnrollment] =
    useState<CourseEnrollment>('with-courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const canViewAllCenters =
    user?.role === 'super_admin' || user?.role === 'dev';

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['courseUnitRoster'],
    queryFn: async (): Promise<StudentDirectoryData> => {
      const response = await fetch('/api/students');
      if (!response.ok) {
        throw new Error('Failed to fetch students and course units');
      }
      return response.json() as Promise<StudentDirectoryData>;
    },
    enabled: canViewAllCenters,
    staleTime: 30_000,
  });

  const centers = data?.techCenters ?? [];
  const students = useMemo(
    () =>
      Object.values(data?.studentsByTechCenter ?? {}).flat().filter(
        (student) =>
          selectedTechCenter === 'all' ||
          student.techCenter?.id === selectedTechCenter,
      ),
    [data?.studentsByTechCenter, selectedTechCenter],
  );
  const studyLoadCounts = useMemo(
    () =>
      students.reduce(
        (counts, student) => {
          const totalCredits = getTotalCredits(student);
          if (totalCredits >= 6) {
            counts.fullTime += 1;
          } else if (totalCredits > 0) {
            counts.halfTime += 1;
          }
          return counts;
        },
        { fullTime: 0, halfTime: 0 },
      ),
    [students],
  );
  const visibleStudentCount = useMemo(
    () => students.filter(isVisibleStudent).length,
    [students],
  );
  const courseEnrollmentCounts = useMemo(
    () =>
      students.reduce(
        (counts, student) => {
          if (student.studentCourses.length > 0) {
            counts.withCourses += 1;
          } else {
            counts.withoutCourses += 1;
          }
          return counts;
        },
        { withCourses: 0, withoutCourses: 0 },
      ),
    [students],
  );
  const filteredStudents = useMemo(
    () =>
      students.filter((student) => {
        if (!isVisibleStudent(student)) return false;

        const matchesStudyLoad =
          studyLoad === 'all' ||
          (studyLoad === 'full-time'
            ? getTotalCredits(student) >= 6
            : getTotalCredits(student) > 0 &&
              getTotalCredits(student) < 6);
        if (!matchesStudyLoad) return false;

        const hasCourses = student.studentCourses.length > 0;
        const matchesCourseEnrollment =
          courseEnrollment === 'all' ||
          (courseEnrollment === 'with-courses'
            ? hasCourses
            : !hasCourses);
        if (!matchesCourseEnrollment) return false;

        const query = searchQuery.trim().toLocaleLowerCase();
        if (!query) return true;

        const fullName = `${student.firstName} ${student.lastName}`.toLocaleLowerCase();
        const matchesName = fullName.includes(query);
        const matchesTechCenter =
          student.techCenter?.name.toLocaleLowerCase().includes(query) ?? false;
        const matchesCourse = student.studentCourses.some((course) =>
          course.courseUnit.toLocaleLowerCase().includes(query),
        );

        return matchesName || matchesTechCenter || matchesCourse;
      }),
    [students, studyLoad, courseEnrollment, searchQuery],
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE),
  );
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * STUDENTS_PER_PAGE,
    currentPage * STUDENTS_PER_PAGE,
  );
  const firstStudentIndex =
    filteredStudents.length === 0
      ? 0
      : (currentPage - 1) * STUDENTS_PER_PAGE + 1;
  const lastStudentIndex = Math.min(
    currentPage * STUDENTS_PER_PAGE,
    filteredStudents.length,
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  if (isAuthLoading) {
    return <CourseUnitsSkeleton />;
  }

  if (!canViewAllCenters) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-[#1A2B4C]">
        You do not have permission to view the course units roster.
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F6F2] text-[#1A2B4C]">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <header className="mb-6 border-b border-[#D1D5DB] pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 shrink-0 text-[#B98A3E]" aria-hidden="true" />
            <h1 className="break-words text-xl font-bold sm:text-2xl">
              Course Units
            </h1>
          </div>
          <p className="mt-1 text-sm text-[#4B5646]">
            View each student&apos;s courses and total credits by tech center.
          </p>
        </header>

        <section
          aria-label="Roster filters"
          className="mb-6 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div className="min-w-0">
            <label
              htmlFor="course-units-search"
              className="mb-1 block text-sm font-semibold"
            >
              Search students, courses, or tech centers
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
                aria-hidden="true"
              />
              <input
                id="course-units-search"
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by student name, course, or tech center"
                className="h-10 w-full min-w-0 border border-[#D1D5DB] bg-white py-2 pl-9 pr-3 text-sm focus:border-[#1A2B4C] focus:outline-none focus:ring-2 focus:ring-[#B98A3E]"
              />
            </div>
            <p className="mt-1 text-xs text-[#6B7280]">
              Searches the roster already loaded in this page.
            </p>
          </div>
          <div className="min-w-0">
            <label
              htmlFor="tech-center-filter"
              className="mb-1 block text-sm font-semibold"
            >
              Tech center
            </label>
            <select
              id="tech-center-filter"
              value={selectedTechCenter}
              onChange={(event) => {
                setSelectedTechCenter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full min-w-0 border border-[#D1D5DB] bg-white px-3 text-sm focus:border-[#1A2B4C] focus:outline-none focus:ring-2 focus:ring-[#B98A3E]"
            >
              <option value="all">All tech centers</option>
              {centers.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0 sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold">Study load</span>
            <p className="mb-2 text-xs text-[#6B7280]">
              Full-time: 6 or more credits. Part-time: fewer than 6 credits.
            </p>
            <nav
              aria-label="Filter students by study load"
              className="flex flex-wrap gap-2"
            >
              {(
                [
                  {
                    id: 'all',
                    label: 'All students',
                    count: visibleStudentCount,
                  },
                  {
                    id: 'full-time',
                    label: 'Full-time',
                    count: studyLoadCounts.fullTime,
                  },
                  {
                    id: 'half-time',
                    label: 'Part-time',
                    count: studyLoadCounts.halfTime,
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={studyLoad === option.id}
                  onClick={() => {
                    setStudyLoad(option.id);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex min-h-11 items-center justify-between gap-4 border px-4 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] ${
                    studyLoad === option.id
                      ? 'border-[#1A2B4C] bg-[#1A2B4C] text-white'
                      : 'border-[#D1D5DB] bg-white text-[#1A2B4C] hover:border-[#B98A3E]'
                  }`}
                >
                  <span className="text-sm font-semibold">{option.label}</span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      studyLoad === option.id
                        ? 'text-[#F3D9A8]'
                        : 'text-[#55705B]'
                    }`}
                    aria-label={`${option.count} students`}
                  >
                    {option.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
          <div className="min-w-0 sm:col-span-2">
            <nav
              aria-label="Filter students by course enrollment"
              className="flex flex-wrap gap-2"
            >
              {(
                [
                  {
                    id: 'with-courses',
                    label: 'With courses',
                    count: courseEnrollmentCounts.withCourses,
                  },
                  {
                    id: 'without-courses',
                    label: 'Without courses',
                    count: courseEnrollmentCounts.withoutCourses,
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={courseEnrollment === option.id}
                  onClick={() =>
                    {
                      setCourseEnrollment((current) =>
                        current === option.id ? 'all' : option.id,
                      );
                      setCurrentPage(1);
                    }
                  }
                  className={`inline-flex min-h-11 items-center justify-between gap-4 border px-4 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] ${
                    courseEnrollment === option.id
                      ? 'border-[#1A2B4C] bg-[#1A2B4C] text-white'
                      : 'border-[#D1D5DB] bg-white text-[#1A2B4C] hover:border-[#B98A3E]'
                  }`}
                >
                  <span className="text-sm font-semibold">{option.label}</span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      courseEnrollment === option.id
                        ? 'text-[#F3D9A8]'
                        : 'text-[#55705B]'
                    }`}
                    aria-label={`${option.count} students`}
                  >
                    {option.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </section>

        {isLoading ? (
          <div className="mt-6" role="status">
            <CourseUnitsSkeleton />
          </div>
        ) : error ? (
          <div className="py-6" role="alert">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#A4462F]">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              Could not load the course units roster.
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
          <section aria-label="Students and course units">
            <p className="mb-3 text-sm text-[#4B5646]" aria-live="polite">
              {filteredStudents.length}{' '}
              {filteredStudents.length === 1 ? 'student' : 'students'}
            </p>
            {filteredStudents.length === 0 ? (
              <p className="py-6 text-sm text-[#4B5646]">
                No students match the selected filters.
              </p>
            ) : (
              <ul className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
                {currentStudents.map((student) => {
                  const totalCredits = getTotalCredits(student);
                  const fullName =
                    `${student.firstName} ${student.lastName}`.trim();

                  return (
                    <li
                      key={student.id}
                      className="min-w-0 border-t border-[#D1D5DB] py-4"
                    >
                      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h2 className="min-w-0 break-words text-base font-bold text-[#1A2B4C]">
                          {fullName || 'Unnamed student'}
                        </h2>
                        <p className="shrink-0 text-sm font-semibold text-[#55705B]">
                          Total: {totalCredits} {totalCredits === 1 ? 'credit' : 'credits'}
                        </p>
                      </div>
                      <p className="mt-0.5 break-words text-xs text-[#6B7280]">
                        {student.techCenter?.name ?? 'No tech center'}
                      </p>
                      {student.studentCourses.length > 0 ? (
                        <ul className="mt-2 min-w-0 space-y-1">
                          {student.studentCourses.map((course) => (
                            <li
                              key={course.id}
                              className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm"
                            >
                              <span className="min-w-0 break-words">
                                {course.courseUnit}
                              </span>
                              <span className="shrink-0 text-[#4B5646]">
                                {course.credits} {course.credits === 1 ? 'credit' : 'credits'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-[#6B7280]">
                          No courses listed
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
              {filteredStudents.length > STUDENTS_PER_PAGE && (
                <nav
                  aria-label="Student list pagination"
                  className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#D1D5DB] pt-4"
                >
                  <p className="text-sm text-[#4B5646]">
                    Showing {firstStudentIndex}–{lastStudentIndex} of{' '}
                    {filteredStudents.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex min-h-10 items-center gap-1 border border-[#D1D5DB] bg-white px-3 text-sm font-semibold text-[#1A2B4C] hover:border-[#B98A3E] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      Previous
                    </button>
                    <span className="px-1 text-sm text-[#4B5646]" aria-live="polite">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex min-h-10 items-center gap-1 border border-[#D1D5DB] bg-white px-3 text-sm font-semibold text-[#1A2B4C] hover:border-[#B98A3E] disabled:cursor-not-allowed disabled:opacity-50"
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
