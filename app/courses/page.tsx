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
    <div className="min-h-screen bg-cloud-500 relative overflow-hidden">
      {/* Modern Background Effects */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-terracotta-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sage-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-terracotta-400 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse animation-delay-4000"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(44, 44, 44, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(44, 44, 44, 0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Modern Header */}
        <header className="mb-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-charcoal-600 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-charcoal-700 transition-colors font-medium"
            >
              Dashboard
            </button>
            <span className="text-charcoal-500">/</span>
            <span className="text-charcoal-700 font-medium">Course Registration</span>
          </nav>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-terracotta-400 to-terracotta-600 rounded-2xl flex items-center justify-center shadow-xl shadow-terracotta-400/30">
                <img
                  src="/freedom.png"
                  alt="Freedom City Tech Center"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-charcoal-700">Course Registration</h1>
                <p className="text-charcoal-600 font-medium">Freedom City Tech Center • Academic Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-lg text-sm font-medium ${hasRegisteredCourses
                ? 'bg-sage-400/20 text-sage-600 border border-sage-400/30'
                : 'bg-terracotta-400/20 text-terracotta-600 border border-terracotta-400/30'
                }`}>
                {hasRegisteredCourses ? '✓ Registered' : 'Available'}
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-cloud-500 backdrop-blur-md hover:bg-cloud-400 text-charcoal-700 rounded-lg border border-sandstone-400 hover:border-terracotta-400 transition-all duration-300"
              >
                ← Back
              </button>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-cloud-500 backdrop-blur-md rounded-2xl border border-sandstone-400 shadow-xl p-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('registration')}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'registration'
                  ? 'bg-gradient-to-r from-terracotta-400 to-terracotta-600 text-white shadow-lg shadow-terracotta-400/30'
                  : 'bg-cloud-400 hover:bg-sandstone-400 text-charcoal-700 hover:text-charcoal-600'
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
                  ? 'bg-gradient-to-r from-sage-400 to-sage-600 text-white shadow-lg shadow-sage-400/30'
                  : 'bg-cloud-400 hover:bg-sandstone-400 text-charcoal-700 hover:text-charcoal-600'
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
                <div className="bg-gradient-to-br from-cloud-500 to-cloud-400 backdrop-blur-md rounded-2xl border border-sandstone-400 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <div className="p-6 border-b border-sandstone-400 bg-gradient-to-r from-sage-400/5 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-600 rounded-xl flex items-center justify-center shadow-lg shadow-sage-400/30">
                          <span className="text-xl text-white">✓</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-charcoal-700">Your Registered Courses</h2>
                          <p className="text-charcoal-600 text-sm font-medium">Total: {registeredCourses.reduce((sum, course) => sum + course.credits, 0)} credits</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sage-600 text-sm font-semibold bg-sage-400/10 px-3 py-1 rounded-full">{registeredCourses.length} courses</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {registeredCourses.map((course, index) => (
                        <div key={`registered-${index}`} className="group bg-gradient-to-br from-white to-cloud-400 backdrop-blur-sm rounded-xl p-5 border border-sandstone-400 hover:border-sage-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-sage-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h4 className="text-charcoal-700 font-semibold text-base mb-1 group-hover:text-sage-600 transition-colors">{course.name}</h4>
                              </div>
                              <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                <span className="text-white text-sm font-bold">{index + 1}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-sandstone-300">
                              <span className="text-charcoal-600 text-xs font-medium uppercase tracking-wide">Credits</span>
                              <span className="text-sage-600 font-bold text-lg">{course.credits}</span>
                            </div>
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
                <div className="bg-gradient-to-br from-cloud-500 to-cloud-400 backdrop-blur-md rounded-2xl border border-sandstone-400 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <div className="p-6 border-b border-sandstone-400 bg-gradient-to-r from-terracotta-400/5 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-terracotta-400 to-terracotta-600 rounded-xl flex items-center justify-center shadow-lg shadow-terracotta-400/30">
                          <span className="text-xl text-white">📚</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-charcoal-700">All Student Registrations</h2>
                          <p className="text-charcoal-600 text-sm font-medium">Browse course submissions from all students</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-terracotta-600 text-sm font-semibold bg-terracotta-400/10 px-3 py-1 rounded-full">{courseSubmissions.length} submissions</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {/* Info Banner */}
                    <div className={`rounded-xl p-5 mb-6 border backdrop-blur-sm ${hasRegisteredCourses
                      ? 'bg-gradient-to-r from-sage-400/10 to-sage-400/5 border-sage-400/30 text-sage-600'
                      : 'bg-gradient-to-r from-terracotta-400/10 to-terracotta-400/5 border-terracotta-400/30 text-terracotta-600'
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hasRegisteredCourses
                          ? 'bg-sage-400/20'
                          : 'bg-terracotta-400/20'
                          }`}>
                          <span className="text-lg">{hasRegisteredCourses ? '💡' : 'ℹ️'}</span>
                        </div>
                        <p className="text-sm font-medium">
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
          <div className="bg-gradient-to-br from-cloud-500 to-cloud-400 backdrop-blur-md rounded-2xl border border-sandstone-400 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="p-6 border-b border-sandstone-400 bg-gradient-to-r from-sage-400/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-600 rounded-xl flex items-center justify-center shadow-lg shadow-sage-400/30">
                  <span className="text-xl text-white">🎓</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-charcoal-700">My Grades & Academic Progress</h2>
                  <p className="text-charcoal-600 text-sm font-medium">Track your course grades and academic performance</p>
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
