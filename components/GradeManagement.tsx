'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStatus } from '@/contexts/UserStatusContext';

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

interface TutorInfo {
  id: string;
  firstName: string;
  lastName: string;
}

export default function GradeManagement({ tutorId }: { tutorId: string }) {
  const { user, isTutor, isAdmin } = useUserStatus();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentGrades, setStudentGrades] = useState<{ [studentId: string]: { [courseName: string]: string } }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [tutorInfo, setTutorInfo] = useState<TutorInfo | null>(null);

  // Grade options
  const gradeOptions = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E', 'F', 'UW', 'CR', 'I', 'IP', 'NC', 'NR', 'P', 'T', 'W', 'AU', 'V'];

  // Fetch all students with their grades
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
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
    } catch (error) {
      setMessage('Error fetching students');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Initialize grades for all students
  useEffect(() => {
    const initialGrades: { [studentId: string]: { [courseName: string]: string } } = {};
    students.forEach(student => {
      initialGrades[student.id] = {};
      student.courses.forEach(course => {
        initialGrades[student.id][course.name] = course.grade;
      });
    });
    setStudentGrades(initialGrades);
  }, [students]);


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
    } catch (error) {
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

  // All students view with scrollable container
  return (
    <div className="max-w-full sm:max-w-6xl mx-auto px-4 sm:px-8 py-8 min-h-screen flex flex-col overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold text-white">Grade Management</h1>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go to Dashboard
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 flex-shrink-0">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
          <p className="text-gray-300 text-sm">Total Students</p>
          <p className="text-2xl font-bold text-white">{totalStudents}</p>
        </div>
        <div className="bg-green-600/20 backdrop-blur-md rounded-lg p-4 border border-green-400/30">
          <p className="text-green-300 text-sm">Fully Graded</p>
          <p className="text-2xl font-bold text-white">{fullyGradedStudents}</p>
        </div>
        <div className="bg-yellow-600/20 backdrop-blur-md rounded-lg p-4 border border-yellow-400/30">
          <p className="text-yellow-300 text-sm">In Progress</p>
          <p className="text-2xl font-bold text-white">{partiallyGradedStudents}</p>
        </div>
        <div className="bg-red-600/20 backdrop-blur-md rounded-lg p-4 border border-red-400/30">
          <p className="text-red-300 text-sm">Not Started</p>
          <p className="text-2xl font-bold text-white">{notStartedStudents}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search students by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-400 text-lg"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-4 px-3 py-2 bg-red-600/20 text-red-300 rounded-lg text-sm hover:bg-red-600/30"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pr-2">
        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">🔄</div>
            <p className="text-white">Loading students...</p>
          </div>
        ) : (
          /* Student Cards with Inline Grading */
          <div className="grid gap-8">
            {filteredStudents.map(student => (
              <div
                key={student.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 transition-all duration-300"
              >
                {/* Student Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {student.firstName} {student.lastName}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <p className="text-gray-300">📚 {student.totalCoursesCount} courses registered</p>
                      <p className="text-gray-300">💳 {student.totalCredits} total credits</p>
                      {student.takesReligion && (
                        <p className="text-green-400">✅ Taking Religion</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`px-4 py-2 rounded-lg border mb-2 ${student.isFullyGraded
                      ? 'bg-green-600/20 border-green-400/30'
                      : 'bg-yellow-600/20 border-yellow-400/30'
                      }`}>
                      <p className="text-white font-medium">
                        {student.gradedCoursesCount}/{student.totalCoursesCount} Graded
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${student.isFullyGraded
                      ? 'bg-green-600/20 text-green-300 border border-green-400/30'
                      : 'bg-yellow-600/20 text-yellow-300 border border-yellow-400/30'
                      }`}>
                      {student.isFullyGraded ? '✅ Fully Graded' : '⏳ In Progress'}
                    </div>
                  </div>
                </div>

                {/* Courses with Grade Inputs */}
                <div className="space-y-3 mb-6">
                  {student.courses.map((course, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{course.name}</h4>
                          <p className="text-gray-300 text-sm">{course.credits} credits</p>
                          {course.grade && (
                            <div className="mt-2">
                              <p className="text-green-400 text-sm">
                                Current Grade: <span className="font-bold">{course.grade}</span>
                              </p>
                              {course.gradedBy && (
                                <p className="text-gray-400 text-xs">
                                  Graded by {course.gradedBy.name} on {course.gradedAt ? new Date(course.gradedAt).toLocaleDateString() : 'Unknown'}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <select
                            value={studentGrades[student.id]?.[course.name] || ''}
                            onChange={(e) => updateGrade(student.id, course.name, e.target.value)}
                            className="w-24 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
                          >
                            <option value="" className="bg-gray-800">Select Grade</option>
                            {gradeOptions.map(grade => (
                              <option key={grade} value={grade} className="bg-gray-800">
                                {grade}
                              </option>
                            ))}
                          </select>

                          {studentGrades[student.id]?.[course.name] && studentGrades[student.id][course.name] !== course.grade && (
                            <span className="text-green-400 font-medium text-sm">
                              ✓ Updated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-white/20">
                  <button
                    onClick={() => saveStudentGrades(student)}
                    disabled={saving || !studentGrades[student.id] || Object.values(studentGrades[student.id]).every(grade => grade === '')}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    {saving ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </span>
                    ) : (
                      '💾 Save Grades'
                    )}
                  </button>

                  {/* Only tutors can clear courses and re-register students - only show if student has existing grades */}
                  {isTutor && student.gradedCoursesCount > 0 && (
                    <button
                      onClick={() => clearAndReRegister(student)}
                      disabled={saving}
                      className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                      {saving ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>
                          Processing...
                        </span>
                      ) : (
                        '🔄 Clear Grades & Re-register'
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg text-center max-w-md z-50 ${messageType === 'success'
          ? 'bg-green-600/20 border border-green-400/30 text-green-300'
          : 'bg-red-600/20 border border-red-400/30 text-red-300'
          }`}>
          {message}
        </div>
      )}
    </div>
  );
}
