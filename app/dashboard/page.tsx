'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminEmail } from '@/config/admin';
import { User, CleaningDay, Weeks, UserRegistration } from '@/types';
import RippleButton from '@/components/RippleButton';
import PhoneNumberPrompt from '@/components/PhoneNumberPrompt';

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
      <PhoneNumberPrompt />
    </div>
  );
}
