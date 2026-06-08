'use client';

import { useState } from 'react';
import { CourseRegistration, FlexibleUser } from '@/types';
import StudentGradesView from './StudentGradesView';

interface CourseRegistrationsDisplayProps {
  courseSubmissions: CourseRegistration[];
  onClearSubmission: (submissionId: string, userName: string, courseName: string) => void;
  isLoading?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  filteredSubmissions?: CourseRegistration[];
  currentUser?: FlexibleUser | null;
  showUserActions?: boolean;
  showAdminActions?: boolean;
  theme?: 'admin' | 'student';
}

export default function CourseRegistrationsDisplay({
  courseSubmissions,
  onClearSubmission,
  isLoading = false,
  searchTerm = '',
  onSearchChange,
  filteredSubmissions = courseSubmissions,
  currentUser,
  showUserActions = true,
  showAdminActions = false,
  theme = 'student'
}: CourseRegistrationsDisplayProps) {
  const [showGradesView, setShowGradesView] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin text-2xl">🔄</div>
        <span className="ml-2 text-charcoal-600">Loading course registrations...</span>
      </div>
    );
  }

  // Show grades view for students viewing their own courses
  if (showGradesView && currentUser && theme === 'student') {
    return (
      <div>
        <button
          onClick={() => setShowGradesView(false)}
          className="mb-6 bg-gradient-to-r from-terracotta-400 to-terracotta-600 hover:from-terracotta-500 hover:to-terracotta-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-terracotta-400/30"
        >
          ← Back to Course List
        </button>
        <StudentGradesView studentId={currentUser.id} theme={theme} />
      </div>
    );
  }

  return (
    <>
      {/* Search Bar */}
      {onSearchChange && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by student name or course..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-cloud-400 border border-sandstone-400 rounded-xl text-charcoal-700 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 transition-all"
            />
            <div className="absolute left-4 top-3.5 text-charcoal-500">
              <span className="text-sm">🔍</span>
            </div>
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2 px-3 py-1.5 bg-terracotta-400/10 text-terracotta-600 border border-terracotta-400/30 rounded-lg text-xs hover:bg-terracotta-400/20 transition-colors duration-200 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-charcoal-700 mb-2">No Course Registrations Found</h3>
          <p className="text-charcoal-600">
            {searchTerm ? 'No courses match your search criteria.' : 'No students have registered for courses yet.'}
          </p>
        </div>
      ) : (
        <>
          {/* Course Cards */}
          <div className="space-y-4 mb-6 max-h-[600px] overflow-y-auto pr-2">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className={`group p-6 rounded-2xl border shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${theme === 'admin'
                  ? 'bg-gradient-to-br from-white to-cloud-400 border-sandstone-400'
                  : 'bg-gradient-to-br from-white to-cloud-400 border-sandstone-400'
                  }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${theme === 'admin'
                      ? 'bg-gradient-to-br from-terracotta-400 to-terracotta-600 shadow-terracotta-400/30'
                      : 'bg-gradient-to-br from-terracotta-400 to-terracotta-600 shadow-terracotta-400/30'
                      }`}>
                      <span className="text-white text-lg">👤</span>
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg ${theme === 'admin' ? 'text-charcoal-700' : 'text-charcoal-700'
                        }`}>
                        {submission.userName}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Courses List */}
                <div className="mb-4">
                  <h4 className={`text-sm font-medium mb-3 uppercase tracking-wide ${theme === 'admin' ? 'text-charcoal-600' : 'text-charcoal-600'
                    }`}>
                    Registered Courses:
                  </h4>
                  <div className="space-y-2">
                    {submission.courses?.map((course: { name: string; credits: number }, index: number) => (
                      <div
                        key={`${submission.id}-course-${index}`}
                        className={`flex justify-between items-center p-3 rounded-xl border ${theme === 'admin'
                          ? 'bg-cloud-400 border-sandstone-400 group-hover:border-terracotta-400 transition-colors'
                          : 'bg-cloud-400 border-sandstone-400 group-hover:border-terracotta-400 transition-colors'
                          }`}
                      >
                        <span className={`font-medium ${
                          theme === 'admin' ? 'text-charcoal-700' : 'text-charcoal-700'
                        }`}>
                          {course.name}
                        </span>
                        <span className={`text-sm font-bold ${theme === 'admin' ? 'text-terracotta-600' : 'text-terracotta-600'
                          }`}>
                          {course.credits} credit{course.credits !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )) || (
                        <p className={`text-sm ${theme === 'admin' ? 'text-charcoal-500' : 'text-charcoal-500'
                          }`}>
                          No courses registered
                        </p>
                      )}
                  </div>
                </div>

                {/* Credits Summary */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${theme === 'admin'
                    ? 'bg-gradient-to-r from-terracotta-400/10 to-terracotta-400/5 text-terracotta-600 border border-terracotta-400/30'
                    : 'bg-gradient-to-r from-terracotta-400/10 to-terracotta-400/5 text-terracotta-600 border border-terracotta-400/30'
                    }`}>
                    Total Credits: {submission.courses?.reduce((sum: number, course: { credits: number }) => sum + (course.credits || 0), 0) || 0}
                  </span>
                </div>

                {/* Religion Status */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${submission.takesReligion
                    ? theme === 'admin'
                      ? 'bg-gradient-to-r from-sage-400/10 to-sage-400/5 text-sage-600 border border-sage-400/30'
                      : 'bg-gradient-to-r from-sage-400/10 to-sage-400/5 text-sage-600 border border-sage-400/30'
                    : theme === 'admin'
                      ? 'bg-gradient-to-r from-charcoal-400/10 to-charcoal-400/5 text-charcoal-600 border border-charcoal-400/30'
                      : 'bg-gradient-to-r from-charcoal-400/10 to-charcoal-400/5 text-charcoal-600 border border-charcoal-400/30'
                    }`}>
                    {submission.takesReligion ? '✓ Taking Religion' : 'No Religion Course'}
                  </span>
                </div>

                {/* Actions */}
                {(showUserActions || showAdminActions) && (
                  <div className="flex justify-end gap-2 pt-4 border-t border-sandstone-400">
                    {showUserActions && currentUser && submission.userId === currentUser.id && (
                      <>
                        <button
                          onClick={() => setShowGradesView(true)}
                          className="bg-gradient-to-r from-sage-400 to-sage-600 hover:from-sage-500 hover:to-sage-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-sage-400/30 hover:shadow-lg"
                        >
                          📊 View Grades
                        </button>
                        <button
                          onClick={() => {
                            const confirmed = window.confirm(
                              `⚠️ Clear Course Registration ⚠️\n\nAre you sure you want to clear all your registered courses?\n\nThis will:\n• Remove all your course registrations\n• Delete your course credit totals\n• Allow you to register again\n\nThis action CANNOT be undone!\n\nClick "OK" to clear your courses or "Cancel" to keep them.`
                            );
                            if (confirmed) {
                              onClearSubmission(submission.id, submission.userName, 'courses');
                            }
                          }}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-red-500/30 hover:shadow-lg"
                        >
                          Clear My Courses
                        </button>
                      </>
                    )}
                    {showAdminActions && (
                      <button
                        onClick={() => {
                          const confirmed = window.confirm(
                            `⚠️ Clear Student Courses ⚠️\n\nAre you sure you want to clear ${submission.userName}'s courses?\n\nThis will:\n• Remove all their course registrations\n• Delete their course credit totals\n• Allow them to register again\n\nThis action CANNOT be undone!\n\nClick "OK" to clear courses or "Cancel" to keep them.`
                          );
                          if (confirmed) {
                            onClearSubmission(submission.id, submission.userName, 'courses');
                          }
                        }}
                        className="bg-gradient-to-r from-terracotta-400 to-terracotta-600 hover:from-terracotta-500 hover:to-terracotta-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-terracotta-400/30 hover:shadow-lg"
                      >
                        Clear Courses
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
