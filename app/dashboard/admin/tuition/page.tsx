'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Filter,
  Search,
  Users,
  DollarSign,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isActive: boolean;
  tuitionAmount?: number | null;
  profileImageUrl?: string | null;
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
  techCenter?: {
    id: string;
    name: string;
    code: string;
  };
}

type TuitionFilter = 'all' | 'with' | 'without';

export default function TuitionPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tuitionFilter, setTuitionFilter] = useState<TuitionFilter>('all');

  const { data, isLoading, error, refetch } = useQuery<APIResponse>({
    queryKey: ['tuition-students', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: '1000',
        lite: 'true',
      });
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(
        `/api/admin/tech-centers/users?${params.toString()}`,
      );
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    },
    staleTime: 2 * 60 * 1000,
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

  const students = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return allStudents
      .filter((student) => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
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
      })
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
          undefined,
          { sensitivity: 'base' },
        ),
      );
  }, [allStudents, searchTerm, tuitionFilter]);

  const formatTuition = (amount?: number | null) =>
    typeof amount === 'number' && amount > 0
      ? `$${amount.toLocaleString()}`
      : '$0';

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A2B4C]">
      {/* HEADER */}
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-6xl px-3 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:border-[#C59B4C] hover:text-[#1A2B4C]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="hidden h-5 w-px bg-[#E5E7EB] sm:block" />

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Administration
              </p>
              <h1 className="truncate text-[15px] font-bold tracking-tight text-[#1A2B4C] sm:text-[16px]">
                Tuition Management
              </h1>
            </div>

            {isLoading ? (
              <div className="hidden h-8 w-36 animate-pulse rounded-md bg-[#F3F4F6] sm:block" />
            ) : (
              techCenter && (
                <div className="hidden items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-[#F8F9FA] px-2.5 py-1.5 sm:flex">
                  <Building2 className="h-3.5 w-3.5 text-[#6B7280]" />
                  <span className="text-[11.5px] font-semibold text-[#4B5646]">
                    {techCenter.name}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF]">
                    {techCenter.code}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-5 sm:py-5">
        {/* STATS — compact inline strip */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5"
              >
                <div className="h-2.5 w-16 animate-pulse rounded bg-[#F3F4F6]" />
                <div className="mt-1.5 h-5 w-12 animate-pulse rounded bg-[#F3F4F6]" />
              </div>
            ))
          ) : (
            <>
              <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-[#9CA3AF]" />
                  <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[#6B7280]">
                    Students
                  </p>
                </div>
                <p className="mt-0.5 text-[18px] font-bold leading-tight text-[#1A2B4C]">
                  {stats.total || 0}
                </p>
              </div>

              <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3 w-3 text-[#9CA3AF]" />
                  <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[#6B7280]">
                    Total Tuition
                  </p>
                </div>
                <p className="mt-0.5 text-[18px] font-bold leading-tight text-[#1A2B4C]">
                  ${(stats.totalTuition || 0).toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTuitionFilter('with')}
                className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  tuitionFilter === 'with'
                    ? 'border-[#C59B4C] bg-[#FBF7EE]'
                    : 'border-[#E5E7EB] bg-white hover:border-[#C59B4C]/50 hover:bg-[#F8F9FA]'
                }`}
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[#6B7280]">
                  With Tuition
                </p>
                <p className="mt-0.5 text-[18px] font-bold leading-tight text-[#1A2B4C]">
                  {stats.withTuition || 0}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTuitionFilter('without')}
                className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  tuitionFilter === 'without'
                    ? 'border-[#C59B4C] bg-[#FBF7EE]'
                    : 'border-[#E5E7EB] bg-white hover:border-[#C59B4C]/50 hover:bg-[#F8F9FA]'
                }`}
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[#6B7280]">
                  Without Tuition
                </p>
                <p className="mt-0.5 text-[18px] font-bold leading-tight text-[#1A2B4C]">
                  {stats.withoutTuition || 0}
                </p>
              </button>
            </>
          )}
        </div>

        {/* SEARCH & FILTER — compact single row */}
        <section className="mb-4 rounded-lg border border-[#E5E7EB] bg-white">
          <div className="flex items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
            <Filter className="h-3.5 w-3.5 text-[#9CA3AF]" />
            <h3 className="text-[12px] font-semibold text-[#1A2B4C]">
              Search & Filter
            </h3>
            <span className="text-[10.5px] text-[#9CA3AF]">
              — Find students by name, status, or tuition
            </span>
          </div>

          <div className="grid gap-2 px-3 py-2.5 md:grid-cols-[minmax(0,1fr)]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-3 text-[12.5px] text-[#1A2B4C] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#C59B4C] focus:ring-2 focus:ring-[#C59B4C]/15"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-[#F3F4F6] px-3 py-2">
            {/* Tuition tabs */}
            <div
              className="flex min-w-0 flex-1 rounded-md border border-[#E5E7EB] bg-white p-0.5"
              role="tablist"
              aria-label="Tuition filter"
            >
              {(
                [
                  ['all', 'All'],
                  ['with', 'With tuition'],
                  ['without', 'Without tuition'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={tuitionFilter === value}
                  onClick={() => setTuitionFilter(value)}
                  className={`flex-1 rounded px-2.5 py-1.5 text-[11.5px] font-semibold transition sm:flex-none sm:px-3.5 ${
                    tuitionFilter === value
                      ? 'bg-[#1A2B4C] text-white'
                      : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A2B4C]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Status dropdown — same row as the tabs */}
            <div className="w-32 shrink-0 sm:w-40">
              <label htmlFor="student-status" className="sr-only">
                Student status
              </label>
              <select
                id="student-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12.5px] text-[#4B5646] outline-none transition-colors focus:border-[#C59B4C] focus:ring-2 focus:ring-[#C59B4C]/15"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </section>

        {/* STUDENT LIST */}
        <section className="rounded-lg border border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-[#F3F4F6] px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <Users className="h-3.5 w-3.5 shrink-0 text-[#6B7280]" />
              <h2 className="text-[12.5px] font-semibold text-[#1A2B4C]">
                Students
              </h2>
              <span className="rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-semibold text-[#6B7280]">
                {isLoading ? '…' : students.length}
              </span>
            </div>
          </div>

          <div className="px-3 py-2">
            {isLoading ? (
              <div className="space-y-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-md px-1.5 py-2"
                  >
                    <div className="h-8 w-8 animate-pulse rounded-full bg-[#F3F4F6]" />
                    <div className="h-3 w-40 animate-pulse rounded bg-[#F3F4F6]" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-8 text-center">
                <AlertCircle className="mx-auto h-6 w-6 text-red-600" />
                <h3 className="mt-2 text-[13px] font-semibold text-red-900">
                  Failed to load students
                </h3>
                <p className="mt-0.5 text-[11.5px] text-red-700">
                  We couldn't retrieve the tuition information.
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#1A2B4C] px-3 py-1.5 text-[11.5px] font-semibold text-white transition-colors hover:bg-[#263D66]"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
              </div>
            ) : students.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#E5E7EB] bg-[#F8F9FA] px-4 py-10 text-center">
                <Users className="mx-auto h-6 w-6 text-[#9CA3AF]" />
                <h3 className="mt-2 text-[13px] font-semibold text-[#4B5646]">
                  No students found
                </h3>
                <p className="mt-0.5 text-[11.5px] text-[#9CA3AF]">
                  Try changing your search or filter settings.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#F3F4F6]">
                {students.map((student) => {
                  const hasTuition =
                    typeof student.tuitionAmount === 'number' &&
                    student.tuitionAmount > 0;

                  return (
                    <li
                      key={student.id}
                      className="flex items-center gap-2.5 px-1 py-2"
                    >
                      {student.profileImageUrl ? (
                        <Image
                          src={student.profileImageUrl}
                          alt={`${student.firstName} ${student.lastName}`}
                          width={32}
                          height={32}
                          unoptimized
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A2B4C] text-[10px] font-bold text-white">
                          {student.firstName?.charAt(0)}
                          {student.lastName?.charAt(0)}
                        </div>
                      )}

                      <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[#1A2B4C]">
                        {student.firstName} {student.lastName}
                      </span>

                      <span
                        className={`shrink-0 text-[12px] font-semibold ${
                          hasTuition ? 'text-[#1A2B4C]' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {formatTuition(student.tuitionAmount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}