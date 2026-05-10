'use client';

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { useUserStatus } from '@/contexts/UserStatusContext';
import { DashboardButton } from '@/components/ui';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  courses: Course[];
  takesReligion: boolean;
  totalCredits: number;
  semester: string;
  academicYear: string;
  gradedCoursesCount: number;
  totalCoursesCount: number;
  isFullyGraded: boolean;
}

interface Course {
  name: string;
  credits: number;
  grade: string;
  gradedBy?: {
    id: string;
    name: string;
  };
  gradedAt?: string;
}

export default function GradeManagement({ tutorId }: { tutorId: string }) {
  const { isTutor } = useUserStatus();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentGrades, setStudentGrades] = useState<{ [studentId: string]: { [courseName: string]: string } }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Grade options
  const gradeOptions = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E', 'F', 'UW', 'CR', 'I', 'IP', 'NC', 'NR', 'P', 'T', 'W', 'AU', 'V'];

  // Fetch all students with their grades
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/grades');
      const data = await response.json();

      if (data.success) {
        setStudents(data.data);
      } else {
        setMessage('Failed to fetch students');
        setMessageType('error');
      }
    } catch {
      setMessage('Error fetching students');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Initialize grades for all students
  const initializeGrades = useCallback(() => {
    const initialGrades: { [studentId: string]: { [courseName: string]: string } } = {};
    students.forEach(student => {
      initialGrades[student.id] = {};
      student.courses.forEach(course => {
        initialGrades[student.id][course.name] = course.grade;
      });
    });
    setStudentGrades(initialGrades);
  }, [students]);

  useEffect(() => {
    initializeGrades();
  }, [initializeGrades]);


  // Update grade for a specific student and course
  const updateGrade = (studentId: string, courseName: string, grade: string) => {
    setStudentGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [courseName]: grade
      }
    }));
  };

  // Save grades for a specific student
  const saveStudentGrades = async (student: Student) => {
    if (!tutorId) return;

    try {
      setSaving(true);
      setMessage('');

      const studentGradeData = studentGrades[student.id] || {};
      const gradesToSave = Object.entries(studentGradeData)
        .filter(([courseName, grade]) => grade !== '')
        .map(([courseName, grade]) => {
          const course = student.courses.find(c => c.name === courseName);
          return {
            studentId: student.id,
            courseName,
            gradeLetter: grade,
            tutorId,
            credits: course?.credits || 0,
            semester: student.semester,
            academicYear: student.academicYear
          };
        });

      if (gradesToSave.length === 0) {
        setMessage('No grades to save');
        setMessageType('error');
        return;
      }

      const response = await fetch('/api/grades', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grades: gradesToSave
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Successfully saved ${gradesToSave.length} grades for ${student.firstName} ${student.lastName}!`);
        setMessageType('success');

        // Refresh students data to show updated grades
        await fetchStudents();

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setMessage('Failed to save grades');
        setMessageType('error');
      }
    } catch {
      setMessage('Error saving grades');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  // Clear courses and re-register student
  const clearAndReRegister = async (student: Student) => {
    const confirmed = window.confirm(
      `Are you sure you want to clear all grades for ${student.firstName} ${student.lastName}?\n\nThis will:\n• Delete all existing grades\n• Keep course registrations intact\n• Allow the student to be re-graded\n\nThis action cannot be undone!`
    );

    if (!confirmed) return;

    setSaving(true);
    setMessage('');
    setMessageType('success');

    try {
      // Delete all grades for this student (keep course registrations)
      const deleteGradesResponse = await fetch(`/api/grades?studentId=${student.id}`, {
        method: 'DELETE'
      });

      if (deleteGradesResponse.ok) {
        setMessage(`Successfully cleared grades for ${student.firstName} ${student.lastName}. Course registrations remain intact and the student can be re-graded.`);
        setMessageType('success');

        // Refresh students data to show updated grades
        await fetchStudents();

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else if (deleteGradesResponse.status === 408) {
        setMessage('Database operation timed out. Please try again.');
        setMessageType('error');
      } else {
        setMessage('Failed to clear grades');
        setMessageType('error');
      }
    } finally {
      setSaving(false);
    }
  };

  // Filter students by search
  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get grading statistics
  const totalStudents = students.length;
  const fullyGradedStudents = students.filter(s => s.isFullyGraded).length;
  const partiallyGradedStudents = students.filter(s => !s.isFullyGraded && s.gradedCoursesCount > 0).length;
  const notStartedStudents = students.filter(s => s.gradedCoursesCount === 0).length;
  const completionRate = totalStudents > 0 ? Math.round((fullyGradedStudents / totalStudents) * 100) : 0;

  // All students view with scrollable container
  return (
    <div className="max-w-full sm:max-w-7xl mx-auto px-4 sm:px-8 py-8 h-screen overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Grade Management</h1>
          <p className="text-slate-400 text-sm">Manage and update student grades efficiently</p>
        </div>
        <DashboardButton text="Back to Dashboard" />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 flex-shrink-0">
        {/* Total Students */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-lg hover:border-indigo-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-2xl">👥</span>
            </div>
            <span className="text-3xl font-bold text-white">{totalStudents}</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Total Students</p>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Fully Graded */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-lg hover:border-emerald-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-2xl">✅</span>
            </div>
            <span className="text-3xl font-bold text-white">{fullyGradedStudents}</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Fully Graded</p>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }}></div>
          </div>
          <p className="text-emerald-400 text-xs mt-2">{completionRate}% completion rate</p>
        </div>

        {/* In Progress */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-lg hover:border-amber-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <span className="text-2xl">⏳</span>
            </div>
            <span className="text-3xl font-bold text-white">{partiallyGradedStudents}</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">In Progress</p>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500" style={{ width: totalStudents > 0 ? `${(partiallyGradedStudents / totalStudents) * 100}%` : '0%' }}></div>
          </div>
          <p className="text-amber-400 text-xs mt-2">{totalStudents > 0 ? `${Math.round((partiallyGradedStudents / totalStudents) * 100)}%` : '0%'} of total</p>
        </div>

        {/* Not Started */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-lg hover:border-rose-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
              <span className="text-2xl">📋</span>
            </div>
            <span className="text-3xl font-bold text-white">{notStartedStudents}</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Not Started</p>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-600 to-red-600 rounded-full transition-all duration-500" style={{ width: totalStudents > 0 ? `${(notStartedStudents / totalStudents) * 100}%` : '0%' }}></div>
          </div>
          <p className="text-rose-400 text-xs mt-2">{totalStudents > 0 ? `${Math.round((notStartedStudents / totalStudents) * 100)}%` : '0%'} of total</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8 flex-shrink-0">
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-lg">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search students by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-slate-400 text-sm">
                Found <span className="text-indigo-400 font-semibold">{filteredStudents.length}</span> of <span className="text-indigo-400 font-semibold">{totalStudents}</span> students
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-700/50 rounded-xl animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700/50 rounded animate-pulse w-1/3"></div>
                  <div className="h-3 bg-slate-700/50 rounded animate-pulse w-1/4"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-12 bg-slate-700/50 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-slate-700/50 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Student Cards with Inline Grading */
        <div className="space-y-6">
          {filteredStudents.map(student => (
            <div
              key={student.id}
              className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg hover:border-indigo-500/50 transition-all duration-300"
            >
              {/* Student Header */}
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <span className="text-xl font-bold text-white">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-slate-400 text-sm">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-400">📚</span>
                        <span className="text-slate-200">{student.totalCoursesCount} courses</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-400">💳</span>
                        <span className="text-slate-200">{student.totalCredits} credits</span>
                      </div>
                      {student.takesReligion && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                          <span className="text-emerald-400">✅</span>
                          <span className="text-emerald-300">Religion</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`px-4 py-2 rounded-lg border mb-2 ${student.isFullyGraded
                      ? 'bg-emerald-500/20 border-emerald-500/30'
                      : 'bg-amber-500/20 border-amber-500/30'
                      }`}>
                      <p className="text-white font-semibold">
                        {student.gradedCoursesCount}/{student.totalCoursesCount}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${student.isFullyGraded
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                      {student.isFullyGraded ? '✓ Complete' : '⏳ In Progress'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Courses with Grade Inputs */}
              <div className="p-6 space-y-4">
                {student.courses.map((course, index) => (
                  <div key={index} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50 hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-white font-semibold truncate">{course.name}</h4>
                          <span className="px-2 py-0.5 bg-slate-600/50 rounded text-xs text-slate-300">{course.credits} credits</span>
                        </div>
                        {course.grade && (
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-slate-400">Current:</span>
                            <span className={`px-2 py-0.5 rounded font-semibold ${['A', 'A-', 'B+'].includes(course.grade) ? 'bg-emerald-500/20 text-emerald-300' :
                              ['B', 'B-', 'C+'].includes(course.grade) ? 'bg-blue-500/20 text-blue-300' :
                                ['C', 'C-', 'D+'].includes(course.grade) ? 'bg-amber-500/20 text-amber-300' :
                                  'bg-rose-500/20 text-rose-300'
                              }`}>
                              {course.grade}
                            </span>
                            {course.gradedBy && (
                              <span className="text-slate-500 text-xs">
                                by {course.gradedBy.name} • {course.gradedAt ? new Date(course.gradedAt).toLocaleDateString() : ''}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <select
                          value={studentGrades[student.id]?.[course.name] || ''}
                          onChange={(e) => updateGrade(student.id, course.name, e.target.value)}
                          className="px-4 py-2.5 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all cursor-pointer min-w-[140px]"
                        >
                          <option value="" className="bg-slate-900 text-slate-400">Select Grade</option>
                          {gradeOptions.map(grade => (
                            <option key={grade} value={grade} className="bg-slate-900 text-white">
                              {grade}
                            </option>
                          ))}
                        </select>

                        {studentGrades[student.id]?.[course.name] && studentGrades[student.id][course.name] !== course.grade && (
                          <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium px-2 py-1 bg-emerald-500/20 rounded-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Updated</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-slate-700/30 border-t border-slate-700/50 flex gap-3">
                <button
                  onClick={() => saveStudentGrades(student)}
                  disabled={saving || !studentGrades[student.id] || Object.values(studentGrades[student.id]).every(grade => grade === '')}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      <span>Save Grades</span>
                    </>
                  )}
                </button>

                {isTutor && student.gradedCoursesCount > 0 && (
                  <button
                    onClick={() => clearAndReRegister(student)}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Reset</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Display */}
      {
        message && (
          <div className={`fixed bottom-6 right-6 p-4 rounded-xl text-center max-w-md z-50 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-right duration-300 ${messageType === 'success'
            ? 'bg-emerald-600/90 border border-emerald-500/30 text-white'
            : 'bg-rose-600/90 border border-rose-500/30 text-white'
            }`}>
            {messageType === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium">{message}</span>
          </div>
        )
      }
    </div >
  );
}
