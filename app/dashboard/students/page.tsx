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
// TOKENS — same system as the dashboard shell:
// ink #12203B · paper #F1F1EC · surface #FFFFFF · hairline #DADCD3
// muted #6B7268 · subtle #8A9088 · brass #B98A3E (accent)
// moss #55705B (active) · rust #A4462F (error)
// labels/counts/codes -> font-mono
// ============================================================

// ============================================================
// INTERFACES
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
// STAT COMPONENT
// ============================================================

const Stat = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="min-w-0">
    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#8A9088]">
      {label}
    </p>

    <div className="mt-1 text-[13px] font-semibold leading-5 text-[#12203B] break-words">
      {children}
    </div>
  </div>
);

// ============================================================
// SEARCH & FILTER BAR
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
    'inline-flex items-center justify-center gap-2 min-h-[38px] px-3.5 py-2 border text-[12px] font-semibold leading-tight transition-colors duration-150 focus:outline-none focus-visible:border-[#B98A3E]';

  const chipOn = 'bg-[#12203B] border-[#12203B] text-white';

  const chipOff =
    'bg-white border-[#DADCD3] text-[#4B564C] hover:border-[#B98A3E] hover:text-[#12203B]';

  return (
    <section className="border border-[#DADCD3] bg-white">
      {/* SEARCH HEADER */}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#B98A3E]">
              Find students
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#12203B]">
              Search &amp; filter
            </h2>

            <p className="mt-1 text-[13px] text-[#6B7268]">
              Search by name, course, or choose a tech center below.
            </p>
          </div>

          {/* SEARCH */}

          <div className="relative w-full lg:w-[480px] xl:w-[560px] shrink-0">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9088] pointer-events-none"
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
                w-full h-11 pl-10 pr-10
                bg-[#F7F6F2]
                border border-[#DADCD3]
                text-[#12203B]
                placeholder:text-[#8A9088]
                text-[14px] font-medium
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
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#8A9088] hover:text-[#12203B] hover:bg-[#F5F4EE] transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTER AREA */}

      <div className="border-t border-[#DADCD3] bg-[#F7F6F2] px-5 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8A9088]">
              Filter by tech center
            </p>

            <p className="mt-1 text-[12px] text-[#6B7268]">
              Tap any center to view its students.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start shrink-0 border border-[#DADCD3] bg-white px-3 py-1.5">
            <Users className="w-3.5 h-3.5 text-[#12203B]" strokeWidth={2} />
            <span className="font-mono text-[11px] font-semibold text-[#12203B] tabular-nums">
              {totalStudents}
            </span>
            <span className="text-[10px] text-[#8A9088]">students</span>
          </div>
        </div>

        {/* FILTER CHIPS */}

        <div
          className="mt-4 flex flex-wrap items-center gap-2"
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
            <Users className="w-4 h-4 shrink-0" strokeWidth={2.2} />
            <span>All Students</span>
            <span
              className={`font-mono text-[10px] tabular-nums ${
                selectedLocation === 'all' ? 'text-white/70' : 'text-[#8A9088]'
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
                className={`${chipBase} ${isSelected ? chipOn : chipOff}`}
              >
                <MapPin
                  className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-[#12203B]'}`}
                  strokeWidth={2.2}
                />
                <span className="break-words text-left">{location.name}</span>
                <span
                  className={`font-mono text-[10px] tabular-nums ${
                    isSelected ? 'text-white/70' : 'text-[#8A9088]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE FILTER */}

        {selectedLocation !== 'all' && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[11px] text-[#6B7268]">Showing:</span>
            <span className="inline-flex items-center gap-1.5 border border-[#DADCD3] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#12203B]">
              <MapPin className="w-3.5 h-3.5" strokeWidth={2.2} />
              {activeLocation?.name || 'Selected center'}
              <Check className="w-3.5 h-3.5 text-[#B98A3E]" strokeWidth={3} />
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
    s.studentCourses?.reduce((total, course) => total + (course.credits || 0), 0) ?? 0;

  const initials = getInitials(student.firstName, student.lastName);
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <article
      onClick={() => router.push(`/dashboard/students/${student.id}`)}
      className="
        group bg-white border border-[#DADCD3]
        overflow-hidden cursor-pointer flex flex-col h-full
        transition-colors duration-150
        hover:border-[#B98A3E]
        focus-within:border-[#B98A3E]
      "
    >
      {/* CARD HEADER */}

      <div className="relative p-5 pb-4 border-b border-[#DADCD3]">
        <span className="absolute top-4 right-4 font-mono text-[11px] tabular-nums text-[#B9BEB2]">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {student.profileImageUrl ? (
              <Image
                src={student.profileImageUrl}
                alt={fullName}
                width={56}
                height={56}
                className="w-14 h-14 object-cover grayscale border border-[#DADCD3]"
              />
            ) : (
              <div className="w-14 h-14 flex items-center justify-center bg-[#12203B]">
                <span className="text-white text-sm font-mono font-semibold tracking-wide">
                  {initials}
                </span>
              </div>
            )}

            <span
              className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white ${
                student.isActive ? 'bg-[#55705B]' : 'bg-[#B9BEB2]'
              }`}
              title={student.isActive ? 'Active' : 'Inactive'}
            />
          </div>

          <div className="min-w-0 flex-1 pr-5">
            <h3 className="text-[16px] font-semibold leading-tight text-[#12203B] break-words">
              {fullName}
            </h3>

            <p className="mt-2 inline-flex items-center gap-1.5 max-w-full font-mono text-[11px] text-[#6B7268]">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#12203B]" strokeWidth={2.4} />
              <span className="break-words">
                {student.techCenter?.name || 'No location'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* CARD CONTENT */}

      <div className="p-5 flex-1">
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <Stat label="General Course">
            <span className="break-words">{student.generalCourse || 'Not specified'}</span>
          </Stat>

          <Stat label="Status">
            <span className={student.isActive ? 'text-[#55705B]' : 'text-[#8A9088]'}>
              {student.isActive ? 'Active' : 'Inactive'}
            </span>
          </Stat>

          <Stat label="Courses Taking">
            <span>{student.studentCourses?.length || 0}</span>
          </Stat>

          <Stat label="Credits">
            <span>{getTotalCredits(student)}</span>
          </Stat>

          <Stat label="Religion">
            <span>
              {student.takesReligion === null
                ? 'N/A'
                : student.takesReligion
                  ? 'Yes'
                  : 'No'}
            </span>
          </Stat>

          <Stat label="Location">
            <span className="break-words">
              {student.techCenter?.name || 'Not specified'}
            </span>
          </Stat>
        </div>

        {/* COURSES */}

        {student.studentCourses?.length > 0 && (
          <>
            <div className="my-5 h-px bg-[#DADCD3]" />

            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8A9088]">
              <BookOpen className="w-4 h-4 text-[#12203B]" strokeWidth={2.2} />
              Enrolled Courses
            </p>

            <ul className="mt-3 space-y-2">
              {student.studentCourses.slice(0, 3).map((course) => (
                <li
                  key={course.id}
                  className="flex items-center justify-between gap-3 border border-[#DADCD3] bg-[#F7F6F2] px-3 py-2.5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold text-[#12203B] break-words">
                      {course.code}
                    </span>
                    <span className="block mt-0.5 text-[11px] text-[#6B7268] break-words">
                      {course.courseUnit}
                    </span>
                  </span>

                  <span className="shrink-0 font-mono text-[11px] text-[#4B564C] tabular-nums">
                    {course.credits} cr
                  </span>
                </li>
              ))}

              {student.studentCourses.length > 3 && (
                <li className="pt-0.5 text-[11px] text-[#8A9088] break-words">
                  +{student.studentCourses.length - 3} more courses
                </li>
              )}
            </ul>
          </>
        )}
      </div>

      {/* CARD ACTION */}

      <div className="p-4 pt-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/students/${student.id}`);
          }}
          className="
            w-full h-11 bg-[#12203B] text-white
            font-mono text-[11px] uppercase tracking-[0.12em] font-semibold
            flex items-center justify-center gap-2
            transition-colors
            group-hover:bg-[#B98A3E] group-hover:text-[#12203B]
          "
        >
          View Profile
          <ArrowRight
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2.5}
          />
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
    <section className="mb-10">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8A9088]">
            <span className="h-4 w-[3px] bg-[#B98A3E]" />
            Student Board
          </p>

          <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-[#12203B] break-words">
            {title}
          </h2>
        </div>

        <div className="shrink-0 flex items-baseline gap-1.5 border border-[#DADCD3] bg-white px-3 py-1.5">
          <span className="font-mono text-[14px] font-semibold text-[#12203B] tabular-nums">
            {students.length}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A9088]">
            students
          </span>
        </div>
      </header>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {students.map((student, index) => (
          <StudentCard key={student.id} student={student} index={index} router={router} />
        ))}
      </div>
    </section>
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
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();

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
    allStudents.filter((student) => student.techCenter?.id === locationId).length;

  const locations = techCenters.map((center) => ({
    ...center,
    _count: { students: getLocationCount(center.id) },
  }));

  const clearFilter = () => {
    setSelectedLocation('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedLocation !== 'all' || Boolean(searchQuery.trim());
  const hasStudents = allStudents.length > 0;

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F1EC]">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
          <div className="h-24 bg-white border border-[#DADCD3]" />
          <div className="mt-4 h-32 bg-white border border-[#DADCD3]" />

          <div className="mt-6 grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 bg-white border border-[#DADCD3]" />
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
        <div className="max-w-sm w-full text-center border border-[#DADCD3] bg-white p-8">
          <div className="mx-auto w-12 h-12 bg-[#FBF0EC] flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-[#A4462F]" strokeWidth={2} />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-[#12203B]">
            Failed to load students
          </h2>

          <p className="mt-2 text-[13px] leading-5 text-[#6B7268]">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 h-11 px-6 bg-[#12203B] text-white font-mono text-[12px] uppercase tracking-widest hover:bg-[#1C2E4E] transition-colors"
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
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pb-12">
        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <header className="pt-7 sm:pt-8 pb-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Link
                href="/dashboard"
                className="border border-[#DADCD3] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6B7268] hover:border-[#B98A3E] hover:text-[#12203B] transition-colors"
              >
                Dashboard
              </Link>

              <Link
                href="/dashboard/courses"
                className="border border-[#DADCD3] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6B7268] hover:border-[#B98A3E] hover:text-[#12203B] transition-colors"
              >
                Courses
              </Link>

              <Link
                href="/dashboard/cleaning"
                className="border border-[#DADCD3] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6B7268] hover:border-[#B98A3E] hover:text-[#12203B] transition-colors"
              >
                Cleaning
              </Link>
            </div>

            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#B98A3E]">
              <span className="h-4 w-[3px] bg-[#B98A3E]" />
              University Community
            </p>

            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[#12203B]">
              Students
            </h1>

            <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#6B7268]">
              Explore the students learning and growing across our
              university community.
            </p>
          </div>

          {/* COMMUNITY COUNT */}

          <div className="shrink-0 border border-[#DADCD3] bg-white px-5 py-4 min-w-[190px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8A9088]">
              Community
            </p>

            <p className="mt-1 text-3xl font-semibold text-[#12203B] tabular-nums leading-tight">
              {totalStudents}
            </p>

            <p className="mt-1 font-mono text-[11px] text-[#8A9088]">
              registered students
            </p>
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
        />

        {/* ====================================================
            RESULTS
        ==================================================== */}

        <main className="pt-7">
          {/* NO STUDENTS */}

          {!hasStudents && (
            <div className="border border-[#DADCD3] bg-white py-20 text-center">
              <Users className="mx-auto w-9 h-9 text-[#B9BEB2]" strokeWidth={1.8} />
              <p className="mt-4 text-[14px] text-[#6B7268]">No students found.</p>
            </div>
          )}

          {/* FILTERED RESULTS */}

          {hasStudents && hasActiveFilters && (
            <>
              {filteredAllStudents.length === 0 ? (
                <div className="border border-[#DADCD3] bg-white py-20 text-center px-6">
                  <Search className="mx-auto w-9 h-9 text-[#B9BEB2]" strokeWidth={1.8} />

                  <h3 className="mt-4 text-lg font-semibold text-[#12203B]">
                    No matching students
                  </h3>

                  <p className="mt-2 text-[13px] leading-5 text-[#6B7268]">
                    Try changing your search or location filter.
                  </p>

                  <button
                    onClick={clearFilter}
                    className="mt-6 h-11 px-6 bg-[#12203B] text-white font-mono text-[12px] uppercase tracking-widest hover:bg-[#1C2E4E] transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <StudentSection
                  title={
                    selectedLocation !== 'all'
                      ? locations.find((loc) => loc.id === selectedLocation)?.name ||
                        'Filtered Results'
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
              {Object.entries(studentsByTechCenter).map(([locationName, students]) => {
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
              })}
            </>
          )}

          {/* ==================================================
              FOOTER
          ================================================== */}

          {hasStudents && (
            <footer className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-[#DADCD3] bg-white px-5 py-4">
              <p className="flex items-center gap-2 text-[12px] font-semibold text-[#4B564C]">
                <Users className="w-4 h-4 text-[#12203B]" strokeWidth={2} />
                Student Community Directory
              </p>

              <span className="font-mono text-[12px] font-semibold text-[#12203B] tabular-nums">
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