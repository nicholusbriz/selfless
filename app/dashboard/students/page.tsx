'use client';

import { useState } from 'react';
import { ArrowLeft, Home, Users, MapPin, User, Search, CheckCircle, XCircle, Filter, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string | null;
  techCenter: {
    id: string;
    name: string;
    country: {
      name: string;
    };
  } | null;
  generalCourse: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
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
      'from-[#E8A33D] to-[#C97F1F]',
      'from-[#14B8A6] to-[#0D9488]',
      'from-[#FB7185] to-[#E11D48]',
      'from-[#6366F1] to-[#4F46E5]',
      'from-[#34D399] to-[#059669]',
    ];
    const hash = firstName.charCodeAt(0) + lastName.charCodeAt(0);
    return colors[Math.abs(hash) % colors.length];
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
          student.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const clearFilter = () => {
    setSelectedTechCenter('all');
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
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#2A2438]/50 animate-pulse" />
                    <div className="flex-grow space-y-2">
                      <div className="h-4 w-32 bg-[#2A2438]/50 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-[#2A2438]/30 rounded animate-pulse" />
                    </div>
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

  return (
    <div className="min-h-screen">
      {/* Header with navigation */}
      <div className="flex items-center gap-4 mb-8">
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
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B6358]" />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:border-[#E8A33D] transition-all duration-200"
          />
        </div>
      </div>

      {/* Tech Center Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-[#6B6358]" />
          <select
            value={selectedTechCenter}
            onChange={(e) => setSelectedTechCenter(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-xl text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] transition-all duration-200 cursor-pointer"
          >
            <option value="all">All Tech Centers</option>
            {techCenters.map((techCenter: TechCenter) => (
              <option key={techCenter.id} value={techCenter.id}>
                {techCenter.name} ({techCenter.country?.name})
              </option>
            ))}
          </select>
          {selectedTechCenter !== 'all' && (
            <button
              onClick={clearFilter}
              className="p-2 rounded-lg bg-[#2A2438] hover:bg-[#3A3448] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
              title="Clear filter"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Total Students Count */}
      <div className="mb-6 flex items-center gap-2 text-[#A79C8C]">
        <Users className="w-4 h-4" />
        <span className="text-sm">Total Students: {totalStudents}</span>
      </div>

      {/* No Students */}
      {!hasStudents && (
        <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-8 text-center">
          <User className="w-12 h-12 text-[#6B6358] mx-auto mb-4" />
          <p className="text-[#A79C8C]">No students found.</p>
        </div>
      )}

      {/* Students by Tech Center */}
      {hasStudents && selectedTechCenter === 'all' && (
        <>
          {Object.entries(studentsByTechCenter).map(([techCenterName, students]) => {
            const filteredStudents = filterStudents(students as Student[]);
            if (filteredStudents.length === 0) return null;

            return (
              <div key={techCenterName} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[#2A2438]">
                    <MapPin className="w-5 h-5 text-[#E8A33D]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#F5F0E8]">{techCenterName}</h2>
                    <p className="text-sm text-[#A79C8C]">{filteredStudents.length} students</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => router.push(`/dashboard/students/${student.id}`)}
                      className="relative bg-gradient-to-br from-[#150F20] to-[#0F0A1A] border border-[#2A2438] rounded-2xl overflow-hidden hover:border-[#E8A33D]/50 cursor-pointer transition-all duration-300 group hover:shadow-xl hover:shadow-[#E8A33D]/10 hover:-translate-y-1"
                    >
                      <div className="h-16 bg-gradient-to-r from-[#E8A33D]/20 to-[#14B8A6]/20 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#150F20]" />
                      </div>

                      <div className="relative -mt-8 px-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-[#0F0A1A] shadow-xl group-hover:shadow-[#E8A33D]/20 transition-all duration-300">
                          {student.profileImageUrl ? (
                            <img
                              src={student.profileImageUrl}
                              alt={`${student.firstName} ${student.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor(student.firstName, student.lastName)} flex items-center justify-center`}>
                              <span className="text-xl font-bold text-[#0B0912]">
                                {getInitials(student.firstName, student.lastName)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-4 pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#F5F0E8] text-lg truncate group-hover:text-[#E8A33D] transition-colors">
                              {student.firstName} {student.lastName}
                            </h3>
                            {student.techCenter && (
                              <p className="text-xs text-[#A79C8C] truncate">{student.techCenter.name}</p>
                            )}
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            {student.isActive ? (
                              <div className="w-6 h-6 rounded-full bg-[#2FA88A]/20 border border-[#2FA88A] flex items-center justify-center">
                                <CheckCircle className="w-3.5 h-3.5 text-[#2FA88A]" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[#FB7185]/20 border border-[#FB7185] flex items-center justify-center">
                                <XCircle className="w-3.5 h-3.5 text-[#FB7185]" />
                              </div>
                            )}
                          </div>
                        </div>

                        {student.generalCourse && (
                          <div className="mb-3 p-2 bg-[#2A2438]/50 rounded-lg">
                            <p className="text-[10px] text-[#6B6358] uppercase tracking-wider mb-1">Course</p>
                            <p className="text-sm text-[#A79C8C] truncate font-medium">{student.generalCourse}</p>
                          </div>
                        )}

                        {student.techCenter && (
                          <div className="flex items-center gap-2 text-xs text-[#6B6358] mb-3">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{student.techCenter.country?.name}</span>
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-[#2A2438]">
                          <div className="flex items-center gap-2 text-xs text-[#E8A33D]">
                            <User className="w-3.5 h-3.5" />
                            <span className="font-medium">Click to view student full profile</span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#E8A33D]/10 to-transparent rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Filtered Tech Center View */}
      {hasStudents && selectedTechCenter !== 'all' && (
        <>
          {(() => {
            const filteredStudents = filterStudents(allStudents);
            
            if (filteredStudents.length === 0) {
              return (
                <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-8 text-center">
                  <User className="w-12 h-12 text-[#6B6358] mx-auto mb-4" />
                  <p className="text-[#A79C8C]">No students found in this tech center.</p>
                </div>
              );
            }

            const techCenterName = filteredStudents[0]?.techCenter?.name || 'Tech Center';

            return (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[#2A2438]">
                    <MapPin className="w-5 h-5 text-[#E8A33D]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#F5F0E8]">{techCenterName}</h2>
                    <p className="text-sm text-[#A79C8C]">{filteredStudents.length} students</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => router.push(`/dashboard/students/${student.id}`)}
                      className="relative bg-gradient-to-br from-[#150F20] to-[#0F0A1A] border border-[#2A2438] rounded-2xl overflow-hidden hover:border-[#E8A33D]/50 cursor-pointer transition-all duration-300 group hover:shadow-xl hover:shadow-[#E8A33D]/10 hover:-translate-y-1"
                    >
                      <div className="h-16 bg-gradient-to-r from-[#E8A33D]/20 to-[#14B8A6]/20 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#150F20]" />
                      </div>

                      <div className="relative -mt-8 px-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-[#0F0A1A] shadow-xl group-hover:shadow-[#E8A33D]/20 transition-all duration-300">
                          {student.profileImageUrl ? (
                            <img
                              src={student.profileImageUrl}
                              alt={`${student.firstName} ${student.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor(student.firstName, student.lastName)} flex items-center justify-center`}>
                              <span className="text-xl font-bold text-[#0B0912]">
                                {getInitials(student.firstName, student.lastName)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-4 pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#F5F0E8] text-lg truncate group-hover:text-[#E8A33D] transition-colors">
                              {student.firstName} {student.lastName}
                            </h3>
                            {student.techCenter && (
                              <p className="text-xs text-[#A79C8C] truncate">{student.techCenter.name}</p>
                            )}
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            {student.isActive ? (
                              <div className="w-6 h-6 rounded-full bg-[#2FA88A]/20 border border-[#2FA88A] flex items-center justify-center">
                                <CheckCircle className="w-3.5 h-3.5 text-[#2FA88A]" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[#FB7185]/20 border border-[#FB7185] flex items-center justify-center">
                                <XCircle className="w-3.5 h-3.5 text-[#FB7185]" />
                              </div>
                            )}
                          </div>
                        </div>

                        {student.generalCourse && (
                          <div className="mb-3 p-2 bg-[#2A2438]/50 rounded-lg">
                            <p className="text-[10px] text-[#6B6358] uppercase tracking-wider mb-1">Course</p>
                            <p className="text-sm text-[#A79C8C] truncate font-medium">{student.generalCourse}</p>
                          </div>
                        )}

                        {student.techCenter && (
                          <div className="flex items-center gap-2 text-xs text-[#6B6358] mb-3">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{student.techCenter.country?.name}</span>
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-[#2A2438]">
                          <div className="flex items-center gap-2 text-xs text-[#E8A33D]">
                            <User className="w-3.5 h-3.5" />
                            <span className="font-medium">Click to view student full profile</span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#E8A33D]/10 to-transparent rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* No Results */}
      {hasStudents && searchQuery && allStudents.filter(s => 
        s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
      ).length === 0 && (
        <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-8 text-center">
          <User className="w-12 h-12 text-[#6B6358] mx-auto mb-4" />
          <p className="text-[#A79C8C]">No students found matching your search.</p>
        </div>
      )}
    </div>
  );
}