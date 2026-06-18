'use client';

import { motion } from 'framer-motion';
import { Users, User, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Tutor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  teacherId?: string;
  department?: string;
}

interface Student {
  id: string;
  name: string;
  studentId: string;
  currentGPA: number;
  takesReligion: boolean;
}

interface TutorGroup {
  tutor: Tutor;
  students: Student[];
  studentCount: number;
  averageGPA: number;
}

interface TutorAssignmentsProps {
  tutorGroups: { [key: string]: TutorGroup };
  currentUserId?: string;
  currentUserRole?: string;
}

export default function TutorAssignments({ tutorGroups, currentUserId, currentUserRole }: TutorAssignmentsProps) {
  const [expandedTutors, setExpandedTutors] = useState<Set<string>>(new Set());

  const toggleTutor = (tutorName: string) => {
    const newExpanded = new Set(expandedTutors);
    if (newExpanded.has(tutorName)) {
      newExpanded.delete(tutorName);
    } else {
      newExpanded.add(tutorName);
    }
    setExpandedTutors(newExpanded);
  };

  const expandAll = () => {
    setExpandedTutors(new Set(Object.keys(tutorGroups)));
  };

  const collapseAll = () => {
    setExpandedTutors(new Set());
  };

  // Find the current user's tutor (if student)
  const currentUserTutor = currentUserId && currentUserRole === 'STUDENT'
    ? Object.values(tutorGroups).find(group => 
        group.students.some((student: Student) => student.id === currentUserId)
      )
    : null;

  const tutorArray = Object.entries(tutorGroups);

  if (tutorArray.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-lg rounded-xl p-8 text-center border border-white/10"
      >
        <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Tutor Assignments</h3>
        <p className="text-gray-400">No tutors have been assigned to students yet.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Tutor Assignments</h2>
            <p className="text-gray-400 text-sm">View all tutors and their assigned students</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Current User's Tutor Highlight (for students) */}
      {currentUserTutor && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Your Tutor</h3>
              <p className="text-purple-300 text-sm">
                {currentUserTutor.tutor.firstName} {currentUserTutor.tutor.lastName}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{currentUserTutor.studentCount}</p>
              <p className="text-gray-400 text-xs">Students</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{currentUserTutor.averageGPA.toFixed(2)}</p>
              <p className="text-gray-400 text-xs">Avg GPA</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{currentUserTutor.tutor.department || 'N/A'}</p>
              <p className="text-gray-400 text-xs">Department</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tutor List */}
      <div className="space-y-3">
        {tutorArray.map(([tutorName, group], index) => {
          const isExpanded = expandedTutors.has(tutorName);
          const isCurrentUserTutor = currentUserTutor?.tutor.id === group.tutor.id;

          return (
            <motion.div
              key={tutorName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/5 backdrop-blur-lg rounded-xl border ${
                isCurrentUserTutor ? 'border-purple-500/30' : 'border-white/10'
              } overflow-hidden`}
            >
              {/* Tutor Header */}
              <button
                onClick={() => toggleTutor(tutorName)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isCurrentUserTutor ? 'bg-purple-500/20' : 'bg-white/10'
                  }`}>
                    <User className={`w-6 h-6 ${isCurrentUserTutor ? 'text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {tutorName}
                      {isCurrentUserTutor && (
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                          Your Tutor
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {group.tutor.department || 'No Department'} • {group.studentCount} students
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-lg font-bold text-white">{group.averageGPA.toFixed(2)}</p>
                    <p className="text-gray-400 text-xs">Avg GPA</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Students List (Expanded) */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/10 p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.students.map((student: Student, studentIndex: number) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: studentIndex * 0.05 }}
                        className={`p-3 rounded-lg border ${
                          student.id === currentUserId
                            ? 'bg-purple-500/10 border-purple-500/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <p className="text-white font-medium text-sm truncate">{student.name}</p>
                          </div>
                          {student.id === currentUserId && (
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">ID: {student.studentId}</span>
                          <span className={`font-medium ${
                            student.currentGPA >= 3.0 ? 'text-green-400' : 
                            student.currentGPA >= 2.0 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            GPA: {student.currentGPA.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          {student.takesReligion ? (
                            <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                              Takes Religion
                            </span>
                          ) : (
                            <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full">
                              No Religion
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
