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
    <BackgroundImage>
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-800/10 to-purple-900/20"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

      {/* Floating animated elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
      <div className="absolute top-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-indigo-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-pink-400/20 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="h-screen flex items-center justify-center">

        <div className="w-full max-w-lg relative z-10 overflow-y-auto max-h-full px-4 py-2">
          <div className="p-4">
            <div className="text-center mb-4">
              {/* Enhanced Logo - Same as Homepage */}
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 rounded-full mb-4 shadow-2xl shadow-cyan-500/50 p-2" style={{ boxShadow: '0 0 40px rgba(6, 182, 212, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)' }}>
                <Image
                  src="/freedom.png"
                  alt="Freedom City Tech Center Logo"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))' }}
                />
              </div>

              {/* Enhanced Title - Same styling as homepage */}
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-transparent mb-3" style={{
                textShadow: '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)',
                letterSpacing: '0.02em'
              }}>
                WELCOME BACK
              </h1>

              {/* Enhanced Subtitle - Same styling as homepage */}
              <p className="text-base md:text-lg font-light text-cyan-200 mb-4 uppercase tracking-widest" style={{
                textShadow: '0 0 20px rgba(6, 182, 212, 0.8), 0 0 40px rgba(6, 182, 212, 0.4)',
                letterSpacing: '0.15em'
              }}>
                {user.fullName || `${user.firstName} ${user.lastName}`}
              </p>

              {/* Enhanced Description - Same styling as homepage */}
              <div className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30 backdrop-blur-md px-6 py-3 rounded-full border border-cyan-400/40" style={{
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
              }}>
                <span className="text-cyan-100 font-bold text-lg tracking-wide" style={{ textShadow: '0 0 15px rgba(6, 182, 212, 0.8)' }}>🌟 Freedom City Tech Center</span>
              </div>
            </div>

            {/* Announcement Notifications */}
            <AnnouncementNotifications
              isAdmin={false} // Always show as read-only for all users on dashboard
              adminId={user?.id || ''}
              adminName={user?.fullName || `${user?.firstName} ${user?.lastName}` || ''}
            />

            <div className="space-y-3 mb-4">
              <button
                onClick={() => {
                  router.push('/form');
                }}
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-500 transform hover:scale-105 uppercase tracking-wider"
                style={{
                  boxShadow: '0 0 30px rgba(6, 182, 212, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)',
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                }}
              >
                <span className="flex items-center justify-center text-xl">
                  <span className="mr-3 text-2xl">📝</span>
                  <span>Register for a Cleaning Day</span>
                </span>
              </button>

              <button
                onClick={() => {
                  router.push('/courses');
                }}
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-500 transform hover:scale-105 uppercase tracking-wider"
                style={{
                  boxShadow: '0 0 30px rgba(147, 51, 234, 0.4), 0 0 60px rgba(99, 102, 241, 0.2)',
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                }}
              >
                <span className="flex items-center justify-center text-xl">
                  <span className="mr-3 text-2xl">📚</span>
                  <span>Send Course Units & Credits</span>
                </span>
              </button>

              <button
                onClick={() => {
                  router.push('/policies');
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium border border-indigo-400/30 transition-all shadow-lg hover:shadow-indigo-500/25"
              >
                <span className="flex items-center justify-center">
                  <span className="mr-2">📖</span>
                  SELFLESS Organisation Policy Book
                </span>
              </button>
            </div>

            <div className="text-center mt-auto">
              {user && user.isAdmin && (
                <button
                  onClick={() => {
                    router.push('/admin');
                  }}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-3 mb-3"
                >
                  <span className="text-xl">⚙️</span>
                  <span className="text-lg">Admin Panel</span>
                </button>
              )}

              {/* Show Announcements button for tutors */}
              {user && user.isTutor && user.tutorPermissions?.canViewAnnouncements && (
                <button
                  onClick={() => {
                    router.push('/announcements');
                  }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-3 mb-3"
                >
                  <span className="text-xl">📢</span>
                  <span className="text-lg">
                    {user.tutorPermissions?.canPostAnnouncements ? 'Manage Announcements' : 'View Announcements'}
                  </span>
                </button>
              )}
              <button
                onClick={async () => {
                  try {
                    // Call signout API to clear the JWT token
                    await fetch('/api/signout', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    });
                  } catch (error) {
                    console.error('Error signing out:', error);
                  } finally {
                    // Always redirect to home after signout attempt
                    router.push('/');
                  }
                }}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-3"
              >
                <span className="text-xl">🚪</span>
                <span className="text-lg">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </BackgroundImage>
  );
}
