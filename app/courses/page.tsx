'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BackgroundImage, DashboardButton } from '@/components/ui';
import { useUserStatus } from '@/contexts/UserStatusContext';
import { useCourseManagement, useCourseRegistrationSearch } from '@/hooks/courseHooks';
import CourseRegistrationManager from '@/components/CourseRegistrationManager';
import CourseRegistrationsDisplay from '@/components/CourseRegistrationsDisplay';
import { withAuth } from '@/lib/routeGuards';

function CoursesPage() {

  // Use global user status for authentication
  const { user } = useUserStatus();

  // Router for navigation
  const router = useRouter();

  // Use course management hook
  const {
    courseSubmissions,
    isLoading: courseRegistrationsLoading,
    clearCourseSubmission,
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
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-full mb-8 shadow-2xl shadow-emerald-500/30 p-3 animate-bounce-in">
            <img
              src="/freedom.png"
              alt="Freedom City Tech Center Logo"
              className="w-full h-full object-contain animate-glow"
            />
          </div>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold bg-gradient-to-r from-emerald-100 via-green-100 to-teal-100 bg-clip-text text-transparent mb-6 animate-slide-in-right leading-relaxed drop-shadow-2xl">
              Course Registration
            </h1>
          </div>
          <div className="max-w-2xl mx-auto">
            <p className="text-emerald-100 text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium mb-4 animate-slide-in-left drop-shadow-lg">
              Freedom City Tech Center
            </p>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl lg:text-2xl animate-slide-in-up drop-shadow-md">
              Register for your courses
            </p>
          </div>
        </div>

        {/* Registered Courses Display */}
        {hasRegisteredCourses && (
          <div className="max-w-4xl mx-auto mb-12 animate-fade-in-up animation-delay-300">
            <div className="glass-card rounded-3xl p-10 border-2 border-emerald-400/30 shadow-glow-lg hover-lift">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-full mb-6 animate-bounce-in shadow-2xl shadow-emerald-500/40">
                  <span className="text-3xl text-white">✅</span>
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gradient-primary mb-6 animate-slide-in-up drop-shadow-2xl">
                  Your Submitted Courses
                </h2>
                <p className="text-emerald-100 text-xl md:text-2xl lg:text-3xl mb-8 animate-slide-in-left drop-shadow-lg">
                  You have successfully registered for these courses
                </p>
              </div>
              <div className="bg-black/30 rounded-2xl p-6 border-2 border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {registeredCourses.map((course, index) => (
                    <div key={`registered-${index}`} className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 rounded-lg p-4 border-2 border-emerald-400/30">
                      <div className="mb-2">
                        <h4 className="text-white font-semibold text-lg">{course.name}</h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-300 text-sm">Credits:</span>
                        <span className="text-white font-bold text-xl">{course.credits}</span>
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
          <div className="mt-12 animate-fade-in-up animation-delay-600">
            <div className="max-w-6xl mx-auto">
              <div className="glass-card rounded-3xl p-10 border-2 border-cyan-400/30 shadow-glow-lg hover-lift">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-full mb-6 animate-bounce-in shadow-2xl shadow-cyan-500/40">
                    <span className="text-3xl text-white">📚</span>
                  </div>
                  <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-cyan-100 via-blue-100 to-indigo-100 bg-clip-text text-transparent mb-6 animate-slide-in-up drop-shadow-2xl">
                    Student Courses
                  </h3>
                  <p className="text-cyan-100 text-xl md:text-2xl lg:text-3xl mb-8 animate-slide-in-left drop-shadow-lg">
                    View all students who have registered for courses
                  </p>
                  {hasRegisteredCourses && (
                    <p className="text-cyan-300 text-lg mt-4 bg-cyan-600/20 rounded-xl p-3 border-2 border-cyan-400/30">
                      💡 You can clear your own course submission to register again
                    </p>
                  )}
                  {!hasRegisteredCourses && (
                    <p className="text-blue-300 text-lg mt-4 bg-blue-600/20 rounded-xl p-3 border-2 border-blue-400/30">
                      💡 You haven&apos;t registered for courses yet, but you can view all student submissions below
                    </p>
                  )}
                </div>
                <div className="bg-black/30 rounded-2xl border-2 border-white/20 p-6">
                  <CourseRegistrationsDisplay
                    courseSubmissions={courseSubmissions}
                    onClearSubmission={handleClearCourseSubmission}
                    isLoading={courseRegistrationsLoading}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filteredSubmissions={filteredRegistrations}
                    currentUser={user}
                    showUserActions={true}
                    showAdminActions={false} // Hide admin actions on student page
                    theme="student"
                  />
                </div>
                {/* Go to Dashboard Button */}
                <div className="text-center mt-8 pt-6">
                  <DashboardButton text="Back to Dashboard" />
                </div>
              </div>
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
