'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  X,
  MapPin,
  ChevronDown,
  ChevronRight,
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
  // email: string; // REMOVED: Email not needed on cards
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

const Stat = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#A3ABB8]">{label}</p>
    <div className="mt-0.5 text-[11px] font-semibold text-[#14213D] break-words">{children}</div>
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
  displayedCount,
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
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, locations.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedLocation]);

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  const activeLocation = locations.find((l) => l.id === selectedLocation);
  const activeLabel = selectedLocation === 'all' ? 'All tech centers' : activeLocation?.name ?? 'All tech centers';

  const sheetLocations = locations.filter((l) =>
    l.name.toLowerCase().includes(sheetQuery.toLowerCase().trim())
  );

  const chipBase =
    'inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[10px] font-bold leading-none whitespace-nowrap transition-all duration-200 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A33D]/40';

  const chipOn = 'bg-[#1A365D] border-[#1A365D] text-white shadow-[0_2px_8px_rgba(26,54,93,0.25)]';
  const chipOff =
    'bg-white border-[#DDE2E8] text-[#354258] hover:border-[#E8A33D] hover:text-[#1A365D] hover:shadow-sm active:scale-[0.98]';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <>
      <div
        className="
          sticky top-0 z-40
          -mx-4 sm:-mx-6 lg:-mx-8
          px-4 sm:px-6 lg:px-8
          bg-white/85 backdrop-blur-xl
          border-b border-[#E6EAEF]
          shadow-[0_1px_0_rgba(20,33,61,0.04),0_8px_24px_-16px_rgba(20,33,61,0.25)]
          supports-[backdrop-filter]:bg-white/70
        "
      >
        <div className="py-2 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#929CAA] pointer-events-none"
                strokeWidth={2}
              />
              <input
                type="text"
                inputMode="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search students, courses…"
                aria-label="Search students"
                className="
                  w-full h-9 pl-8 pr-8
                  bg-[#F8FAFC] border border-[#DDE2E8]
                  text-[#14213D] placeholder:text-[#929CAA]
                  text-[12px] rounded-lg
                  focus:outline-none focus:bg-white focus:border-[#E8A33D]
                  focus:ring-3 focus:ring-[#E8A33D]/10
                  transition-all
                "
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#8993A2] hover:text-[#14213D] hover:bg-[#EEF2F7] transition-colors"
                >
                  <X className="w-3 h-3" strokeWidth={2.5} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="
                lg:hidden inline-flex items-center gap-1.5
                h-9 px-2.5 rounded-lg border border-[#DDE2E8] bg-white
                text-[10px] font-bold text-[#1A365D] shadow-sm
                active:scale-[0.98] transition-all max-w-[42%]
              "
              aria-label="Filter by tech center"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
              <span className="truncate">
                {selectedLocation === 'all' ? 'Filter' : activeLabel}
              </span>
              <ChevronDown className="w-3 h-3 shrink-0 opacity-60" strokeWidth={2.5} />
            </button>

            <div className="hidden lg:flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#E6EAEF] shrink-0">
              <Users className="w-3.5 h-3.5 text-[#1A365D]" strokeWidth={2} />
              <span className="text-[12px] font-extrabold text-[#14213D] tabular-nums">
                {displayedCount}
              </span>
              <span className="text-[10px] font-semibold text-[#8993A2] tabular-nums">
                / {totalStudents}
              </span>
            </div>
          </div>

          <div className="relative">
            <div
              className={`lg:hidden pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent transition-opacity ${
                canScrollLeft ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div
              className={`lg:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent transition-opacity ${
                canScrollRight ? 'opacity-100' : 'opacity-0'
              }`}
            />

            <div
              ref={scrollerRef}
              className="
                flex items-center gap-1.5 overflow-x-auto lg:overflow-visible lg:flex-wrap
                pb-1 -mb-0.5 scroll-smooth snap-x snap-mandatory
                [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
              "
              role="tablist"
              aria-label="Filter by tech center"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedLocation === 'all'}
                data-active={selectedLocation === 'all'}
                onClick={() => {
                  setSelectedLocation('all');
                }}
                className={`${chipBase} snap-start ${selectedLocation === 'all' ? chipOn : chipOff}`}
              >
                All
                <span
                  className={`inline-flex items-center justify-center min-w-[1.1rem] h-4.5 px-1.5 rounded-full text-[9px] font-extrabold tabular-nums ${
                    selectedLocation === 'all' ? 'bg-white/20 text-white' : 'bg-[#EEF2F7] text-[#5B6779]'
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
                    data-active={isSelected}
                    onClick={() => {
                      setSelectedLocation(location.id);
                    }}
                    title={location.name}
                    className={`${chipBase} snap-start max-w-[13rem] ${isSelected ? chipOn : chipOff}`}
                  >
                    <span className="truncate max-w-[8rem]">{location.name}</span>
                    <span
                      className={`inline-flex items-center justify-center min-w-[1.1rem] h-4.5 px-1.5 rounded-full text-[9px] font-extrabold tabular-nums ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#EEF2F7] text-[#5B6779]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:hidden flex items-center justify-between gap-2 pb-0.5">
            <p className="flex items-center gap-1.5 text-[9px] font-semibold text-[#8993A2]">
              <ChevronRight className="w-2.5 h-2.5 animate-pulse" strokeWidth={3} />
              Scroll sideways to filter by tech center
            </p>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] font-bold text-[#5B6779] tabular-nums">
                {displayedCount}
                <span className="text-[#A3ABB8]"> / {totalStudents}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-[#0B182B]/50 backdrop-blur-[2px] animate-in fade-in duration-200"
            onClick={() => setSheetOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter by tech center"
            className="
              absolute inset-x-0 bottom-0
              max-h-[80vh] flex flex-col
              bg-white rounded-t-2xl border-t border-[#E6EAEF]
              shadow-[0_-12px_40px_rgba(11,24,43,0.25)]
              animate-in slide-in-from-bottom duration-250
            "
          >
            <div className="pt-2.5 pb-1 flex justify-center shrink-0">
              <span className="h-1.5 w-10 rounded-full bg-[#DDE2E8]" />
            </div>

            <div className="px-4 pb-3 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-extrabold text-[#14213D]">Tech Centers</h3>
                <p className="text-[11px] text-[#8993A2] font-medium">
                  {locations.length} centers • {totalStudents} students
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close"
                className="p-2 rounded-lg text-[#8993A2] hover:bg-[#F1F4F8]"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            <div className="px-4 pb-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#929CAA]" strokeWidth={2} />
                <input
                  value={sheetQuery}
                  onChange={(e) => setSheetQuery(e.target.value)}
                  placeholder="Find a tech center…"
                  className="w-full h-10 pl-9 pr-3 bg-[#F8FAFC] border border-[#DDE2E8] rounded-xl text-[13px] text-[#14213D] placeholder:text-[#929CAA] focus:outline-none focus:border-[#E8A33D] focus:ring-4 focus:ring-[#E8A33D]/10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation('all');
                  setSheetOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl transition-colors ${
                  selectedLocation === 'all' ? 'bg-[#F2F6FC]' : 'hover:bg-[#F8FAFC]'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-[#1A365D] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-white" strokeWidth={2} />
                  </span>
                  <span className="text-[13px] font-bold text-[#14213D] truncate">All tech centers</span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-extrabold text-[#5B6779] tabular-nums">{totalStudents}</span>
                  {selectedLocation === 'all' && <Check className="w-4 h-4 text-[#E8A33D]" strokeWidth={3} />}
                </span>
              </button>

              {sheetLocations.map((location) => {
                const isSelected = selectedLocation === location.id;
                return (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(location.id);
                      setSheetOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl transition-colors ${
                      isSelected ? 'bg-[#F2F6FC]' : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0 text-left">
                      <span className="w-8 h-8 rounded-lg bg-[#EEF2F7] flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-[#1A365D]" strokeWidth={2} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-bold text-[#14213D] truncate">{location.name}</span>
                        <span className="block text-[10px] font-medium text-[#8993A2] truncate">
                          {location.country?.name}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-extrabold text-[#5B6779] tabular-nums">
                        {location._count?.students || 0}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#E8A33D]" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}

              {sheetLocations.length === 0 && (
                <p className="py-8 text-center text-[12px] text-[#8993A2]">No tech center matches that name.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================
// STUDENT CARD - Email removed
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

  const getAvatarColor = (firstName: string, lastName: string) => {
    const colors = ['bg-[#1A365D]', 'bg-[#244A78]', 'bg-[#315D8D]'];
    const hash = firstName.charCodeAt(0) + lastName.charCodeAt(0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getTotalCredits = (s: Student) =>
    s.studentCourses?.reduce((total, course) => total + (course.credits || 0), 0) ?? 0;

  const initials = getInitials(student.firstName, student.lastName);
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <article
      onClick={() => router.push(`/dashboard/students/${student.id}`)}
      className="
        group bg-white border border-[#E6EAEF] rounded-2xl overflow-hidden
        cursor-pointer flex flex-col
        shadow-[0_1px_2px_rgba(20,33,61,0.04)]
        transition-all duration-200
        hover:shadow-[0_16px_40px_-20px_rgba(20,33,61,0.45)]
        hover:border-[#E8A33D] hover:-translate-y-1
        focus-within:ring-2 focus-within:ring-[#E8A33D]/30
        h-full
      "
    >
      <div className="relative p-4 pb-3 bg-gradient-to-b from-[#F8FAFC] to-white border-b border-[#EEF2F7]">
        <span className="absolute top-3 right-3 text-[10px] font-extrabold tabular-nums text-[#C3CAD5]">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            {student.profileImageUrl ? (
              <Image
                src={student.profileImageUrl}
                alt={fullName}
                width={52}
                height={52}
                className="w-13 h-13 w-[52px] h-[52px] rounded-xl object-cover border border-[#E6EAEF]"
              />
            ) : (
              <div
                className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center ${getAvatarColor(
                  student.firstName,
                  student.lastName
                )}`}
              >
                <span className="text-white text-sm font-extrabold tracking-wide">{initials}</span>
              </div>
            )}

            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                student.isActive ? 'bg-[#22A06B]' : 'bg-[#B6BDC8]'
              }`}
              title={student.isActive ? 'Active' : 'Inactive'}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-extrabold text-[#14213D] break-words group-hover:text-[#1A365D]">
              {fullName}
            </h3>
            {/* Email removed */}
            <p className="mt-1.5 inline-flex items-center gap-1 max-w-full text-[10px] font-bold text-[#5B6779] bg-[#F1F4F8] border border-[#E6EAEF] rounded-full px-2 py-0.5">
              <MapPin className="w-3 h-3 shrink-0 text-[#1A365D]" strokeWidth={2.4} />
              <span className="break-words">{student.techCenter?.name || 'No location'}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          <Stat label="General Course">
            <span className="break-words">{student.generalCourse || 'Not specified'}</span>
          </Stat>
          <Stat label="Status">
            <span className={student.isActive ? 'text-[#1B7A52]' : 'text-[#8993A2]'}>
              {student.isActive ? 'Active' : 'Inactive'}
            </span>
          </Stat>
          <Stat label="Courses Taking">
            <span className="break-words">{student.studentCourses?.length || 0}</span>
          </Stat>
          <Stat label="Credits">
            <span className="break-words">{getTotalCredits(student)}</span>
          </Stat>
          <Stat label="Religion">
            <span className="break-words">
              {student.takesReligion === null ? 'N/A' : student.takesReligion ? 'Yes' : 'No'}
            </span>
          </Stat>
          <Stat label="Location">
            <span className="break-words">{student.techCenter?.name || 'Not specified'}</span>
          </Stat>
        </div>

        {student.studentCourses?.length > 0 && (
          <>
            <div className="my-4 h-px bg-[#EEF2F7]" />

            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#A3ABB8]">
              <BookOpen className="w-3.5 h-3.5 text-[#1A365D]" strokeWidth={2.2} />
              Enrolled Courses
            </p>

            <ul className="mt-2 space-y-1.5">
              {student.studentCourses.slice(0, 3).map((course) => (
                <li
                  key={course.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[#EEF2F7] bg-[#F8FAFC] px-2.5 py-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-extrabold text-[#1A365D] break-words">{course.code}</span>
                    <span className="block text-[10px] text-[#8993A2] break-words">{course.courseUnit}</span>
                  </span>
                  <span className="shrink-0 text-[10px] font-bold text-[#5B6779] bg-white border border-[#E6EAEF] rounded-full px-2 py-0.5 tabular-nums">
                    {course.credits} cr
                  </span>
                </li>
              ))}

              {student.studentCourses.length > 3 && (
                <li className="pt-0.5 text-[10px] font-bold text-[#8993A2] break-words">
                  +{student.studentCourses.length - 3} more courses
                </li>
              )}
            </ul>
          </>
        )}
      </div>

      <div className="p-3 pt-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/students/${student.id}`);
          }}
          className="
            w-full h-10 rounded-xl
            bg-[#1A365D] text-white text-[11px] uppercase tracking-[0.14em] font-extrabold
            flex items-center justify-center gap-2
            hover:bg-[#15304F] group-hover:bg-[#E8A33D] group-hover:text-[#14213D]
            transition-colors
          "
        >
          View Profile
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
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
    <section className="mb-8">
      <header className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#A3ABB8]">
            <span className="h-3 w-0.5 bg-[#E8A33D] rounded-full" />
            Student Board
          </p>
          <h2 className="mt-1 text-lg sm:text-xl font-extrabold text-[#14213D] break-words">{title}</h2>
        </div>

        <div className="shrink-0 flex items-baseline gap-1.5 rounded-full border border-[#E6EAEF] bg-white px-3 py-1.5">
          <span className="text-sm font-extrabold text-[#1A365D] tabular-nums">{students.length}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8993A2]">students</span>
        </div>
      </header>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

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

  const studentsByTechCenter = data?.studentsByTechCenter || {};
  const techCenters = data?.techCenters || [];
  const totalStudents = data?.totalStudents || 0;

  const allStudents = Object.values(studentsByTechCenter).flat() as Student[];

  const filterStudents = (students: Student[]) => {
    let filtered = students;

    if (selectedLocation !== 'all') {
      filtered = filtered.filter((student) => student.techCenter?.id === selectedLocation);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((student) => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        return (
          fullName.includes(query) ||
          // email removed from search
          student.studentCourses?.some(
            (course) =>
              course.code.toLowerCase().includes(query) ||
              course.courseUnit.toLowerCase().includes(query)
          ) ||
          (student.generalCourse && student.generalCourse.toLowerCase().includes(query)) ||
          (student.techCenter && student.techCenter.name.toLowerCase().includes(query))
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
  const displayedCount = hasActiveFilters ? filteredAllStudents.length : totalStudents;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB]">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
          <div className="h-20 rounded-2xl bg-white border border-[#E6EAEF]" />
          <div className="mt-4 h-20 rounded-2xl bg-white border border-[#E6EAEF]" />
          <div className="mt-6 flex gap-2 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-28 shrink-0 rounded-full bg-white border border-[#E6EAEF]" />
            ))}
          </div>
          <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-white border border-[#E6EAEF]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center rounded-2xl border border-[#E6EAEF] bg-white p-8 shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-xl bg-[#FDECEC] flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-[#C0392B]" strokeWidth={2} />
          </div>
          <h2 className="mt-4 text-base font-extrabold text-[#14213D]">Failed to load students</h2>
          <p className="mt-1.5 text-[12px] text-[#8993A2]">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 h-10 px-6 rounded-xl bg-[#1A365D] text-white text-[12px] font-bold hover:bg-[#15304F] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pb-12">
        <header className="pt-6 pb-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#A3ABB8]">
              <span className="h-3 w-0.5 bg-[#E8A33D] rounded-full" />
              University Community
            </p>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-[#14213D]">STUDENTS</h1>
            <p className="mt-1 max-w-xl text-[12px] sm:text-[13px] text-[#5B6779]">
              Explore the students learning and growing across our university community.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-[#E6EAEF] bg-white px-4 py-3 shadow-sm">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#A3ABB8]">Community</p>
            <p className="text-2xl font-black text-[#1A365D] tabular-nums leading-tight">{totalStudents}</p>
            <p className="text-[10px] font-semibold text-[#8993A2]">registered students</p>
          </div>
        </header>

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

        <main ref={resultsRef} className="pt-4">
          {!hasStudents && (
            <div className="rounded-2xl border border-[#E6EAEF] bg-white py-16 text-center">
              <Users className="mx-auto w-8 h-8 text-[#C3CAD5]" strokeWidth={1.8} />
              <p className="mt-3 text-[13px] font-semibold text-[#8993A2]">No students found.</p>
            </div>
          )}

          {hasStudents && hasActiveFilters && (
            <>
              {filteredAllStudents.length === 0 ? (
                <div className="rounded-2xl border border-[#E6EAEF] bg-white py-16 text-center px-6">
                  <Search className="mx-auto w-8 h-8 text-[#C3CAD5]" strokeWidth={1.8} />
                  <h3 className="mt-3 text-sm font-extrabold text-[#14213D]">No matching students</h3>
                  <p className="mt-1 text-[12px] text-[#8993A2]">Try changing your search or location filter.</p>
                  <button
                    onClick={clearFilter}
                    className="mt-5 h-10 px-5 rounded-xl bg-[#1A365D] text-white text-[12px] font-bold hover:bg-[#15304F] transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <StudentSection
                  title={
                    selectedLocation !== 'all'
                      ? locations.find((loc) => loc.id === selectedLocation)?.name || 'Filtered Results'
                      : 'Filtered Results'
                  }
                  students={filteredAllStudents}
                  router={router}
                />
              )}
            </>
          )}

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

          {hasStudents && (
            <footer className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[#E6EAEF] bg-white px-4 py-3">
              <p className="flex items-center gap-2 text-[11px] font-bold text-[#5B6779]">
                <Users className="w-4 h-4 text-[#1A365D]" strokeWidth={2} />
                Student Community Directory
              </p>
              <span className="text-[11px] font-extrabold text-[#1A365D] tabular-nums">
                {totalStudents} students
              </span>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}