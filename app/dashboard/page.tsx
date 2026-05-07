'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User } from '@/lib/auth';
import { BackgroundImage } from '@/components/ui';
import { useCleaningDays } from '@/hooks/cleaningHooks';
import { useUserStatus } from '@/contexts/UserStatusContext';
import { API_ENDPOINTS } from '@/config/constants';
import NotificationsIcon from '@/components/NotificationsIcon';
import Announcements from '@/components/Announcements';
import UnifiedMessaging from '@/components/chat/UnifiedMessaging';
import TutorSchedule from '@/components/TutorSchedule';
import StudentGradesView from '@/components/StudentGradesView';
import { withAuth } from '@/lib/routeGuards';

function DashboardPage() {
  // Use global user status for authentication
  const { user, canManageGrades } = useUserStatus();
  const router = useRouter();

  // Use React Query for data fetching
  const { data: cleaningDays = [], isLoading: daysLoading } = useCleaningDays();

  // State for overlays
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGradesOpen, setIsGradesOpen] = useState(false);


  return (
    <BackgroundImage className="min-h-screen relative">
      {/* Glass overlay for better readability */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

      {/* Modern Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Image
                  src="/freedom.png"
                  alt="Freedom City Tech Center"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Freedom City Tech Center</h1>
                <p className="text-sm text-white/80">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification Icon */}
              <NotificationsIcon
                onClick={() => {
                  // Open slide-down overlay
                  setIsAnnouncementsOpen(true);
                }}
                forceClose={isAnnouncementsOpen}
              />

              <div className="text-right">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="text-sm font-medium text-white hover:text-cyan-200 transition-colors cursor-pointer"
                >
                  {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                </button>
                <p className="text-xs text-white/80 hover:text-cyan-200 transition-colors cursor-pointer" onClick={() => setIsProfileOpen(true)}>
                  go to profile
                </p>
              </div>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 cursor-pointer"
              >
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-8 pb-20 sm:pb-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.firstName}!</h2>
          <p className="text-white/80">Manage your academic activities and stay updated with the latest announcements.</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Cleaning Day Registration */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 hover:bg-white/20 transition-all duration-300 group">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Cleaning Day</h3>
              <p className="text-white/70 text-sm mb-4">Register for your assigned cleaning duty</p>
              <button
                onClick={() => router.push('/cleaning-form')}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium py-2 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105"
              >
                Register Now
              </button>
            </div>
          </div>

          {/* Course Management */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 hover:bg-white/20 transition-all duration-300 group">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Courses</h3>
              <p className="text-white/70 text-sm mb-4">Submit course units and credits</p>
              <button
                onClick={() => router.push('/courses')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
              >
                Manage Courses
              </button>
            </div>
          </div>

          {/* Policy Guidelines */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 hover:bg-white/20 transition-all duration-300 group">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Policies</h3>
              <p className="text-white/70 text-sm mb-4">Access organization guidelines</p>
              <button
                onClick={() => router.push('/policies')}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
              >
                View Policies
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 hover:bg-white/20 transition-all duration-300 group">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Messages</h3>
              <p className="text-white/70 text-sm mb-4">Chat with other users and admin</p>
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
              >
                Open Chat
              </button>
            </div>
          </div>

          {/* Grade Management - Only for Tutors and Admins */}
          {canManageGrades && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 hover:bg-white/20 transition-all duration-300 group">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Grade Management</h3>
                <p className="text-white/70 text-sm mb-4">Enter and manage student grades</p>
                <button
                  onClick={() => router.push('/grades')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium py-2 px-4 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
                >
                  Manage Grades
                </button>
              </div>
            </div>
          )}

          {/* View My Grades - For All Users */}
          {user && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 hover:bg-white/20 transition-all duration-300 group">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">My Grades</h3>
                <p className="text-white/70 text-sm mb-4">View your academic performance and grades</p>
                <button
                  onClick={() => setIsGradesOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                >
                  View My Grades
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Panel */}
        {user && user.isAdmin && (
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl border border-amber-400/30 hover:from-amber-500/30 hover:to-orange-500/30 transition-all duration-300 mb-6">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Admin Panel</h3>
                  <p className="text-white/70 text-sm">Manage users, courses, and system settings</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium py-3 px-4 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
              >
                Access Admin Panel
              </button>
            </div>
          </div>
        )}

        {/* Tutor Schedule Section */}
        <div className="mb-8">
          <TutorSchedule />
        </div>

        {/* Sign Out Section */}
        <div className="mt-8 pt-8 border-t border-white/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white/60 text-sm">
              <p>© 2026 Freedom City Tech Center. All rights reserved.</p>
              <p className="mt-1">Excellence in Technology Education</p>
            </div>
            <button
              onClick={async () => {
                try {
                  const response = await fetch(API_ENDPOINTS.SIGNOUT, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });

                  if (!response.ok) {
                    console.error('Signout failed');
                  }
                } catch (error) {
                  console.error('Error during signout:', error);
                } finally {
                  // Always redirect to home page
                  router.push('/');
                }
              }}
              className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium py-3 px-6 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
            >
              <span className="text-xl">🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      </main>

      {/* Announcements Slide-Down Overlay */}
      {isAnnouncementsOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* Semi-transparent backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsAnnouncementsOpen(false)}
          />

          {/* Slide-down content */}
          <div className="relative bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-2xl transform transition-transform duration-300 ease-out">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">📢</span>
                  </div>
                  <h2 className="text-xl font-bold">Announcements</h2>
                </div>
                <button
                  onClick={() => setIsAnnouncementsOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <span className="text-lg">✕</span>
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="p-6">
                <Announcements
                  showAnnouncementsList={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Slide-Right Overlay */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50">
          {/* Semi-transparent backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsProfileOpen(false)}
          />

          {/* Slide-right content */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 border-b border-gray-200 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <h2 className="text-xl font-bold">Profile</h2>
                </div>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <span className="text-lg">✕</span>
                </button>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl mx-auto">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white/20"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mt-4 mb-2">
                  {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                </h3>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {user?.isAdmin && (
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs rounded-full font-medium">
                      Admin
                    </span>
                  )}
                  {user?.isTutor && (
                    <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs rounded-full font-medium">
                      Tutor
                    </span>
                  )}
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs rounded-full font-medium">
                    Student
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">📞</span> Contact Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm">Email Address</p>
                    <p className="text-gray-800 font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Phone Number</p>
                    <p className="text-gray-800 font-medium">
                      {user?.phoneNumber || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">📚</span> Academic Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm">Student ID</p>
                    <p className="text-gray-800 font-medium">{user?.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Member Since</p>
                    <p className="text-gray-800 font-medium">Active Student</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Account Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-green-600 font-medium">Active</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Grades Slide-Down Overlay */}
      {isGradesOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* Semi-transparent backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsGradesOpen(false)}
          />

          {/* Slide-down content */}
          <div className="relative bg-white/95 backdrop-blur-lg shadow-2xl mt-4 sm:mt-8 md:mt-12 mx-2 sm:mx-4 md:mx-8 max-w-7xl w-full rounded-2xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm sm:text-lg">🎓</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">My Grades</h2>
              </div>
              <button
                onClick={() => setIsGradesOpen(false)}
                className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="text-sm sm:text-lg">✕</span>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="max-h-[60vh] sm:max-h-[65vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
              <div className="p-3 sm:p-6">
                <StudentGradesView studentId={user?.id || ''} theme="overlay" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified Messaging */}
      <UnifiedMessaging isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </BackgroundImage>
  );
}

export default withAuth(DashboardPage, {
  requireAuth: true
});
