'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  X,
  BookOpen,
  ArrowUp,
  AlertCircle,
  Check,
  ChevronRight,
  ArrowDownUp,
  LayoutGrid,
  List,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

// ============================================================
// STUDENTS DIRECTORY
// Clean institutional light theme
// Enhanced text visibility · no horizontal scroll
// ============================================================

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  role: { name: string };
  techCenter: {
    id: string;
    name: string;
    country: { name: string };
  } | null;
  generalCourse: string | null;
  takesReligion: boolean | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  studentCourses: Array<{
    id: string;
    code: string;
    courseUnit: string;
    credits: number;
    status: string;
  }>;
}

interface TechCenter {
  id: string;
  name: string;
  country: { name: string };
  _count?: { students: number };
}

type Router = ReturnType<typeof useRouter>;

// ============================================================
// TECH CENTER HUES
// Each tech center gets a consistent color dot for wayfinding.
// ============================================================

const TECH_CENTER_HUES: Record<string, string> = {
  'Freedom City Tech Center': '#55705B',
  'Kampala Central': '#3E5C76',
  'Gulu Hub': '#7C3AED',
  'Mbarara Tech': '#B98A3E',
  'Jinja Center': '#A4462F',
};

const getTechCenterHue = (name: string | undefined): string => {
  if (!name) return '#9CA3AF';
  if (TECH_CENTER_HUES[name]) return TECH_CENTER_HUES[name];

  // Fallback: deterministic hue from string
  const palette = ['#55705B', '#3E5C76', '#7C3AED', '#B98A3E', '#A4462F', '#0F766E'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
};

// ============================================================
// SORT HELPERS
// ============================================================

type SortOption = 'name' | 'newest' | 'active';

const sortStudents = (students: Student[], sortBy: SortOption): Student[] => {
  const copy = [...students];
  if (sortBy === 'name') {
    return copy.sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.trim().toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }
  if (sortBy === 'newest') {
    return copy.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  // active
  return copy.sort((a, b) => Number(b.isActive) - Number(a.isActive));
};

// ============================================================
// SMALL STAT
// ============================================================

const Stat = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="min-w-0">
    <p className="font-mono text-[10px] uppercase tracking-[0.09em] text-[#B98A3E] font-bold">
      {label}
    </p>

    <div className="mt-1 text-[13px] font-bold leading-4 text-[#1A2B4C] break-words">
      {children}
    </div>
  </div>
);

// ============================================================
// SEARCH & FILTER
// ============================================================

const SearchFilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedLocation,
  setSelectedLocation,
  locations,
  totalStudents,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocation: string;
  setSelectedLocation: (id: string) => void;
  locations: TechCenter[];
  totalStudents: number;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}) => {
  const activeLocation = locations.find((loc) => loc.id === selectedLocation);

  const chipBase =
    'inline-flex items-center justify-center gap-1.5 min-h-[34px] px-3 py-1.5 border text-[12px] font-semibold leading-tight transition-colors duration-150 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-1';

  const chipOn = 'bg-[#1A2B4C] border-[#1A2B4C] text-white';
  const chipOff =
    'bg-white border-[#E5E7EB] text-[#374151] hover:border-[#B98A3E] hover:text-[#1A2B4C] hover:bg-[#F8F9FA]';

  const useDropdown = locations.length > 8;

  return (
    <section className="rounded-lg border border-[#E5E7EB] bg-white shadow-md">
      {/* SEARCH */}
      <div className="px-4 py-4 sm:px-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="h-4 w-[3px] bg-[#B98A3E] rounded-full" />
              <h2 className="text-[16px] font-bold tracking-tight text-[#1A2B4C]">
                Search students
              </h2>
            </div>
            <p className="mt-1 text-[12px] text-[#4B5646]">
              Find students by name, course, or tech center.
            </p>
          </div>

          <div className="relative w-full md:w-[390px] lg:w-[450px] shrink-0">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280] pointer-events-none"
              strokeWidth={2}
            />
            <input
              type="text"
              inputMode="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, courses..."
              aria-label="Search students"
              className="
                w-full h-10 pl-9 pr-9
                bg-[#F7F6F2]
                border border-[#E5E7EB] rounded
                text-[#1A2B4C]
                placeholder:text-[#9CA3AF]
                text-[13px] font-semibold
                focus:outline-none
                focus:bg-white
                focus:border-[#B98A3E]
                transition-colors
              "
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-[#1A2B4C]"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="border-t border-[#E5E7EB] bg-[#F7F6F2] px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3">
          {/* TOP ROW: label + count + sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#B98A3E] font-bold">
                Tech centers
              </span>
              <span className="inline-flex items-center gap-1 border border-[#E5E7EB] bg-white px-2 py-1 rounded">
                <Users className="w-3 h-3 text-[#1A2B4C]" strokeWidth={2} />
                <span className="font-mono text-[11px] font-bold text-[#1A2B4C] tabular-nums">
                  {totalStudents}
                </span>
              </span>
            </div>

            {/* SORT */}
            <div className="ml-auto flex items-center gap-1.5">
              <ArrowDownUp className="w-3.5 h-3.5 text-[#B98A3E]" />
              <label htmlFor="sort-select" className="sr-only">
                Sort students
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="
                  h-8 px-2 pr-7
                  bg-white border border-[#E5E7EB] rounded
                  text-[11px] font-bold text-[#1A2B4C]
                  focus:outline-none focus:border-[#B98A3E]
                  cursor-pointer
                "
              >
                <option value="name">Sort: Name (A–Z)</option>
                <option value="newest">Sort: Newest</option>
                <option value="active">Sort: Recently Active</option>
              </select>
            </div>
          </div>

          {/* CHIPS or DROPDOWN */}
          {useDropdown ? (
            <div className="flex items-center gap-2">
              <label htmlFor="tech-center-select" className="sr-only">
                Filter by tech center
              </label>
              <select
                id="tech-center-select"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="
                  w-full h-10 px-3
                  bg-white border border-[#E5E7EB] rounded
                  text-[12px] font-bold text-[#1A2B4C]
                  focus:outline-none focus:border-[#B98A3E]
                  cursor-pointer
                "
              >
                <option value="all">
                  All tech centers ({totalStudents})
                </option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc._count?.students || 0})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="tablist"
              aria-label="Filter by tech center"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedLocation === 'all'}
                onClick={() => setSelectedLocation('all')}
                className={`${chipBase} ${selectedLocation === 'all' ? chipOn : chipOff}`}
              >
                <Users className="w-3.5 h-3.5" strokeWidth={2.2} />
                <span>All</span>
                <span
                  className={`font-mono text-[10px] tabular-nums ${
                    selectedLocation === 'all' ? 'text-white/80' : 'text-[#6B7280]'
                  }`}
                >
                  {totalStudents}
                </span>
              </button>

              {locations.map((location) => {
                const count = location._count?.students || 0;
                const isSelected = selectedLocation === location.id;
                const hue = getTechCenterHue(location.name);

                return (
                  <button
                    key={location.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedLocation(location.id)}
                    title={location.name}
                    className={`${chipBase} ${isSelected ? chipOn : chipOff}`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: isSelected ? '#fff' : hue }}
                    />
                    <span className="break-words text-left">{location.name}</span>
                    <span
                      className={`font-mono text-[10px] tabular-nums ${
                        isSelected ? 'text-white/80' : 'text-[#6B7280]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ACTIVE FILTER */}
          {selectedLocation !== 'all' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#6B7280]">Showing</span>
              <span className="inline-flex items-center gap-1.5 border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] font-bold text-[#1A2B4C] rounded">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getTechCenterHue(activeLocation?.name) }}
                />
                {activeLocation?.name || 'Selected center'}
                <Check className="w-3 h-3 text-[#B98A3E]" strokeWidth={3} />
              </span>
            </div>
          )}

          {/* VIEW MODE TOGGLE */}
          <div className="flex items-center gap-1 border border-[#E5E7EB] bg-white rounded-lg p-1 ml-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#B98A3E] text-white'
                  : 'text-[#6B7280] hover:text-[#1A2B4C]'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="text-[11px] font-semibold">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#B98A3E] text-white'
                  : 'text-[#6B7280] hover:text-[#1A2B4C]'
              }`}
              title="List view"
            >
              <List className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="text-[11px] font-semibold">List</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// STUDENT CARD (Grid View)
// ============================================================

const StudentCard = ({
  student,
  index,
  router,
}: {
  student: Student;
  index: number;
  router: Router;
}) => {
  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const getTotalCredits = (s: Student) =>
    s.studentCourses?.reduce(
      (total, course) => total + (course.credits || 0),
      0,
    ) ?? 0;

  const initials = getInitials(student.firstName, student.lastName);
  const fullName = `${student.firstName} ${student.lastName}`;
  const totalCredits = getTotalCredits(student);
  const hue = getTechCenterHue(student.techCenter?.name);

  return (
    <article
      className="
        group bg-white shadow-lg
        overflow-hidden
        transition-all duration-200
        hover:shadow-xl hover:-translate-y-0.5
      "
    >
      <div className="flex h-full">
        {/* LEFT: User Image - Half Width */}
        <div className="w-1/2 min-h-[200px] relative bg-[#F7F6F2]">
          {student.profileImageUrl ? (
            <Image
              src={student.profileImageUrl}
              alt={fullName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 200px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#1A2B4C]">
              <span className="text-white text-[24px] font-mono font-bold">
                {initials}
              </span>
            </div>
          )}

          {/* Active Status Indicator */}
          <span
            className={`absolute top-3 right-3 w-2.5 h-2.5 border-2 border-white rounded-full ${
              student.isActive ? 'bg-[#55705B]' : 'bg-[#9CA3AF]'
            }`}
            title={student.isActive ? 'Active' : 'Inactive'}
          />
        </div>

        {/* RIGHT: Content - Half Width */}
        <div className="w-1/2 flex flex-col p-3">
          {/* Header */}
          <div className="mb-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[14px] font-bold leading-tight text-[#1A2B4C] break-words flex-1">
                {fullName}
              </h3>
              <span className="text-[9px] text-[#4B5646] shrink-0">
                {student.role?.name === 'teacher' ? 'Tutor' : student.role?.name || 'Student'}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-[9px] text-[#4B5646]">
              <span
                className="w-1 h-1 rounded-full shrink-0"
                style={{ backgroundColor: hue }}
              />
              <span className="truncate">
                {student.techCenter?.name || 'No location'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-1 flex-1 overflow-y-auto">
            <div>
              <p className="font-mono text-[7px] uppercase tracking-[0.09em] text-[#B98A3E] font-bold">
                General Degree Course
              </p>
              <p className="mt-0.5 text-[9px] font-semibold text-[#1A2B4C] break-words">
                {student.generalCourse || 'Not specified'}
              </p>
            </div>



            {student.studentCourses?.length > 0 && (
              <div>
                <p className="flex items-center justify-between gap-1 font-mono text-[7px] uppercase tracking-[0.1em] text-[#B98A3E] font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-2 h-2 text-[#B98A3E]" strokeWidth={2.2} />
                    Course Units taking
                  </span>
                  <span>{totalCredits} credits</span>
                </p>
                <div className="space-y-0.25">
                  {student.studentCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between gap-1 px-2 py-0.5">
                      <span className="text-[8px] font-semibold text-[#1A2B4C] flex-1">
                        {course.courseUnit}
                      </span>
                      <span className="shrink-0 font-mono text-[7px] text-[#4B5646] tabular-nums font-bold">
                        {course.credits}cr
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action with Joined and Religion */}
          <div className="mt-2 pt-2 border-t border-[#F3F4F6] flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/students/${student.id}`)}
              className="inline-flex items-center gap-1 text-[9px] font-bold text-[#B98A3E] transition-colors hover:text-[#1A2B4C] hover:gap-1.5 cursor-pointer"
            >
              View Profile
              <ChevronRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
            </button>

            <div className="flex items-center gap-2">
              <p className="font-mono text-[7px] text-[#4B5646]">
                {new Date(student.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <span className="text-[#D1D5DB]">•</span>
              <p className="font-mono text-[7px] text-[#4B5646]">
                Religion: {student.takesReligion === null
                  ? 'N/A'
                  : student.takesReligion
                    ? 'Yes'
                    : 'No'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

// ============================================================
// STUDENT LIST CARD (List View)
// ============================================================

const StudentListCard = ({
  student,
  router,
}: {
  student: Student;
  router: Router;
}) => {
  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const getTotalCredits = (s: Student) =>
    s.studentCourses?.reduce(
      (total, course) => total + (course.credits || 0),
      0,
    ) ?? 0;

  const initials = getInitials(student.firstName, student.lastName);
  const fullName = `${student.firstName} ${student.lastName}`;
  const totalCredits = getTotalCredits(student);
  const hue = getTechCenterHue(student.techCenter?.name);

  return (
    <article className="bg-white shadow-md rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg">
      <div className="p-2.5">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex-1">
            <h3 className="text-[14px] font-bold text-[#1A2B4C]">
              {fullName}
            </h3>
            <div className="mt-0.75 flex items-center gap-1 text-[9px] text-[#4B5646]">
              <span
                className="w-1 h-1 rounded-full shrink-0"
                style={{ backgroundColor: hue }}
              />
              <span>{student.techCenter?.name || 'No location'}</span>
              <span className="text-[#D1D5DB]">•</span>
              <span>{student.role?.name === 'teacher' ? 'Tutor' : student.role?.name || 'Student'}</span>
              <span className="text-[#D1D5DB]">•</span>
              <span className={student.isActive ? 'text-[#55705B] font-semibold' : 'text-[#9CA3AF]'}>
                {student.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-0.5">
            <span className="font-mono text-[9px] text-[#B98A3E] font-bold">
              {student.studentCourses?.length || 0} courses
            </span>
            <span className="font-mono text-[9px] text-[#4B5646]">
              {totalCredits} credits
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="mb-1.5 space-y-0.75">
          <div className="flex items-baseline gap-1">
            <p className="font-mono text-[7px] uppercase tracking-[0.09em] text-[#B98A3E] font-bold shrink-0">
              General Degree Course:
            </p>
            <p className="text-[9px] font-semibold text-[#1A2B4C]">
              {student.generalCourse || 'Not specified'}
            </p>
          </div>

          {student.studentCourses?.length > 0 && (
            <div>
              <p className="flex items-center gap-0.75 font-mono text-[7px] uppercase tracking-[0.1em] text-[#B98A3E] font-bold mb-0.75">
                <BookOpen className="w-2 h-2 text-[#B98A3E]" strokeWidth={2.2} />
                Course Units taking
              </p>
              <div className="space-y-0.25">
                {student.studentCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between gap-0.75 px-2 py-0.5">
                    <span className="text-[8px] font-semibold text-[#1A2B4C] flex-1">
                      {course.courseUnit}
                    </span>
                    <span className="shrink-0 font-mono text-[7px] text-[#4B5646] tabular-nums font-bold">
                      {course.credits}cr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action with Joined, Religion, and Profile Image */}
        <div className="pt-1.5 border-t border-[#F3F4F6] flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/students/${student.id}`)}
            className="inline-flex items-center gap-1 text-[9px] font-bold text-[#B98A3E] transition-colors hover:text-[#1A2B4C] hover:gap-1.5 cursor-pointer"
          >
            View Profile
            <ChevronRight className="w-2.5 h-2.5 transition-transform hover:translate-x-0.5" />
          </button>

          <div className="flex items-center gap-1.5">
            <p className="font-mono text-[7px] text-[#4B5646]">
              {new Date(student.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <span className="text-[#D1D5DB]">•</span>
            <p className="font-mono text-[7px] text-[#4B5646]">
              Religion: {student.takesReligion === null
                ? 'N/A'
                : student.takesReligion
                  ? 'Yes'
                  : 'No'}
            </p>
          </div>

          {/* Profile Image */}
          <div className="relative shrink-0">
            {student.profileImageUrl ? (
              <Image
                src={student.profileImageUrl}
                alt={fullName}
                width={28}
                height={28}
                className="w-7 h-7 object-cover rounded"
              />
            ) : (
              <div className="w-7 h-7 flex items-center justify-center bg-[#1A2B4C] rounded">
                <span className="text-white text-[9px] font-mono font-bold">
                  {initials}
                </span>
              </div>
            )}

            <span
              className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-2 border-white rounded-full ${
                student.isActive ? 'bg-[#55705B]' : 'bg-[#9CA3AF]'
              }`}
              title={student.isActive ? 'Active' : 'Inactive'}
            />
          </div>
        </div>
      </div>
    </article>
  );
};

// ============================================================
// STUDENT SECTION
// ============================================================

const StudentSection = ({
  title,
  students,
  router,
  collapsible = false,
  onViewAll,
  viewMode,
}: {
  title: string;
  students: Student[];
  router: Router;
  collapsible?: boolean;
  onViewAll?: () => void;
  viewMode: 'grid' | 'list';
}) => {
  if (students.length === 0) return null;

  const previewCount = 3;
  const hasMore = collapsible && students.length > previewCount;
  const visibleStudents = hasMore ? students.slice(0, previewCount) : students;
  const hue = getTechCenterHue(title);

  return (
    <section className="mb-8">
      {/* HEADER */}
      <header className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex items-center gap-2.5">
          <span
            className="h-4 w-[3px] shrink-0 rounded-full"
            style={{ backgroundColor: hue }}
          />
          <h2 className="text-[16px] font-bold tracking-tight text-[#1A2B4C] truncate">
            {title}
          </h2>
          <div className="shrink-0 flex items-center gap-1.5 bg-white px-2.5 py-1 border border-[#E5E7EB] rounded">
            <span className="font-mono text-[11px] font-bold text-[#1A2B4C] tabular-nums">
              {students.length}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#B98A3E]">
              students
            </span>
          </div>
        </div>
      </header>

      {/* CARDS */}
      {viewMode === 'grid' ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibleStudents.map((student, index) => (
            <StudentCard
              key={student.id}
              student={student}
              index={index}
              router={router}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
          {visibleStudents.map((student) => (
            <StudentListCard
              key={student.id}
              student={student}
              router={router}
            />
          ))}
        </div>
      )}

      {/* VIEW ALL */}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onViewAll}
            className="
              inline-flex items-center gap-1.5 h-9 px-4
              border border-[#E5E7EB] bg-white
              text-[12px] font-bold text-[#1A2B4C]
              rounded hover:border-[#B98A3E] hover:bg-[#F7F6F2]
              transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-1
            "
          >
            View all {title} students
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </section>
  );
};

// ============================================================
// COMMUNITY TICKER
// ============================================================

const CommunityTicker = ({ students }: { students: Student[] }) => {
  // Only students with a usable profile image are included in the avatar ticker.
  const profileStudents = students.filter(
    (student) =>
      typeof student.profileImageUrl === 'string' &&
      student.profileImageUrl.trim().length > 0,
  );
  const tickerStudents = [...profileStudents, ...profileStudents];

  return (
    <div className="overflow-hidden border border-[#E5E7EB] bg-white rounded-lg shadow-md">
      <div className="flex h-14 items-center overflow-hidden">
        <div className="h-full shrink-0 border-r border-[#E5E7EB] bg-[#1A2B4C] px-3 flex items-center">
          <span className="font-mono text-[9px] uppercase tracking-[0.13em] text-white font-bold">
            Community
          </span>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          {profileStudents.length > 0 ? (
            <div className="student-avatar-ticker flex w-max items-center gap-3 px-3">
              {tickerStudents.map((student, index) => (
                <div
                  key={`${student.id}-${index}`}
                  className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm ring-1 ring-[#DADCD3]"
                  title={`${student.firstName} ${student.lastName}`}
                >
                  <Image
                    src={student.profileImageUrl!}
                    alt={`${student.firstName} ${student.lastName}`}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="px-4 text-[11px] font-medium text-[#6B7268]">
              Student community
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .student-avatar-ticker {
          animation: studentAvatarTicker 34s linear infinite;
          will-change: transform;
        }
        @keyframes studentAvatarTicker {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .student-avatar-ticker {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================================
// MAIN PAGE
// ============================================================

export default function StudentsPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Failed to fetch students');
      const result = await response.json();
      return result as {
        studentsByTechCenter: { [key: string]: Student[] };
        techCenters: TechCenter[];
        totalStudents: number;
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const studentsByTechCenter = useMemo(
    () => data?.studentsByTechCenter || {},
    [data?.studentsByTechCenter],
  );
  const techCenters = data?.techCenters || [];
  const totalStudents = data?.totalStudents || 0;

  const allStudents = useMemo(
    () => Object.values(studentsByTechCenter).flat() as Student[],
    [studentsByTechCenter],
  );

  const filterStudents = (students: Student[]) => {
    let filtered = students;
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(
        (student) => student.techCenter?.id === selectedLocation,
      );
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((student) => {
        const fullName =
          `${student.firstName} ${student.lastName}`.toLowerCase();
        return (
          fullName.includes(query) ||
          student.studentCourses?.some(
            (course) =>
              course.code.toLowerCase().includes(query) ||
              course.courseUnit.toLowerCase().includes(query),
          ) ||
          (student.generalCourse &&
            student.generalCourse.toLowerCase().includes(query)) ||
          (student.techCenter &&
            student.techCenter.name.toLowerCase().includes(query))
        );
      });
    }
    return filtered;
  };

  const filteredAllStudents = sortStudents(filterStudents(allStudents), sortBy);

  const getLocationCount = (locationId: string) =>
    allStudents.filter((student) => student.techCenter?.id === locationId)
      .length;

  const locations = [...techCenters]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((center) => ({
      ...center,
      _count: { students: getLocationCount(center.id) },
    }));

  const clearFilter = () => {
    setSelectedLocation('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedLocation !== 'all' || Boolean(searchQuery.trim());
  const hasStudents = allStudents.length > 0;

  /* ==========================================================
     LOADING
  ========================================================== */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F6F2]">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
          <div className="h-24 bg-white border border-[#E5E7EB] rounded-lg shadow-md" />
          <div className="mt-4 h-28 bg-white border border-[#E5E7EB] rounded-lg shadow-md" />
          <div className="mt-6 grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-[360px] bg-white border border-[#E5E7EB] rounded-lg shadow-md"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center border border-[#E5E7EB] bg-white p-8 rounded-lg shadow-md">
          <div className="mx-auto w-12 h-12 bg-[#FBF0EC] flex items-center justify-center rounded">
            <AlertCircle className="w-6 h-6 text-[#A4462F]" strokeWidth={2} />
          </div>
          <h2 className="mt-4 text-[17px] font-bold text-[#1A2B4C]">
            Failed to load students
          </h2>
          <p className="mt-1.5 text-[13px] leading-5 text-[#4B5646]">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 h-10 px-5 bg-[#1A2B4C] text-white font-mono text-[11px] uppercase tracking-widest hover:bg-[#2C3E5A] transition-colors rounded font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-5 left-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#1A2B4C] shadow-lg transition-all hover:-translate-y-0.5 hover:border-[#B98A3E] hover:bg-[#F7F6F2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-2 sm:left-5"
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
        </button>
      )}

      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pb-10">
        {/* ====================================================
            PAGE HEADER — SIMPLIFIED
        ==================================================== */}

        <header className="pt-6 pb-5">
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <Link
              href="/dashboard"
              className="border border-[#E5E7EB] bg-white px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide text-[#4B5646] hover:border-[#B98A3E] hover:text-[#1A2B4C] transition-colors rounded font-semibold"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/courses"
              className="border border-[#E5E7EB] bg-white px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide text-[#4B5646] hover:border-[#B98A3E] hover:text-[#1A2B4C] transition-colors rounded font-semibold"
            >
              Courses
            </Link>
            <Link
              href="/dashboard/cleaning"
              className="border border-[#E5E7EB] bg-white px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide text-[#4B5646] hover:border-[#B98A3E] hover:text-[#1A2B4C] transition-colors rounded font-semibold"
            >
              Cleaning
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-[30px] sm:text-[34px] font-bold tracking-tight text-[#1A2B4C] leading-tight">
                Students
              </h1>
              <p className="mt-1.5 text-[13px] leading-5 text-[#B98A3E] font-semibold">
                {totalStudents} students across {techCenters.length} tech centers.
              </p>
            </div>
          </div>
        </header>

        {/* ====================================================
            SEARCH + FILTER
        ==================================================== */}

        <SearchFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          locations={locations}
          totalStudents={totalStudents}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* ====================================================
            TICKER (Moved below search/filter)
        ==================================================== */}

        <div className="mt-4">
          <CommunityTicker students={allStudents} />
        </div>

        {/* ====================================================
            RESULTS
        ==================================================== */}

        <main className="pt-6">
          {/* NO STUDENTS */}
          {!hasStudents && (
            <div className="border border-dashed border-[#D1D5DB] bg-white py-20 text-center rounded-lg shadow-md">
              <Users className="mx-auto w-10 h-10 text-[#9CA3AF]" strokeWidth={1.6} />
              <h3 className="mt-4 text-[16px] font-bold text-[#1A2B4C]">
                No students yet
              </h3>
              <p className="mt-1.5 text-[13px] text-[#4B5646]">
                Students will appear here once they register.
              </p>
            </div>
          )}

          {/* FILTERED */}
          {hasStudents && hasActiveFilters && (
            <>
              {filteredAllStudents.length === 0 ? (
                <div className="border border-[#E5E7EB] bg-white py-16 text-center px-6 rounded-lg shadow-md">
                  <Search className="mx-auto w-9 h-9 text-[#9CA3AF]" strokeWidth={1.8} />
                  <h3 className="mt-3 text-[16px] font-bold text-[#1A2B4C]">
                    No matching students
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-5 text-[#4B5646]">
                    Try changing your search or location filter.
                  </p>
                  <button
                    onClick={clearFilter}
                    className="mt-5 h-10 px-5 bg-[#1A2B4C] text-white font-mono text-[11px] uppercase tracking-widest hover:bg-[#2C3E5A] transition-colors rounded font-bold"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {filteredAllStudents.map((student, index) => (
                        <StudentCard
                          key={student.id}
                          student={student}
                          index={index}
                          router={router}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                      {filteredAllStudents.map((student) => (
                        <StudentListCard
                          key={student.id}
                          student={student}
                          router={router}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ALL BY TECH CENTER */}
          {hasStudents && !hasActiveFilters && (
            <>
              {Object.entries(studentsByTechCenter)
                .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
                .map(([locationName, students]) => {
                  const studentList = sortStudents(students as Student[], sortBy);
                  if (studentList.length === 0) return null;
                  const techCenter = techCenters.find(
                    (tc) => tc.name === locationName,
                  );
                  const hue = getTechCenterHue(locationName);
                  const previewCount = 3;
                  const hasMore = studentList.length > previewCount;
                  const visibleStudents = hasMore ? studentList.slice(0, previewCount) : studentList;

                  return (
                    <section key={locationName} className="mb-8">
                      {/* HEADER */}
                      <header className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex items-center gap-2.5">
                          <span
                            className="h-4 w-[3px] shrink-0 rounded-full"
                            style={{ backgroundColor: hue }}
                          />
                          <h2 className="text-[16px] font-bold tracking-tight text-[#1A2B4C] truncate">
                            {locationName}
                          </h2>
                          <div className="shrink-0 flex items-center gap-1.5 bg-white px-2.5 py-1 border border-[#E5E7EB] rounded">
                            <span className="font-mono text-[11px] font-bold text-[#1A2B4C] tabular-nums">
                              {studentList.length}
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#B98A3E]">
                              students
                            </span>
                          </div>
                        </div>
                      </header>

                      {/* CARDS */}
                      {viewMode === 'grid' ? (
                        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                          {visibleStudents.map((student, index) => (
                            <StudentCard
                              key={student.id}
                              student={student}
                              index={index}
                              router={router}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                          {visibleStudents.map((student) => (
                            <StudentListCard
                              key={student.id}
                              student={student}
                              router={router}
                            />
                          ))}
                        </div>
                      )}

                      {/* VIEW ALL */}
                      {hasMore && (
                        <div className="mt-4 flex justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (techCenter) {
                                setSelectedLocation(techCenter.id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            className="
                              inline-flex items-center gap-1.5 h-9 px-4
                              border border-[#E5E7EB] bg-white
                              text-[12px] font-bold text-[#1A2B4C]
                              rounded hover:border-[#B98A3E] hover:bg-[#F7F6F2]
                              transition-colors
                              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-1
                            "
                          >
                            View all {locationName} students
                            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </button>
                        </div>
                      )}
                    </section>
                  );
                })}
            </>
          )}

          {/* FOOTER */}
          {hasStudents && (
            <footer className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-[#E5E7EB] bg-white px-4 py-3 rounded-lg shadow-md">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#4B5646]">
                <Users className="w-3.5 h-3.5 text-[#1A2B4C]" strokeWidth={2} />
                Student Community Directory
              </p>
              <span className="font-mono text-[11px] font-bold text-[#B98A3E] tabular-nums">
                {hasActiveFilters
                  ? `${filteredAllStudents.length} of ${totalStudents} students`
                  : `${totalStudents} students`}
              </span>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}