'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { isAdminEmail } from '@/config/admin';
import { User } from '@/types';
import AnnouncementNotifications from '@/components/AnnouncementNotifications';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const router = useRouter();

  // Check if user has valid authentication from URL params
  useEffect(() => {
    const checkUserAccess = async () => {
      // Get user data from URL params (passed from login)
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId');
      const email = urlParams.get('email');

      if (!userId || !email) {
        // No auth params, redirect to home
        router.push('/');
        return;
      }

      try {
        // Verify user exists in database
        const response = await fetch('/api/user-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, email }),
        });

        if (!response.ok) {
          // User not found, redirect to home
          router.push('/');
          return;
        }

        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
        } else {
          // User not found, redirect to home
          router.push('/');
        }
      } catch {
        router.push('/');
      } finally {
        setCheckingStatus(false);
      }
    };

    checkUserAccess();
  }, [router]);

  // Fetch cleaning days
  useEffect(() => {
    const fetchCleaningDays = async () => {
      try {
        const response = await fetch('/api/cleaning-days');
        const data = await response.json();

        if (data.success) {
          // Data fetched successfully
        }
      } catch {
        // Error fetching cleaning days - will show in UI
      }
    };

    fetchCleaningDays();
  }, []);

  if (!user || checkingStatus) {
    return (
      <>
        <div className="h-screen relative overflow-hidden">
          {/* Video Background - Same as Homepage */}
          <div className="absolute inset-0 w-full h-full">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover transform scale-110"
              style={{
                filter: 'brightness(0.25) contrast(1.2) saturate(0.9) blur(1.5px)',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            >
              <source src="/freedom.mp4" type="video/mp4" />
              <source src="/freedom.webm" type="video/webm" />
              <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800" />
            </video>

            {/* Overlay gradient - Same as Homepage */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-800/10 to-purple-900/20"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-screen flex items-center justify-center">
            {/* Floating animated elements - Same as Homepage */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute top-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>
            <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-indigo-400/20 rounded-full blur-3xl animate-float animation-delay-1000"></div>
            <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-pink-400/20 rounded-full blur-3xl animate-float animation-delay-3000"></div>

            <div className="text-center relative z-10">
              {/* Cool loading animation */}
              <div className="mb-8">
                <div className="relative inline-flex items-center justify-center">
                  {/* Outer rotating ring */}
                  <div className="absolute inset-0 w-24 h-24 border-4 border-purple-500/30 rounded-full animate-spin"></div>

                  {/* Middle rotating ring */}
                  <div className="absolute inset-2 w-20 h-20 border-4 border-indigo-500/50 rounded-full animate-spin animation-reverse"></div>

                  {/* Inner ring */}
                  <div className="absolute inset-4 w-16 h-16 border-4 border-pink-500/70 rounded-full animate-spin animation-delay-1000"></div>

                  {/* Center logo */}
                  <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 rounded-full shadow-2xl shadow-purple-500/50 flex items-center justify-center animate-bounce-in">
                    <Image
                      src="/freedom.png"
                      alt="Freedom Logo"
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain animate-glow"
                    />
                  </div>
                </div>
              </div>

              {/* Cool loading text with gradient animation */}
              <div className="space-y-4">
                <div className="relative">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent animate-gradient-shift">
                    Loading Dashboard
                  </h1>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent blur-xl animate-pulse"></div>
                </div>

                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-200"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce animation-delay-400"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce animation-delay-600"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-800"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce animation-delay-1000"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce animation-delay-1200"></div>
                </div>

                <p className="text-purple-200 text-lg font-medium animate-fade-in-up">
                  Preparing your personalized experience...
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-screen relative overflow-hidden">
        {/* Video Background - Same as Homepage */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover transform scale-110"
            style={{
              filter: 'brightness(0.25) contrast(1.2) saturate(0.9) blur(1.5px)',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          >
            <source src="/freedom.mp4" type="video/mp4" />
            <source src="/freedom.webm" type="video/webm" />
            <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800" />
          </video>

          {/* Overlay gradient - Same as Homepage */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-800/10 to-purple-900/20"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-screen flex items-center justify-center">
          {/* Floating animated elements - Same as Homepage */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-indigo-400/20 rounded-full blur-3xl animate-float animation-delay-1000"></div>
          <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-pink-400/20 rounded-full blur-3xl animate-float animation-delay-3000"></div>

          <div className="w-full max-w-md relative z-10 animate-fade-in-up overflow-y-auto max-h-full">
            <div className="p-8">
              <div className="text-center mb-8">
                {/* Enhanced Logo - Same as Homepage */}
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 rounded-full mb-8 shadow-2xl shadow-cyan-500/50 p-3 animate-bounce-in" style={{ boxShadow: '0 0 40px rgba(6, 182, 212, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)' }}>
                  <Image
                    src="/freedom.png"
                    alt="Freedom City Tech Center Logo"
                    width={128}
                    height={128}
                    className="w-full h-full object-contain animate-glow"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))' }}
                  />
                </div>

                {/* Enhanced Title - Same styling as homepage */}
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-transparent mb-6 animate-float" style={{
                  animation: 'float 6s ease-in-out infinite, slideInRight 1s ease-out',
                  textShadow: '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)',
                  letterSpacing: '0.02em'
                }}>
                  WELCOME BACK
                </h1>

                {/* Enhanced Subtitle - Same styling as homepage */}
                <p className="text-lg md:text-xl font-light text-cyan-200 mb-6 animate-float uppercase tracking-widest" style={{
                  animation: 'float 8s ease-in-out infinite 2s, slideInLeft 1s ease-out 0.5s',
                  textShadow: '0 0 20px rgba(6, 182, 212, 0.8), 0 0 40px rgba(6, 182, 212, 0.4)',
                  letterSpacing: '0.15em'
                }}>
                  {user.fullName || `${user.firstName} ${user.lastName}`}
                </p>

                {/* Enhanced Description - Same styling as homepage */}
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30 backdrop-blur-md px-6 py-3 rounded-full border border-cyan-400/40 animate-float" style={{
                  animation: 'float 10s ease-in-out infinite 1s, fadeInUp 1s ease-out 1s',
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

              <div className="space-y-4 animate-fade-in-up mb-8">
                <button
                  onClick={() => {
                    const urlParams = new URLSearchParams(window.location.search);
                    router.push(`/form?${urlParams.toString()}`);
                  }}
                  className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold py-6 px-8 rounded-2xl hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-500 transform hover:scale-105 uppercase tracking-wider"
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
                    const urlParams = new URLSearchParams(window.location.search);
                    router.push(`/courses?${urlParams.toString()}`);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold py-6 px-8 rounded-2xl hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-500 transform hover:scale-105 uppercase tracking-wider"
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
                    const urlParams = new URLSearchParams(window.location.search);
                    router.push(`/policies?${urlParams.toString()}`);
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-4 px-6 rounded-lg font-medium border border-indigo-400/30 transition-all shadow-lg hover:shadow-indigo-500/25"
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-2">📖</span>
                    SELFLESS Organisation Policy Book
                  </span>
                </button>
              </div>

              <div className="text-center mt-auto">
                {user && isAdminEmail(user.email) && (
                  <button
                    onClick={() => {
                      const urlParams = new URLSearchParams(window.location.search);
                      router.push(`/admin?${urlParams.toString()}`);
                    }}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-3 mb-4"
                  >
                    <span className="text-xl">⚙️</span>
                    <span className="text-lg">Admin Panel</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    router.push('/');
                  }}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-3"
                >
                  <span className="text-xl">🚪</span>
                  <span className="text-lg">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
