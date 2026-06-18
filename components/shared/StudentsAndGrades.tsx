'use client';

import React, { useState } from 'react';
import { Award } from 'lucide-react';
import GradeBadge from '@/components/shared/GradeBadge';
import EmptyState from '@/components/shared/EmptyState';
import { CourseListItemSkeleton } from '@/components/shared/LoadingState';
import { GRADE_LETTERS } from '@/lib/constants';

interface StudentsAndGradesProps {
  students?: any[];
  courses?: any[];
  grades?: any[];
  selectedWeek: number;
  isLoading?: boolean;
  isEditable?: boolean;
  onGradeAssign?: (studentId: string, courseId: string, gradeLetter: string) => void;
  mode?: 'teacher' | 'student';
}

export default function StudentsAndGrades({
  students,
  courses,
  grades,
  selectedWeek,
  isLoading,
  isEditable = false,
  onGradeAssign,
  mode = 'student'
}: StudentsAndGradesProps) {
  const [saving, setSaving] = useState<string | null>(null);

  // Student mode: display student's own grades
  if (mode === 'student') {
    if (isLoading) {
      return (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-6 w-48"></div>
          </div>
          <div className="divide-y divide-white/10">
            {[1, 2, 3, 4, 5].map(i => <CourseListItemSkeleton key={i} />)}
          </div>
        </div>
      );
    }

    if (!courses || courses.length === 0) {
      return (
        <EmptyState 
          icon={Award} 
          title="No courses enrolled" 
          description="Add courses first!"
        />
      );
    }

    return (
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Award className="w-5 h-5" />
            Week {selectedWeek} Grades
          </h2>
        </div>
        <div className="divide-y divide-white/10">
          {courses.map((course: any) => {
            const grade = grades?.find(
              (g: any) => g.courseId === course.id && g.week === selectedWeek
            );
            return (
              <div
                key={course.id}
                className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{course.courseName}</p>
                  <p className="text-gray-400 text-sm">{course.credits} credits</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs mb-1">Grade</p>
                  <GradeBadge grade={grade?.gradeLetter} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Teacher mode: display all students and allow grade assignment
  if (mode === 'teacher') {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-6 w-48"></div>
              </div>
              <div className="p-4">
                <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-16"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!students || students.length === 0) {
      return (
        <EmptyState 
          icon={Award} 
          title="No students found" 
          description="No students are currently assigned to you."
        />
      );
    }

    const handleGradeChange = async (studentId: string, courseId: string, gradeLetter: string) => {
      if (!isEditable || !onGradeAssign) return;
      
      setSaving(`${studentId}-${courseId}`);
      try {
        await onGradeAssign(studentId, courseId, gradeLetter);
      } finally {
        setSaving(null);
      }
    };

    return (
      <div className="space-y-4">
        {students.map((student: any) => {
          const enrolledCourses = student?.enrolledCourses || [];
          const existingGrades = student?.existingGrades || [];

          if (enrolledCourses.length === 0) {
            return (
              <div key={student.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-b border-white/10 p-4">
                  <h3 className="text-white font-semibold text-lg">{student?.name}</h3>
                  <p className="text-gray-400 text-sm">{student?.studentId}</p>
                </div>
                <div className="p-8 text-center text-gray-400">
                  No courses enrolled
                </div>
              </div>
            );
          }

          return (
            <div key={student.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
              {/* Student Header */}
              <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-b border-white/10 p-4">
                <h3 className="text-white font-semibold text-lg">
                  {student.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  {student.studentId} • {enrolledCourses.length} courses
                </p>
              </div>

              {/* Courses List */}
              <div className="divide-y divide-white/10">
                {enrolledCourses.map((course: any) => {
                  const currentGrade = existingGrades.find(
                    (g: any) => g.courseId === course.id && g.week === selectedWeek
                  )?.gradeLetter || null;
                  const savingKey = `${student.id}-${course.id}`;
                  
                  return (
                    <div
                      key={course.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {course.courseName}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {course.credits} credit{course.credits !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {currentGrade && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-lg">
                            <Award className="w-4 h-4 text-green-400" />
                            <span className="font-semibold text-green-400">{currentGrade}</span>
                          </div>
                        )}
                        
                        {isEditable && (
                          <select
                            value={currentGrade || ''}
                            onChange={(e) => handleGradeChange(student.studentProfileId || student.id, course.id, e.target.value)}
                            disabled={saving === savingKey}
                            className={`
                              px-3 py-2 rounded-lg text-sm font-medium transition-all
                              bg-slate-900/80 border border-slate-600/50
                              text-white focus:outline-none focus:ring-2 focus:ring-violet-500
                              disabled:opacity-50 disabled:cursor-not-allowed
                              ${currentGrade ? 'border-green-500/50 bg-green-500/10' : 'border-slate-600/50'}
                            `}
                          >
                            <option value="" className="bg-slate-900 text-gray-400">
                              Select Grade
                            </option>
                            {GRADE_LETTERS.map((letter) => (
                              <option key={letter} value={letter} className="bg-slate-900 text-white hover:bg-slate-800">
                                {letter}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        {saving === savingKey && (
                          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}
