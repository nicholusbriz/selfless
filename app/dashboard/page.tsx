'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminEmail } from '@/config/admin';
import { User } from '@/types';
import PhoneNumberPrompt from '@/components/PhoneNumberPrompt';
import Announcements from '@/components/Announcements';

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
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>

        {/* Floating animated elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-pink-500/20 rounded-full blur-3xl animate-float animation-delay-1000"></div>

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
                <img
                  src="/freedom.png"
                  alt="Freedom Logo"
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
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up overflow-y-auto max-h-full">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover-lift">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-4 shadow-lg shadow-purple-500/50 p-2 animate-bounce-in">
              <img
                src="/freedom.png"
                alt="Freedom City Tech Center Logo"
                className="w-full h-full object-contain animate-glow"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3 animate-slide-in-right">
              Welcome, {user.fullName || `${user.firstName} ${user.lastName}`}!
            </h1>
            <p className="text-purple-200 text-lg font-medium mb-6 animate-slide-in-left">
              Freedom City Tech Center
            </p>
          </div>

          {/* Announcements Display Section */}
          <div className="mb-6">
            <Announcements
              isAdmin={false} // Always show as read-only for all users on dashboard
              adminId={user?.id || ''}
              adminEmail={user?.email || ''}
              adminName={user?.fullName || `${user?.firstName} ${user?.lastName}` || ''}
            />
          </div>

          <div className="space-y-4 animate-fade-in-up mb-8">
            <button
              onClick={() => {
                const urlParams = new URLSearchParams(window.location.search);
                router.push(`/form?${urlParams.toString()}`);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-lg font-medium border border-blue-400/30 transition-all shadow-lg hover:shadow-blue-500/25"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">📝</span>
                Register for a Cleaning Day
              </span>
            </button>

            <button
              onClick={() => {
                const urlParams = new URLSearchParams(window.location.search);
                router.push(`/courses?${urlParams.toString()}`);
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-lg font-medium border border-purple-400/30 transition-all shadow-lg hover:shadow-purple-500/25"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">📚</span>
                Send All Course Units and Credits You doing
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
      <PhoneNumberPrompt />
    </div>
  );
}
