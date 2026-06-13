'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, BookOpen, CheckCircle, XCircle, Award, GraduationCap, LayoutGrid, List } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  roleId: string;
  role: {
    id: string;
    name: string;
  };
  currentGPA: number;
  totalCredits: number;
  coursesCount: number;
  tuition: number | null;
  tuitionPaid: boolean;
  enrolledCourses: {
    id: string;
    courseName: string;
    credits: number;
    status: string;
  }[];
  grades: any[];
}

type TabType = 'students' | 'courses' | 'analytics';

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch students using TanStack Query
  const { data: studentsData, isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await fetch('/api/admin/students');
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      return data.students || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const students = studentsData || [];

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (searchTerm) {
      return students.filter((student: Student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return students;
  }, [students, searchTerm]);

  // Auto-switch to students tab when searching
  useEffect(() => {
    if (searchTerm && activeTab !== 'students') {
      setActiveTab('students');
    }
  }, [searchTerm, activeTab]);

  // Get all unique courses
  const allCourses = useMemo(() => {
    const courseMap = new Map<string, { name: string; credits: number; students: number }>();
    
    students.forEach((student: Student) => {
      student.enrolledCourses?.forEach((course: any) => {
        const existing = courseMap.get(course.courseName);
        if (existing) {
          existing.students++;
        } else {
          courseMap.set(course.courseName, {
            name: course.courseName,
            credits: course.credits,
            students: 1
          });
        }
      });
    });
    
    return Array.from(courseMap.values());
  }, [students]);

  const totalStudents = students.length;
  const totalCourses = students.reduce((sum: number, student: Student) => 
    sum + (student.enrolledCourses?.length || 0), 0
  );
  const totalCredits = students.reduce((sum: number, student: Student) => 
    sum + (student.totalCredits || 0), 0
  );
  const religionStudents = students.filter((student: Student) => 
    student.enrolledCourses?.some((course: any) => 
      course.courseName.toLowerCase().includes('religion') || 
      course.courseName.toLowerCase().includes('rel')
    )
  ).length;

  if (isLoading) {
    return (
      <div className="px-4 py-4 md:px-6 md:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="h-5 bg-white/10 rounded animate-pulse mb-2 w-3/4"></div>
                    <div className="h-3 bg-white/10 rounded animate-pulse w-1/2"></div>
                  </div>
                  <div className="h-6 bg-white/10 rounded-full animate-pulse w-16 ml-2 flex-shrink-0"></div>
                </div>
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-2 border border-white/5">
                      <div className="h-3 bg-white/10 rounded animate-pulse w-full mb-1"></div>
                      <div className="h-2 bg-white/10 rounded animate-pulse w-1/3"></div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="h-3 bg-white/10 rounded animate-pulse w-16"></div>
                  <div className="h-4 bg-white/10 rounded animate-pulse w-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Error loading data</p>
          <p className="text-gray-400 text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Fixed Header */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 md:px-6 md:py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Academic Dashboard</h1>
              <p className="text-gray-400 text-xs md:text-sm">Freedom City Tech Center</p>
            </div>
            
            {/* Statistics */}
            <div className="flex gap-2 md:gap-4 overflow-x-auto pb-1 md:pb-0">
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-semibold text-sm">{totalStudents}</span>
                  <span className="text-gray-400 text-xs hidden sm:inline">Students</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-semibold text-sm">{totalCourses}</span>
                  <span className="text-gray-400 text-xs hidden sm:inline">Courses</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-400" />
                  <span className="text-white font-semibold text-sm">{totalCredits}</span>
                  <span className="text-gray-400 text-xs hidden sm:inline">Credits</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={() => setActiveTab('students')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
                  activeTab === 'students'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
                  activeTab === 'courses'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
                  activeTab === 'analytics'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Analytics
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* View Mode Toggle */}
              {activeTab === 'students' && (
                <div className="flex bg-white/5 rounded-lg p-1 flex-shrink-0">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'students' && (
              <motion.div
                key="students"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredStudents.map((student: Student) => (
                      <motion.div
                        key={student.id}
                        className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-bold text-white mb-1 truncate">{student.name}</h3>
                            <p className="text-purple-300 text-xs">ID: {student.studentId}</p>
                          </div>
                          <div className="bg-purple-500/20 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                            <span className="text-purple-300 text-xs font-semibold">{student.totalCredits} cr</span>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {student.enrolledCourses?.slice(0, 5).map((course: any) => (
                            <div key={course.id} className="bg-white/5 rounded-lg p-2 border border-white/5">
                              <p className="text-white text-xs font-medium truncate">{course.courseName}</p>
                              <p className="text-gray-400 text-xs">{course.credits} cr</p>
                            </div>
                          ))}
                          {student.enrolledCourses?.length > 5 && (
                            <p className="text-gray-400 text-xs text-center">+{student.enrolledCourses.length - 5} more</p>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                          <span className="text-gray-400 text-xs">GPA: {student.currentGPA.toFixed(2)}</span>
                          {student.enrolledCourses?.some((course: any) => 
                            course.courseName.toLowerCase().includes('religion')
                          ) ? (
                            <div className="flex items-center gap-1 text-green-400 text-xs">
                              <CheckCircle className="w-3 h-3" />
                              <span className="hidden sm:inline">Religion</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-400 text-xs">
                              <XCircle className="w-3 h-3" />
                              <span className="hidden sm:inline">No Religion</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Student</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Credits</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">GPA</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Courses</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Religion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredStudents.map((student: Student) => (
                          <tr key={student.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <p className="text-white font-medium text-sm truncate max-w-[150px]">{student.name}</p>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-sm">{student.studentId}</td>
                            <td className="px-4 py-3 text-white text-sm">{student.totalCredits}</td>
                            <td className="px-4 py-3 text-white text-sm">{student.currentGPA.toFixed(2)}</td>
                            <td className="px-4 py-3 text-gray-400 text-sm">{student.enrolledCourses?.length || 0}</td>
                            <td className="px-4 py-3">
                              {student.enrolledCourses?.some((course: any) => 
                                course.courseName.toLowerCase().includes('religion')
                              ) ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {filteredStudents.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No students found matching "{searchTerm}"</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'courses' && (
              <motion.div
                key="courses"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allCourses.map((course, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-bold text-white mb-1 truncate">{course.name}</h3>
                          <p className="text-purple-300 text-xs">{course.credits} Credits</p>
                        </div>
                        <div className="bg-blue-500/20 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                          <span className="text-blue-300 text-xs font-semibold">{course.students}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/10">
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-400 mb-2 md:mb-3" />
                    <p className="text-2xl md:text-3xl font-bold text-white">{totalStudents}</p>
                    <p className="text-gray-400 text-xs md:text-sm">Total Students</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/10">
                    <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-blue-400 mb-2 md:mb-3" />
                    <p className="text-2xl md:text-3xl font-bold text-white">{totalCourses}</p>
                    <p className="text-gray-400 text-xs md:text-sm">Total Enrollments</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/10">
                    <Award className="w-6 h-6 md:w-8 md:h-8 text-green-400 mb-2 md:mb-3" />
                    <p className="text-2xl md:text-3xl font-bold text-white">{totalCredits}</p>
                    <p className="text-gray-400 text-xs md:text-sm">Total Credits</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/10">
                    <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-orange-400 mb-2 md:mb-3" />
                    <p className="text-2xl md:text-3xl font-bold text-white">{religionStudents}</p>
                    <p className="text-gray-400 text-xs md:text-sm">Religion Students</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
