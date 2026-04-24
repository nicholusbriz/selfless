'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminEmail } from '@/config/admin';
import { User, CleaningDay, Weeks, UserRegistration } from '@/types';

export default function FormPage() {
  const [user, setUser] = useState<User | null>(null);
  const [weeks, setWeeks] = useState<Weeks>({});
  const [selectedDay, setSelectedDay] = useState<CleaningDay | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState<UserRegistration[]>([]);
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
          setIsRegistered(data.isRegistered);
          setUserRegistrations(data.registrations || []);

          // If user is already registered, redirect to dashboard
          if (data.isRegistered) {
            const urlParams = new URLSearchParams(window.location.search);
            router.push(`/dashboard?${urlParams.toString()}`);
            return;
          }
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

  // Fetch cleaning days and set selected day for registered users
  useEffect(() => {
    const fetchCleaningDays = async () => {
      try {
        const response = await fetch('/api/cleaning-days');
        const data = await response.json();

        if (data.success) {
          setWeeks(data.weeks);

          // If user is registered, set their current registered day as selected
          if (isRegistered && userRegistrations.length > 0) {
            const currentRegistration = userRegistrations[0];
            // Find the matching day in weeks data to get formatted date
            for (const weekNum in data.weeks) {
              const week = data.weeks[weekNum];
              const day = week.find((d: CleaningDay) => d.id === currentRegistration.id);
              if (day) {
                setSelectedDay(day);
                break;
              }
            }
          }
        }
      } catch {
        // Error fetching cleaning days - will show in UI
      }
    };

    fetchCleaningDays();
  }, [isRegistered, userRegistrations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate user is logged in
    if (!user || !user.id) {
      setMessage('User session expired. Please log in again.');
      setMessageType('error');
      // Redirect to home
      setTimeout(() => {
        router.push('/');
      }, 2000);
      return;
    }

    // Validate day selection
    if (!selectedDay) {
      setMessage('Please select a cleaning day before submitting.');
      setMessageType('error');
      return;
    }

    if (selectedDay.isFull) {
      setMessage('This day is already full. Please select another day.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      // Only allow initial registration, no updates
      if (isRegistered) {
        const registeredDay = userRegistrations[0];
        setMessage(`You have already registered to work on ${registeredDay?.dayName}, ${registeredDay?.formattedDate}. Each student can only register for one day.`);
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/form-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cleaningDayId: selectedDay.id,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userName = user?.fullName || `${user?.firstName} ${user?.lastName}`;
        const dayName = selectedDay?.dayName;
        const formattedDate = selectedDay?.date ? new Date(selectedDay.date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }) : '';

        setMessage(`${userName}, you have successfully registered for ${dayName}, ${formattedDate}! Redirecting to your dashboard...`);
        setMessageType('success');
        setSelectedDay(null);

        // Refresh user status before redirect
        const statusResponse = await fetch('/api/user-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id }),
        });
        const statusData = await statusResponse.json();
        if (statusData.success) {
          setIsRegistered(statusData.isRegistered);
          setUserRegistrations(statusData.registrations);
        }

        // Redirect to dashboard after successful registration
        setTimeout(() => {
          const urlParams = new URLSearchParams(window.location.search);
          router.push(`/dashboard?${urlParams.toString()}`);
        }, 2500);
      } else {
        // Handle specific error cases
        if (response.status === 404 && data.message?.includes('User not found')) {
          setMessage('Your session has expired. Please log in again.');
          setMessageType('error');
          // Redirect to home
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setMessage(data.message || 'Failed to register for cleaning day');
          setMessageType('error');
        }
      }
    } catch {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || checkingStatus) {
    return (
      <div className="h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-6"></div>
          <p className="text-white text-xl font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      <div className="container mx-auto px-4 py-8 h-full flex flex-col">
        <div className="overflow-y-auto flex-1">
          <div className="text-center mb-8 animate-fade-in-down">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full mb-4 animate-bounce-in shadow-glow-lg p-2">
              <img
                src="/freedom.png"
                alt="Freedom City Tech Center Logo"
                className="w-full h-full object-contain animate-glow"
              />
            </div>
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={() => {
                  // Refresh cleaning days data
                  const fetchCleaningDays = async () => {
                    try {
                      const response = await fetch('/api/cleaning-days');
                      const data = await response.json();
                      if (data.success) {
                        setWeeks(data.weeks);
                      }
                    } catch {
                      // Error refreshing data - will show in UI
                    }
                  };
                  fetchCleaningDays();
                }}
                className="glass-morphism hover:glass-card text-cyan-300 py-2 px-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105 border border-cyan-500/50 text-sm hover:shadow-glow animate-float"
              >
                <span className="flex items-center gap-2">
                  <span className="animate-spin-slow">🔄</span>
                  Refresh Data
                </span>
              </button>
            </div>
            <h1 className="text-4xl font-bold text-gradient-primary mb-2 animate-slide-in-right text-shadow-lg">
              Welcome, {user.fullName || `${user.firstName} ${user.lastName}`}!
            </h1>
            <p className="text-cyan-300 text-lg mb-2 animate-slide-in-left drop-shadow-lg">
              Freedom City Tech Center
            </p>
            <p className="text-gray-300 animate-slide-in-up">
              Choose your preferred cleaning day
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-8 animate-fade-in-up animation-delay-300">
            <div className={`glass-card rounded-3xl p-8 border shadow-glow-lg hover-lift ${isRegistered
              ? 'border-green-500/30'
              : 'border-white/20'
              }`}>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 animate-bounce-in ${isRegistered ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'
                  } shadow-lg`}>
                  <span className="text-3xl text-white animate-pulse-slow">
                    {isRegistered ? '✓' : '+'}
                  </span>
                </div>
                <h2 className={`text-3xl font-bold mb-2 animate-slide-in-up ${isRegistered ? 'text-gradient-primary' : 'text-gradient-primary'
                  } text-shadow-lg`}>
                  {isRegistered ? 'Already Registered!' : 'Choose Your Cleaning Day'}
                </h2>
                {!isRegistered && (
                  <p className="text-gray-300 text-lg mb-4 animate-fade-in-up animation-delay-200">
                    You haven&apos;t registered for any cleaning day yet. Please select your preferred day below.
                  </p>
                )}
                {isRegistered && userRegistrations.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-bold">✓</span>
                      </div>
                      <div>
                        <p className="text-emerald-400 text-xl font-bold">
                          ✓ Already Registered!
                        </p>
                        <p className="text-emerald-300 text-lg">
                          You have registered to work on:
                        </p>
                      </div>
                    </div>
                    {userRegistrations.map((registration, index) => (
                      <div key={index} className="bg-gradient-to-r from-emerald-600/30 to-green-600/30 backdrop-blur-sm rounded-2xl p-6 inline-block border border-emerald-400/50 shadow-lg shadow-emerald-500/30 transform hover:scale-105 transition-all duration-300">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-lg font-bold">✓</span>
                          </div>
                          <div>
                            <p className="text-emerald-300 font-bold text-2xl">
                              {registration.dayName}
                            </p>
                            <div className="bg-emerald-600/20 rounded-lg px-4 py-2 border border-emerald-400/30 mb-2">
                              <p className="text-emerald-200 text-sm font-medium">
                                📅 {registration.formattedDate}
                              </p>
                            </div>
                            <p className="text-white text-sm text-emerald-200/80">
                              Registration Date
                            </p>
                          </div>
                        </div>
                        <div className="bg-emerald-600/20 rounded-lg px-3 py-2 border border-emerald-400/30">
                          <p className="text-emerald-200 text-sm font-medium">
                            📅 Registration confirmed
                          </p>
                        </div>
                      </div>
                    ))}
                    <p className="text-yellow-400 text-sm mt-4 bg-yellow-600/20 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/30">
                      ⚠️ You cannot register again as each student can only work on one day.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {message && (
            <div className={`max-w-4xl mx-auto mb-8 animate-fade-in-up`}>
              <div className={`glass-morphism rounded-2xl p-6 text-center border shadow-glow ${messageType === 'success'
                ? 'border-green-400/30'
                : 'border-red-400/30'
                }`}>
                <p className={`text-lg font-medium animate-slide-in-down ${messageType === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {message}
                </p>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto animate-fade-in-up animation-delay-500">
            <div className="glass-card rounded-3xl p-8 border border-white/20 shadow-glow-lg hover-lift">
              <h2 className="text-3xl font-bold text-gradient-primary mb-8 text-center animate-bounce-in text-shadow-lg">
                Choose Your Cleaning Day
              </h2>

              <div className="mb-8 animate-fade-in-up animation-delay-600">
                <h3 className="text-2xl font-bold text-gradient-primary mb-6 text-center animate-slide-in-left text-shadow-lg">
                  Week 1 (May 4-8, 2026)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weeks[1]?.filter((day: CleaningDay) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.dayName)).map((day: CleaningDay, index: number) => (
                    <div
                      key={day.id}
                      onClick={() => !day.isFull && setSelectedDay(day)}
                      className={`glass-card rounded-2xl p-6 border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer animate-scale-in ${selectedDay?.id === day.id
                        ? 'bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border-cyan-400 shadow-glow-lg'
                        : day.isFull
                          ? 'bg-gray-800/30 border-gray-400/50 opacity-50 cursor-not-allowed'
                          : 'bg-black/50 border-white/20 hover:bg-gradient-to-br hover:from-purple-600/20 hover:to-cyan-600/20 hover:border-cyan-400/30 hover:shadow-glow'
                        }`}
                      style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="cleaningDay"
                            checked={selectedDay?.id === day.id}
                            onChange={() => setSelectedDay(day)}
                            disabled={day.isFull}
                            className={`w-5 h-5 accent-cyan-600 ${day.isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          />
                          <div>
                            <h4 className={`font-bold text-lg ${day.isFull ? 'text-gray-400' : 'text-white'}`}>
                              {day.dayName}
                            </h4>
                            <p className={`text-sm ${day.isFull ? 'text-gray-500' : 'text-white/70'}`}>
                              May {new Date(day.date).getDate()}, 2026
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-medium ${day.isFull ? 'text-red-400' : 'text-cyan-400'}`}>
                            {day.registeredCount}/{day.maxSlots} Registered
                          </span>
                          {day.isFull && (
                            <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full border border-red-400/30 ml-2">
                              FULL
                            </span>
                          )}
                        </div>
                      </div>

                      {day.registeredUsers && day.registeredUsers.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/20">
                          <h5 className="text-sm font-semibold text-cyan-300 mb-2">
                            Registered Students ({day.registeredUsers.length}):
                          </h5>
                          <div className="space-y-1">
                            {day.registeredUsers.map((user: User) => (
                              <div key={user.id} className="bg-black/30 rounded p-2 border border-white/20">
                                <p className="text-white text-xs font-medium">
                                  {user.firstName} {user.lastName}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Week 2 (May 11-15, 2026)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weeks[2]?.filter((day: CleaningDay) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.dayName)).map((day: CleaningDay) => (
                    <div
                      key={day.id}
                      onClick={() => !day.isFull && setSelectedDay(day)}
                      className={`bg-black/50 rounded-2xl p-6 border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${selectedDay?.id === day.id
                        ? 'bg-black/70 border-cyan-400 shadow-lg shadow-cyan-500/25'
                        : day.isFull
                          ? 'bg-black/40 border-gray-400/50 opacity-50 cursor-not-allowed'
                          : 'bg-black/50 border-white/20 hover:bg-black/60 hover:border-cyan-400/30'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="cleaningDay"
                            checked={selectedDay?.id === day.id}
                            onChange={() => setSelectedDay(day)}
                            disabled={day.isFull}
                            className={`w-5 h-5 accent-cyan-600 ${day.isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          />
                          <div>
                            <h4 className={`font-bold text-lg ${day.isFull ? 'text-gray-400' : 'text-white'}`}>
                              {day.dayName}
                            </h4>
                            <p className={`text-sm ${day.isFull ? 'text-gray-500' : 'text-white/70'}`}>
                              May {new Date(day.date).getDate()}, 2026
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-medium ${day.isFull ? 'text-red-400' : 'text-cyan-400'}`}>
                            {day.registeredCount}/{day.maxSlots} Registered
                          </span>
                          {day.isFull && (
                            <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full border border-red-400/30 ml-2">
                              FULL
                            </span>
                          )}
                        </div>
                      </div>

                      {day.registeredUsers && day.registeredUsers.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/20">
                          <h5 className="text-sm font-semibold text-cyan-300 mb-2">
                            Registered Students ({day.registeredUsers.length}):
                          </h5>
                          <div className="space-y-1">
                            {day.registeredUsers.map((user: User) => (
                              <div key={user.id} className="bg-black/30 rounded p-2 border border-white/20">
                                <p className="text-white text-xs font-medium">
                                  {user.firstName} {user.lastName}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Week 3 (May 18-22, 2026)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weeks[3]?.filter((day: CleaningDay) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.dayName)).map((day: CleaningDay) => (
                    <div
                      key={day.id}
                      onClick={() => !day.isFull && setSelectedDay(day)}
                      className={`bg-black/50 rounded-2xl p-6 border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${selectedDay?.id === day.id
                        ? 'bg-black/70 border-cyan-400 shadow-lg shadow-cyan-500/25'
                        : day.isFull
                          ? 'bg-black/40 border-gray-400/50 opacity-50 cursor-not-allowed'
                          : 'bg-black/50 border-white/20 hover:bg-black/60 hover:border-cyan-400/30'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="cleaningDay"
                            checked={selectedDay?.id === day.id}
                            onChange={() => setSelectedDay(day)}
                            disabled={day.isFull}
                            className={`w-5 h-5 accent-cyan-600 ${day.isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          />
                          <div>
                            <h4 className={`font-bold text-lg ${day.isFull ? 'text-gray-400' : 'text-white'}`}>
                              {day.dayName}
                            </h4>
                            <p className={`text-sm ${day.isFull ? 'text-gray-500' : 'text-white/70'}`}>
                              May {new Date(day.date).getDate()}, 2026
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-medium ${day.isFull ? 'text-red-400' : 'text-cyan-400'}`}>
                            {day.registeredCount}/{day.maxSlots} Registered
                          </span>
                          {day.isFull && (
                            <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full border border-red-400/30 ml-2">
                              FULL
                            </span>
                          )}
                        </div>
                      </div>

                      {day.registeredUsers && day.registeredUsers.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/20">
                          <h5 className="text-sm font-semibold text-cyan-300 mb-2">
                            Registered Students ({day.registeredUsers.length}):
                          </h5>
                          <div className="space-y-1">
                            {day.registeredUsers.map((user: User) => (
                              <div key={user.id} className="bg-black/30 rounded p-2 border border-white/20">
                                <p className="text-white text-xs font-medium">
                                  {user.firstName} {user.lastName}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center animate-fade-in-up animation-delay-800">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !selectedDay || isRegistered}
                  className={`py-4 px-8 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg animate-bounce-in ${isRegistered
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-xl'
                    }`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Registering...
                    </span>
                  ) : isRegistered ? (
                    'Already Registered - Cannot Register Again'
                  ) : (
                    'Register for Selected Day'
                  )}
                </button>
                {isRegistered && (
                  <p className="text-yellow-400 text-sm mt-3 animate-slide-in-up glass-morphism rounded-lg p-3 border border-yellow-400/30">
                    You have already registered to work on {userRegistrations[0]?.dayName}, {userRegistrations[0]?.formattedDate}. Each student can only register for one day.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-auto space-y-4">
            <div className="flex justify-center gap-4">
              {user && isAdminEmail(user.email) && (
                <button
                  onClick={() => {
                    // Get current URL params to pass to admin page
                    const urlParams = new URLSearchParams(window.location.search);
                    router.push(`/admin?${urlParams.toString()}`);
                  }}
                  className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 py-3 px-6 rounded-full font-medium border border-purple-500/50 transition-all"
                >
                  ⚙️ Admin Panel
                </button>
              )}
              <button
                onClick={() => {
                  const urlParams = new URLSearchParams(window.location.search);
                  router.push(`/dashboard?${urlParams.toString()}`);
                }}
                className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 py-3 px-6 rounded-full font-medium border border-cyan-500/50 transition-all"
              >
                🏠 Go back to Dashboard
              </button>
              <button
                onClick={() => {
                  router.push('/');
                }}
                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 py-3 px-6 rounded-full font-medium border border-red-500/50 transition-all"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
