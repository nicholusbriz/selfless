'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  X,
  MapPin,
  ChevronDown,
  BookOpen,
  SlidersHorizontal,
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
// STICKY SEARCH & FILTER BAR
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
  displayedCount: number;
  hasActiveFilters: boolean;
  clearFilter: () => void;
}) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetQuery, setSheetQuery] = useState('');

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;

    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth - 4
    );
  }, []);

  useEffect(() => {
    updateScrollState();

    const el = scrollerRef.current;

    if (!el) return;

    el.addEventListener('scroll', updateScrollState, {
      passive: true,
    });

    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, locations.length]);

  useEffect(() => {
    const el = scrollerRef.current;

    if (!el) return;

    const active =
      el.querySelector<HTMLElement>('[data-active="true"]');

    active?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [selectedLocation]);

  useEffect(() => {
    if (!sheetOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sheetOpen]);

  const activeLocation = locations.find(
    (location) => location.id === selectedLocation
  );

  const activeLabel =
    selectedLocation === 'all'
      ? 'All tech centers'
      : activeLocation?.name ?? 'All tech centers';

  const sheetLocations = locations.filter((location) =>
    location.name
      .toLowerCase()
      .includes(sheetQuery.toLowerCase().trim())
  );

  const chipBase =
    'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border text-[12px] sm:text-[13px] font-bold leading-none whitespace-nowrap transition-all duration-200 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A33D]/40';

  const chipOn =
    'bg-[#1A365D] border-[#1A365D] text-white shadow-[0_4px_12px_rgba(26,54,93,0.20)]';

  const chipOff =
    'bg-white border-[#D8DEE7] text-[#354258] hover:border-[#E8A33D] hover:text-[#1A365D] hover:shadow-sm active:scale-[0.98]';

  return (
    <>
      {/* ======================================================
          STICKY BAR
      ====================================================== */}

      <div
        className="
          sticky top-0 z-40
          -mx-4 sm:-mx-6 lg:-mx-8
          px-4 sm:px-6 lg:px-8
          bg-white/95 backdrop-blur-xl
          border-b border-[#E3E8EF]
          shadow-[0_1px_0_rgba(20,33,61,0.04),0_8px_24px_-18px_rgba(20,33,61,0.35)]
          supports-[backdrop-filter]:bg-white/80
        "
      >
        <div className="py-3 sm:py-4 space-y-3">
          {/* SEARCH ROW */}

          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-0 lg:max-w-[620px]">
              <Search
                className="
                  absolute left-3.5 top-1/2
                  -translate-y-1/2
                  w-4.5 h-4.5
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
                  h-11 sm:h-12
                  pl-11 pr-10
                  bg-[#F8FAFC]
                  border border-[#D8DEE7]
                  text-[#14213D]
                  placeholder:text-[#8A94A3]
                  text-[14px] sm:text-[15px]
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
                    absolute right-2.5 top-1/2
                    -translate-y-1/2
                    p-1.5
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

            {/* MOBILE FILTER BUTTON */}

            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="
                lg:hidden
                inline-flex
                items-center
                justify-center
                gap-2
                h-11
                px-3.5
                rounded-xl
                border border-[#D8DEE7]
                bg-white
                text-[12px]
                sm:text-[13px]
                font-bold
                text-[#1A365D]
                shadow-sm
                active:scale-[0.98]
                transition-all
                max-w-[45%]
              "
              aria-label="Filter by tech center"
            >
              <SlidersHorizontal
                className="w-4 h-4 shrink-0"
                strokeWidth={2.2}
              />

              <span className="truncate">
                {selectedLocation === 'all'
                  ? 'Filter'
                  : activeLabel}
              </span>

              <ChevronDown
                className="w-3.5 h-3.5 shrink-0 opacity-60"
                strokeWidth={2.5}
              />
            </button>

            {/* DESKTOP STUDENT COUNT */}

            <div
              className="
                hidden lg:flex
                items-center gap-2
                h-12
                px-4
                rounded-xl
                bg-[#F8FAFC]
                border border-[#E3E8EF]
                shrink-0
              "
            >
              <Users
                className="w-4 h-4 text-[#1A365D]"
                strokeWidth={2}
              />

              <span className="text-[14px] font-extrabold text-[#14213D] tabular-nums">
                {totalStudents}
              </span>

              <span className="text-[12px] font-semibold text-[#7D8796]">
                students
              </span>
            </div>
          </div>

          {/* TECH CENTER FILTERS */}

          <div className="relative">
            <div
              className={`
                lg:hidden
                pointer-events-none
                absolute left-0 top-0 bottom-0
                w-8
                bg-gradient-to-r
                from-white
                to-transparent
                transition-opacity
                z-10
                ${canScrollLeft ? 'opacity-100' : 'opacity-0'}
              `}
            />

            <div
              className={`
                lg:hidden
                pointer-events-none
                absolute right-0 top-0 bottom-0
                w-10
                bg-gradient-to-l
                from-white
                to-transparent
                transition-opacity
                z-10
                ${canScrollRight ? 'opacity-100' : 'opacity-0'}
              `}
            />

            <div
              ref={scrollerRef}
              className="
                flex
                items-center
                gap-2
                overflow-x-auto
                lg:overflow-visible
                lg:flex-wrap
                pb-1
                scroll-smooth
                snap-x
                snap-mandatory
                [scrollbar-width:none]
                [-ms-overflow-style:none]
                [&::-webkit-scrollbar]:hidden
              "
              role="tablist"
              aria-label="Filter by tech center"
            >
              {/* ALL */}

              <button
                type="button"
                role="tab"
                aria-selected={selectedLocation === 'all'}
                data-active={selectedLocation === 'all'}
                onClick={() => setSelectedLocation('all')}
                className={`
                  ${chipBase}
                  snap-start
                  ${
                    selectedLocation === 'all'
                      ? chipOn
                      : chipOff
                  }
                `}
              >
                All

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
                    data-active={isSelected}
                    onClick={() =>
                      setSelectedLocation(location.id)
                    }
                    title={location.name}
                    className={`
                      ${chipBase}
                      snap-start
                      max-w-[16rem]
                      ${
                        isSelected
                          ? chipOn
                          : chipOff
                      }
                    `}
                  >
                    <span className="truncate max-w-[11rem]">
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
          </div>
        </div>
      </div>

      {/* ======================================================
          MOBILE FILTER SHEET
      ====================================================== */}

      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="
              absolute inset-0
              bg-[#0B182B]/50
              backdrop-blur-[2px]
              animate-in
              fade-in
              duration-200
            "
            onClick={() => setSheetOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter by tech center"
            className="
              absolute
              inset-x-0
              bottom-0
              max-h-[85vh]
              flex
              flex-col
              bg-white
              rounded-t-3xl
              border-t
              border-[#E3E8EF]
              shadow-[0_-16px_50px_rgba(11,24,43,0.25)]
              animate-in
              slide-in-from-bottom
              duration-250
            "
          >
            <div className="pt-3 pb-2 flex justify-center">
              <span className="h-1.5 w-12 rounded-full bg-[#D8DEE7]" />
            </div>

            <div className="px-5 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#14213D]">
                  Tech Centers
                </h3>

                <p className="mt-0.5 text-[12px] text-[#7D8796] font-medium">
                  {locations.length} centers • {totalStudents}{' '}
                  students
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close"
                className="
                  p-2.5
                  rounded-xl
                  text-[#7D8796]
                  hover:bg-[#F1F4F8]
                "
              >
                <X
                  className="w-5 h-5"
                  strokeWidth={2.5}
                />
              </button>
            </div>

            <div className="px-5 pb-4">
              <div className="relative">
                <Search
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    w-4.5
                    h-4.5
                    text-[#8A94A3]
                  "
                  strokeWidth={2}
                />

                <input
                  value={sheetQuery}
                  onChange={(e) =>
                    setSheetQuery(e.target.value)
                  }
                  placeholder="Find a tech center..."
                  className="
                    w-full
                    h-12
                    pl-11
                    pr-4
                    bg-[#F8FAFC]
                    border
                    border-[#D8DEE7]
                    rounded-xl
                    text-[14px]
                    text-[#14213D]
                    placeholder:text-[#8A94A3]
                    font-medium
                    focus:outline-none
                    focus:border-[#E8A33D]
                    focus:ring-4
                    focus:ring-[#E8A33D]/10
                  "
                />
              </div>
            </div>

            <div
              className="
                flex-1
                overflow-y-auto
                overscroll-contain
                px-3
                pb-[max(1rem,env(safe-area-inset-bottom))]
              "
            >
              {/* ALL */}

              <button
                type="button"
                onClick={() => {
                  setSelectedLocation('all');
                  setSheetOpen(false);
                }}
                className={`
                  w-full
                  flex
                  items-center
                  justify-between
                  gap-3
                  px-3
                  py-3.5
                  rounded-xl
                  transition-colors
                  ${
                    selectedLocation === 'all'
                      ? 'bg-[#F2F6FC]'
                      : 'hover:bg-[#F8FAFC]'
                  }
                `}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-[#1A365D]
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <Users
                      className="w-5 h-5 text-white"
                      strokeWidth={2}
                    />
                  </span>

                  <span className="text-[14px] font-bold text-[#14213D] truncate">
                    All tech centers
                  </span>
                </span>

                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-[12px] font-extrabold text-[#5B6779] tabular-nums">
                    {totalStudents}
                  </span>

                  {selectedLocation === 'all' && (
                    <Check
                      className="w-5 h-5 text-[#E8A33D]"
                      strokeWidth={3}
                    />
                  )}
                </span>
              </button>

              {sheetLocations.map((location) => {
                const isSelected =
                  selectedLocation === location.id;

                return (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(location.id);
                      setSheetOpen(false);
                    }}
                    className={`
                      w-full
                      flex
                      items-center
                      justify-between
                      gap-3
                      px-3
                      py-3.5
                      rounded-xl
                      transition-colors
                      ${
                        isSelected
                          ? 'bg-[#F2F6FC]'
                          : 'hover:bg-[#F8FAFC]'
                      }
                    `}
                  >
                    <span className="flex items-center gap-3 min-w-0 text-left">
                      <span
                        className="
                          w-10
                          h-10
                          rounded-xl
                          bg-[#EEF2F7]
                          flex
                          items-center
                          justify-center
                          shrink-0
                        "
                      >
                        <MapPin
                          className="w-5 h-5 text-[#1A365D]"
                          strokeWidth={2}
                        />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-[14px] font-bold text-[#14213D] truncate">
                          {location.name}
                        </span>

                        <span className="block mt-0.5 text-[11px] font-medium text-[#8993A2] truncate">
                          {location.country?.name}
                        </span>
                      </span>
                    </span>

                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-[12px] font-extrabold text-[#5B6779] tabular-nums">
                        {location._count?.students || 0}
                      </span>

                      {isSelected && (
                        <Check
                          className="w-5 h-5 text-[#E8A33D]"
                          strokeWidth={3}
                        />
                      )}
                    </span>
                  </button>
                );
              })}

              {sheetLocations.length === 0 && (
                <p className="py-10 text-center text-[13px] text-[#8993A2]">
                  No tech center matches that name.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
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
      (total, course) => total + (course.credits || 0),
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
        router.push(`/dashboard/students/${student.id}`)
      }
      className="
        group
        bg-white
        border border-[#E3E8EF]
        rounded-2xl
        overflow-hidden
        cursor-pointer
        flex flex-col
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
                student.isActive ? 'Active' : 'Inactive'
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
              {student.generalCourse || 'Not specified'}
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
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] =
    useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['students'],

    queryFn: async () => {
      const response = await fetch('/api/students');

      if (!response.ok) {
        throw new Error('Failed to fetch students');
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

  const totalStudents = data?.totalStudents || 0;

  const allStudents = Object.values(
    studentsByTechCenter
  ).flat() as Student[];

  const filterStudents = (students: Student[]) => {
    let filtered = students;

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(
        (student) =>
          student.techCenter?.id === selectedLocation
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

  const getLocationCount = (locationId: string) =>
    allStudents.filter(
      (student) =>
        student.techCenter?.id === locationId
    ).length;

  const locations = techCenters.map((center) => ({
    ...center,
    _count: {
      students: getLocationCount(center.id),
    },
  }));

  const clearFilter = () => {
    setSelectedLocation('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedLocation !== 'all' ||
    Boolean(searchQuery.trim());

  const hasStudents = allStudents.length > 0;

  const displayedCount = hasActiveFilters
    ? filteredAllStudents.length
    : totalStudents;

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

          <div className="mt-4 h-20 rounded-2xl bg-white border border-[#E3E8EF]" />

          <div className="mt-6 flex gap-2 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="
                  h-10
                  w-32
                  shrink-0
                  rounded-xl
                  bg-white
                  border
                  border-[#E3E8EF]
                "
              />
            ))}
          </div>

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
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
            onClick={() => window.location.reload()}
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
    <div className="min-h-screen bg-[#F6F8FB]">
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
            <div className="flex items-center gap-3 mb-4">
              <Link
                href="/dashboard"
                className="rounded-lg bg-[#F0F4F8] px-3 py-2 text-sm text-[#6B7280] hover:bg-[#E8EEF5] hover:text-[#374151] transition-all duration-200"
              >
                Dashboard
              </Link>

              <Link
                href="/dashboard/courses"
                className="rounded-lg bg-[#F0F4F8] px-3 py-2 text-sm text-[#6B7280] hover:bg-[#E8EEF5] hover:text-[#374151] transition-all duration-200"
              >
                Courses
              </Link>

              <Link
                href="/dashboard/cleaning"
                className="rounded-lg bg-[#F0F4F8] px-3 py-2 text-sm text-[#6B7280] hover:bg-[#E8EEF5] hover:text-[#374151] transition-all duration-200"
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
              Explore the students learning and growing
              across our university community.
            </p>
          </div>

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
            STICKY SEARCH + FILTERS
        ==================================================== */}

        <SearchFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          locations={locations}
          totalStudents={totalStudents}
          displayedCount={displayedCount}
          hasActiveFilters={hasActiveFilters}
          clearFilter={clearFilter}
        />

        {/* ====================================================
            RESULTS
        ==================================================== */}

        <main
          ref={resultsRef}
          className="pt-6"
        >
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

          {hasStudents &&
            hasActiveFilters && (
              <>
                {filteredAllStudents.length === 0 ? (
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
                    students={filteredAllStudents}
                    router={router}
                  />
                )}
              </>
            )}

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
                      studentList.length === 0
                    )
                      return null;

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
                items-center
                justify-between
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
                {totalStudents} students
              </span>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}