'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  X,
  Users,
  GraduationCap,
  Hash,
  AlertCircle,
  Search,
  Eye,
  MessageSquare,
  Edit,
  Calendar,
  TrendingUp,
  MoreVertical
} from 'lucide-react';
import UserAvatar from '@/components/shared/UserAvatar';
import { useWebSocketEvent } from '@/hooks/useWebSocket';
import { useQueryClient } from '@tanstack/react-query';

interface Teacher {
  id: string;
  name: string;
  email: string;
  role?: string;
  teacherId?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'pending';
  lastActivity?: Date;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId?: string;
  gpa?: number;
  role?: string;
}

interface Assignment {
  id: string;
  teacherId: string;
  studentId: string;
  status: string;
  teacher?: Teacher;
  student?: Student;
}

interface EnhancedTutorAssignmentsProps {
  assignments: Assignment[];
  teachers: Teacher[];
  currentUserId: string;
  currentUserRole: string;
}

export default function EnhancedTutorAssignments({
  assignments,
  teachers,
  currentUserId,
  currentUserRole
}: EnhancedTutorAssignmentsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expandedTutors, setExpandedTutors] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Listen for assignment updates via WebSocket
  useWebSocketEvent('assignment:updated', (updatedAssignment) => {
    // Invalidate relevant queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
    queryClient.invalidateQueries({ queryKey: ['all-teachers'] });
  });

  // Group assignments by teacher using the teachers prop
  const tutorGroups = useMemo(() => {
    const groups: { [key: string]: {
      teacher: Teacher;
      students: Student[];
      studentCount: number;
      averageGPA: number;
    }} = {};

    // Initialize groups with all teachers (even those without assignments)
    (teachers || []).forEach(teacher => {
      groups[teacher.id] = {
        teacher,
        students: [],
        studentCount: 0,
        averageGPA: 0
      };
    });

    // Add assignments to their respective teacher groups
    assignments.forEach(assignment => {
      const teacher = assignment.teacher;
      if (!teacher) return;

      const teacherKey = teacher.id;
      if (!groups[teacherKey]) {
        groups[teacherKey] = {
          teacher,
          students: [],
          studentCount: 0,
          averageGPA: 0
        };
      }

      if (assignment.student) {
        groups[teacherKey].students.push(assignment.student);
        groups[teacherKey].studentCount++;
      }
    });

    // Calculate average GPA per tutor
    Object.keys(groups).forEach(teacherKey => {
      const group = groups[teacherKey];
      const totalGPA = group.students.reduce((sum, s) => sum + (s.gpa || 0), 0);
      group.averageGPA = group.studentCount > 0 ? totalGPA / group.studentCount : 0;
    });

    return groups;
  }, [assignments, teachers]);

  // Filter tutor groups based on search query
  const filteredTutorGroups = useMemo(() => {
    if (!searchQuery.trim()) return tutorGroups;

    const query = searchQuery.toLowerCase().trim();
    const filtered: { [key: string]: any } = {};

    Object.entries(tutorGroups).forEach(([teacherId, group]) => {
      // Check if teacher name matches
      if (group.teacher.name.toLowerCase().includes(query)) {
        filtered[teacherId] = group;
        return;
      }

      // Check if any student matches
      const matchingStudents = group.students.filter(student => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        return fullName.includes(query) ||
               student.email?.toLowerCase().includes(query) ||
               student.studentId?.toLowerCase().includes(query);
      });

      if (matchingStudents.length > 0) {
        filtered[teacherId] = {
          ...group,
          students: matchingStudents,
          studentCount: matchingStudents.length
        };
      }
    });

    return filtered;
  }, [tutorGroups, searchQuery]);

  // Auto-expand tutor cards when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const matchingTutorIds = Object.keys(filteredTutorGroups);
      setExpandedTutors(new Set(matchingTutorIds));
    } else {
      setExpandedTutors(new Set());
    }
  }, [searchQuery, filteredTutorGroups]);

  const toggleTutor = (teacherId: string) => {
    const newExpanded = new Set(expandedTutors);
    if (newExpanded.has(teacherId)) {
      newExpanded.delete(teacherId);
    } else {
   
      newExpanded.add(teacherId);
    }
    setExpandedTutors(newExpanded);
  };

  const expandAll = () => {
    setExpandedTutors(new Set(Object.keys(tutorGroups)));
  };

  const collapseAll = () => {
    setExpandedTutors(new Set());
  };

  const tutorArray = Object.entries(filteredTutorGroups);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 w-full"
    >
      {/* Header with Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">👨‍🏫 Tutor Management</h2>
            <p className="text-gray-400 text-sm">View all tutors and their assigned students</p>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0 self-start sm:self-auto">
          <button
            onClick={expandAll}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg border border-purple-500/20"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Search Bar with Filter - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
            aria-label="Search students"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {tutorArray.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg rounded-xl p-8 text-center border border-white/10"
        >
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchQuery ? 'No Results Found' : 'No Tutor Assignments'}
          </h3>
          <p className="text-gray-400">
            {searchQuery 
              ? `No students or tutors matching "${searchQuery}"`
              : 'No tutors have been assigned to students yet.'}
          </p>
        </motion.div>
      )}

      {/* Tutor List */}
      <div className="space-y-3 w-full">
        {tutorArray.map(([teacherId, group], index) => {
          const isExpanded = expandedTutors.has(teacherId);
          const isCurrentUser = teacherId === currentUserId;

          return (
            <motion.div
              key={teacherId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/5 backdrop-blur-lg rounded-xl border ${
                isCurrentUser ? 'border-purple-500/30' : 'border-white/10'
              } overflow-hidden`}
            >
              {/* Tutor Header - Mobile Optimized */}
              <div
                onClick={() => toggleTutor(teacherId)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTutor(teacherId);
                  }
                }}
                className="p-3 sm:p-4 w-full cursor-pointer"
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-controls={`tutor-${teacherId}-students`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <UserAvatar user={{ firstName: group.teacher.name.split(' ')[0], lastName: group.teacher.name.split(' ').slice(1).join(' ') }} size="md" />
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-white truncate">
                          {group.teacher.name}
                        </h3>
                        {/* Status Badge */}
                        {group.teacher.status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                            group.teacher.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : group.teacher.status === 'inactive'
                              ? 'bg-gray-500/20 text-gray-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {group.teacher.status.charAt(0).toUpperCase() + group.teacher.status.slice(1)}
                          </span>
                        )}
                        {group.teacher.role && (
                          <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                            group.teacher.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {group.teacher.role === 'admin' ? 'Admin' : 'Teacher'}
                          </span>
                        )}
                        {isCurrentUser && (
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full flex-shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 mt-1">
                        <p className="text-gray-400 text-xs sm:text-sm truncate">
                          {group.teacher.department || 'Assigned to'}
                        </p>
                        {/* Student Count with Color Coding */}
                        <span className={`text-xs font-medium ${
                          group.studentCount > 0 ? 'text-green-400' : 'text-gray-500'
                        }`}>
                          {group.studentCount} students
                        </span>
                        {/* Last Activity */}
                        {group.teacher.lastActivity && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(group.teacher.lastActivity).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        {isExpanded ? 'Click to hide students' : 'Click to view all students assigned to this tutor'}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  {/* Quick Action Buttons - Mobile Optimized */}
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/dashboard/overview?tab=messages');
                      }}
                      className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 text-xs font-medium transition-colors min-h-[36px]"
                      aria-label="Message tutor"
                    >
                      Message
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/profile?id=${teacherId}`);
                      }}
                      className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 text-xs font-medium transition-colors min-h-[36px]"
                      aria-label="View tutor profile"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Students List (Expanded) with Progress Bar - Mobile Optimized */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/10 p-3 sm:p-4"
                  id={`tutor-${teacherId}-students`}
                  role="region"
                  aria-label={`${group.teacher.name}'s students`}
                >
                  {/* Workload Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Workload Progress</span>
                      <span>{group.studentCount} students assigned</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((group.studentCount / 20) * 100, 100)}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${
                          group.studentCount > 15
                            ? 'bg-red-500'
                            : group.studentCount > 10
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {group.students.map((student: Student, studentIndex: number) => {
                      // Check if student matches search query
                      const isMatch = searchQuery.trim() && (
                        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
                      );

                      return (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: studentIndex * 0.05 }}
                          className={`p-3 rounded-lg border ${
                            isMatch 
                              ? 'bg-purple-500/20 border-purple-500/50 ring-1 ring-purple-500/30' 
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <UserAvatar user={student} size="sm" />
                              <div className="min-w-0 flex-1">
                                <p className="text-white font-medium text-sm">
                                  {student.firstName} {student.lastName}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-400 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Hash className="w-3 h-3" />
                                    {student.studentId || 'N/A'}
                                  </span>
                                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                                    {student.role || 'Student'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => router.push(`/dashboard/profile?id=${student.id}&from=overview`)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 text-xs font-medium transition-colors min-h-[36px]"
                                aria-label={`View ${student.firstName} ${student.lastName}'s profile`}
                              >
                                View Profile
                              </button>
                              <button
                                onClick={() => router.push('/dashboard/overview?tab=messages')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 text-xs font-medium transition-colors min-h-[36px]"
                                aria-label={`Message ${student.firstName} ${student.lastName}`}
                              >
                                Message
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-6 w-full">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-3 sm:p-4">
          <p className="text-gray-400 text-xs sm:text-sm">
            {searchQuery ? 'Matching Tutors' : 'Total Tutors/Admins'}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white">{tutorArray.length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-3 sm:p-4">
          <p className="text-gray-400 text-xs sm:text-sm">
            {searchQuery ? 'Matching Students' : 'Total Students Assigned'}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-purple-400">
            {tutorArray.reduce((sum, [, group]) => sum + group.studentCount, 0)}
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-3 sm:p-4">
          <p className="text-gray-400 text-xs sm:text-sm">Your Students</p>
          <p className="text-xl sm:text-2xl font-bold text-green-400">
            {tutorArray.find(([id]) => id === currentUserId)?.[1].studentCount || 0}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
