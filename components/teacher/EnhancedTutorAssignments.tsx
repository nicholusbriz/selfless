'use client';

import { useState, useMemo, useEffect } from 'react';
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
  Search
} from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  role?: string;
  teacherId?: string;
  department?: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId?: string;
  gpa?: number;
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
  onStatusChange?: (assignmentId: string, status: string) => void;
}

export default function EnhancedTutorAssignments({
  assignments,
  teachers,
  currentUserId,
  currentUserRole,
  onStatusChange
}: EnhancedTutorAssignmentsProps) {
  const [expandedTutors, setExpandedTutors] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Group assignments by teacher using the teachers prop
  const tutorGroups = useMemo(() => {
    const groups: { [key: string]: {
      teacher: Teacher;
      students: Student[];
      studentCount: number;
      verifiedCount: number;
      averageGPA: number;
    }} = {};

    // Initialize groups with all teachers (even those without assignments)
    (teachers || []).forEach(teacher => {
      groups[teacher.id] = {
        teacher,
        students: [],
        studentCount: 0,
        verifiedCount: 0,
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
          verifiedCount: 0,
          averageGPA: 0
        };
      }

      if (assignment.student) {
        groups[teacherKey].students.push(assignment.student);
        groups[teacherKey].studentCount++;
        if (assignment.status === 'verified') {
          groups[teacherKey].verifiedCount++;
        }
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

  // Check if assignment belongs to current user
  const isAssignmentOwned = (assignment: Assignment) => {
    return assignment.teacherId === currentUserId;
  };

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
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Tutor Assignments</h2>
            <p className="text-gray-400 text-sm">View all tutors and their assigned students</p>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={expandAll}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors px-2 py-1"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search students by name, email, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
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
      <div className="space-y-3">
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
              {/* Tutor Header */}
              <button
                onClick={() => toggleTutor(teacherId)}
                className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isCurrentUser ? 'bg-purple-500/20' : 'bg-white/10'
                  }`}>
                    <User className={`w-5 h-5 sm:w-6 sm:h-6 ${isCurrentUser ? 'text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                      <span className="truncate">{group.teacher.name}</span>
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
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">
                      {group.teacher.department || 'No Department'} • {group.studentCount} students
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-lg font-bold text-white">{group.averageGPA.toFixed(2)}</p>
                    <p className="text-gray-400 text-xs">Avg GPA</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-lg font-bold text-green-400">{group.verifiedCount}</p>
                    <p className="text-gray-400 text-xs">Verified</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </button>

              {/* Students List (Expanded) */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/10 p-3 sm:p-4"
                >
                  <div className="space-y-2">
                    {group.students.map((student: Student, studentIndex: number) => {
                      const assignment = assignments.find(
                        a => a.studentId === student.id && a.teacherId === teacherId
                      );
                      const canEdit = isAssignmentOwned(assignment!);
                      
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
                              : canEdit 
                              ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                              : 'bg-gray-500/5 border-gray-500/20'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-white font-medium text-sm">
                                  {student.firstName} {student.lastName}
                                  {!canEdit && (
                                    <span className="ml-2 text-xs text-gray-500">(Read-only)</span>
                                  )}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-400 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Hash className="w-3 h-3" />
                                    {student.studentId || 'N/A'}
                                  </span>
                                  {student.gpa !== undefined && (
                                    <span className={`font-medium flex-shrink-0 ${
                                      student.gpa >= 3.0 ? 'text-green-400' : 
                                      student.gpa >= 2.0 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                      GPA: {student.gpa.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {assignment?.status && (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  assignment.status === 'verified'
                                    ? 'bg-green-500/20 text-green-400'
                                    : assignment.status === 'not_verified'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {assignment.status === 'verified' ? 'verified' :
                                   assignment.status === 'not_verified' ? 'not verified' : 'rejected'}
                                </span>
                              )}
                              {onStatusChange && canEdit && assignment && (
                                <select
                                  value={assignment.status}
                                  onChange={(e) => onStatusChange(assignment.id, e.target.value)}
                                  className="bg-black/50 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="not_verified">Pending</option>
                                  <option value="verified">Verified</option>
                                </select>
                              )}
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
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
