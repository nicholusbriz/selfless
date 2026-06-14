'use client';

import React, { useState } from 'react';
import { Award } from 'lucide-react';
import { GRADE_LETTERS } from '@/lib/constants';

interface GradeAssignmentCardProps {
  student: {
    id: string;
    name: string;
    studentId: string;
    enrolledCourses: any[];
    existingGrades: any[];
  };
  weekNumber: number;
  onGradeAssign: (courseId: string, gradeLetter: string) => void;
  isEditable: boolean;
}

export default function GradeAssignmentCard({
  student,
  weekNumber,
  onGradeAssign,
  isEditable
}: GradeAssignmentCardProps) {
  const [saving, setSaving] = useState<string | null>(null);

  const enrolledCourses = student?.enrolledCourses || [];
  const existingGrades = student?.existingGrades || [];

  const handleGradeChange = async (courseId: string, gradeLetter: string) => {
    if (!isEditable) return;
    
    setSaving(courseId);
    try {
      await onGradeAssign(courseId, gradeLetter);
    } finally {
      setSaving(null);
    }
  };

  const getCurrentGrade = (courseId: string) => {
    const grade = existingGrades.find(
      (g: any) => g.courseId === courseId && g.week === weekNumber
    );
    return grade?.gradeLetter || null;
  };

  if (enrolledCourses.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
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
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
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
          const currentGrade = getCurrentGrade(course.id);
          
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
                    onChange={(e) => handleGradeChange(course.id, e.target.value)}
                    disabled={saving === course.id}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all
                      bg-gray-800/50 border border-gray-600/50
                      text-white focus:outline-none focus:ring-2 focus:ring-violet-500
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${currentGrade ? 'border-green-500/50 bg-green-500/10' : 'border-gray-600/50'}
                    `}
                  >
                    <option value="" className="bg-gray-900 text-gray-400">
                      Select Grade
                    </option>
                    {GRADE_LETTERS.map((letter) => (
                      <option key={letter} value={letter} className="bg-gray-900 text-white">
                        {letter}
                      </option>
                    ))}
                  </select>
                )}
                
                {saving === course.id && (
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}