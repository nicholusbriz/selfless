'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Home, DollarSign, Users, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, Loader2, BookOpen, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isActive: boolean;
  createdAt: string;
  tuitionAmount?: number;
  generalCourse?: string;
  techCenter?: {
    id: string;
    name: string;
    code: string;
  };
  _count?: {
    submittedCourses: number;
  };
  submittedCourses?: Array<{
    id: string;
    name: string;
    code: string;
    courseUnit: string;
    credits: number;
    status: string;
  }>;
}

export default function TuitionPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, statusFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tech-centers/users?role=student');
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      setStudents(data.users || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.firstName.toLowerCase().includes(term) ||
          student.lastName.toLowerCase().includes(term) ||
          student.email.toLowerCase().includes(term)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((student) => student.status === statusFilter);
    }

    setFilteredStudents(filtered);
  };

  const totalTuition = filteredStudents.reduce((sum, student) => sum + (student.tuitionAmount || 0), 0);

  const calculateTotalCredits = (student: Student) => {
    return student.submittedCourses?.reduce((sum, course) => sum + (course.credits || 0), 0) || 0;
  };

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
          onClick={() => router.push('/')}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
          aria-label="Go home"
        >
          <Home className="w-5 h-5" />
        </button>
        
        <div className="h-8 w-px bg-[#2A2438]" />
        
        <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
          Tuition Management
        </h1>
      </div>

      {/* Stats Card */}
      <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-[#E8A33D]/10 border border-[#E8A33D]/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-[#E8A33D]" />
          </div>
          <span className="text-[#A79C8C] text-sm">Total Tuition</span>
        </div>
        <p className="text-2xl font-bold text-[#F5F0E8]">
          ${totalTuition.toLocaleString()}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A79C8C]" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#2A2438]/30 border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#A79C8C] focus:outline-none focus:border-[#E8A33D]/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#A79C8C]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#2A2438]/30 border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D]/50"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#E8A33D]/10 border border-[#E8A33D]/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#F5F0E8]">
              Students Tuition
            </h2>
            <p className="text-[#A79C8C] text-sm">
              Manage student tuition payments
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#E8A33D] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-[#A79C8C] mx-auto mb-4 opacity-50" />
            <p className="text-[#A79C8C]">No students found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => {
              const totalCredits = calculateTotalCredits(student);
              const courseCount = student.submittedCourses?.length || 0;

              return (
                <div
                  key={student.id}
                  className="bg-[#2A2438]/30 border border-[#2A2438] rounded-xl p-5 hover:border-[#E8A33D]/30 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E8A33D]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#E8A33D] font-semibold text-sm">
                          {student.firstName[0]}{student.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#F5F0E8] text-sm">
                          {student.firstName} {student.lastName}
                        </h3>
                        <div className="flex items-center gap-1 text-xs">
                          {student.isActive ? (
                            <span className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 bg-[#E8A33D]/10 border border-[#E8A33D]/20 rounded-lg">
                      <span className="text-[#E8A33D] font-semibold text-sm">
                        ${student.tuitionAmount?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-[#150F20] rounded-lg p-2 text-center">
                      <p className="text-[#A79C8C] text-xs">Courses</p>
                      <p className="text-[#F5F0E8] font-semibold">{courseCount}</p>
                    </div>
                    <div className="bg-[#150F20] rounded-lg p-2 text-center">
                      <p className="text-[#A79C8C] text-xs">Credits</p>
                      <p className="text-[#F5F0E8] font-semibold">{totalCredits}</p>
                    </div>
                  </div>

                  {/* Courses List */}
                  {student.submittedCourses && student.submittedCourses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[#A79C8C] text-xs font-medium">Enrolled Courses:</p>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {student.submittedCourses.map((course) => (
                          <div
                            key={course.id}
                            className="flex items-center justify-between bg-[#150F20] rounded-lg px-2 py-1.5"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-[#F5F0E8] text-xs font-medium truncate">
                                {course.code}
                              </p>
                              <p className="text-[#A79C8C] text-xs truncate">
                                {course.courseUnit}
                              </p>
                            </div>
                            <div className="ml-2 px-2 py-0.5 bg-[#E8A33D]/10 border border-[#E8A33D]/20 rounded">
                              <span className="text-[#E8A33D] text-xs font-medium">
                                {course.credits} cr
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="mt-4 pt-3 border-t border-[#2A2438] space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-[#A79C8C]">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    {student.phoneNumber && (
                      <div className="flex items-center gap-2 text-[#A79C8C]">
                        <Phone className="w-3 h-3" />
                        <span>{student.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
