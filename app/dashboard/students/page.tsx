'use client';

import { useState } from 'react';
import { ArrowLeft, Home, Users, MapPin, User, Search, CheckCircle, XCircle, Filter, X, BookOpen } from 'lucide-react';
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
  const [selectedTechCenter, setSelectedTechCenter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all'); // all, withCourses, withoutCourses
  const [religionFilter, setReligionFilter] = useState<string>('all'); // all, takesReligion, noReligion

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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (firstName: string, lastName: string) => {
    const colors = [
      'from-[#3A3448] to-[#2A2438]',
      'from-[#4A4458] to-[#3A3448]',
      'from-[#5A5468] to-[#4A4458]',
    ];
    const hash = firstName.charCodeAt(0) + lastName.charCodeAt(0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getTotalCredits = (student: Student) => {
    if (!student.studentCourses || student.studentCourses.length === 0) {
      return 0;
    }
    return student.studentCourses.reduce((total, course) => total + (course.credits || 0), 0);
  };

  const filterStudents = (students: Student[]) => {
    let filtered = students;

    if (selectedTechCenter !== 'all') {
      filtered = filtered.filter(
        (student) => student.techCenter?.id === selectedTechCenter
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.firstName.toLowerCase().includes(query) ||
          student.lastName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          // Search by course codes
          student.studentCourses?.some((course) => 
            course.code.toLowerCase().includes(query) ||
            course.courseUnit.toLowerCase().includes(query)
          ) ||
          // Search by general course
          (student.generalCourse && student.generalCourse.toLowerCase().includes(query))
      );
    }

    // Course filter
    if (courseFilter === 'withCourses') {
      filtered = filtered.filter(
        (student) => student.studentCourses && student.studentCourses.length > 0
      );
    } else if (courseFilter === 'withoutCourses') {
      filtered = filtered.filter(
        (student) => !student.studentCourses || student.studentCourses.length === 0
      );
    }

    // Religion filter
    if (religionFilter === 'takesReligion') {
      filtered = filtered.filter(
        (student) => student.takesReligion === true
      );
    } else if (religionFilter === 'noReligion') {
      filtered = filtered.filter(
        (student) => student.takesReligion === false
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

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#2A2438]/50 animate-pulse" />
          <div className="h-8 w-px bg-[#2A2438]" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2A2438]/50 animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-[#2A2438]/50 rounded animate-pulse" />
              <div className="h-4 w-48 bg-[#2A2438]/30 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="h-12 bg-[#0B0912] border border-[#2A2438] rounded-xl animate-pulse" />
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#2A2438]/50 rounded animate-pulse" />
            <div className="flex-1 h-12 bg-[#0B0912] border border-[#2A2438] rounded-xl animate-pulse" />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-12 bg-[#0B0912] border border-[#2A2438] rounded-xl animate-pulse" />
          <div className="h-12 bg-[#0B0912] border border-[#2A2438] rounded-xl animate-pulse" />
        </div>

        <div className="mb-6 flex items-center gap-2">
          <div className="w-4 h-4 bg-[#2A2438]/50 rounded animate-pulse" />
          <div className="h-4 w-32 bg-[#2A2438]/30 rounded animate-pulse" />
        </div>

        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#2A2438]/50 animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-[#2A2438]/50 rounded animate-pulse" />
                <div className="h-4 w-24 bg-[#2A2438]/30 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="bg-[#150F20] border border-[#2A2438] rounded-xl p-4">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-[#2A2438]/50 animate-pulse" />
                    <div className="flex-grow space-y-2">
                      <div className="h-4 w-32 bg-[#2A2438]/50 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-[#2A2438]/30 rounded animate-pulse" />
                      <div className="h-3 w-28 bg-[#2A2438]/30 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 bg-[#2A2438]/30 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-[#2A2438]/30 rounded animate-pulse" />
                    <div className="h-10 bg-[#2A2438]/50 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#FB7185]/10 border border-[#FB7185]/20 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-[#FB7185]" />
          </div>
          <p className="text-[#FB7185] font-medium mb-2">Failed to load students</p>
          <p className="text-[#A79C8C] text-sm">{error instanceof Error ? error.message : 'Please try again later'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[#2A2438] text-[#F5F0E8] rounded-lg hover:bg-[#3A3448] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get all students as a flat array for filtering
  const allStudents = Object.values(studentsByTechCenter).flat() as Student[];

  // Check if there are any students
  const hasStudents = allStudents.length > 0;

  // Student Card Component
  const StudentCard = ({ student }: { student: Student }) => (
    <div
      onClick={() => router.push(`/dashboard/students/${student.id}`)}
      className="bg-[#0B0912] border border-[#2A2438] rounded-xl p-4 cursor-pointer hover:border-[#3A3448] transition-all duration-300 hover:shadow-xl hover:shadow-[#2A2438]/20"
    >
      {/* ===== TOP SECTION: Avatar + User Info ===== */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar with Status Badge */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#2A2438]">
            {student.profileImageUrl ? (
              <img
                src={student.profileImageUrl}
                alt={`${student.firstName} ${student.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor(student.firstName, student.lastName)} flex items-center justify-center`}>
                <span className="text-xl font-bold text-[#F5F0E8]">
                  {getInitials(student.firstName, student.lastName)}
                </span>
              </div>
            )}
          </div>
          {/* Status Badge Overlay */}
          <div className="absolute -top-1 -right-1">
            {student.isActive ? (
              <div className="w-5 h-5 rounded-full bg-[#2FA88A]/20 border-2 border-[#2FA88A] flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-[#2FA88A]" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#FB7185]/20 border-2 border-[#FB7185] flex items-center justify-center">
                <XCircle className="w-3 h-3 text-[#FB7185]" />
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#F5F0E8] text-base leading-tight">
            {student.firstName} {student.lastName}
          </h3>
          {student.techCenter && (
            <p className="text-sm text-[#A79C8C] truncate">{student.techCenter.name}</p>
          )}
          {student.generalCourse && (
            <p className="text-sm text-[#6B6358] truncate">{student.generalCourse}</p>
          )}
        </div>
      </div>

      {/* ===== COURSES SECTION ===== */}
      {student.studentCourses && student.studentCourses.length > 0 ? (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#E8A33D]" />
              <span className="text-sm font-medium text-[#F5F0E8]">
                Courses ({student.studentCourses.length})
              </span>
            </div>
            <span className="text-xs text-[#6B6358]">
              Total: {getTotalCredits(student)} credits
            </span>
          </div>

          {/* Course List - Each course on its own line */}
          <div className="space-y-2">
            {student.studentCourses.map((course) => (
              <div
                key={course.id}
                className="bg-[#150F20] border border-[#2A2438] rounded-lg p-3"
              >
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-sm font-medium text-[#E8A33D]">
                    {course.code}
                  </span>
                  <span className="text-xs text-[#6B6358]">·</span>
                  <span className="text-sm text-[#F5F0E8] break-words flex-1 min-w-[120px]">
                    {course.courseUnit}
                  </span>
                  <span className="text-xs text-[#6B6358] ml-auto flex-shrink-0">
                    {course.credits} credits
                  </span>
                </div>
                {/* Course status/tier if available */}
                {course.status && (
                  <div className="mt-1">
                    <span className="text-xs px-2 py-0.5 bg-[#2A2438] rounded-full text-[#A79C8C]">
                      {course.status}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-[#150F20] border border-[#2A2438] rounded-lg text-center">
          <p className="text-sm text-[#6B6358]">No courses enrolled</p>
        </div>
      )}

      {/* ===== STATS SECTION ===== */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {student.takesReligion !== null && (
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-[#6B6358]">⛪ Religion:</span>
            <span className={student.takesReligion ? 'text-[#2FA88A]' : 'text-[#FB7185]'}>
              {student.takesReligion ? 'Yes' : 'No'}
            </span>
          </div>
        )}
        {student.techCenter && (
          <div className="flex items-center gap-1.5 text-sm text-[#6B6358]">
            <MapPin className="w-4 h-4" />
            <span>{student.techCenter.country?.name}</span>
          </div>
        )}
      </div>

      {/* ===== ACTION BUTTON ===== */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/dashboard/students/${student.id}`);
        }}
        className="w-full px-4 py-2.5 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
      >
        View Profile
      </button>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `linear-gradient(45deg, transparent 48%, white 48%, white 52%, transparent 52%), linear-gradient(-45deg, transparent 48%, white 48%, white 52%, transparent 52%)`,
        backgroundSize: '60px 60px'
      }} />
      
      {/* Header with navigation */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
          aria-label="Go to dashboard"
        >
          <Home className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-[#2A2438]" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#E8A33D]/20 to-[#C97F1F]/10 border border-[#E8A33D]/20">
            <Users className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              Students
            </h1>
            <p className="text-sm text-[#A79C8C]">View all students by tech center</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative z-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B6358]" />
          <input
            type="text"
            placeholder="Search students by name, email, course code, or course unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:border-[#3A3448] transition-all duration-200"
          />
        </div>
      </div>

      {/* Tech Center Filter */}
      <div className="mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-[#6B6358]" />
          <select
            value={selectedTechCenter}
            onChange={(e) => setSelectedTechCenter(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-xl text-[#F5F0E8] focus:outline-none focus:border-[#3A3448] transition-all duration-200 cursor-pointer"
          >
            <option value="all">All Tech Centers</option>
            {techCenters.map((techCenter: TechCenter) => (
              <option key={techCenter.id} value={techCenter.id}>
                {techCenter.name} ({techCenter.country?.name})
              </option>
            ))}
          </select>
          {(selectedTechCenter !== 'all' || courseFilter !== 'all' || religionFilter !== 'all' || searchQuery) && (
            <button
              onClick={clearFilter}
              className="p-2 rounded-lg bg-[#2A2438] hover:bg-[#3A3448] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
              title="Clear all filters"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Course and Religion Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-[#6B6358]" />
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-xl text-[#F5F0E8] focus:outline-none focus:border-[#3A3448] transition-all duration-200 cursor-pointer"
          >
            <option value="all">All Students</option>
            <option value="withCourses">With Courses</option>
            <option value="withoutCourses">Without Courses</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-[#6B6358]" />
          <select
            value={religionFilter}
            onChange={(e) => setReligionFilter(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-xl text-[#F5F0E8] focus:outline-none focus:border-[#3A3448] transition-all duration-200 cursor-pointer"
          >
            <option value="all">All Religion Status</option>
            <option value="takesReligion">Takes Religion</option>
            <option value="noReligion">No Religion</option>
          </select>
        </div>
      </div>

      {/* Total Students Count */}
      <div className="mb-6 flex items-center gap-2 text-[#A79C8C] relative z-10">
        <Users className="w-4 h-4" />
        <span className="text-sm">Total Students: {totalStudents}</span>
      </div>

      {/* No Students */}
      {!hasStudents && (
        <div className="bg-[#0B0912] border border-[#2A2438] rounded-xl p-8 text-center relative z-10">
          <User className="w-12 h-12 text-[#6B6358] mx-auto mb-4" />
          <p className="text-[#A79C8C]">No students found.</p>
        </div>
      )}

      {/* Students by Tech Center (when no filters are active) */}
      {hasStudents && selectedTechCenter === 'all' && courseFilter === 'all' && religionFilter === 'all' && !searchQuery && (
        <>
          {Object.entries(studentsByTechCenter).map(([techCenterName, students]) => {
            const filteredStudents = filterStudents(students as Student[]);
            if (filteredStudents.length === 0) return null;

            return (
              <div key={techCenterName} className="mb-8 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[#2A2438]">
                    <MapPin className="w-5 h-5 text-[#A79C8C]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#F5F0E8]">{techCenterName}</h2>
                    <p className="text-sm text-[#A79C8C]">{filteredStudents.length} students</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <StudentCard key={student.id} student={student} />
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Filtered View (when any filter is active) */}
      {hasStudents && (selectedTechCenter !== 'all' || courseFilter !== 'all' || religionFilter !== 'all' || searchQuery) && (
        <>
          {(() => {
            const filteredStudents = filterStudents(allStudents);
            
            if (filteredStudents.length === 0) {
              return (
                <div className="bg-[#0B0912] border border-[#2A2438] rounded-xl p-8 text-center relative z-10">
                  <User className="w-12 h-12 text-[#6B6358] mx-auto mb-4" />
                  <p className="text-[#A79C8C]">No students found matching your filters.</p>
                  <button
                    onClick={clearFilter}
                    className="mt-4 px-4 py-2 bg-[#2A2438] text-[#F5F0E8] rounded-lg hover:bg-[#3A3448] transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              );
            }

            return (
              <div className="mb-8 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[#2A2438]">
                    <MapPin className="w-5 h-5 text-[#A79C8C]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#F5F0E8]">Filtered Results</h2>
                    <p className="text-sm text-[#A79C8C]">{filteredStudents.length} students found</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <StudentCard key={student.id} student={student} />
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}