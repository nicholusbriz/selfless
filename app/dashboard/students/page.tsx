'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  X,
  MapPin,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Check,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

// ============================================================
// STUDENTS DIRECTORY
// Clean institutional light theme
// Compact cards · minimal spacing · easy scanning
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
    <p className="font-mono text-[9px] uppercase tracking-[0.09em] text-[#8A9088]">
      {label}
    </p>

    <div className="mt-0.5 text-[12px] font-semibold leading-4 text-[#12203B] break-words">
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
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocation: string;
  setSelectedLocation: (id: string) => void;
  locations: TechCenter[];
  totalStudents: number;
}) => {
  const activeLocation = locations.find(
    (location) => location.id === selectedLocation
  );

  const chipBase =
    'inline-flex items-center justify-center gap-1.5 min-h-[34px] px-3 py-1.5 border text-[11px] font-semibold leading-tight transition-colors duration-150 focus:outline-none focus-visible:border-[#B98A3E]';

  const chipOn = 'bg-[#12203B] border-[#12203B] text-white';

  const chipOff =
    'bg-white border-[#DADCD3] text-[#4B564C] hover:border-[#B98A3E] hover:text-[#12203B]';

  return (
    <section className="border border-[#DADCD3] bg-white">
      {/* SEARCH */}

      <div className="px-4 py-3.5 sm:px-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-[3px] bg-[#B98A3E]" />

              <h2 className="text-[15px] font-semibold tracking-tight text-[#12203B]">
                Search students
              </h2>
            </div>

            <p className="mt-0.5 text-[11px] text-[#6B7268]">
              Find students by name, course, or tech center.
            </p>
          </div>

          <div className="relative w-full md:w-[390px] lg:w-[450px] shrink-0">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8A9088] pointer-events-none"
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
                w-full h-9 pl-9 pr-9
                bg-[#F7F6F2]
                border border-[#DADCD3]
                text-[#12203B]
                placeholder:text-[#8A9088]
                text-[12px] font-medium
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
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#8A9088] hover:text-[#12203B]"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTERS */}

      <div className="border-t border-[#DADCD3] bg-[#F7F6F2] px-4 py-3 sm:px-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8A9088]">
              Tech centers
            </span>

            <span className="inline-flex items-center gap-1 border border-[#DADCD3] bg-white px-2 py-1">
              <Users className="w-3 h-3 text-[#12203B]" strokeWidth={2} />

              <span className="font-mono text-[10px] font-semibold text-[#12203B] tabular-nums">
                {totalStudents}
              </span>
            </span>
          </div>

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
              className={`${chipBase} ${
                selectedLocation === 'all' ? chipOn : chipOff
              }`}
            >
              <Users className="w-3.5 h-3.5" strokeWidth={2.2} />
              <span>All</span>

              <span
                className={`font-mono text-[9px] tabular-nums ${
                  selectedLocation === 'all'
                    ? 'text-white/70'
                    : 'text-[#8A9088]'
                }`}
              >
                {totalStudents}
              </span>
            </button>

            {locations.map((location) => {
              const count = location._count?.students || 0;
              const isSelected = selectedLocation === location.id;

              return (
                <button
                  key={location.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedLocation(location.id)}
                  title={location.name}
                  className={`${chipBase} ${
                    isSelected ? chipOn : chipOff
                  }`}
                >
                  <MapPin
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-white' : 'text-[#12203B]'
                    }`}
                    strokeWidth={2.2}
                  />

                  <span className="break-words text-left">
                    {location.name}
                  </span>

                  <span
                    className={`font-mono text-[9px] tabular-nums ${
                      isSelected ? 'text-white/70' : 'text-[#8A9088]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedLocation !== 'all' && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[10px] text-[#8A9088]">Showing</span>

            <span className="inline-flex items-center gap-1 border border-[#DADCD3] bg-white px-2 py-1 text-[10px] font-semibold text-[#12203B]">
              <MapPin className="w-3 h-3" strokeWidth={2.2} />
              {activeLocation?.name || 'Selected center'}
              <Check
                className="w-3 h-3 text-[#B98A3E]"
                strokeWidth={3}
              />
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

// ============================================================
// STUDENT CARD
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
      0
    ) ?? 0;

  const initials = getInitials(student.firstName, student.lastName);
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <article
      onClick={() => router.push(`/dashboard/students/${student.id}`)}
      className="
        group bg-white border border-[#DADCD3] rounded-lg
        overflow-hidden cursor-pointer
        transition-all duration-200
        hover:border-[#B98A3E] hover:shadow-lg hover:-translate-y-0.5
        focus-within:border-[#B98A3E] focus-within:shadow-lg
      "
    >
      {/* ======================================================
          COMPACT CARD HEADER
      ====================================================== */}

      <div className="px-4 py-3.5 border-b border-[#DADCD3]">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {student.profileImageUrl ? (
              <Image
                src={student.profileImageUrl}
                alt={fullName}
                width={46}
                height={46}
                className="w-[46px] h-[46px] object-cover grayscale"
              />
            ) : (
              <div className="w-[46px] h-[46px] flex items-center justify-center bg-[#12203B]">
                <span className="text-white text-[11px] font-mono font-semibold">
                  {initials}
                </span>
              </div>
            )}

            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white ${
                student.isActive ? 'bg-[#55705B]' : 'bg-[#B9BEB2]'
              }`}
              title={student.isActive ? 'Active' : 'Inactive'}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-semibold leading-5 text-[#12203B] break-words text-left">
              {fullName}
            </h3>

            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#6B7268]">
              <MapPin
                className="w-3 h-3 shrink-0 text-[#12203B]"
                strokeWidth={2.3}
              />

              <span className="truncate">
                {student.techCenter?.name || 'No location'}
              </span>
            </p>
          </div>

          <span className="shrink-0 font-mono text-[9px] text-[#B9BEB2] tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* ======================================================
          COMPACT INFORMATION
      ====================================================== */}

      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <Stat label="General Degree Course">
            {student.generalCourse || 'Not specified'}
          </Stat>

          <Stat label="Status">
            <span
              className={
                student.isActive ? 'text-[#55705B]' : 'text-[#8A9088]'
              }
            >
              {student.isActive ? 'Active' : 'Inactive'}
            </span>
          </Stat>

          <Stat label="Courses Taking">
            {student.studentCourses?.length || 0}
          </Stat>

          <Stat label="Credits">
            {getTotalCredits(student)}
          </Stat>

          <Stat label="Religion">
            {student.takesReligion === null
              ? 'N/A'
              : student.takesReligion
                ? 'Yes'
                : 'No'}
          </Stat>

          <Stat label="Location">
            {student.techCenter?.name || 'Not specified'}
          </Stat>
        </div>

        {/* ====================================================
            ENROLLED COURSES
        ==================================================== */}

        {student.studentCourses?.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#8A9088]">
                <BookOpen
                  className="w-3 h-3 text-[#12203B]"
                  strokeWidth={2.2}
                />
                Courses
              </p>

              {student.studentCourses.length > 3 && (
                <span className="font-mono text-[9px] text-[#8A9088]">
                  +{student.studentCourses.length - 3} more
                </span>
              )}
            </div>

            <div className="mt-1.5 space-y-1.5">
              {student.studentCourses.slice(0, 3).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="block text-[10px] font-semibold leading-4 text-[#12203B]">
                      {course.code}
                    </span>

                    <span className="block truncate text-[9px] leading-3.5 text-[#6B7268]">
                      {course.courseUnit}
                    </span>
                  </div>

                  <span className="shrink-0 font-mono text-[9px] text-[#6B7268] tabular-nums">
                    {course.credits} cr
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          SMALL ACTION
      ====================================================== */}

      <div className="px-4 pb-3.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/students/${student.id}`);
          }}
          className="text-[11px] font-medium text-[#B98A3E] underline decoration-1 underline-offset-2 transition-colors hover:text-[#12203B]"
        >
          View Profile
        </button>
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
}: {
  title: string;
  students: Student[];
  router: Router;
}) => {
  if (students.length === 0) return null;

  return (
    <section className="mb-7">
      {/* SECTION HEADING */}

      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-2">
          <span className="h-4 w-[3px] bg-[#B98A3E] shrink-0" />

          <h2 className="text-[15px] font-semibold tracking-tight text-[#12203B] truncate">
            {title}
          </h2>
        </div>

        <div className="shrink-0 flex items-center gap-1.5">
          <span className="font-mono text-[12px] font-semibold text-[#12203B] tabular-nums">
            {students.length}
          </span>

          <span className="font-mono text-[9px] uppercase tracking-wider text-[#8A9088]">
            students
          </span>
        </div>
      </header>

      {/* CARDS */}

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {students.map((student, index) => (
          <StudentCard
            key={student.id}
            student={student}
            index={index}
            router={router}
          />
        ))}
      </div>
    </section>
  );
};

// ============================================================
// SCROLLING COMMUNITY MESSAGE
// ============================================================

const CommunityTicker = () => {
  const messages = [
    'Course Registration',
    'Course Submission',
    'Stay Connected With Your Tutors',
    'Participate In Your Cleaning Day',
    'Keep Your Academic Work On Time',
    'Student Community',
  ];

  const tickerItems = [...messages, ...messages];

  return (
    <div className="mt-4 overflow-hidden border-y border-[#DADCD3] bg-white">
      <div className="flex h-8 items-center overflow-hidden">
        <div className="shrink-0 border-r border-[#DADCD3] bg-[#12203B] px-3 h-full flex items-center">
          <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-white">
            Community
          </span>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="student-ticker flex w-max items-center whitespace-nowrap">
            {tickerItems.map((message, index) => (
              <div
                key={`${message}-${index}`}
                className="flex items-center"
              >
                <span className="px-4 font-mono text-[9px] uppercase tracking-[0.08em] text-[#6B7268]">
                  {message}
                </span>

                <span className="text-[#B98A3E] text-[9px]">
                  •
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .student-ticker {
          animation: studentTicker 34s linear infinite;
        }

        @keyframes studentTicker {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .student-ticker {
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

  const { data, isLoading, error } = useQuery({
    queryKey: ['students'],

    queryFn: async () => {
      const response = await fetch('/api/students');

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

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

  const studentsByTechCenter = data?.studentsByTechCenter || {};
  const techCenters = data?.techCenters || [];
  const totalStudents = data?.totalStudents || 0;

  const allStudents = Object.values(studentsByTechCenter).flat() as Student[];

  // ==========================================================
  // FILTERING
  // ==========================================================

  const filterStudents = (students: Student[]) => {
    let filtered = students;

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(
        (student) => student.techCenter?.id === selectedLocation
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
              course.courseUnit.toLowerCase().includes(query)
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

  const filteredAllStudents = filterStudents(allStudents);

  const getLocationCount = (locationId: string) =>
    allStudents.filter(
      (student) => student.techCenter?.id === locationId
    ).length;

  const locations = techCenters.map((center) => ({
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

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F1EC]">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-5 animate-pulse">
          <div className="h-20 bg-white border border-[#DADCD3]" />
          <div className="mt-3 h-24 bg-white border border-[#DADCD3]" />

          <div className="mt-5 grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-[310px] bg-white border border-[#DADCD3]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#F1F1EC] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center border border-[#DADCD3] bg-white p-7">
          <div className="mx-auto w-10 h-10 bg-[#FBF0EC] flex items-center justify-center">
            <AlertCircle
              className="w-5 h-5 text-[#A4462F]"
              strokeWidth={2}
            />
          </div>

          <h2 className="mt-4 text-[16px] font-semibold text-[#12203B]">
            Failed to load students
          </h2>

          <p className="mt-1.5 text-[12px] leading-5 text-[#6B7268]">
            {error instanceof Error
              ? error.message
              : 'Please try again later'}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 h-9 px-5 bg-[#12203B] text-white font-mono text-[10px] uppercase tracking-widest hover:bg-[#1C2E4E] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#F1F1EC] overflow-x-hidden">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pb-9">
        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <header className="pt-5 sm:pt-6 pb-3">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
            <div className="min-w-0">
              {/* SMALL NAV */}

              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <Link
                  href="/dashboard"
                  className="border border-[#DADCD3] bg-white px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wide text-[#6B7268] hover:border-[#B98A3E] hover:text-[#12203B] transition-colors"
                >
                  Dashboard
                </Link>

                <Link
                  href="/dashboard/courses"
                  className="border border-[#DADCD3] bg-white px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wide text-[#6B7268] hover:border-[#B98A3E] hover:text-[#12203B] transition-colors"
                >
                  Courses
                </Link>

                <Link
                  href="/dashboard/cleaning"
                  className="border border-[#DADCD3] bg-white px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wide text-[#6B7268] hover:border-[#B98A3E] hover:text-[#12203B] transition-colors"
                >
                  Cleaning
                </Link>
              </div>

              <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.17em] text-[#B98A3E]">
                <span className="h-3.5 w-[3px] bg-[#B98A3E]" />
                University Community
              </p>

              <h1 className="mt-1 text-[28px] sm:text-[32px] font-semibold tracking-tight text-[#12203B] leading-tight">
                Students
              </h1>

              <p className="mt-1 max-w-xl text-[12px] leading-5 text-[#6B7268]">
                Explore the students learning and growing across our
                university community.
              </p>
            </div>

            {/* COMMUNITY COUNT */}

            <div className="shrink-0 flex items-center gap-3 border border-[#DADCD3] bg-white px-4 py-2.5">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#8A9088]">
                  Community
                </p>

                <p className="mt-0.5 text-[22px] font-semibold text-[#12203B] tabular-nums leading-tight">
                  {totalStudents}
                </p>
              </div>

              <div className="h-8 w-px bg-[#DADCD3]" />

              <p className="max-w-[85px] font-mono text-[9px] leading-3.5 text-[#8A9088]">
                registered
                <br />
                students
              </p>
            </div>
          </div>

          {/* SCROLLING MESSAGE */}

          <CommunityTicker />
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
        />

        {/* ====================================================
            RESULTS
        ==================================================== */}

        <main className="pt-5">
          {/* NO STUDENTS */}

          {!hasStudents && (
            <div className="border border-[#DADCD3] bg-white py-16 text-center">
              <Users
                className="mx-auto w-8 h-8 text-[#B9BEB2]"
                strokeWidth={1.8}
              />

              <p className="mt-3 text-[12px] text-[#6B7268]">
                No students found.
              </p>
            </div>
          )}

          {/* FILTERED RESULTS */}

          {hasStudents && hasActiveFilters && (
            <>
              {filteredAllStudents.length === 0 ? (
                <div className="border border-[#DADCD3] bg-white py-16 text-center px-6">
                  <Search
                    className="mx-auto w-8 h-8 text-[#B9BEB2]"
                    strokeWidth={1.8}
                  />

                  <h3 className="mt-3 text-[15px] font-semibold text-[#12203B]">
                    No matching students
                  </h3>

                  <p className="mt-1.5 text-[12px] leading-5 text-[#6B7268]">
                    Try changing your search or location filter.
                  </p>

                  <button
                    onClick={clearFilter}
                    className="mt-5 h-9 px-5 bg-[#12203B] text-white font-mono text-[10px] uppercase tracking-widest hover:bg-[#1C2E4E] transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <StudentSection
                  title={
                    selectedLocation !== 'all'
                      ? locations.find(
                          (loc) => loc.id === selectedLocation
                        )?.name || 'Filtered Results'
                      : 'Filtered Results'
                  }
                  students={filteredAllStudents}
                  router={router}
                />
              )}
            </>
          )}

          {/* ALL STUDENTS BY TECH CENTER */}

          {hasStudents && !hasActiveFilters && (
            <>
              {Object.entries(studentsByTechCenter).map(
                ([locationName, students]) => {
                  const studentList = students as Student[];

                  if (studentList.length === 0) return null;

                  return (
                    <StudentSection
                      key={locationName}
                      title={locationName}
                      students={studentList}
                      router={router}
                    />
                  );
                }
              )}
            </>
          )}

          {/* ==================================================
              FOOTER
          ================================================== */}

          {hasStudents && (
            <footer className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-[#DADCD3] bg-white px-4 py-3">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold text-[#4B564C]">
                <Users
                  className="w-3.5 h-3.5 text-[#12203B]"
                  strokeWidth={2}
                />
                Student Community Directory
              </p>

              <span className="font-mono text-[10px] font-semibold text-[#12203B] tabular-nums">
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