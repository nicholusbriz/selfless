'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PageLoader } from '@/components/ui';
import { useUserStatus } from '@/contexts/UserStatusContext';
import { API_ENDPOINTS } from '@/config/constants';
import Announcements from '@/components/Announcements';
import AnnouncementsPreview from '@/components/AnnouncementsPreview';
import UnifiedMessaging from '@/components/chat/UnifiedMessaging';
import TutorSchedule from '@/components/TutorSchedule';
import { withAuth } from '@/lib/routeGuards';

function DashboardPage() {
  // Use global user status for authentication
  const { user, canManageGrades } = useUserStatus();
  const router = useRouter();

  // State for overlays - MUST be called before any conditional logic
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Use React Query for data fetching
  // Show loading state while data is being fetched
  if (false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <PageLoader text="Loading dashboard..." color="white" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-cloud-500 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-terracotta-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sage-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(44, 44, 44, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(44, 44, 44, 0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-cloud-500 backdrop-blur-xl border-b border-sandstone-400 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-14 h-14 bg-terracotta-400 rounded-2xl flex items-center justify-center shadow-xl shadow-terracotta-500/40 group-hover:shadow-terracotta-500/60 transition-all duration-300 transform group-hover:scale-105">
                  <Image
                    src="/freedom.png"
                    alt="Freedom City Tech Center"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-sage-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-charcoal-700">
                  Freedom City Tech Center
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-charcoal-600 font-medium">Dashboard</p>
                  <span className="w-1 h-1 bg-terracotta-400 rounded-full"></span>
                  <p className="text-xs text-charcoal-500 font-semibold">Student Portal</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center gap-2 bg-cloud-400 backdrop-blur-md rounded-xl px-4 py-2 border border-sandstone-400">
                <button
                  onClick={() => router.push('/courses')}
                  className="flex items-center gap-2 text-sm text-charcoal-700 hover:text-terracotta-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-cloud-300"
                >
                  <span className="text-base">📚</span>
                  <span>Courses</span>
                </button>
                <div className="w-px h-4 bg-sandstone-400"></div>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="flex items-center gap-2 text-sm text-charcoal-700 hover:text-terracotta-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-cloud-300"
                >
                  <span className="text-base">💬</span>
                  <span>Chat</span>
                </button>
              </div>

              {/* Notification Icon */}
              <div className="relative">
                <button
                  onClick={() => setIsAnnouncementsOpen(true)}
                  className="w-11 h-11 bg-cloud-400 backdrop-blur-md rounded-xl flex items-center justify-center border border-sandstone-400 hover:bg-cloud-300 hover:border-terracotta-400 transition-all duration-300 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">🔔</span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta-400 rounded-full text-xs text-white font-bold flex items-center justify-center shadow-lg shadow-terracotta-500/30">3</span>
                </button>
              </div>

              {/* User Profile Section */}
              <div className="flex items-center gap-4 pl-6 border-l border-sandstone-400">
                <div className="text-right hidden sm:block">
                  <button
                    onClick={() => setIsProfileOpen(true)}
                    className="text-sm font-semibold text-charcoal-700 hover:text-terracotta-400 transition-colors cursor-pointer block"
                  >
                    {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                  </button>
                  <p className="text-xs text-charcoal-600 hover:text-terracotta-400 transition-colors cursor-pointer" onClick={() => setIsProfileOpen(true)}>
                    {user?.isAdmin ? 'Administrator' : user?.isTutor ? 'Tutor' : 'Student'}
                  </p>
                </div>
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="relative group"
                >
                  <div className="w-12 h-12 bg-terracotta-400 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-terracotta-500/30 group-hover:shadow-terracotta-500/50 transition-all duration-300 transform group-hover:scale-105 border-2 border-white/20 group-hover:border-terracotta-400/50">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-sage-400 rounded-full border-2 border-white"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-8 pb-20 sm:pb-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-charcoal-700 mb-2">Welcome back, {user?.firstName}!</h2>
          <p className="text-charcoal-600">Manage your academic activities and stay updated with the latest announcements.</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Cleaning Day Registration */}
          <div className="bg-cloud-400 backdrop-blur-md rounded-2xl border border-sandstone-400 hover:bg-cloud-300 hover:border-terracotta-400 transition-all duration-300 group shadow-xl hover:shadow-2xl transform hover:scale-105">
            <div className="p-6">
              <div className="w-12 h-12 bg-terracotta-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-terracotta-500/30">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-charcoal-700 mb-2">Cleaning Day</h3>
              <p className="text-charcoal-600 text-sm mb-4">Register for your assigned cleaning duty</p>
              <button
                onClick={() => router.push('/cleaning-form')}
                className="w-full bg-terracotta-400 text-white font-medium py-2 px-4 rounded-lg hover:bg-terracotta-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-terracotta-500/20"
              >
                Register Now
              </button>
            </div>
          </div>

          {/* Course Management */}
          <div className="bg-cloud-400 backdrop-blur-md rounded-2xl border border-sandstone-400 hover:bg-cloud-300 hover:border-sage-400 transition-all duration-300 group shadow-xl hover:shadow-2xl transform hover:scale-105">
            <div className="p-6">
              <div className="w-12 h-12 bg-sage-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-sage-500/30">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-charcoal-700 mb-2">Courses</h3>
              <p className="text-charcoal-600 text-sm mb-4">Submit course units and credits</p>
              <button
                onClick={() => router.push('/courses')}
                className="w-full bg-sage-400 text-white font-medium py-2 px-4 rounded-lg hover:bg-sage-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-sage-500/20"
              >
                Manage Courses
              </button>
            </div>
          </div>

          {/* Policy Guidelines */}
          <div className="bg-cloud-400 backdrop-blur-md rounded-2xl border border-sandstone-400 hover:bg-cloud-300 hover:border-terracotta-400 transition-all duration-300 group shadow-xl hover:shadow-2xl transform hover:scale-105">
            <div className="p-6">
              <div className="w-12 h-12 bg-terracotta-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-terracotta-500/30">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-lg font-semibold text-charcoal-700 mb-2">Policies</h3>
              <p className="text-charcoal-600 text-sm mb-4">Access organization guidelines</p>
              <button
                onClick={() => router.push('/policies')}
                className="w-full bg-terracotta-400 text-white font-medium py-2 px-4 rounded-lg hover:bg-terracotta-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-terracotta-500/20"
              >
                View Policies
              </button>
            </div>
          </div>

          {/* My Grades */}
          <div className="bg-cloud-400 backdrop-blur-md rounded-2xl border border-sandstone-400 hover:bg-cloud-300 hover:border-sage-400 transition-all duration-300 group shadow-xl hover:shadow-2xl transform hover:scale-105">
            <div className="p-6">
              <div className="w-12 h-12 bg-sage-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-sage-500/30">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="text-lg font-semibold text-charcoal-700 mb-2">My Grades</h3>
              <p className="text-charcoal-600 text-sm mb-4">View your academic performance</p>
              <button
                onClick={() => router.push('/courses')}
                className="w-full bg-sage-400 text-white font-medium py-2 px-4 rounded-lg hover:bg-sage-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-sage-500/20"
              >
                View Grades
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-cloud-400 backdrop-blur-md rounded-2xl border border-sandstone-400 hover:bg-cloud-300 hover:border-terracotta-400 transition-all duration-300 group shadow-xl hover:shadow-2xl transform hover:scale-105">
            <div className="p-6">
              <div className="w-12 h-12 bg-terracotta-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-terracotta-500/30">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-charcoal-700 mb-2">Messages</h3>
              <p className="text-charcoal-600 text-sm mb-4">Chat with other users and admin</p>
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full bg-terracotta-400 text-white font-medium py-2 px-4 rounded-lg hover:bg-terracotta-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-terracotta-500/20"
              >
                Open Chat
              </button>
            </div>
          </div>

          {/* Grade Management - Only for Tutors and Admins */}
          {canManageGrades && (
            <div className="bg-cloud-400 backdrop-blur-md rounded-2xl border border-sandstone-400 hover:bg-cloud-300 hover:border-sage-400 transition-all duration-300 group shadow-xl hover:shadow-2xl transform hover:scale-105">
              <div className="p-6">
                <div className="w-12 h-12 bg-sage-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-sage-500/30">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-charcoal-700 mb-2">Grade Management</h3>
                <p className="text-charcoal-600 text-sm mb-4">Enter and manage student grades</p>
                <button
                  onClick={() => router.push('/grades')}
                  className="w-full bg-sage-400 text-white font-medium py-2 px-4 rounded-lg hover:bg-sage-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-sage-500/20"
                >
                  Manage Grades
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Announcements Preview Section */}
        <div className="mb-8">
          <AnnouncementsPreview onViewAll={() => setIsAnnouncementsOpen(true)} />
        </div>

        {/* Admin Panel */}
        {user && user.isAdmin && (
          <div className="bg-terracotta-400/20 backdrop-blur-md rounded-2xl border border-terracotta-400 hover:bg-terracotta-400/30 transition-all duration-300 mb-6 shadow-xl shadow-terracotta-500/20">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-terracotta-400 rounded-xl flex items-center justify-center shadow-lg shadow-terracotta-500/30">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal-700">Admin Panel</h3>
                  <p className="text-charcoal-600 text-sm">Manage users, courses, and system settings</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="w-full bg-terracotta-400 text-white font-medium py-3 px-4 rounded-lg hover:bg-terracotta-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-terracotta-500/20"
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
        <div className="mt-8 pt-8 border-t border-sandstone-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-charcoal-600 text-sm">
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
              className="bg-terracotta-400 text-white font-medium py-3 px-6 rounded-lg hover:bg-terracotta-600 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-terracotta-500/20"
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
          <div className="relative bg-cloud-400/95 backdrop-blur-md border-b border-sandstone-400 shadow-2xl transform transition-transform duration-300 ease-out">
            {/* Header */}
            <div className="bg-terracotta-400 text-white p-4 border-b border-sandstone-400 shadow-lg shadow-terracotta-500/30">
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
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-cloud-400/95 backdrop-blur-md shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto">
            {/* Header */}
            <div className="bg-terracotta-400 text-white p-4 border-b border-sandstone-400 sticky top-0 z-10 shadow-lg shadow-terracotta-500/30">
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
                  <div className="w-20 h-20 bg-terracotta-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-terracotta-500/30 mx-auto">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-sage-400 rounded-full border-4 border-white/20"></div>
                </div>
                <h3 className="text-2xl font-bold text-charcoal-700 mt-4 mb-2">
                  {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                </h3>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {user?.isAdmin && (
                    <span className="px-3 py-1 bg-terracotta-400 text-white text-xs rounded-full font-medium shadow-md">
                      Admin
                    </span>
                  )}
                  {user?.isTutor && (
                    <span className="px-3 py-1 bg-sage-400 text-white text-xs rounded-full font-medium shadow-md">
                      Tutor
                    </span>
                  )}
                  <span className="px-3 py-1 bg-sandstone-400 text-charcoal-700 text-xs rounded-full font-medium shadow-md">
                    Student
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-cloud-500 rounded-xl p-4 border border-sandstone-400">
                <h4 className="font-semibold text-charcoal-700 mb-3 flex items-center gap-2">
                  <span className="text-lg">📞</span> Contact Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-charcoal-600 text-sm">Email Address</p>
                    <p className="text-charcoal-700 font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-charcoal-600 text-sm">Phone Number</p>
                    <p className="text-charcoal-700 font-medium">
                      {user?.phoneNumber || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-cloud-500 rounded-xl p-4 border border-sandstone-400">
                <h4 className="font-semibold text-charcoal-700 mb-3 flex items-center gap-2">
                  <span className="text-lg">📚</span> Academic Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-charcoal-600 text-sm">Student ID</p>
                    <p className="text-charcoal-700 font-medium">{user?.id}</p>
                  </div>
                  <div>
                    <p className="text-charcoal-600 text-sm">Member Since</p>
                    <p className="text-charcoal-700 font-medium">Active Student</p>
                  </div>
                  <div>
                    <p className="text-charcoal-600 text-sm">Account Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-sage-400 rounded-full"></div>
                      <p className="text-sage-400 font-medium">Active</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Unified Messaging */}
      <UnifiedMessaging isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  );
}

export default withAuth(DashboardPage, {
  requireAuth: true
});
