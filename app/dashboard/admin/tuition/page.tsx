'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Home,
  DollarSign,
  Users,
  Loader2,
  Search,
  Filter,
  Building2,
  GraduationCap,
  BookOpen,
  ChevronDown,
  ChevronUp,
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

export default function TuitionPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  // ---------------------------------------------------------
  // FETCH STUDENTS
  // ---------------------------------------------------------

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
  const stats = data?.stats as APIResponse['stats'] || {};
  const techCenter = data?.techCenter;

  // Client-side search filter
  const students = allStudents.filter((student) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower)
    );
  });

  const calculateTotalCredits = (student: Student) => {
    return student.submittedCourses?.reduce(
      (sum, course) => sum + (course.credits || 0),
      0
    ) || 0;
  };

  const toggleExpand = (studentId: string) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#1E293B]">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition-all hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#1A365D]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="mx-1 hidden h-7 w-px bg-[#E2E8F0] sm:block" />

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3182CE]">
                Administration
              </p>

              <h1
                className="truncate text-xl font-bold text-[#1A365D] sm:text-2xl"
                style={{
                  fontFamily: 'var(--font-display)',
                }}
              >
                Tuition Management
              </h1>
            </div>

            {/* Display Tech Center */}
            {techCenter && (
              <div className="hidden items-center gap-2 rounded-xl bg-[#F8FAFC] px-4 py-2 sm:flex">
                <Building2 className="h-4 w-4 text-[#64748B]" />
                <span className="text-sm font-medium text-[#1A365D]">
                  {techCenter.name}
                </span>
                <span className="text-xs text-[#94A3B8]">({techCenter.code})</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Page Introduction */}

        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#1E293B] sm:text-2xl">
            Student Tuition
          </h2>

          <p className="mt-1 text-sm text-[#64748B]">
            Monitor student tuition information and enrollment.
          </p>
        </div>

        {/* =================================================
            SUMMARY CARDS - Simplified
        ================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Students */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B]">
                  Total Students
                </p>
                <p className="mt-2 text-2xl font-bold text-[#1E293B]">
                  {stats.total || 0}
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  In this tech center
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <Users className="h-5 w-5 text-[#475569]" />
              </div>
            </div>
          </div>

          {/* Total Tuition */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B]">
                  Total Tuition
                </p>
                <p className="mt-2 text-2xl font-bold text-[#1A365D]">
                  ${stats.totalTuition?.toLocaleString() || '0'}
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  All students combined
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4FB]">
                <DollarSign className="h-5 w-5 text-[#1A365D]" />
              </div>
            </div>
          </div>

          {/* Total Credits */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B]">
                  Total Credits
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {stats.totalCredits || 0}
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Across all students
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <BookOpen className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* With Tuition */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B]">
                  With Tuition
                </p>
                <p className="mt-2 text-2xl font-bold text-[#1A365D]">
                  {stats.withTuition || 0}
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  {stats.withoutTuition || 0} without tuition
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4FB]">
                <DollarSign className="h-5 w-5 text-[#1A365D]" />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            SEARCH AND FILTER
        ================================================== */}

        <section className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1F5F9]">
              <Filter className="h-4 w-4 text-[#475569]" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#334155]">
                Search & Filter
              </h3>

              <p className="text-xs text-[#94A3B8]">
                Find students by name.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] bg-white py-3 pl-10 pr-4 text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none transition-all focus:border-[#3182CE] focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {/* Status */}
            <div className="relative md:w-52">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm text-[#334155] outline-none transition-all focus:border-[#3182CE] focus:ring-4 focus:ring-blue-50"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-.02 1.06l-4.25 4.5a.75.75 0 01-1.06-1.04L8.94 10 5.23 6.21a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            STUDENT LIST - Enhanced with Profile Images & Courses
        ================================================== */}

        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6 lg:p-7">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4FB]">
                <Users className="h-5 w-5 text-[#1A365D]" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#1E293B] sm:text-xl">
                  Students
                </h2>
                <p className="text-sm text-[#64748B]">
                  Showing {students.length} students
                </p>
              </div>
            </div>

            <span className="rounded-lg bg-[#F8FAFC] px-3 py-2 text-xs font-medium text-[#64748B]">
              {students.length} {students.length === 1 ? 'student' : 'students'}
            </span>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF4FB]">
                <Loader2 className="h-6 w-6 animate-spin text-[#3182CE]" />
              </div>
              <p className="mt-4 text-sm font-medium text-[#475569]">
                Loading students...
              </p>
            </div>
          ) : error ? (
            /* Error */
            <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-12 text-center">
              <h3 className="text-sm font-semibold text-red-700">
                Failed to load students
              </h3>
              <p className="mt-1 text-xs text-red-600/80">
                We couldn't retrieve the tuition information.
              </p>
              <button
                onClick={() => refetch()}
                className="mt-5 rounded-xl bg-[#1A365D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#153475]"
              >
                Retry
              </button>
            </div>
          ) : students.length === 0 ? (
            /* Empty */
            <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-6 py-16 text-center">
              <Users className="mx-auto h-10 w-10 text-[#94A3B8]" />
              <h3 className="mt-4 text-sm font-semibold text-[#475569]">
                No students found
              </h3>
              <p className="mt-1 text-xs text-[#94A3B8]">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            /* Student Cards - Enhanced */
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {students.map((student: Student) => {
                const totalCredits = calculateTotalCredits(student);
                const courseCount = student._count?.submittedCourses || 0;
                const isExpanded = expandedStudent === student.id;

                return (
                  <article
                    key={student.id}
                    className="rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-all duration-200 hover:border-[#CBD5E1] hover:shadow-md"
                  >
                    {/* Student Name, Status & Profile Image */}
                    <div className="flex items-center gap-3">
                      {/* Profile Image */}
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[#E2E8F0] bg-[#F8FAFC]">
                        {student.profileImageUrl ? (
                          <Image
                            src={student.profileImageUrl}
                            alt={`${student.firstName} ${student.lastName}`}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#EEF4FB] text-sm font-bold text-[#1A365D]">
                            {student.firstName?.charAt(0)}
                            {student.lastName?.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-[#1A365D]">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p
                          className={`text-xs font-medium ${
                            student.status === 'SUSPENDED'
                              ? 'text-amber-600'
                              : student.isActive
                              ? 'text-emerald-600'
                              : 'text-red-500'
                          }`}
                        >
                          {student.status === 'SUSPENDED'
                            ? 'Suspended'
                            : student.isActive
                            ? 'Active'
                            : 'Inactive'}
                        </p>
                      </div>
                    </div>

                    {/* Tuition Amount */}
                    <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                        Tuition
                      </p>
                      <p className="mt-1 text-2xl font-bold text-[#1A365D]">
                        ${(student.tuitionAmount || 0).toLocaleString()}
                      </p>
                    </div>

                    {/* Course & Credits Summary */}
                    <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-[#64748B]">
                          <BookOpen className="h-4 w-4" />
                          <span>
                            <span className="font-semibold text-[#334155]">
                              {courseCount}
                            </span>{' '}
                            {courseCount === 1 ? 'Course' : 'Courses'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#64748B]">
                          <GraduationCap className="h-4 w-4" />
                          <span>
                            <span className="font-semibold text-[#334155]">
                              {totalCredits}
                            </span>{' '}
                            {totalCredits === 1 ? 'Credit' : 'Credits'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Button - Only show if student has courses */}
                    {student.submittedCourses && student.submittedCourses.length > 0 && (
                      <button
                        onClick={() => toggleExpand(student.id)}
                        className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-[#E2E8F0] py-2 text-xs font-medium text-[#64748B] transition-all hover:bg-[#F8FAFC]"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Hide Courses
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Show Courses ({student.submittedCourses.length})
                          </>
                        )}
                      </button>
                    )}

                    {/* Expanded Course List */}
                    {isExpanded && student.submittedCourses && student.submittedCourses.length > 0 && (
                      <div className="mt-3 border-t border-[#E2E8F0] pt-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Course List
                        </p>
                        <div className="max-h-48 space-y-2 overflow-y-auto">
                          {student.submittedCourses.map((course) => (
                            <div
                              key={course.id}
                              className="flex items-center justify-between rounded-lg bg-[#F8FAFC] px-3 py-2 text-sm"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-[#1E293B]">
                                  {course.name}
                                </p>
                                <p className="text-xs text-[#94A3B8]">
                                  {course.code} • {course.courseUnit}
                                </p>
                              </div>
                              <span className="ml-2 shrink-0 rounded-full bg-[#EEF4FB] px-2.5 py-1 text-xs font-semibold text-[#1A365D]">
                                {course.credits} {course.credits === 1 ? 'credit' : 'credits'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}