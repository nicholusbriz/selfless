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
  profileImageUrl?: string;
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
    profileImageUrl?: string;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student: Student, index: number) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
              className="group relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 overflow-hidden"
              whileHover={{ y: -4, scale: 1.02 }}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Decorative glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              {/* Student Header */}
              <div className="relative flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-50" />
                    <UserAvatar user={{ firstName: student.name.split(' ')[0], lastName: student.name.split(' ').slice(1).join(' '), profileImageUrl: student.profileImageUrl }} size="sm" />
                    {!student.profileImageUrl && (
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] px-1.5 py-0.5 rounded-full whitespace-nowrap font-bold shadow-lg">
                        Update
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white truncate group-hover:text-purple-300 transition-colors">{student.name}</h3>
                    <p className="text-purple-400/80 text-xs font-medium">ID: {student.studentId}</p>
                    {!student.profileImageUrl && (
                      <p className="text-gray-400 text-[9px] mt-1 italic">Update your avatar on your profile page</p>
                    )}
                    {/* Tutor Assignment */}
                    <div className="mt-2 flex items-center gap-1.5">
                      {student.tutor ? (
                        <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          <p className="text-green-400 text-xs font-medium">
                            {student.tutor.firstName} {student.tutor.lastName}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-gray-500/10 px-2 py-1 rounded-full border border-gray-500/20">
                          <p className="text-gray-400 text-xs font-medium">No tutor assigned</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* ✅ Display Religion Status (Read-only) */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border backdrop-blur-sm ${
                  student.takesReligion
                    ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
                    : 'bg-gray-500/20 border-gray-500/30 text-gray-400'
                }`}>
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">
                    {student.takesReligion ? 'Religion' : 'No Religion'}
                  </span>
                </div>
              </div>

              {/* Courses List */}
              <div className="relative space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-white text-sm font-semibold">Your Courses</p>
                    <span className="text-blue-400 text-xs font-bold bg-blue-500/20 px-2 py-0.5 rounded-full">{student.enrolledCourses?.length || 0}</span>
                  </div>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {student.enrolledCourses?.map((course: any, idx: number) => (
                    <motion.div 
                      key={course.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      className="group/course bg-gradient-to-r from-white/5 to-transparent hover:from-white/10 rounded-xl p-3 border border-white/5 hover:border-purple-500/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold break-words group-hover/course:text-purple-300 transition-colors">{course.courseName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                              <div className="w-1 h-1 bg-purple-400 rounded-full" />
                              <span>{course.credits} credits</span>
                            </div>
                            <span className="text-gray-500 text-[10px]">•</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              course.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              course.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {course.status}
                            </span>
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-purple-500/30 rounded-full group-hover/course:bg-purple-500 transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                  {(!student.enrolledCourses || student.enrolledCourses.length === 0) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-4 border-2 border-dashed border-white/10 rounded-xl"
                    >
                      <BookOpen className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-50" />
                      <p className="text-gray-500 text-xs font-medium">No courses enrolled yet</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">Student</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">ID</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">Tutor</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">Religion</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">Courses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((student: Student, index: number) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="hover:bg-white/5 transition-all duration-300 group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm opacity-30" />
                          <UserAvatar user={{ firstName: student.name.split(' ')[0], lastName: student.name.split(' ').slice(1).join(' '), profileImageUrl: student.profileImageUrl }} size="sm" />
                          {!student.profileImageUrl && (
                            <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[6px] px-1 py-0.5 rounded-full whitespace-nowrap font-bold">
                              Update
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors">{student.name}</p>
                          <p className="text-gray-500 text-xs">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                        <div className="w-1 h-1 bg-purple-400 rounded-full" />
                        <span className="text-purple-300 text-xs font-medium">{student.studentId}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {student.tutor ? (
                        <div className="flex items-center gap-1.5 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-green-400 text-xs font-medium">
                            {student.tutor.firstName} {student.tutor.lastName}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-gray-500/10 px-2.5 py-1 rounded-lg border border-gray-500/20">
                          <span className="text-gray-500 text-xs font-medium">Not assigned</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border backdrop-blur-sm ${
                        student.takesReligion
                          ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
                          : 'bg-gray-500/20 border-gray-500/30 text-gray-400'
                      }`}>
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">
                          {student.takesReligion ? 'Takes Religion' : 'No Religion'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {student.enrolledCourses?.slice(0, 3).map((course: any) => (
                          <motion.span
                            key={course.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 text-xs px-2.5 py-1 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-colors truncate max-w-[150px]"
                            title={course.courseName}
                          >
                            {course.courseName}
                          </motion.span>
                        ))}
                        {student.enrolledCourses?.length > 3 && (
                          <span className="bg-white/10 text-gray-400 text-xs px-2.5 py-1 rounded-lg font-medium">+{student.enrolledCourses.length - 3}</span>
                        )}
                        {(!student.enrolledCourses || student.enrolledCourses.length === 0) && (
                          <span className="text-gray-500 text-xs italic">None</span>
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