'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, LayoutGrid, List, BookOpen, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  enrolledCourses: {
    id: string;
    courseName: string;
    credits: number;
    status: string;
  }[];
}

interface StudentCoursesTabProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function StudentCoursesTab({ searchTerm, onSearchChange }: StudentCoursesTabProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: studentsData, isLoading, error, refetch } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await fetch('/api/admin/students');
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      return data.students || [];
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const students = studentsData || [];

  const filteredStudents = useMemo(() => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return students.filter((student: Student) =>
        student.name.toLowerCase().includes(search) ||
        student.studentId.toLowerCase().includes(search) ||
        student.enrolledCourses?.some((course: any) =>
          course.courseName.toLowerCase().includes(search)
        )
      );
    }
    return students;
  }, [students, searchTerm]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 animate-pulse"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="h-5 bg-white/10 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-2">
                    <div className="h-3 bg-white/10 rounded w-full mb-1"></div>
                    <div className="h-2 bg-white/10 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Error loading students</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and View Mode Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search students or courses..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex bg-white/5 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-gray-400 text-sm">
        Showing {filteredStudents.length} of {students.length} students
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student: Student, index: number) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              {/* Student Info */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <h3 className="text-base font-bold text-white truncate">{student.name}</h3>
                  </div>
                  <p className="text-purple-300 text-xs">ID: {student.studentId}</p>
                </div>
              </div>

              {/* Courses List */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-3 h-3 text-blue-400" />
                  <p className="text-gray-400 text-xs font-medium">
                    Courses ({student.enrolledCourses?.length || 0})
                  </p>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {student.enrolledCourses?.map((course: any) => (
                    <div key={course.id} className="bg-white/5 rounded-lg p-2 border border-white/5">
                      <p className="text-white text-xs font-medium break-words">{course.courseName}</p>
                      <p className="text-gray-400 text-xs">{course.credits} credits</p>
                    </div>
                  ))}
                  {(!student.enrolledCourses || student.enrolledCourses.length === 0) && (
                    <p className="text-gray-500 text-xs text-center py-2">No courses enrolled</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Courses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((student: Student, index: number) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-white font-medium text-sm">{student.name}</p>
                      <p className="text-gray-500 text-xs">{student.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-400 text-sm">{student.studentId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {student.enrolledCourses?.slice(0, 3).map((course: any) => (
                          <span
                            key={course.id}
                            className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full truncate max-w-[150px]"
                            title={course.courseName}
                          >
                            {course.courseName}
                          </span>
                        ))}
                        {student.enrolledCourses?.length > 3 && (
                          <span className="text-gray-400 text-xs">+{student.enrolledCourses.length - 3}</span>
                        )}
                        {(!student.enrolledCourses || student.enrolledCourses.length === 0) && (
                          <span className="text-gray-500 text-xs">None</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No students found matching "{searchTerm}"</p>
        </motion.div>
      )}
    </div>
  );
}