'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BackgroundImage } from '@/components/ui';
import { useUserStatus } from '@/contexts/UserStatusContext';
import { useCourseManagement, useCourseRegistrationSearch } from '@/hooks/courseHooks';
import CourseRegistrationManager from '@/components/CourseRegistrationManager';
import CourseRegistrationsDisplay from '@/components/CourseRegistrationsDisplay';
import StudentGradesView from '@/components/StudentGradesView';
import { withAuth } from '@/lib/routeGuards';

function CoursesPage() {
  // State for tab navigation
  const [activeTab, setActiveTab] = useState<'registration' | 'grades'>('registration');

  // Use global user status for authentication
  const { user } = useUserStatus();

  // Router for navigation
  const router = useRouter();

  // Use course management hook
  const {
    courseSubmissions,
    isLoading: courseRegistrationsLoading,
    handleClearCourseSubmission,
    hasRegisteredCourses,
    registeredCourses
  } = useCourseManagement({ user, isAdmin: false });

  // Use shared course search hook
  const {
    searchTerm,
    setSearchTerm,
    filteredSubmissions: filteredRegistrations
  } = useCourseRegistrationSearch(courseSubmissions);

  // Course status checking is now handled by useCourseManagement hook
  // React Query handles course registrations data fetching automatically

  return (
    <BackgroundImage className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-indigo-950/80 to-slate-900/80 backdrop-blur-sm"></div>
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Professional Header */}
        <header className="mb-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-slate-200 transition-colors"
            >
              Dashboard
            </button>
            <span>/</span>
            <span className="text-slate-200">Course Registration</span>
          </nav>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <img
                  src="/freedom.png"
                  alt="Freedom City Tech Center"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-100">Course Registration</h1>
                <p className="text-slate-400">Freedom City Tech Center • Academic Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-lg text-sm font-medium ${hasRegisteredCourses
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                {hasRegisteredCourses ? '✓ Registered' : 'Available'}
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg border border-slate-700/50 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg p-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('registration')}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'registration'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-slate-200'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>📚</span>
                  <span>Course Registration</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('grades')}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'grades'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-slate-200'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>🎓</span>
                  <span>My Grades</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'registration' && (
          <div className="space-y-8">
            {/* Registered Courses Display */}
            {hasRegisteredCourses && (
              <div className="mb-8">
                <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg">
                  <div className="p-6 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-xl">✓</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-100">Your Registered Courses</h2>
                          <p className="text-slate-400 text-sm">Total: {registeredCourses.reduce((sum, course) => sum + course.credits, 0)} credits</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 text-sm font-medium">{registeredCourses.length} courses</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {registeredCourses.map((course, index) => (
                        <div key={`registered-${index}`} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50 hover:border-emerald-500/30 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-slate-100 font-medium text-sm mb-1">{course.name}</h4>
                            </div>
                            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-emerald-400 text-xs font-bold">{index + 1}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-xs">Credits</span>
                            <span className="text-emerald-400 font-bold">{course.credits}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Course Registration Form */}
            {!hasRegisteredCourses && (
              <CourseRegistrationManager
                user={user}
                mode="student"
                onSubmitSuccess={() => {
                  // Course registration is automatically handled by React Query hooks
                  // No manual refresh needed - cache invalidation is automatic
                  console.log('Course registration submitted successfully');
                }}
              />
            )}

            {/* Student Courses Section - Visible to All Users */}
            {user && (
              <div className="mb-8">
                <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg">
                  <div className="p-6 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-xl">📚</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-100">All Student Registrations</h2>
                          <p className="text-slate-400 text-sm">Browse course submissions from all students</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 text-sm font-medium">{courseSubmissions.length} submissions</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {/* Info Banner */}
                    <div className={`rounded-lg p-4 mb-6 border ${hasRegisteredCourses
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                      }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{hasRegisteredCourses ? '💡' : 'ℹ️'}</span>
                        <p className="text-sm">
                          {hasRegisteredCourses
                            ? 'You can clear your course submission to register again.'
                            : 'You haven\'t registered for courses yet. View submissions below to see what others have registered.'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Course Registrations Display */}
                    <CourseRegistrationsDisplay
                      courseSubmissions={courseSubmissions}
                      onClearSubmission={handleClearCourseSubmission}
                      isLoading={courseRegistrationsLoading}
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      filteredSubmissions={filteredRegistrations}
                      currentUser={user}
                      showUserActions={true}
                      showAdminActions={false}
                      theme="student"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === 'grades' && user && (
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎓</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">My Grades & Academic Progress</h2>
                  <p className="text-slate-400 text-sm">Track your course grades and academic performance</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <StudentGradesView studentId={user?.id || ''} theme="student" />
            </div>
          </div>
        )}
      </div>
    </BackgroundImage>
  );
}

export default withAuth(CoursesPage, {
  requireAuth: true
});
