'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Home,
  Users,
  MapPin,
  User,
  Search,
  CheckCircle,
  XCircle,
  Filter,
  X,
  BookOpen,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string | null;
  role: {
    name: string;
  };
  techCenter: {
    id: string;
    name: string;
    country: {
      name: string;
    };
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
  country: {
    name: string;
  };
}

export default function StudentsPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechCenter, setSelectedTechCenter] =
    useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [religionFilter, setReligionFilter] =
    useState<string>('all');

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

  const getInitials = (
    firstName: string,
    lastName: string
  ) => {
    return `${firstName.charAt(0)}${lastName.charAt(
      0
    )}`.toUpperCase();
  };

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

  const getTotalCredits = (student: Student) => {
    if (
      !student.studentCourses ||
      student.studentCourses.length === 0
    ) {
      return 0;
    }

    return student.studentCourses.reduce(
      (total, course) =>
        total + (course.credits || 0),
      0
    );
  };

  const filterStudents = (students: Student[]) => {
    let filtered = students;

    if (selectedTechCenter !== 'all') {
      filtered = filtered.filter(
        (student) =>
          student.techCenter?.id === selectedTechCenter
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter(
        (student) =>
          student.firstName
            .toLowerCase()
            .includes(query) ||
          student.lastName
            .toLowerCase()
            .includes(query) ||
          student.email
            .toLowerCase()
            .includes(query) ||
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
              .includes(query))
      );
    }

    if (courseFilter === 'withCourses') {
      filtered = filtered.filter(
        (student) =>
          student.studentCourses &&
          student.studentCourses.length > 0
      );
    } else if (courseFilter === 'withoutCourses') {
      filtered = filtered.filter(
        (student) =>
          !student.studentCourses ||
          student.studentCourses.length === 0
      );
    }

    if (religionFilter === 'takesReligion') {
      filtered = filtered.filter(
        (student) =>
          student.takesReligion === true
      );
    } else if (religionFilter === 'noReligion') {
      filtered = filtered.filter(
        (student) =>
          student.takesReligion === false
      );
    }

    return filtered;
  };

  const clearFilter = () => {
    setSelectedTechCenter('all');
    setCourseFilter('all');
    setReligionFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedTechCenter !== 'all' ||
    courseFilter !== 'all' ||
    religionFilter !== 'all' ||
    Boolean(searchQuery);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F6F8] to-[#E8EBF0]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">

          <div className="h-10 w-48 bg-gradient-to-r from-[#E0E4E9] to-[#D5D9E0] animate-pulse mb-8 rounded-lg" />

          <div className="h-28 bg-gradient-to-br from-white to-[#F8F9FA] border-2 border-[#D8DDE4] animate-pulse mb-6 rounded-lg shadow-md" />

          <div className="h-12 bg-gradient-to-r from-white to-[#F8F9FA] border-2 border-[#D8DDE4] animate-pulse mb-4 rounded-lg shadow-sm" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            <div className="h-12 bg-gradient-to-r from-white to-[#F8F9FA] border-2 border-[#D8DDE4] animate-pulse rounded-lg shadow-sm" />
            <div className="h-12 bg-gradient-to-r from-white to-[#F8F9FA] border-2 border-[#D8DDE4] animate-pulse rounded-lg shadow-sm" />
            <div className="h-12 bg-gradient-to-r from-white to-[#F8F9FA] border-2 border-[#D8DDE4] animate-pulse rounded-lg shadow-sm" />
          </div>

          {[1, 2, 3].map((section) => (
            <div key={section} className="mb-10">
              <div className="h-7 w-56 bg-gradient-to-r from-[#DDE2E8] to-[#D0D5DC] animate-pulse mb-4 rounded-lg" />

              <div className="bg-gradient-to-br from-white to-[#F8F9FA] border-2 border-[#D8DDE4] rounded-lg shadow-md overflow-hidden">
                {[1, 2, 3].map((row) => (
                  <div
                    key={row}
                    className="h-28 border-b border-[#E3E6EA] animate-pulse last:border-b-0"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F6F8] to-[#E8EBF0]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">

          <button
            onClick={() => router.back()}
            className="p-2.5 bg-white border-2 border-[#D8DDE4] text-[#596678] hover:text-[#14213D] hover:border-[#E8A33D] transition-all duration-200 rounded-lg shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="mt-8 bg-gradient-to-br from-white to-[#F8F9FA] border-2 border-[#D8DDE4] p-10 text-center rounded-lg shadow-xl">
            <div className="w-16 h-16 bg-[#D95C5C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-[#D95C5C]" />
            </div>

            <h2 className="text-lg font-bold text-[#14213D]">
              Failed to load students
            </h2>

            <p className="text-sm text-[#718096] mt-2">
              {error instanceof Error
                ? error.message
                : 'Please try again later'}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 px-6 py-2.5 bg-gradient-to-r from-[#1A365D] to-[#244A78] text-white font-semibold hover:from-[#15304F] hover:to-[#1F3F6D] hover:shadow-lg transition-all duration-300 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allStudents =
    Object.values(studentsByTechCenter).flat() as Student[];

  const hasStudents = allStudents.length > 0;

  /*
   * ============================================================
   * STUDENT DISPLAY
   * ============================================================
   */

  const StudentDisplay = ({
    student,
    index,
  }: {
    student: Student;
    index: number;
  }) => {
    const initials = getInitials(
      student.firstName,
      student.lastName
    );

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
          border-b
          border-[#DDE2E8]
          cursor-pointer
          hover:shadow-lg
          hover:border-[#E8A33D]/30
          hover:bg-gradient-to-r
          hover:from-white
          hover:to-[#FAFBFC]
          transition-all
          duration-300
          relative
          overflow-hidden
        "
      >
        {/* ====================================================
            DESKTOP BILLBOARD ROW
        ==================================================== */}

        <div className="hidden lg:grid grid-cols-[55px_90px_minmax(280px,1fr)_180px_140px_130px] items-center gap-5 px-6 py-5">

          {/* Number */}
          <div>
            <span className="font-mono text-sm font-bold text-[#A2AAB5] group-hover:text-[#E8A33D] group-hover:scale-110 transition-all duration-300 inline-block">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          {/* Photo */}
          <div className="relative">
            <div className="w-[72px] h-[72px] overflow-hidden bg-[#E5E8EC] rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300">
              {student.profileImageUrl ? (
                <img
                  src={student.profileImageUrl}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div
                  className={`w-full h-full ${getAvatarColor(
                    student.firstName,
                    student.lastName
                  )} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
                >
                  <span className="text-xl font-bold text-white">
                    {initials}
                  </span>
                </div>
              )}
            </div>

            <div className="absolute -right-1 -bottom-1 bg-white rounded-full shadow-sm">
              {student.isActive ? (
                <CheckCircle className="w-5 h-5 text-[#2F9E78]" />
              ) : (
                <XCircle className="w-5 h-5 text-[#D95C5C]" />
              )}
            </div>
          </div>

          {/* Name */}
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[#14213D] truncate group-hover:text-[#1A365D] transition-colors duration-300">
              {student.firstName} {student.lastName}
            </h3>

            <p className="text-sm text-[#657286] mt-1 truncate group-hover:text-[#354258] transition-colors duration-300">
              {student.generalCourse || 'Student'}
            </p>

            {student.techCenter && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-[#8A94A3] group-hover:text-[#657286] transition-colors duration-300">
                <MapPin className="w-3.5 h-3.5" />
                {student.techCenter.name}
              </div>
            )}
          </div>

          {/* Programme */}
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#929CAA] font-bold mb-1">
              Programme
            </p>

            <p className="text-sm text-[#354258] font-medium truncate">
              {student.generalCourse || 'Not specified'}
            </p>
          </div>

          {/* Academic */}
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#929CAA] font-bold mb-1">
              Academic
            </p>

            <p className="text-sm text-[#354258] truncate">
              {student.studentCourses?.length || 0} courses
            </p>

            <p className="text-xs text-[#8A94A3] truncate">
              {getTotalCredits(student)} credits
            </p>
          </div>

          {/* Profile */}
          <div className="flex justify-end">
            <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] font-bold text-[#657286] group-hover:text-[#E8A33D] group-hover:translate-x-1 transition-all duration-300">
              Profile
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* ====================================================
            TABLET
        ==================================================== */}

        <div className="hidden sm:flex lg:hidden items-center gap-5 px-5 py-5 group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:to-[#FAFBFC] transition-all duration-300">

          <span className="font-mono text-xs font-bold text-[#A2AAB5] w-7 group-hover:text-[#E8A33D] transition-colors duration-300">
            {String(index + 1).padStart(2, '0')}
          </span>

          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 overflow-hidden bg-[#E5E8EC] rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300">
              {student.profileImageUrl ? (
                <img
                  src={student.profileImageUrl}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div
                  className={`w-full h-full ${getAvatarColor(
                    student.firstName,
                    student.lastName
                  )} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
                >
                  <span className="text-lg font-bold text-white">
                    {initials}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#14213D] truncate group-hover:text-[#1A365D] transition-colors duration-300">
              {student.firstName} {student.lastName}
            </h3>

            <p className="text-sm text-[#657286] truncate group-hover:text-[#354258] transition-colors duration-300">
              {student.generalCourse || 'Student'}
            </p>

            <p className="text-xs text-[#8A94A3] truncate mt-1 group-hover:text-[#657286] transition-colors duration-300">
              {student.techCenter?.name || 'No tech center'}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-[#8A94A3] group-hover:text-[#657286] transition-colors duration-300">
              {student.studentCourses?.length || 0} courses
            </p>

            <p className="text-xs text-[#8A94A3] group-hover:text-[#657286] transition-colors duration-300">
              {getTotalCredits(student)} credits
            </p>
          </div>

          <ChevronRight className="w-5 h-5 text-[#9AA3AF] group-hover:text-[#E8A33D] group-hover:translate-x-1 transition-all duration-300" />
        </div>

        {/* ====================================================
            MOBILE STUDENT BILLBOARD
        ==================================================== */}

        <div className="sm:hidden px-4 py-5 group-hover:bg-gradient-to-b group-hover:from-transparent group-hover:to-[#FAFBFC] transition-all duration-300">

          {/* Number + identity */}
          <div className="flex items-start gap-4">

            <div className="pt-1">
              <span className="font-mono text-xs font-bold text-[#E8A33D]">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            <div className="relative flex-shrink-0">
              <div className="w-[68px] h-[68px] overflow-hidden bg-[#E5E8EC] rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300">
                {student.profileImageUrl ? (
                  <img
                    src={student.profileImageUrl}
                    alt={`${student.firstName} ${student.lastName}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div
                    className={`w-full h-full ${getAvatarColor(
                      student.firstName,
                      student.lastName
                    )} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
                  >
                    <span className="text-lg font-bold text-white">
                      {initials}
                    </span>
                  </div>
                )}
              </div>

              <div className="absolute -right-1 -bottom-1 bg-white rounded-full shadow-sm">
                {student.isActive ? (
                  <CheckCircle className="w-5 h-5 text-[#2F9E78]" />
                ) : (
                  <XCircle className="w-5 h-5 text-[#D95C5C]" />
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">

              {/* FULL NAME — NEVER HIDDEN */}
              <h3 className="text-lg font-bold leading-tight text-[#14213D] break-words group-hover:text-[#1A365D] transition-colors duration-300">
                {student.firstName} {student.lastName}
              </h3>

              <p className="text-sm text-[#657286] mt-1 break-words group-hover:text-[#354258] transition-colors duration-300">
                {student.generalCourse || 'Student'}
              </p>

              {student.techCenter && (
                <div className="flex items-start gap-1.5 mt-2 text-xs text-[#8A94A3] group-hover:text-[#657286] transition-colors duration-300">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />

                  <span className="break-words">
                    {student.techCenter.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Information divider */}
          <div className="my-5 h-px bg-gradient-to-r from-transparent via-[#E1E5EA] to-transparent" />

          {/* Information grid */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">

            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#929CAA]">
                Programme
              </p>

              <p className="text-sm font-medium text-[#354258] mt-1 break-words">
                {student.generalCourse || 'Not specified'}
              </p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#929CAA]">
                Status
              </p>

              <div className="flex items-center gap-1.5 mt-1">
                {student.isActive ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-[#2F9E78]" />
                    <span className="text-sm text-[#2F9E78]">
                      Active
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-[#D95C5C]" />
                    <span className="text-sm text-[#D95C5C]">
                      Inactive
                    </span>
                  </>
                )}
              </div>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#929CAA]">
                Courses
              </p>

              <p className="text-sm font-medium text-[#354258] mt-1">
                {student.studentCourses?.length || 0}
              </p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#929CAA]">
                Credits
              </p>

              <p className="text-sm font-medium text-[#354258] mt-1">
                {getTotalCredits(student)}
              </p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#929CAA]">
                Religion
              </p>

              <p className="text-sm font-medium mt-1">
                {student.takesReligion === null ? (
                  <span className="text-[#8993A2]">
                    Not specified
                  </span>
                ) : student.takesReligion ? (
                  <span className="text-[#2F9E78]">
                    Yes
                  </span>
                ) : (
                  <span className="text-[#D95C5C]">
                    No
                  </span>
                )}
              </p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#929CAA]">
                Country
              </p>

              <p className="text-sm font-medium text-[#354258] mt-1 break-words">
                {student.techCenter?.country?.name ||
                  'Not specified'}
              </p>
            </div>
          </div>

          {/* Courses */}
          {student.studentCourses &&
            student.studentCourses.length > 0 && (
              <>
                <div className="my-5 h-px bg-gradient-to-r from-transparent via-[#E1E5EA] to-transparent" />

                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-[#E8A33D]" />

                  <span className="text-xs uppercase tracking-[0.12em] font-bold text-[#657286]">
                    Enrolled Courses
                  </span>
                </div>

                <div className="space-y-2">
                  {student.studentCourses.map(
                    (course) => (
                      <div
                        key={course.id}
                        className="border border-[#E1E5EA] bg-gradient-to-br from-[#F8F9FA] to-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#E8A33D]">
                              {course.code}
                            </p>

                            <p className="text-sm font-medium text-[#354258] mt-0.5 break-words">
                              {course.courseUnit}
                            </p>
                          </div>

                          <span className="text-[10px] text-[#8993A2] whitespace-nowrap bg-[#1A365D]/5 px-2 py-1 rounded-full">
                            {course.credits} credits
                          </span>
                        </div>

                        {course.status && (
                          <span className="inline-block mt-2 text-[10px] uppercase tracking-[0.1em] text-[#8993A2] bg-[#E8A33D]/10 px-2 py-1 rounded-full">
                            {course.status}
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </>
            )}

          {/* Profile button */}
          <button
            onClick={(e) => {
              e.stopPropagation();

              router.push(
                `/dashboard/students/${student.id}`
              );
            }}
            className="
              w-full
              mt-5
              px-4
              py-3
              bg-gradient-to-r
              from-[#1A365D]
              to-[#244A78]
              text-white
              text-xs
              uppercase
              tracking-[0.14em]
              font-bold
              flex
              items-center
              justify-between
              hover:from-[#15304F]
              hover:to-[#1F3F6D]
              hover:shadow-lg
              transition-all
              duration-300
              rounded-lg
            "
          >
            <span>View Student Profile</span>

            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </article>
    );
  };

  /*
   * ============================================================
   * STUDENT SECTION
   * ============================================================
   */

  const StudentSection = ({
    title,
    students,
  }: {
    title: string;
    students: Student[];
  }) => {
    if (students.length === 0) return null;

    return (
      <section className="mb-10">

        {/* Section heading */}
        <div className="flex items-end justify-between gap-4 mb-5">

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-[3px] bg-gradient-to-r from-[#E8A33D] to-[#1A365D]" />

              <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#8A94A3]">
                Student Board
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-[#14213D] tracking-tight">
              {title}
            </h2>
          </div>

          <div className="px-4 py-2 bg-[#1A365D]/5 rounded-lg border border-[#1A365D]/10">
            <span className="text-xs md:text-sm font-bold text-[#1A365D]">
              {students.length} students
            </span>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:grid grid-cols-[55px_90px_minmax(280px,1fr)_180px_140px_130px] gap-5 px-6 py-4 bg-gradient-to-r from-[#1A365D] to-[#244A78] text-white shadow-md">
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-bold">
            No.
          </span>

          <span className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-bold">
            Photo
          </span>

          <span className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-bold">
            Student
          </span>

          <span className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-bold">
            Programme
          </span>

          <span className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-bold">
            Academic
          </span>

          <span className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-bold text-right">
            Profile
          </span>
        </div>

        <div className="border-2 border-[#D8DDE4] rounded-lg overflow-hidden shadow-lg">
          {students.map((student, index) => (
            <StudentDisplay
              key={student.id}
              student={student}
              index={index}
            />
          ))}
        </div>
      </section>
    );
  };

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F6F8] via-[#F0F2F5] to-[#E8EBF0]">

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">

        {/* ======================================================
            NAVIGATION
        ====================================================== */}

        <div className="flex items-center justify-between mb-8">

          <div className="flex items-center gap-2">

            <button
              onClick={() => router.back()}
              className="p-2.5 bg-white border-2 border-[#D8DDE4] text-[#596678] hover:text-[#14213D] hover:border-[#E8A33D] hover:shadow-md transition-all duration-200 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="p-2.5 bg-white border-2 border-[#D8DDE4] text-[#596678] hover:text-[#14213D] hover:border-[#E8A33D] hover:shadow-md transition-all duration-200 rounded-lg"
            >
              <Home className="w-5 h-5" />
            </button>

          </div>

          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#D8DDE4] rounded-lg shadow-sm">
            <GraduationCap className="w-4 h-4 text-[#E8A33D]" />
            <span className="text-xs uppercase tracking-[0.18em] text-[#8993A2] font-bold">
              Student Community
            </span>
          </div>
        </div>

        {/* ======================================================
            MOBILE SEARCH (Fixed)
        ====================================================== */}

        <div className="sm:hidden fixed top-0 left-0 right-0 z-50 py-3 px-4 bg-[#F5F6F8]/95 backdrop-blur-md border-b border-[#D8DDE4]/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A94A3]" />

            <input
              type="text"
              placeholder="Search student name, email, course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full
                pl-12
                pr-12
                py-3
                bg-white
                border-2
                border-[#D3D9E1]
                text-[#14213D]
                placeholder-[#929CAA]
                focus:outline-none
                focus:border-[#E8A33D]
                focus:ring-4
                focus:ring-[#E8A33D]/10
                shadow-sm
                transition-all
                duration-200
              "
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8993A2] hover:text-[#14213D] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Spacer for fixed mobile search */}
        <div className="h-16 sm:hidden" />

        {/* ======================================================
            BILLBOARD HEADER
        ====================================================== */}

        <header className="relative py-10 md:py-14 mb-8 overflow-hidden">

          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A365D]/5 via-transparent to-[#E8A33D]/5" />

          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#1A365D] via-[#E8A33D] to-[#1A365D]" />

          <div className="relative max-w-7xl mx-auto px-4 md:px-6">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">

              <div className="flex-1">

                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-[#E8A33D]/10 rounded-lg">
                    <Users className="w-5 h-5 text-[#E8A33D]" />
                  </div>

                  <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#7B8797]">
                    University Community
                  </span>
                </div>

                <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-[-0.06em] leading-[0.8] text-transparent bg-clip-text bg-gradient-to-br from-[#14213D] via-[#1A365D] to-[#14213D]">
                  STUDENTS
                </h1>

                <p className="max-w-xl mt-6 text-base md:text-lg text-[#667386] leading-relaxed font-medium">
                  Explore the students learning and growing
                  across our university community.
                </p>
              </div>

              <div className="md:text-right flex-shrink-0">

                <div className="inline-block p-6 bg-white border-2 border-[#1A365D] shadow-xl rounded-lg">

                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#8A94A3] mb-2">
                    Community
                  </p>

                  <p className="text-5xl md:text-6xl font-black text-[#1A365D] leading-none">
                    {totalStudents}
                  </p>

                  <p className="text-sm text-[#7B8797] mt-2 font-medium">
                    registered students
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-10">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D8DDE4] to-transparent" />

              <div className="flex items-center gap-2">
                <span className="text-[#E8A33D] text-lg">◆</span>
                <span className="text-[#E8A33D] text-sm">◆</span>
                <span className="text-[#E8A33D] text-lg">◆</span>
              </div>

              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D8DDE4] to-transparent" />
            </div>
          </div>
        </header>

        {/* ======================================================
            DESKTOP STICKY SEARCH
        ====================================================== */}

        <div className="hidden sm:block sticky top-0 z-50 mb-4 py-4 bg-[#F5F6F8] border-b border-[#D8DDE4]/50 backdrop-blur-md">

          <div className="relative">

            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A94A3]" />

            <input
              type="text"
              placeholder="Search student name, email, course or course unit..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="
                w-full
                pl-12
                pr-12
                py-4
                bg-white
                border-2
                border-[#D3D9E1]
                text-[#14213D]
                placeholder-[#929CAA]
                focus:outline-none
                focus:border-[#E8A33D]
                focus:ring-4
                focus:ring-[#E8A33D]/10
                shadow-sm
                transition-all
                duration-200
              "
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8993A2] hover:text-[#14213D] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ======================================================
            FILTERS
        ====================================================== */}

        <div className="mb-8">

          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-[#E8A33D]/10 rounded-md">
              <Filter className="w-4 h-4 text-[#E8A33D]" />
            </div>

            <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#667386]">
              Directory Filters
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            <select
              value={selectedTechCenter}
              onChange={(e) =>
                setSelectedTechCenter(e.target.value)
              }
              className="px-4 py-3 bg-white border-2 border-[#D3D9E1] text-[#354258] focus:outline-none focus:border-[#E8A33D] focus:ring-2 focus:ring-[#E8A33D]/10 rounded-lg shadow-sm transition-all duration-200"
            >
              <option value="all">
                All Tech Centers
              </option>

              {techCenters.map(
                (techCenter: TechCenter) => (
                  <option
                    key={techCenter.id}
                    value={techCenter.id}
                  >
                    {techCenter.name} (
                    {techCenter.country?.name})
                  </option>
                )
              )}
            </select>

            <select
              value={courseFilter}
              onChange={(e) =>
                setCourseFilter(e.target.value)
              }
              className="px-4 py-3 bg-white border-2 border-[#D3D9E1] text-[#354258] focus:outline-none focus:border-[#E8A33D] focus:ring-2 focus:ring-[#E8A33D]/10 rounded-lg shadow-sm transition-all duration-200"
            >
              <option value="all">
                All Students
              </option>

              <option value="withCourses">
                With Courses
              </option>

              <option value="withoutCourses">
                Without Courses
              </option>
            </select>

            <select
              value={religionFilter}
              onChange={(e) =>
                setReligionFilter(e.target.value)
              }
              className="px-4 py-3 bg-white border-2 border-[#D3D9E1] text-[#354258] focus:outline-none focus:border-[#E8A33D] focus:ring-2 focus:ring-[#E8A33D]/10 rounded-lg shadow-sm transition-all duration-200"
            >
              <option value="all">
                All Religion Status
              </option>

              <option value="takesReligion">
                Takes Religion
              </option>

              <option value="noReligion">
                No Religion
              </option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-4 px-2">

            <p className="text-xs text-[#7B8797]">
              Showing{' '}
              <strong className="text-[#354258]">
                {totalStudents}
              </strong>{' '}
              students
            </p>

            {hasActiveFilters && (
              <button
                onClick={clearFilter}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#1A365D] hover:text-[#E8A33D] transition-colors duration-200"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ======================================================
            NO STUDENTS
        ====================================================== */}

        {!hasStudents && (
          <div className="bg-white border-2 border-[#D8DDE4] rounded-lg py-16 text-center shadow-lg">
            <div className="w-16 h-16 bg-[#E8A33D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-[#E8A33D]" />
            </div>

            <p className="text-[#667386] font-medium">
              No students found.
            </p>
          </div>
        )}

        {/* ======================================================
            NORMAL VIEW
        ====================================================== */}

        {hasStudents &&
          !hasActiveFilters && (
            <>
              {Object.entries(
                studentsByTechCenter
              ).map(
                ([techCenterName, students]) => {

                  const filteredStudents =
                    filterStudents(
                      students as Student[]
                    );

                  if (
                    filteredStudents.length === 0
                  ) {
                    return null;
                  }

                  return (
                    <StudentSection
                      key={techCenterName}
                      title={techCenterName}
                      students={filteredStudents}
                    />
                  );
                }
              )}
            </>
          )}

        {/* ======================================================
            FILTERED VIEW
        ====================================================== */}

        {hasStudents &&
          hasActiveFilters && (
            <>
              {(() => {
                const filteredStudents =
                  filterStudents(allStudents);

                if (
                  filteredStudents.length === 0
                ) {
                  return (
                    <div className="bg-gradient-to-br from-white to-[#F8F9FA] border-2 border-[#D8DDE4] py-16 text-center rounded-lg shadow-xl">

                      <div className="w-16 h-16 bg-[#E8A33D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-[#E8A33D]" />
                      </div>

                      <h2 className="font-bold text-[#354258] text-lg">
                        No matching students
                      </h2>

                      <p className="text-sm text-[#7B8797] mt-2">
                        Try changing your search or filters.
                      </p>

                      <button
                        onClick={clearFilter}
                        className="mt-5 px-5 py-2.5 bg-gradient-to-r from-[#1A365D] to-[#244A78] text-white text-sm font-semibold hover:from-[#15304F] hover:to-[#1F3F6D] hover:shadow-lg transition-all duration-300 rounded-lg"
                      >
                        Clear Filters
                      </button>
                    </div>
                  );
                }

                return (
                  <StudentSection
                    title="Filtered Results"
                    students={filteredStudents}
                  />
                );
              })()}
            </>
          )}

        {/* ======================================================
            FOOTER
        ====================================================== */}

        {hasStudents && (
          <div className="border-t-2 border-[#D8DDE4] pt-6 mt-4 flex flex-col sm:flex-row justify-between gap-3">

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#E8A33D]/10 rounded-md">
                <GraduationCap className="w-4 h-4 text-[#E8A33D]" />
              </div>

              <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#7B8797]">
                Student Community Directory
              </span>
            </div>

            <div className="px-4 py-2 bg-[#1A365D]/5 rounded-lg border border-[#1A365D]/10">
              <span className="text-xs font-bold text-[#1A365D]">
                {totalStudents} students
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}