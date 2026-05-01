'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User } from '@/lib/auth';
import AnnouncementNotifications from '@/components/AnnouncementNotifications';
import { BackgroundImage, PageLoader } from '@/components/ui';
import { useCleaningDays } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  // Authentication hook - handles JWT validation and user state
  const { user, isLoading: authLoading } = useAuth('/');
  const router = useRouter();

  // Use React Query for cleaning days data
  const { data: cleaningDays = [], isLoading: daysLoading } = useCleaningDays();

  // React Query handles cleaning days data fetching automatically

  if (!user || authLoading) {
    return (
      <PageLoader text="Loading Dashboard" color="purple" />
    );
  }

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
              <div className="text-right">
                <button
                  onClick={() => router.push('/profile')}
                  className="text-sm font-medium text-white hover:text-cyan-200 transition-colors cursor-pointer"
                >
                  {user.fullName || `${user.firstName} ${user.lastName}`}
                </button>
                <p className="text-xs text-white/80">{user.email}</p>
              </div>
              <button
                onClick={() => router.push('/profile')}
                className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 cursor-pointer"
              >
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user.firstName}!</h2>
          <p className="text-white/80">Manage your academic activities and stay updated with the latest announcements.</p>
        </div>

        {/* Announcement Notifications */}
        <div className="mb-8">
          <AnnouncementNotifications
            isAdmin={false}
            adminId={user?.id || ''}
            adminName={user?.fullName || `${user?.firstName} ${user?.lastName}` || ''}
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Cleaning Day Registration */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 hover:bg-white/20 transition-all duration-300">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Cleaning Day Registration</h3>
              <p className="text-white/70 mb-4">Register for your assigned cleaning duty and manage your schedule efficiently.</p>
              <button
                onClick={() => router.push('/form')}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105"
              >
                Register Now
              </button>
            </div>
          </div>

          {/* Course Management */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 hover:bg-white/20 transition-all duration-300">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Course Management</h3>
              <p className="text-white/70 mb-4">Submit your course units and credits for academic tracking and evaluation.</p>
              <button
                onClick={() => router.push('/courses')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
              >
                Manage Courses
              </button>
            </div>
          </div>

          {/* Policy Guidelines */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 hover:bg-white/20 transition-all duration-300">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Policy Guidelines</h3>
              <p className="text-white/70 mb-4">Access SELFLESS Organisation Policy Book for regulations and guidelines.</p>
              <button
                onClick={() => router.push('/policies')}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
              >
                View Policies
              </button>
            </div>
          </div>
        </div>

        {/* Admin/Tutor Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Admin Panel */}
          {user && user.isAdmin && (
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl border border-amber-400/30 hover:from-amber-500/30 hover:to-orange-500/30 transition-all duration-300">
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

          {/* Announcements */}
          {user && user.isTutor && user.tutorPermissions?.canViewAnnouncements && (
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-md rounded-2xl border border-emerald-400/30 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📢</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Announcements</h3>
                    <p className="text-white/70 text-sm">
                      {user.tutorPermissions?.canPostAnnouncements ? 'Manage and post announcements' : 'View latest announcements'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/announcements')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium py-3 px-4 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
                >
                  {user.tutorPermissions?.canPostAnnouncements ? 'Manage Announcements' : 'View Announcements'}
                </button>
              </div>
            </div>
          )}
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
                  await fetch('/api/signout', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
                } catch (error) {
                  // Handle error silently
                } finally {
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
    </BackgroundImage>
  );
}
