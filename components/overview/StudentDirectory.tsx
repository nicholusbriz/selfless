'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Hash, Eye, MessageSquare, Search, Filter, CheckCircle, XCircle, BookOpen, Award } from 'lucide-react';
import UserAvatar from '@/components/shared/UserAvatar';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId?: string;
  gpa?: number;
  role?: string;
  profileImageUrl?: string;
  assignedTutor?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  } | null;
  enrolledCourses?: Array<{
    id?: string;
    name?: string;
    code?: string;
    subject?: string;
    [key: string]: any;
  }>;
  takesReligion?: boolean;
  totalCredits?: number;
}

interface StudentDirectoryProps {
  students: Student[];
  currentUserId?: string;
}

export default function StudentDirectory({ students, currentUserId }: StudentDirectoryProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const firstName = student.firstName || '';
      const lastName = student.lastName || '';
      const studentId = student.studentId || '';
      
      const matchesSearch = 
        firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studentId.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [students, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <motion.div
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-purple-500/30 transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Student Header */}
            <div className="flex items-start gap-3 mb-3">
              {/* Avatar */}
              <UserAvatar user={student} size="md" />
              
              {/* Name and Role */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm truncate">
                  {student.firstName} {student.lastName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {student.studentId || 'N/A'}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                    {student.role || 'Student'}
                  </span>
                </div>
              </div>
            </div>

            {/* Courses and Religion Status */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <BookOpen className="w-3 h-3" />
                <span>{student.enrolledCourses?.length || 0} courses enrolled</span>
              </div>
              {student.enrolledCourses && student.enrolledCourses.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {student.enrolledCourses.map((course, idx) => {
                    const courseName = course?.courseName || course?.name || course?.code || course?.subject || 'Course';
                    return (
                      <span
                        key={course?.id || courseName || idx}
                        className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs"
                      >
                        {courseName}
                      </span>
                    );
                  })}
                </div>
              )}
              {student.takesReligion !== undefined && (
                <div className={`flex items-center gap-1 text-xs ${
                  student.takesReligion ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {student.takesReligion ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  <span>{student.takesReligion ? 'Taking Religion' : 'Not taking Religion'}</span>
                </div>
              )}
              {student.totalCredits !== undefined && (
                <div className="flex items-center gap-1 text-xs text-blue-400">
                  <Award className="w-3 h-3" />
                  <span>{student.totalCredits} credits</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/dashboard/profile?id=${student.id}&from=students`)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 text-xs font-medium transition-colors"
              >
                <Eye className="w-3 h-3 hidden sm:block" />
                <span>View Profile</span>
              </button>
              <button
                onClick={() => router.push('/dashboard/overview?tab=messages')}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 text-xs font-medium transition-colors"
              >
                <MessageSquare className="w-3 h-3 hidden sm:block" />
                <span>Message</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No students found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
        </motion.div>
      )}
    </div>
  );
}
