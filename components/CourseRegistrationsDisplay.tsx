'use client';

import { CourseRegistration, FlexibleUser } from '@/types';
import ExcelExporter from './ExcelExporter';

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
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin text-2xl">🔄</div>
        <span className="ml-2 text-white">Loading course registrations...</span>
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
              className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <span className="text-sm">🔍</span>
            </div>
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1.5 px-2 py-1 bg-red-600/20 text-red-300 rounded text-xs hover:bg-red-600/30 transition-colors duration-200"
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
          <h3 className="text-xl font-semibold text-white mb-2">No Course Registrations Found</h3>
          <p className="text-gray-300">
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
                className={`p-6 rounded-xl border ${theme === 'admin'
                  ? 'bg-white border-gray-200'
                  : 'bg-black/30 border-white/20'
                  }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`font-semibold text-lg ${theme === 'admin' ? 'text-gray-900' : 'text-white'
                      }`}>
                      {submission.userName}
                    </h3>
                  </div>
                </div>

                {/* Courses List */}
                <div className="mb-4">
                  <h4 className={`text-sm font-medium mb-2 ${theme === 'admin' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                    Registered Courses:
                  </h4>
                  <div className="space-y-2">
                    {submission.courses?.map((course: any, index: number) => (
                      <div
                        key={`${submission.id}-course-${index}`}
                        className={`flex justify-between items-center p-2 rounded ${theme === 'admin'
                          ? 'bg-gray-50 border border-gray-200'
                          : 'bg-black/20 border border-white/10'
                          }`}
                      >
                        <span className={
                          theme === 'admin' ? 'text-gray-900' : 'text-white'
                        }>
                          {course.name}
                        </span>
                        <span className={`text-sm ${theme === 'admin' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                          {course.credits} credit{course.credits !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )) || (
                        <p className={`text-sm ${theme === 'admin' ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                          No courses registered
                        </p>
                      )}
                  </div>
                </div>

                {/* Credits Summary */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${theme === 'admin'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-blue-600/20 text-blue-300 border border-blue-400/30'
                    }`}>
                    Total Credits: {submission.courses?.reduce((sum: number, course: any) => sum + (course.credits || 0), 0) || 0}
                  </span>
                </div>

                {/* Religion Status */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${submission.takesReligion
                    ? theme === 'admin'
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-green-600/20 text-green-300 border border-green-400/30'
                    : theme === 'admin'
                      ? 'bg-gray-100 text-gray-600 border border-gray-200'
                      : 'bg-gray-600/20 text-gray-400 border border-gray-400/30'
                    }`}>
                    {submission.takesReligion ? '✓ Taking Religion' : 'No Religion Course'}
                  </span>
                </div>

                {/* Actions */}
                {(showUserActions || showAdminActions) && (
                  <div className="flex justify-end">
                    {showUserActions && currentUser && submission.userId === currentUser.id && (
                      <button
                        onClick={() => {
                          const confirmed = window.confirm(
                            `⚠️ Clear Course Registration ⚠️\n\nAre you sure you want to clear all your registered courses?\n\nThis will:\n• Remove all your course registrations\n• Delete your course credit totals\n• Allow you to register again\n\nThis action CANNOT be undone!\n\nClick "OK" to clear your courses or "Cancel" to keep them.`
                          );
                          if (confirmed) {
                            onClearSubmission(submission.id, submission.userName, 'courses');
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Clear My Courses
                      </button>
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
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Clear Courses
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Export */}
          {showAdminActions && (
            <div className="p-4 bg-black/30 rounded-lg border border-white/20">
              <h3 className="text-sm font-semibold text-white mb-3">Export Courses Data</h3>
              <ExcelExporter
                data={filteredSubmissions.flatMap(submission =>
                  submission.courses?.map(course => ({
                    'Student Name': submission.userName || '',
                    'Religion': submission.takesReligion ? 'Yes' : 'No',
                    'Course Name': course.name || '',
                    'Credits': String(course.credits || 0),
                    'Submitted Date': submission.submittedAt || ''
                  })) || []
                )}
                filename="course-submissions.csv"
                className="mb-2"
              >
                📊 Export Course Submissions
              </ExcelExporter>
            </div>
          )}
        </>
      )}
    </>
  );
}
