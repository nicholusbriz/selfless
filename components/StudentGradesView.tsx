'use client';

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';

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

interface StudentGradesData {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  courses: Course[];
  takesReligion: boolean;
  totalCredits: number;
  semester: string;
  academicYear: string;
}

interface StudentGradesViewProps {
  studentId: string;
  theme?: 'student' | 'admin' | 'overlay';
}

export default function StudentGradesView({ studentId, theme = 'student' }: StudentGradesViewProps) {
  const [gradesData, setGradesData] = useState<StudentGradesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudentGrades = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/grades?studentId=${studentId}`);
      const data = await response.json();

      if (data.success) {
        setGradesData(data.data);
      } else {
        setError('Failed to fetch grades');
      }
    } catch {
      setError('Error fetching grades');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchStudentGrades();
  }, [fetchStudentGrades]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin text-2xl">🔄</div>
        <span className="ml-2 text-white">Loading grades...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Grades</h3>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  if (!gradesData) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Grades Found</h3>
        <p className="text-gray-300">No grade records available for this student.</p>
      </div>
    );
  }

  const gradedCourses = gradesData.courses.filter(course => course.grade !== '');
  const ungradedCourses = gradesData.courses.filter(course => course.grade === '');

  return (
    <div className="space-y-6">
      {/* Student Header */}
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'admin' ? 'text-gray-900' :
          theme === 'overlay' ? 'text-white' : 'text-white'
          }`}>
          {gradesData.student.firstName} {gradesData.student.lastName}
        </h2>
        <p className={`text-lg ${theme === 'admin' ? 'text-gray-600' :
          theme === 'overlay' ? 'text-gray-300' : 'text-gray-300'
          }`}>
          {gradesData.student.email}
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <div className={`px-4 py-2 rounded-lg text-sm font-medium ${theme === 'admin'
            ? 'bg-blue-100 text-blue-800 border border-blue-300'
            : theme === 'overlay' ? 'bg-blue-600/20 text-blue-300 border border-blue-400/30'
              : 'bg-blue-600/20 text-blue-300 border border-blue-400/30'
            }`}>
            {gradesData.semester} {gradesData.academicYear}
          </div>
          <div className={`px-4 py-2 rounded-lg text-sm font-medium ${theme === 'admin'
            ? 'bg-purple-100 text-purple-800 border border-purple-300'
            : theme === 'overlay' ? 'bg-purple-600/20 text-purple-300 border border-purple-400/30'
              : 'bg-purple-600/20 text-purple-300 border border-purple-400/30'
            }`}>
            {gradedCourses.length}/{gradesData.courses.length} Courses Graded
          </div>
        </div>
      </div>

      {/* Graded Courses */}
      {gradedCourses.length > 0 && (
        <div>
          <h3 className={`text-xl font-semibold mb-4 ${theme === 'admin' ? 'text-gray-800' : 'text-white'
            }`}>
            📊 Your Grades
          </h3>
          <div className="space-y-3">
            {gradedCourses.map((course, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${theme === 'admin'
                  ? 'bg-white border-gray-200 shadow-sm'
                  : 'bg-white/10 backdrop-blur-md border-white/20'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className={`font-semibold text-lg mb-1 ${theme === 'admin' ? 'text-gray-900' : 'text-white'
                      }`}>
                      {course.name}
                    </h4>
                    <p className={`text-sm ${theme === 'admin' ? 'text-gray-600' : 'text-gray-300'
                      }`}>
                      {course.credits} credit{course.credits !== 1 ? 's' : ''}
                    </p>
                    {course.gradedBy && (
                      <p className={`text-xs mt-2 ${theme === 'admin' ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                        Graded by {course.gradedBy.name} on{' '}
                        {course.gradedAt ? new Date(course.gradedAt).toLocaleDateString() : 'Unknown date'}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${theme === 'admin'
                      ? 'bg-green-100 text-green-800 border-2 border-green-300'
                      : 'bg-green-600/20 text-green-300 border-2 border-green-400/30'
                      }`}>
                      {course.grade}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ungraded Courses */}
      {ungradedCourses.length > 0 && (
        <div>
          <h3 className={`text-xl font-semibold mb-4 ${theme === 'admin' ? 'text-gray-800' : 'text-white'
            }`}>
            ⏳ Pending Grades
          </h3>
          <div className="space-y-3">
            {ungradedCourses.map((course, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${theme === 'admin'
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white/5 border-white/10'
                  }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className={`font-semibold ${theme === 'admin' ? 'text-gray-900' : 'text-white'
                      }`}>
                      {course.name}
                    </h4>
                    <p className={`text-sm ${theme === 'admin' ? 'text-gray-600' : 'text-gray-300'
                      }`}>
                      {course.credits} credit{course.credits !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${theme === 'admin'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'bg-yellow-600/20 text-yellow-300 border border-yellow-400/30'
                    }`}>
                    Pending
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className={`p-6 rounded-xl border ${theme === 'admin'
        ? 'bg-gray-50 border-gray-200'
        : 'bg-white/10 backdrop-blur-md border-white/20'
        }`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'admin' ? 'text-gray-800' : 'text-white'
          }`}>
          📈 Academic Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className={`text-sm font-medium mb-1 ${theme === 'admin' ? 'text-gray-600' : 'text-gray-300'
              }`}>
              Total Courses
            </p>
            <p className={`text-2xl font-bold ${theme === 'admin' ? 'text-gray-900' : 'text-white'
              }`}>
              {gradesData.courses.length}
            </p>
          </div>
          <div className="text-center">
            <p className={`text-sm font-medium mb-1 ${theme === 'admin' ? 'text-gray-600' : 'text-gray-300'
              }`}>
              Total Credits
            </p>
            <p className={`text-2xl font-bold ${theme === 'admin' ? 'text-gray-900' : 'text-white'
              }`}>
              {gradesData.totalCredits}
            </p>
          </div>
          <div className="text-center">
            <p className={`text-sm font-medium mb-1 ${theme === 'admin' ? 'text-gray-600' : 'text-gray-300'
              }`}>
              Graded Courses
            </p>
            <p className={`text-2xl font-bold ${theme === 'admin' ? 'text-gray-900' : 'text-white'
              }`}>
              {gradedCourses.length}
            </p>
          </div>
        </div>

        {gradesData.takesReligion && (
          <div className="mt-4 text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${theme === 'admin'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-green-600/20 text-green-300 border border-green-400/30'
              }`}>
              ✓ Taking Religion Course
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
