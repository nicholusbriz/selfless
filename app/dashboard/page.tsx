'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminEmail } from '@/config/admin';
import { User, CleaningDay, Weeks, UserRegistration } from '@/types';
import RippleButton from '@/components/RippleButton';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [weeks, setWeeks] = useState<Weeks>({});
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState<UserRegistration[]>([]);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
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
          setIsRegistered(data.isRegistered);
          setUserRegistrations(data.registrations || []);
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
          setWeeks(data.weeks);
        }
      } catch {
        // Error fetching cleaning days - will show in UI
      }
    };

    fetchCleaningDays();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Refresh cleaning days data
      const daysResponse = await fetch('/api/cleaning-days');
      const daysData = await daysResponse.json();
      if (daysData.success) {
        setWeeks(daysData.weeks);
      }

      // Refresh user status
      if (user?.id) {
        const statusResponse = await fetch('/api/user-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const statusData = await statusResponse.json();
        if (statusData.success) {
          setIsRegistered(statusData.isRegistered);
          setUserRegistrations(statusData.registrations);
        }
      }
    } catch {
      // Error refreshing data
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || checkingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-6"></div>
          <p className="text-white text-xl font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
        }}
      />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="glass-card rounded-3xl p-8 border border-white/20 shadow-glow-lg hover-lift">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full mb-4 shadow-lg shadow-purple-500/50 p-2 animate-bounce-in">
              <img
                src="/freedom.png"
                alt="Freedom City Tech Center Logo"
                className="w-full h-full object-contain animate-glow"
              />
            </div>
            <h1 className="text-3xl font-bold text-gradient-primary mb-3 animate-slide-in-right text-shadow-lg">
              Welcome, {user.fullName || `${user.firstName} ${user.lastName}`}!
            </h1>
            <p className="text-cyan-300 text-lg mb-6 animate-slide-in-left">
              Freedom City Tech Center
            </p>
          </div>

          <div className="space-y-4 animate-fade-in-up">
            <RippleButton
              onClick={() => {
                const urlParams = new URLSearchParams(window.location.search);
                router.push(`/form?${urlParams.toString()}`);
              }}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">📝</span>
                Register for a Cleaning Day
              </span>
            </RippleButton>

            <RippleButton
              onClick={() => {
                const urlParams = new URLSearchParams(window.location.search);
                router.push(`/courses?${urlParams.toString()}`);
              }}
              className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">📚</span>
                Send Number of Credits
              </span>
            </RippleButton>

            {user && isAdminEmail(user.email) && (
              <RippleButton
                onClick={() => {
                  const urlParams = new URLSearchParams(window.location.search);
                  router.push(`/admin?${urlParams.toString()}`);
                }}
                className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-700 hover:via-red-700 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25"
              >
                <span className="flex items-center justify-center">
                  <span className="mr-2">⚙️</span>
                  Admin Panel
                </span>
              </RippleButton>
            )}

            <RippleButton
              onClick={() => {
                router.push('/');
              }}
              className="w-full bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white font-semibold py-3 px-6 rounded-lg hover:from-gray-700 hover:via-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-gray-500/25"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🚪</span>
                Sign Out
              </span>
            </RippleButton>
          </div>
        </div>
      </div>
    </div>
  );
}
