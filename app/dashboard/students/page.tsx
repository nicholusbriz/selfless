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
    <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.1em] text-[#7D8796]">
      {label}
    </p>

    <div className="mt-1 text-[13px] sm:text-[14px] font-semibold leading-5 text-[#14213D] break-words">
      {children}
    </div>
  </div>
);

// ============================================================
// SEARCH & FILTER BAR
// ============================================================
// Normal page section.
// NOT sticky.
// NOT horizontally scrollable.
// All filters wrap naturally.

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
    'inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2.5 rounded-xl border text-[12px] sm:text-[13px] font-bold leading-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A33D]/40';

  const chipOn =
    'bg-[#1A365D] border-[#1A365D] text-white shadow-[0_5px_15px_rgba(26,54,93,0.18)]';

  const chipOff =
    'bg-white border-[#D8DEE7] text-[#354258] hover:border-[#E8A33D] hover:text-[#1A365D] hover:bg-[#FFFCF7] hover:shadow-sm active:scale-[0.98]';

  return (
    <section
      className="
        rounded-2xl
        border border-[#E3E8EF]
        bg-white
        shadow-[0_3px_12px_rgba(20,33,61,0.04)]
        overflow-hidden
      "
    >
      {/* SEARCH HEADER */}

      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-4 rounded-full bg-[#E8A33D]" />

              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-[#7D8796]">
                Find Students
              </p>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#14213D]">
              Search & filter students
            </h2>

            <p className="mt-1 text-[12px] sm:text-[13px] text-[#8993A2]">
              Search by student name, course, or choose a tech
              center below.
            </p>
          </div>

          {/* SEARCH */}

          <div className="relative w-full lg:w-[480px] xl:w-[560px] shrink-0">
            <Search
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                w-4.5
                h-4.5
                text-[#7D8796]
                pointer-events-none
              "
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
                w-full
                h-12
                pl-11
                pr-11
                bg-[#F8FAFC]
                border
                border-[#D8DEE7]
                text-[#14213D]
                placeholder:text-[#8A94A3]
                text-[14px]
                sm:text-[15px]
                rounded-xl
                font-medium
                focus:outline-none
                focus:bg-white
                focus:border-[#E8A33D]
                focus:ring-4
                focus:ring-[#E8A33D]/10
                transition-all
              "
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="
                  absolute
                  right-2.5
                  top-1/2
                  -translate-y-1/2
                  p-2
                  rounded-lg
                  text-[#7D8796]
                  hover:text-[#14213D]
                  hover:bg-[#EEF2F7]
                  transition-colors
                "
              >
                <X
                  className="w-4 h-4"
                  strokeWidth={2.5}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTER AREA */}

      <div className="border-t border-[#EEF2F7] bg-[#FBFCFE] px-4 sm:px-5 lg:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#7D8796]">
              Filter by Tech Center
            </p>

            <p className="mt-1 text-[11px] sm:text-[12px] font-medium text-[#8993A2]">
              Tap any center to view its students.
            </p>
          </div>

          <div
            className="
              inline-flex
              items-center
              gap-2
              self-start
              shrink-0
              rounded-full
              bg-white
              border
              border-[#E3E8EF]
              px-3
              py-1.5
            "
          >
            <Users
              className="w-3.5 h-3.5 text-[#1A365D]"
              strokeWidth={2}
            />

            <span className="text-[11px] font-extrabold text-[#14213D] tabular-nums">
              {totalStudents}
            </span>

            <span className="text-[10px] font-semibold text-[#8993A2]">
              students
            </span>
          </div>
        </div>

        {/* ALL FILTERS DISPLAYED AND WRAPPED */}

        <div
          className="
            mt-4
            flex
            flex-wrap
            items-center
            gap-2
          "
          role="tablist"
          aria-label="Filter by tech center"
        >
          {/* ALL */}

          <button
            type="button"
            role="tab"
            aria-selected={selectedLocation === 'all'}
            onClick={() => setSelectedLocation('all')}
            className={`
              ${chipBase}
              ${
                selectedLocation === 'all'
                  ? chipOn
                  : chipOff
              }
            `}
          >
            <Users
              className="w-4 h-4 shrink-0"
              strokeWidth={2.2}
            />

            <span>All Students</span>

            <span
              className={`
                inline-flex
                items-center
                justify-center
                min-w-[1.5rem]
                h-5
                px-1.5
                rounded-full
                text-[10px]
                font-extrabold
                tabular-nums
                ${
                  selectedLocation === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#EEF2F7] text-[#5B6779]'
                }
              `}
            >
              {totalStudents}
            </span>
          </button>

          {/* TECH CENTERS */}

          {locations.map((location) => {
            const count = location._count?.students || 0;
            const isSelected =
              selectedLocation === location.id;

            return (
              <button
                key={location.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() =>
                  setSelectedLocation(location.id)
                }
                title={location.name}
                className={`
                  ${chipBase}
                  ${
                    isSelected
                      ? chipOn
                      : chipOff
                  }
                `}
              >
                <MapPin
                  className={`
                    w-4
                    h-4
                    shrink-0
                    ${
                      isSelected
                        ? 'text-white'
                        : 'text-[#1A365D]'
                    }
                  `}
                  strokeWidth={2.2}
                />

                <span className="break-words text-left">
                  {location.name}
                </span>

                <span
                  className={`
                    inline-flex
                    items-center
                    justify-center
                    min-w-[1.5rem]
                    h-5
                    px-1.5
                    rounded-full
                    text-[10px]
                    font-extrabold
                    tabular-nums
                    ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#EEF2F7] text-[#5B6779]'
                    }
                  `}
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
            <span className="text-[11px] font-semibold text-[#8993A2]">
              Showing:
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF3F9] border border-[#D8E1EC] px-3 py-1.5 text-[11px] font-bold text-[#1A365D]">
              <MapPin
                className="w-3.5 h-3.5"
                strokeWidth={2.2}
              />

              {activeLocation?.name || 'Selected center'}

              <Check
                className="w-3.5 h-3.5 text-[#E8A33D]"
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
  const getInitials = (
    firstName: string,
    lastName: string
  ) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const getAvatarColor = (
    firstName: string,
    lastName: string
  ) => {
    const colors = [
      'bg-[#1A365D]',
      'bg-[#244A78]',
      'bg-[#315D8D]',
    ];

    const hash =
      firstName.charCodeAt(0) +
      lastName.charCodeAt(0);

    return colors[Math.abs(hash) % colors.length];
  };

  const getTotalCredits = (s: Student) =>
    s.studentCourses?.reduce(
      (total, course) =>
        total + (course.credits || 0),
      0
    ) ?? 0;

  const initials = getInitials(
    student.firstName,
    student.lastName
  );

  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <article
      onClick={() =>
        router.push(
          `/dashboard/students/${student.id}`
        )
      }
      className="
        group
        bg-white
        border
        border-[#E3E8EF]
        rounded-2xl
        overflow-hidden
        cursor-pointer
        flex
        flex-col
        shadow-[0_2px_6px_rgba(20,33,61,0.05)]
        transition-all
        duration-200
        hover:shadow-[0_18px_45px_-22px_rgba(20,33,61,0.45)]
        hover:border-[#E8A33D]
        hover:-translate-y-1
        focus-within:ring-2
        focus-within:ring-[#E8A33D]/30
        h-full
      "
    >
      {/* CARD HEADER */}

      <div
        className="
          relative
          p-5
          pb-4
          bg-gradient-to-b
          from-[#F8FAFC]
          to-white
          border-b
          border-[#EEF2F7]
        "
      >
        <span
          className="
            absolute
            top-4
            right-4
            text-[11px]
            font-extrabold
            tabular-nums
            text-[#B2BBC8]
          "
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {student.profileImageUrl ? (
              <Image
                src={student.profileImageUrl}
                alt={fullName}
                width={60}
                height={60}
                className="
                  w-[60px]
                  h-[60px]
                  rounded-2xl
                  object-cover
                  border
                  border-[#E3E8EF]
                "
              />
            ) : (
              <div
                className={`
                  w-[60px]
                  h-[60px]
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  ${getAvatarColor(
                    student.firstName,
                    student.lastName
                  )}
                `}
              >
                <span className="text-white text-base font-extrabold tracking-wide">
                  {initials}
                </span>
              </div>
            )}

            <span
              className={`
                absolute
                -bottom-1
                -right-1
                w-4
                h-4
                rounded-full
                border-2
                border-white
                ${
                  student.isActive
                    ? 'bg-[#22A06B]'
                    : 'bg-[#B6BDC8]'
                }
              `}
              title={
                student.isActive
                  ? 'Active'
                  : 'Inactive'
              }
            />
          </div>

          <div className="min-w-0 flex-1 pr-5">
            <h3
              className="
                text-[16px]
                sm:text-[17px]
                font-extrabold
                leading-tight
                text-[#14213D]
                break-words
                group-hover:text-[#1A365D]
              "
            >
              {fullName}
            </h3>

            <p
              className="
                mt-2
                inline-flex
                items-center
                gap-1.5
                max-w-full
                text-[11px]
                sm:text-[12px]
                font-bold
                text-[#5B6779]
                bg-[#F1F4F8]
                border
                border-[#E3E8EF]
                rounded-full
                px-2.5
                py-1
              "
            >
              <MapPin
                className="w-3.5 h-3.5 shrink-0 text-[#1A365D]"
                strokeWidth={2.4}
              />

              <span className="break-words">
                {student.techCenter?.name ||
                  'No location'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* CARD CONTENT */}

      <div className="p-5 flex-1">
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <Stat label="General Course">
            <span className="break-words">
              {student.generalCourse ||
                'Not specified'}
            </span>
          </Stat>

          <Stat label="Status">
            <span
              className={
                student.isActive
                  ? 'text-[#1B7A52]'
                  : 'text-[#8993A2]'
              }
            >
              {student.isActive
                ? 'Active'
                : 'Inactive'}
            </span>
          </Stat>

          <Stat label="Courses Taking">
            <span>
              {student.studentCourses?.length || 0}
            </span>
          </Stat>

          <Stat label="Credits">
            <span>
              {getTotalCredits(student)}
            </span>
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
              {student.techCenter?.name ||
                'Not specified'}
            </span>
          </Stat>
        </div>

        {/* COURSES */}

        {student.studentCourses?.length > 0 && (
          <>
            <div className="my-5 h-px bg-[#EEF2F7]" />

            <p
              className="
                flex
                items-center
                gap-2
                text-[10px]
                sm:text-[11px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-[#7D8796]
              "
            >
              <BookOpen
                className="w-4 h-4 text-[#1A365D]"
                strokeWidth={2.2}
              />

              Enrolled Courses
            </p>

            <ul className="mt-3 space-y-2">
              {student.studentCourses
                .slice(0, 3)
                .map((course) => (
                  <li
                    key={course.id}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      rounded-xl
                      border
                      border-[#EEF2F7]
                      bg-[#F8FAFC]
                      px-3
                      py-2.5
                    "
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className="
                          block
                          text-[12px]
                          sm:text-[13px]
                          font-extrabold
                          text-[#1A365D]
                          break-words
                        "
                      >
                        {course.code}
                      </span>

                      <span
                        className="
                          block
                          mt-0.5
                          text-[11px]
                          sm:text-[12px]
                          text-[#8993A2]
                          break-words
                        "
                      >
                        {course.courseUnit}
                      </span>
                    </span>

                    <span
                      className="
                        shrink-0
                        text-[11px]
                        font-bold
                        text-[#5B6779]
                        bg-white
                        border
                        border-[#E3E8EF]
                        rounded-full
                        px-2.5
                        py-1
                        tabular-nums
                      "
                    >
                      {course.credits} cr
                    </span>
                  </li>
                ))}

              {student.studentCourses.length > 3 && (
                <li
                  className="
                    pt-0.5
                    text-[11px]
                    font-bold
                    text-[#8993A2]
                    break-words
                  "
                >
                  +
                  {student.studentCourses.length - 3}{' '}
                  more courses
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

            router.push(
              `/dashboard/students/${student.id}`
            );
          }}
          className="
            w-full
            h-11
            rounded-xl
            bg-[#1A365D]
            text-white
            text-[12px]
            uppercase
            tracking-[0.12em]
            font-extrabold
            flex
            items-center
            justify-center
            gap-2
            hover:bg-[#15304F]
            group-hover:bg-[#E8A33D]
            group-hover:text-[#14213D]
            transition-colors
          "
        >
          View Profile

          <ArrowRight
            className="
              w-4
              h-4
              transition-transform
              group-hover:translate-x-0.5
            "
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
      <header
        className="
          mb-4
          flex
          items-end
          justify-between
          gap-3
        "
      >
        <div className="min-w-0">
          <p
            className="
              flex
              items-center
              gap-2
              text-[10px]
              sm:text-[11px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#7D8796]
            "
          >
            <span className="h-4 w-1 bg-[#E8A33D] rounded-full" />

            Student Board
          </p>

          <h2
            className="
              mt-1.5
              text-xl
              sm:text-2xl
              font-extrabold
              tracking-tight
              text-[#14213D]
              break-words
            "
          >
            {title}
          </h2>
        </div>

        <div
          className="
            shrink-0
            flex
            items-baseline
            gap-1.5
            rounded-full
            border
            border-[#E3E8EF]
            bg-white
            px-3.5
            py-2
            shadow-sm
          "
        >
          <span className="text-[15px] font-extrabold text-[#1A365D] tabular-nums">
            {students.length}
          </span>

          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#8993A2]">
            students
          </span>
        </div>
      </header>

      <div
        className="
          grid
          gap-5
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-4
        "
      >
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
// MAIN PAGE
// ============================================================

export default function StudentsPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] =
    useState('');

  const [selectedLocation, setSelectedLocation] =
    useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['students'],

    queryFn: async () => {
      const response = await fetch('/api/students');

      if (!response.ok) {
        throw new Error(
          'Failed to fetch students'
        );
      }

      const result = await response.json();

      return result as {
        studentsByTechCenter: {
          [key: string]: Student[];
        };
        techCenters: TechCenter[];
        totalStudents: number;
      };
    },

    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const studentsByTechCenter =
    data?.studentsByTechCenter || {};

  const techCenters = data?.techCenters || [];

  const totalStudents =
    data?.totalStudents || 0;

  const allStudents = Object.values(
    studentsByTechCenter
  ).flat() as Student[];

  // ==========================================================
  // FILTERING
  // ==========================================================

  const filterStudents = (
    students: Student[]
  ) => {
    let filtered = students;

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(
        (student) =>
          student.techCenter?.id ===
          selectedLocation
      );
    }

    if (searchQuery.trim()) {
      const query =
        searchQuery.toLowerCase().trim();

      filtered = filtered.filter((student) => {
        const fullName =
          `${student.firstName} ${student.lastName}`.toLowerCase();

        return (
          fullName.includes(query) ||
          student.studentCourses?.some(
            (course) =>
              course.code
                .toLowerCase()
                .includes(query) ||
              course.courseUnit
                .toLowerCase()
                .includes(query)
          ) ||
          (student.generalCourse &&
            student.generalCourse
              .toLowerCase()
              .includes(query)) ||
          (student.techCenter &&
            student.techCenter.name
              .toLowerCase()
              .includes(query))
        );
      });
    }

    return filtered;
  };

  const filteredAllStudents =
    filterStudents(allStudents);

  const getLocationCount = (
    locationId: string
  ) =>
    allStudents.filter(
      (student) =>
        student.techCenter?.id ===
        locationId
    ).length;

  const locations = techCenters.map(
    (center) => ({
      ...center,
      _count: {
        students: getLocationCount(center.id),
      },
    })
  );

  const clearFilter = () => {
    setSelectedLocation('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedLocation !== 'all' ||
    Boolean(searchQuery.trim());

  const hasStudents =
    allStudents.length > 0;

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB]">
        <div
          className="
            mx-auto
            max-w-[1600px]
            px-4
            sm:px-6
            lg:px-8
            py-6
            animate-pulse
          "
        >
          <div className="h-24 rounded-2xl bg-white border border-[#E3E8EF]" />

          <div className="mt-4 h-32 rounded-2xl bg-white border border-[#E3E8EF]" />

          <div
            className="
              mt-6
              grid
              gap-5
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-3
              2xl:grid-cols-4
            "
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(
              (i) => (
                <div
                  key={i}
                  className="
                    h-80
                    rounded-2xl
                    bg-white
                    border
                    border-[#E3E8EF]
                  "
                />
              )
            )}
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
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center px-4">
        <div
          className="
            max-w-sm
            w-full
            text-center
            rounded-2xl
            border
            border-[#E3E8EF]
            bg-white
            p-8
            shadow-sm
          "
        >
          <div
            className="
              mx-auto
              w-14
              h-14
              rounded-2xl
              bg-[#FDECEC]
              flex
              items-center
              justify-center
            "
          >
            <AlertCircle
              className="w-7 h-7 text-[#C0392B]"
              strokeWidth={2}
            />
          </div>

          <h2 className="mt-5 text-lg font-extrabold text-[#14213D]">
            Failed to load students
          </h2>

          <p className="mt-2 text-[13px] leading-5 text-[#8993A2]">
            {error instanceof Error
              ? error.message
              : 'Please try again later'}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="
              mt-6
              h-11
              px-6
              rounded-xl
              bg-[#1A365D]
              text-white
              text-[13px]
              font-bold
              hover:bg-[#15304F]
              transition-colors
            "
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
    <div className="min-h-screen bg-[#F6F8FB] overflow-x-hidden">
      <div
        className="
          mx-auto
          max-w-[1600px]
          px-4
          sm:px-6
          lg:px-8
          pb-12
        "
      >
        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <header
          className="
            pt-7
            sm:pt-8
            pb-5
            flex
            flex-col
            lg:flex-row
            lg:items-end
            lg:justify-between
            gap-5
          "
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
              <Link
                href="/dashboard"
                className="
                  rounded-lg
                  bg-[#F0F4F8]
                  px-3
                  py-2
                  text-sm
                  text-[#6B7280]
                  hover:bg-[#E8EEF5]
                  hover:text-[#374151]
                  transition-all
                  duration-200
                "
              >
                Dashboard
              </Link>

              <Link
                href="/dashboard/courses"
                className="
                  rounded-lg
                  bg-[#F0F4F8]
                  px-3
                  py-2
                  text-sm
                  text-[#6B7280]
                  hover:bg-[#E8EEF5]
                  hover:text-[#374151]
                  transition-all
                  duration-200
                "
              >
                Courses
              </Link>

              <Link
                href="/dashboard/cleaning"
                className="
                  rounded-lg
                  bg-[#F0F4F8]
                  px-3
                  py-2
                  text-sm
                  text-[#6B7280]
                  hover:bg-[#E8EEF5]
                  hover:text-[#374151]
                  transition-all
                  duration-200
                "
              >
                Cleaning
              </Link>
            </div>

            <p
              className="
                flex
                items-center
                gap-2
                text-[10px]
                sm:text-[11px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[#7D8796]
              "
            >
              <span className="h-4 w-1 bg-[#E8A33D] rounded-full" />

              University Community
            </p>

            <h1
              className="
                mt-2
                text-3xl
                sm:text-4xl
                font-black
                tracking-tight
                text-[#14213D]
              "
            >
              STUDENTS
            </h1>

            <p
              className="
                mt-2
                max-w-xl
                text-[14px]
                sm:text-[15px]
                leading-6
                text-[#5B6779]
              "
            >
              Explore the students learning and
              growing across our university
              community.
            </p>
          </div>

          {/* COMMUNITY COUNT */}

          <div
            className="
              shrink-0
              rounded-2xl
              border
              border-[#E3E8EF]
              bg-white
              px-5
              py-4
              shadow-sm
              min-w-[190px]
            "
          >
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-[#7D8796]
              "
            >
              Community
            </p>

            <p
              className="
                mt-1
                text-3xl
                font-black
                text-[#1A365D]
                tabular-nums
                leading-tight
              "
            >
              {totalStudents}
            </p>

            <p className="mt-1 text-[11px] font-semibold text-[#8993A2]">
              registered students
            </p>
          </div>
        </header>

        {/* ====================================================
            NORMAL SEARCH + FILTER SECTION
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
            <div
              className="
                rounded-2xl
                border
                border-[#E3E8EF]
                bg-white
                py-20
                text-center
              "
            >
              <Users
                className="
                  mx-auto
                  w-10
                  h-10
                  text-[#C3CAD5]
                "
                strokeWidth={1.8}
              />

              <p className="mt-4 text-[14px] font-semibold text-[#8993A2]">
                No students found.
              </p>
            </div>
          )}

          {/* FILTERED RESULTS */}

          {hasStudents &&
            hasActiveFilters && (
              <>
                {filteredAllStudents.length ===
                0 ? (
                  <div
                    className="
                      rounded-2xl
                      border
                      border-[#E3E8EF]
                      bg-white
                      py-20
                      text-center
                      px-6
                    "
                  >
                    <Search
                      className="
                        mx-auto
                        w-10
                        h-10
                        text-[#C3CAD5]
                      "
                      strokeWidth={1.8}
                    />

                    <h3 className="mt-4 text-lg font-extrabold text-[#14213D]">
                      No matching students
                    </h3>

                    <p className="mt-2 text-[13px] leading-5 text-[#8993A2]">
                      Try changing your search or
                      location filter.
                    </p>

                    <button
                      onClick={clearFilter}
                      className="
                        mt-6
                        h-11
                        px-6
                        rounded-xl
                        bg-[#1A365D]
                        text-white
                        text-[13px]
                        font-bold
                        hover:bg-[#15304F]
                        transition-colors
                      "
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <StudentSection
                    title={
                      selectedLocation !== 'all'
                        ? locations.find(
                            (loc) =>
                              loc.id ===
                              selectedLocation
                          )?.name ||
                          'Filtered Results'
                        : 'Filtered Results'
                    }
                    students={
                      filteredAllStudents
                    }
                    router={router}
                  />
                )}
              </>
            )}

          {/* ALL STUDENTS BY TECH CENTER */}

          {hasStudents &&
            !hasActiveFilters && (
              <>
                {Object.entries(
                  studentsByTechCenter
                ).map(
                  ([
                    locationName,
                    students,
                  ]) => {
                    const studentList =
                      students as Student[];

                    if (
                      studentList.length ===
                      0
                    ) {
                      return null;
                    }

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
            <footer
              className="
                mt-5
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-3
                rounded-2xl
                border
                border-[#E3E8EF]
                bg-white
                px-4
                sm:px-5
                py-4
                shadow-sm
              "
            >
              <p
                className="
                  flex
                  items-center
                  gap-2
                  text-[12px]
                  sm:text-[13px]
                  font-bold
                  text-[#5B6779]
                "
              >
                <Users
                  className="w-4 h-4 text-[#1A365D]"
                  strokeWidth={2}
                />

                Student Community Directory
              </p>

              <span
                className="
                  text-[12px]
                  sm:text-[13px]
                  font-extrabold
                  text-[#1A365D]
                  tabular-nums
                "
              >
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