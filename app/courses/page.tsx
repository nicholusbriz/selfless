'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 relative overflow-hidden">
      {/* Modern Background Effects */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse animation-delay-4000"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Modern Header */}
        <header className="mb-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-amber-100 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-white transition-colors font-medium"
            >
              Dashboard
            </button>
            <span className="text-amber-200">/</span>
            <span className="text-white font-medium">Course Registration</span>
          </nav>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30">
                <img
                  src="/freedom.png"
                  alt="Freedom City Tech Center"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">Course Registration</h1>
                <p className="text-amber-100 font-medium">Freedom City Tech Center • Academic Portal</p>
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
                className="px-4 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all duration-300"
              >
                ← Back
              </button>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('registration')}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'registration'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white hover:text-amber-100'
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
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white hover:text-amber-100'
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
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
                  <div className="p-6 border-b border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-xl">✓</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-white drop-shadow-md">Your Registered Courses</h2>
                          <p className="text-amber-100 text-sm font-medium">Total: {registeredCourses.reduce((sum, course) => sum + course.credits, 0)} credits</p>
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
                        <div key={`registered-${index}`} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-emerald-400/40 transition-all duration-300">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-white font-medium text-sm mb-1 drop-shadow-sm">{course.name}</h4>
                            </div>
                            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-emerald-400 text-xs font-bold">{index + 1}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-amber-100 text-xs font-medium">Credits</span>
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
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
                  <div className="p-6 border-b border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-xl">📚</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-white drop-shadow-md">All Student Registrations</h2>
                          <p className="text-amber-100 text-sm font-medium">Browse course submissions from all students</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-400 text-sm font-medium">{courseSubmissions.length} submissions</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {/* Info Banner */}
                    <div className={`rounded-lg p-4 mb-6 border ${hasRegisteredCourses
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
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
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎓</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white drop-shadow-md">My Grades & Academic Progress</h2>
                  <p className="text-amber-100 text-sm font-medium">Track your course grades and academic performance</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <StudentGradesView studentId={user?.id || ''} theme="student" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(CoursesPage, {
  requireAuth: true
});
