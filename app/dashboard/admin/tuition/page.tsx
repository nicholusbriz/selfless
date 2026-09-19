'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Building2,
  DollarSign,
  Filter,
  GraduationCap,
  Search,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  courseUnit: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isActive: boolean;
  tuitionAmount?: number;
  profileImageUrl?: string | null;
  submittedCourses: Course[];
  _count: {
    submittedCourses: number;
  };
}

interface APIResponse {
  users: Student[];
  stats: {
    total: number;
    withTuition: number;
    withoutTuition: number;
    totalTuition: number;
    totalCredits: number;
    active: number;
    inactive: number;
    suspended: number;
  };
  statuses: string[];
  techCenter: {
    id: string;
    name: string;
    code: string;
  };
}

type TuitionFilter = 'all' | 'with' | 'without';

/* =========================================================
   SKELETONS
========================================================= */

function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#DADCD3] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-3 w-20 animate-pulse rounded bg-[#F0F2EF]" />
          <div className="mt-2 h-7 w-16 animate-pulse rounded bg-[#E8EBE7]" />
        </div>

        <div className="hidden h-8 w-8 shrink-0 animate-pulse rounded-lg bg-[#F0F2EF] sm:block" />
      </div>
    </div>
  );
}

function StudentCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#DADCD3] bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[#E8EBE7]" />

        <div className="min-w-0 flex-1">
          <div className="h-4 w-40 animate-pulse rounded bg-[#E8EBE7]" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[#F0F2EF]" />
        </div>

        <div className="hidden h-7 w-20 animate-pulse rounded bg-[#F0F2EF] sm:block" />
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <div className="h-2.5 w-12 animate-pulse rounded bg-[#F0F2EF]" />
          <div className="mt-2 h-7 w-24 animate-pulse rounded bg-[#E8EBE7]" />
        </div>

        <div className="h-3 w-16 animate-pulse rounded bg-[#F0F2EF]" />
      </div>

      <div className="mt-4 border-t border-[#EEF0ED] pt-3">
        <div className="h-3 w-full animate-pulse rounded bg-[#F0F2EF]" />
        <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-[#F0F2EF]" />
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function TuitionPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tuitionFilter, setTuitionFilter] =
    useState<TuitionFilter>('all');

  /* =======================================================
     FETCH STUDENTS
  ======================================================= */

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<APIResponse>({
    queryKey: ['tuition-students', statusFilter],

    queryFn: async () => {
      const params = new URLSearchParams({
        limit: '1000',
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(
        `/api/admin/tech-centers/users?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      return response.json();
    },

    staleTime: 30000,
    refetchInterval: 30000,
  });

  const allStudents: Student[] = data?.users || [];

  const stats = data?.stats || {
    total: 0,
    withTuition: 0,
    withoutTuition: 0,
    totalTuition: 0,
    totalCredits: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
  };

  const techCenter = data?.techCenter;

  /* =======================================================
     FILTER STUDENTS
  ======================================================= */

  const students = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return allStudents.filter((student) => {
      const fullName =
        `${student.firstName} ${student.lastName}`.toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        student.firstName.toLowerCase().includes(normalizedSearch) ||
        student.lastName.toLowerCase().includes(normalizedSearch);

      const hasTuition =
        typeof student.tuitionAmount === 'number' &&
        student.tuitionAmount > 0;

      const matchesTuition =
        tuitionFilter === 'all' ||
        (tuitionFilter === 'with' && hasTuition) ||
        (tuitionFilter === 'without' && !hasTuition);

      return matchesSearch && matchesTuition;
    });
  }, [allStudents, searchTerm, tuitionFilter]);

  /* =======================================================
     HELPERS
  ======================================================= */

  const calculateTotalCredits = (student: Student) => {
    return (
      student.submittedCourses?.reduce(
        (sum, course) => sum + (course.credits || 0),
        0
      ) || 0
    );
  };

  const formatTuition = (amount?: number) => {
    return `$${(amount || 0).toLocaleString()}`;
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#F1F1EC] text-[#12203B]">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-[#DADCD3] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DADCD3] bg-white text-[#6B7268] transition-all hover:border-[#C9CCC4] hover:bg-[#F7F6F2] hover:text-[#12203B]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="hidden h-6 w-px bg-[#DADCD3] sm:block" />

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A9088]">
                Administration
              </p>

              <h1 className="truncate text-lg font-bold tracking-tight text-[#12203B] sm:text-xl">
                Tuition Management
              </h1>
            </div>

            {isLoading ? (
              <div className="hidden h-9 w-40 animate-pulse rounded-lg bg-[#F0F2EF] sm:block" />
            ) : (
              techCenter && (
                <div className="hidden items-center gap-2 rounded-lg border border-[#E4E6E0] bg-[#F7F6F2] px-3 py-2 sm:flex">
                  <Building2 className="h-4 w-4 text-[#6B7268]" />

                  <span className="text-xs font-semibold text-[#344136]">
                    {techCenter.name}
                  </span>

                  <span className="text-[10px] text-[#8A9088]">
                    {techCenter.code}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {/* PAGE TITLE */}

        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#12203B]">
              Student Tuition
            </h2>

            <p className="mt-0.5 text-sm text-[#6B7268]">
              Review tuition records and enrolled courses.
            </p>
          </div>

          {!isLoading && (
            <p className="text-xs text-[#8A9088]">
              Showing {students.length} of {allStudents.length}
            </p>
          )}
        </div>

        {/* =====================================================
            SUMMARY
        ====================================================== */}

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {isLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              {/* Students */}

              <div className="rounded-xl border border-[#DADCD3] bg-white p-4 transition-shadow hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-[#6B7268]">
                      Students
                    </p>

                    <p className="mt-1 text-2xl font-bold tracking-tight text-[#12203B]">
                      {stats.total || 0}
                    </p>
                  </div>

                  <div className="hidden h-8 w-8 items-center justify-center rounded-lg bg-[#F1F1EC] sm:flex">
                    <Users className="h-4 w-4 text-[#55705B]" />
                  </div>
                </div>
              </div>

              {/* Total Tuition */}

              <div className="rounded-xl border border-[#DADCD3] bg-white p-4 transition-shadow hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#6B7268]">
                      Total Tuition
                    </p>

                    <p className="mt-1 truncate text-2xl font-bold tracking-tight text-[#12203B]">
                      {formatTuition(stats.totalTuition)}
                    </p>
                  </div>

                  <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F7F1E5] sm:flex">
                    <DollarSign className="h-4 w-4 text-[#B98A3E]" />
                  </div>
                </div>
              </div>

              {/* With Tuition */}

              <button
                type="button"
                onClick={() => setTuitionFilter('with')}
                className={`rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
                  tuitionFilter === 'with'
                    ? 'border-[#B98A3E] bg-[#FBF7EF] shadow-sm'
                    : 'border-[#DADCD3] bg-white hover:bg-[#F7F6F2]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-[#6B7268]">
                      With Tuition
                    </p>

                    <p className="mt-1 text-2xl font-bold tracking-tight text-[#12203B]">
                      {stats.withTuition || 0}
                    </p>
                  </div>

                  <div className="hidden h-8 w-8 items-center justify-center rounded-lg bg-[#F7F1E5] sm:flex">
                    <DollarSign className="h-4 w-4 text-[#B98A3E]" />
                  </div>
                </div>
              </button>

              {/* Without Tuition */}

              <button
                type="button"
                onClick={() => setTuitionFilter('without')}
                className={`rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
                  tuitionFilter === 'without'
                    ? 'border-[#A4462F] bg-[#FBF3F0] shadow-sm'
                    : 'border-[#DADCD3] bg-white hover:bg-[#F7F6F2]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-[#6B7268]">
                      Without Tuition
                    </p>

                    <p className="mt-1 text-2xl font-bold tracking-tight text-[#12203B]">
                      {stats.withoutTuition || 0}
                    </p>
                  </div>

                  <div className="hidden h-8 w-8 items-center justify-center rounded-lg bg-[#F8EDEA] sm:flex">
                    <DollarSign className="h-4 w-4 text-[#A4462F]" />
                  </div>
                </div>
              </button>
            </>
          )}
        </div>

        {/* =====================================================
            SEARCH & FILTER
        ====================================================== */}

        <section className="mb-5 rounded-xl border border-[#DADCD3] bg-white p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#55705B]" />

            <div>
              <h3 className="text-sm font-semibold text-[#12203B]">
                Search & Filter
              </h3>

              <p className="text-[11px] text-[#8A9088]">
                Find students by name, status, or tuition record.
              </p>
            </div>
          </div>

          <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            {/* Search */}

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9088]" />

              <input
                type="text"
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#DADCD3] bg-white pl-9 pr-3 text-sm text-[#12203B] outline-none transition-colors placeholder:text-[#9A9F98] focus:border-[#55705B] focus:ring-2 focus:ring-[#55705B]/10"
              />
            </div>

            {/* Status */}

            <div>
              <label
                htmlFor="student-status"
                className="sr-only"
              >
                Student status
              </label>

              <select
                id="student-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#DADCD3] bg-white px-3 text-sm text-[#344136] outline-none transition-colors focus:border-[#55705B] focus:ring-2 focus:ring-[#55705B]/10"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {/* Tuition */}

            <div>
              <label
                htmlFor="tuition-status"
                className="sr-only"
              >
                Tuition status
              </label>

              <select
                id="tuition-status"
                value={tuitionFilter}
                onChange={(e) =>
                  setTuitionFilter(
                    e.target.value as TuitionFilter
                  )
                }
                className="h-10 w-full rounded-lg border border-[#DADCD3] bg-white px-3 text-sm text-[#344136] outline-none transition-colors focus:border-[#55705B] focus:ring-2 focus:ring-[#55705B]/10"
              >
                <option value="all">All Tuition</option>
                <option value="with">With Tuition</option>
                <option value="without">
                  Without Tuition
                </option>
              </select>
            </div>
          </div>

          {tuitionFilter !== 'all' && (
            <div className="mt-3 flex items-center justify-between border-t border-[#EEF0ED] pt-3">
              <p className="text-xs text-[#6B7268]">
                Showing students{' '}
                <span className="font-semibold text-[#344136]">
                  {tuitionFilter === 'with'
                    ? 'with tuition'
                    : 'without tuition'}
                </span>
              </p>

              <button
                type="button"
                onClick={() => setTuitionFilter('all')}
                className="text-xs font-semibold text-[#55705B] hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </section>

        {/* =====================================================
            STUDENT LIST
        ====================================================== */}

        <section className="rounded-xl border border-[#DADCD3] bg-white">
          {/* LIST HEADER */}

          <div className="flex items-center justify-between gap-3 border-b border-[#E8EAE5] px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F1EC]">
                <Users className="h-4 w-4 text-[#55705B]" />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-bold text-[#12203B]">
                  Students
                </h2>

                <p className="text-[11px] text-[#8A9088]">
                  Tuition and course overview
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-md bg-[#F7F6F2] px-2 py-1 text-[11px] font-semibold text-[#6B7268]">
              {isLoading ? '...' : students.length}
            </span>
          </div>

          <div className="p-3 sm:p-4">
            {/* =================================================
                LOADING
            ================================================== */}

            {isLoading ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <StudentCardSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              /* =================================================
                 ERROR
              ================================================== */

              <div className="rounded-lg border border-[#E7C9C2] bg-[#FBF3F0] px-5 py-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F8EDEA]">
                  <DollarSign className="h-5 w-5 text-[#A4462F]" />
                </div>

                <h3 className="mt-3 text-sm font-semibold text-[#7E3426]">
                  Failed to load students
                </h3>

                <p className="mt-1 text-xs text-[#A4462F]/80">
                  We couldn't retrieve the tuition information.
                </p>

                <button
                  onClick={() => refetch()}
                  className="mt-4 rounded-lg bg-[#12203B] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1C2D4B]"
                >
                  Retry
                </button>
              </div>
            ) : students.length === 0 ? (
              /* =================================================
                 EMPTY
              ================================================== */

              <div className="rounded-lg border border-dashed border-[#DADCD3] bg-[#F7F6F2] px-5 py-12 text-center">
                <Users className="mx-auto h-8 w-8 text-[#9A9F98]" />

                <h3 className="mt-3 text-sm font-semibold text-[#344136]">
                  No students found
                </h3>

                <p className="mt-1 text-xs text-[#8A9088]">
                  Try changing your search or filter settings.
                </p>
              </div>
            ) : (
              /* =================================================
                 STUDENT CARDS
              ================================================== */

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {students.map((student) => {
                  const totalCredits =
                    calculateTotalCredits(student);

                  const courseCount =
                    student._count?.submittedCourses ??
                    student.submittedCourses?.length ??
                    0;

                  const hasTuition =
                    typeof student.tuitionAmount === 'number' &&
                    student.tuitionAmount > 0;

                  return (
                    <article
                      key={student.id}
                      className={`group relative overflow-hidden rounded-xl border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                        hasTuition
                          ? 'border-[#DADCD3] hover:border-[#C8CBC3]'
                          : 'border-[#E4D7D2] hover:border-[#D7C3BC]'
                      }`}
                    >
                      {/* Small status accent */}

                      <div
                        className={`absolute left-0 top-0 h-full w-0.5 ${
                          hasTuition
                            ? 'bg-[#B98A3E]'
                            : 'bg-[#A4462F]'
                        }`}
                      />

                      {/* =================================================
                          STUDENT HEADER
                      ================================================== */}

                      <div className="flex items-center gap-3">
                        {/* Profile */}

                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#DADCD3] bg-[#F1F1EC]">
                          {student.profileImageUrl ? (
                            <Image
                              src={student.profileImageUrl}
                              alt={`${student.firstName} ${student.lastName}`}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[11px] font-bold text-[#55705B]">
                              {student.firstName?.charAt(0)}
                              {student.lastName?.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Name + status */}

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <h3 className="min-w-0 truncate text-sm font-bold text-[#12203B]">
                              {student.firstName}{' '}
                              {student.lastName}
                            </h3>

                            <span
                              className={`shrink-0 text-[10px] font-semibold ${
                                student.status === 'SUSPENDED'
                                  ? 'text-[#A46A16]'
                                  : student.isActive
                                  ? 'text-[#55705B]'
                                  : 'text-[#A4462F]'
                              }`}
                            >
                              {student.status === 'SUSPENDED'
                                ? 'Suspended'
                                : student.isActive
                                ? 'Active'
                                : 'Inactive'}
                            </span>
                          </div>

                          {/* Course count + credits on same line */}

                          <div className="mt-1 flex items-center gap-2 text-[10px] text-[#8A9088]">
                            <span>
                              {courseCount}{' '}
                              {courseCount === 1
                                ? 'course'
                                : 'courses'}
                            </span>

                            <span className="h-1 w-1 rounded-full bg-[#C5C9C1]" />

                            <span>
                              {totalCredits}{' '}
                              {totalCredits === 1
                                ? 'credit'
                                : 'credits'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* =================================================
                          TUITION ROW
                      ================================================== */}

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7A8077]">
                            Tuition
                          </p>

                          <div className="mt-0.5 flex items-baseline gap-2">
                            <p
                              className={`text-2xl font-bold tracking-tight ${
                                hasTuition
                                  ? 'text-[#12203B]'
                                  : 'text-[#7E3426]'
                              }`}
                            >
                              {formatTuition(
                                student.tuitionAmount
                              )}
                            </p>

                            <span
                              className={`text-[10px] font-semibold ${
                                hasTuition
                                  ? 'text-[#806126]'
                                  : 'text-[#A4462F]'
                              }`}
                            >
                              {hasTuition
                                ? 'Recorded'
                                : 'Not recorded'}
                            </span>
                          </div>
                        </div>

                        {/* Tuition icon */}

                        <div
                          className={`mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            hasTuition
                              ? 'bg-[#F7F1E5] text-[#B98A3E]'
                              : 'bg-[#F8EDEA] text-[#A4462F]'
                          }`}
                        >
                          <DollarSign className="h-4 w-4" />
                        </div>
                      </div>

                      {/* =================================================
                          COURSE INFORMATION
                      ================================================== */}

                      <div className="mt-4 border-t border-[#EEF0ED] pt-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-[#55705B]" />

                            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7A8077]">
                              Courses
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] text-[#8A9088]">
                            <GraduationCap className="h-3 w-3" />

                            <span>
                              {totalCredits}{' '}
                              {totalCredits === 1
                                ? 'credit'
                                : 'credits'}
                            </span>
                          </div>
                        </div>

                        {student.submittedCourses?.length > 0 ? (
                          <div className="mt-2 space-y-1">
                            {student.submittedCourses.map(
                              (course) => (
                                <div
                                  key={course.id}
                                  className="flex items-center justify-between gap-3 text-[11px] leading-4"
                                >
                                  <span className="min-w-0 truncate text-[#4B564C]">
                                    {course.name}
                                  </span>

                                  <span className="shrink-0 text-[10px] font-medium text-[#8A9088]">
                                    {course.credits}{' '}
                                    {course.credits === 1
                                      ? 'credit'
                                      : 'credits'}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="mt-2 text-[11px] text-[#9A9F98]">
                            No courses submitted
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}