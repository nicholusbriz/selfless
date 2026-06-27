'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, LayoutGrid, List, BookOpen, User, GraduationCap, AlertTriangle, Clock, DollarSign, GraduationCap as GraduationCapIcon } from 'lucide-react';
import UserAvatar from '@/components/shared/UserAvatar';

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  takesReligion?: boolean;
  enrolledCourses: {
    id: string;
    courseName: string;
    credits: number;
    status: string;
  }[];
  tutor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    teacherId?: string;
    department?: string;
  } | null;
  hasTutor?: boolean;
}

interface StudentCoursesTabProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  students: Student[];
  currentUserId?: string; // Optional - for filtering current student
}

export default function StudentCoursesTab({ 
  searchTerm, 
  onSearchChange, 
  students,
  currentUserId
}: StudentCoursesTabProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter to show current student only (for student role)
  const displayStudents = useMemo(() => {
    if (currentUserId) {
      return students.filter(s => s.id === currentUserId);
    }
    return students;
  }, [students, currentUserId]);

  const filteredStudents = useMemo(() => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return displayStudents.filter((student: Student) =>
        student.name.toLowerCase().includes(search) ||
        student.studentId.toLowerCase().includes(search) ||
        student.enrolledCourses?.some((course: any) =>
          course.courseName.toLowerCase().includes(search)
        )
      );
    }
    return displayStudents;
  }, [displayStudents, searchTerm]);

  if (!displayStudents || displayStudents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No courses found</p>
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
            placeholder="Search your courses..."
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
        Showing {filteredStudents.length} of {displayStudents.length} student
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student: Student, index: number) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              {/* Student Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <UserAvatar user={{ firstName: student.name.split(' ')[0], lastName: student.name.split(' ').slice(1).join(' ') }} size="sm" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white truncate">{student.name}</h3>
                    <p className="text-purple-300 text-xs">ID: {student.studentId}</p>
                    {/* Tutor Assignment */}
                    <div className="mt-1">
                      {student.tutor ? (
                        <p className="text-green-400 text-xs">
                          Tutor: {student.tutor.firstName} {student.tutor.lastName}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-xs">No tutor assigned</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* ✅ Display Religion Status (Read-only) */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  student.takesReligion
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  <GraduationCap className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    {student.takesReligion ? 'Religion' : 'No Religion'}
                  </span>
                </div>
              </div>

              {/* Courses List */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-3 h-3 text-blue-400" />
                  <p className="text-gray-400 text-xs font-medium">
                    Your Courses ({student.enrolledCourses?.length || 0})
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Tutor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Religion</th>
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
                      {student.tutor ? (
                        <span className="text-green-400 text-sm">
                          {student.tutor.firstName} {student.tutor.lastName}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Not assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                        student.takesReligion
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        <GraduationCap className="w-3 h-3" />
                        <span className="text-xs font-medium">
                          {student.takesReligion ? 'Takes Religion' : 'No Religion'}
                        </span>
                      </div>
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

      {filteredStudents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No courses found matching "{searchTerm}"</p>
        </motion.div>
      )}
    </div>
  );
}