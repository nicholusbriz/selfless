'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

          // If user is already registered, show their registration status
          // (don't redirect - let them see they've already registered)
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
          body: JSON.stringify({ userId: user?.id, email: user?.email }),
        });
        const statusData = await statusResponse.json();
        if (statusData.success) {
          setIsRegistered(statusData.isRegistered);
          setUserRegistrations(statusData.registrations);
        }

        // User stays on form page to manually navigate when ready
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
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-400 border-t-white mx-auto mb-6"></div>
          <p className="text-orange-200 text-xl font-medium animate-pulse">Loading your registration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="relative z-10">
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-pink-500/20 rounded-full blur-3xl animate-float animation-delay-1000"></div>

        <div className="container mx-auto px-4 py-8">
          <div className="overflow-y-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 rounded-full mb-8 shadow-2xl shadow-purple-500/30 p-3 animate-bounce-in">
                <img
                  src="/freedom.png"
                  alt="Freedom City Tech Center Logo"
                  className="w-full h-full object-contain animate-glow"
                />
              </div>
              <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold bg-gradient-to-r from-purple-100 via-indigo-100 to-pink-100 bg-clip-text text-transparent mb-6 animate-slide-in-right leading-relaxed drop-shadow-2xl">
                  Cleaning Day Registration
                </h1>
              </div>
              <div className="max-w-2xl mx-auto">
                <p className="text-purple-100 text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium mb-4 animate-slide-in-left drop-shadow-lg">
                  Freedom City Tech Center
                </p>
                <p className="text-gray-300 text-base sm:text-lg md:text-xl lg:text-2xl animate-slide-in-up drop-shadow-md">
                  Register for your assigned cleaning duty
                </p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 animate-slide-in-right drop-shadow-lg">
                Welcome, {user.fullName || `${user.firstName} ${user.lastName}`}!
              </h2>
              <p className="text-purple-100 text-base sm:text-lg md:text-xl lg:text-2xl mb-6 animate-slide-in-left drop-shadow-md">
                Freedom City Tech Center
              </p>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl animate-slide-in-up drop-shadow-sm">
                Choose your preferred cleaning day
              </p>
            </div>

            {/* Status Card */}
            <div className="max-w-4xl mx-auto mb-12 animate-fade-in-up animation-delay-300">
              <div className={`bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border-2 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] ${isRegistered
                ? 'border-emerald-400/40 shadow-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-green-500/10'
                : 'border-purple-400/40 shadow-purple-400/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/10'
                }`}>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 rounded-full mb-8 animate-pulse shadow-2xl shadow-purple-500/40">
                    <span className="text-3xl text-white">{isRegistered ? '✓' : '📅'}</span>
                  </div>
                  <h2 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-slide-in-right drop-shadow-2xl ${isRegistered
                    ? 'from-emerald-200 to-green-200'
                    : 'from-purple-200 to-indigo-200'
                    } bg-clip-text text-transparent`}>
                    {isRegistered ? 'Registration Complete!' : 'Choose Your Cleaning Day'}
                  </h2>
                  {!isRegistered && (
                    <p className="text-gray-100 text-xl md:text-2xl lg:text-3xl mb-8">
                      Select your preferred cleaning day from the options below
                    </p>
                  )}
                  {isRegistered && userRegistrations.length > 0 && (
                    <div className="space-y-8">
                      {userRegistrations.map((registration, index) => (
                        <div key={index} className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-2xl rounded-3xl p-10 border-2 border-emerald-300/50 shadow-2xl shadow-emerald-400/30">
                          <div className="flex items-center gap-6 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-400 rounded-full flex items-center justify-center shadow-xl shadow-emerald-400/50">
                              <span className="text-white text-2xl font-bold">✓</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-emerald-100 text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
                                {registration.dayName}
                              </h3>
                              <div className="bg-emerald-500/20 rounded-xl px-6 py-4 border border-emerald-300/50">
                                <p className="text-emerald-50 text-lg md:text-xl lg:text-2xl font-semibold">
                                  📅 {registration.formattedDate}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-emerald-500/20 rounded-xl px-6 py-4 border border-emerald-300/50 text-center">
                            <p className="text-emerald-50 text-lg md:text-xl lg:text-2xl font-semibold">
                              ✅ Registration Confirmed
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-2xl rounded-2xl p-6 border-2 border-yellow-300/50">
                        <p className="text-yellow-50 text-base md:text-lg lg:text-xl font-medium text-center">
                          ⚠️ Each student can only register for one cleaning day. Your registration is confirmed!
                        </p>
                      </div>
                    </div>
                  )
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`max-w-4xl mx-auto mb-12 animate-fade-in-up`}>
              <div className={`bg-white/20 backdrop-blur-2xl rounded-3xl p-8 text-center border-2 shadow-2xl ${messageType === 'success'
                ? 'border-emerald-300/50 shadow-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-green-500/10'
                : 'border-red-300/50 shadow-red-400/30 bg-gradient-to-br from-red-500/10 to-rose-500/10'
                }`}>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${messageType === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}>
                    <span className="text-white text-lg">{messageType === 'success' ? '✓' : '!'}</span>
                  </div>
                  <p className={`text-xl font-semibold ${messageType === 'success' ? 'text-emerald-100' : 'text-red-100'}`}>
                    {message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Day Selection Cards */}
          <div className="max-w-7xl mx-auto animate-fade-in-up animation-delay-500">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border-2 border-purple-400/40 shadow-2xl shadow-purple-400/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 rounded-full mb-6 animate-pulse shadow-2xl shadow-purple-500/40">
                  <span className="text-3xl text-white">📅</span>
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-100 to-indigo-100 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
                  Select Your Cleaning Day
                </h2>
                <p className="text-gray-100 text-lg sm:text-xl md:text-2xl lg:text-3xl">
                  Choose from the available days below
                </p>
              </div>

              <div className="mb-8 animate-fade-in-up animation-delay-600">
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-200 to-indigo-200 bg-clip-text text-transparent mb-6 text-center drop-shadow-lg">
                  Week 1 (May 4-8, 2026)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {weeks[1]?.filter((day: CleaningDay) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.dayName)).map((day: CleaningDay, index: number) => (
                    <div
                      key={day.id}
                      onClick={() => !day.isFull && setSelectedDay(day)}
                      className={`group relative bg-white rounded-2xl p-6 border transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden shadow-lg ${selectedDay?.id === day.id
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-400 shadow-xl shadow-blue-400/30'
                        : day.isFull
                          ? 'bg-gray-100 border-gray-300 opacity-75 cursor-not-allowed'
                          : 'bg-white border-gray-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-xl'
                        }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Status Badge */}
                      {day.isFull && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          FULL
                        </div>
                      )}

                      {selectedDay?.id === day.id && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          SELECTED
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <input
                            type="radio"
                            name="cleaningDay"
                            checked={selectedDay?.id === day.id}
                            onChange={() => setSelectedDay(day)}
                            disabled={day.isFull}
                            className={`w-6 h-6 ${day.isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${selectedDay?.id === day.id ? 'accent-blue-600' : 'accent-gray-600'
                              }`}
                          />
                          <div>
                            <h4 className={`font-bold text-2xl mb-2 ${day.isFull ? 'text-gray-600' : 'text-gray-900'}`}>
                              {day.dayName}
                            </h4>
                            <p className={`text-base ${day.isFull ? 'text-gray-500' : 'text-gray-700'}`}>
                              May {new Date(day.date).getDate()}, 2026
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-lg">👥</span>
                          </div>
                          <div>
                            <span className={`text-lg font-semibold ${day.isFull ? 'text-red-600' : 'text-blue-600'}`}>
                              {day.registeredCount}/{day.maxSlots}
                            </span>
                            <p className={`text-sm ${day.isFull ? 'text-gray-500' : 'text-gray-600'}`}>
                              Spots Available
                            </p>
                          </div>
                        </div>
                      </div>

                      {day.registeredUsers && day.registeredUsers.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-sm font-semibold text-gray-700">
                              Registered Students ({day.registeredUsers.length})
                            </h5>
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 text-xs">📋</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {day.registeredUsers.slice(0, 3).map((user: User) => (
                              <div key={user.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-gray-800 text-sm font-medium">
                                  {user.firstName} {user.lastName}
                                </p>
                              </div>
                            ))}
                            {day.registeredUsers.length > 3 && (
                              <div className="text-center text-xs text-gray-500 mt-2">
                                +{day.registeredUsers.length - 3} more students
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-200 to-indigo-200 bg-clip-text text-transparent mb-6 text-center drop-shadow-lg">
                  Week 2 (May 11-15, 2026)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weeks[2]?.filter((day: CleaningDay) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.dayName)).map((day: CleaningDay) => (
                    <div
                      key={day.id}
                      onClick={() => !day.isFull && setSelectedDay(day)}
                      className={`group relative bg-white rounded-2xl p-6 border transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden shadow-lg ${selectedDay?.id === day.id
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-400 shadow-xl shadow-blue-400/30'
                        : day.isFull
                          ? 'bg-gray-100 border-gray-300 opacity-75 cursor-not-allowed'
                          : 'bg-white border-gray-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-xl'
                        }`}
                    >
                      {/* Status Badge */}
                      {day.isFull && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          FULL
                        </div>
                      )}

                      {selectedDay?.id === day.id && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          SELECTED
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <input
                            type="radio"
                            name="cleaningDay"
                            checked={selectedDay?.id === day.id}
                            onChange={() => setSelectedDay(day)}
                            disabled={day.isFull}
                            className={`w-6 h-6 ${day.isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${selectedDay?.id === day.id ? 'accent-blue-600' : 'accent-gray-600'
                              }`}
                          />
                          <div>
                            <h4 className={`font-bold text-2xl mb-2 ${day.isFull ? 'text-gray-600' : 'text-gray-900'}`}>
                              {day.dayName}
                            </h4>
                            <p className={`text-base ${day.isFull ? 'text-gray-500' : 'text-gray-700'}`}>
                              May {new Date(day.date).getDate()}, 2026
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-lg">👥</span>
                          </div>
                          <div>
                            <span className={`text-lg font-semibold ${day.isFull ? 'text-red-600' : 'text-blue-600'}`}>
                              {day.registeredCount}/{day.maxSlots}
                            </span>
                            <p className={`text-sm ${day.isFull ? 'text-gray-500' : 'text-gray-600'}`}>
                              Spots Available
                            </p>
                          </div>
                        </div>
                      </div>

                      {day.registeredUsers && day.registeredUsers.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-sm font-semibold text-gray-700">
                              Registered Students ({day.registeredUsers.length})
                            </h5>
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 text-xs">📋</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {day.registeredUsers.slice(0, 3).map((user: User) => (
                              <div key={user.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-gray-800 text-sm font-medium">
                                  {user.firstName} {user.lastName}
                                </p>
                              </div>
                            ))}
                            {day.registeredUsers.length > 3 && (
                              <div className="text-center text-xs text-gray-500 mt-2">
                                +{day.registeredUsers.length - 3} more students
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-200 to-indigo-200 bg-clip-text text-transparent mb-6 text-center drop-shadow-lg">
                  Week 3 (May 18-22, 2026)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weeks[3]?.filter((day: CleaningDay) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.dayName)).map((day: CleaningDay) => (
                    <div
                      key={day.id}
                      onClick={() => !day.isFull && setSelectedDay(day)}
                      className={`group relative bg-white rounded-2xl p-6 border transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden shadow-lg ${selectedDay?.id === day.id
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-400 shadow-xl shadow-blue-400/30'
                        : day.isFull
                          ? 'bg-gray-100 border-gray-300 opacity-75 cursor-not-allowed'
                          : 'bg-white border-gray-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-xl'
                        }`}
                    >
                      {/* Status Badge */}
                      {day.isFull && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          FULL
                        </div>
                      )}

                      {selectedDay?.id === day.id && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          SELECTED
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <input
                            type="radio"
                            name="cleaningDay"
                            checked={selectedDay?.id === day.id}
                            onChange={() => setSelectedDay(day)}
                            disabled={day.isFull}
                            className={`w-6 h-6 ${day.isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${selectedDay?.id === day.id ? 'accent-blue-600' : 'accent-gray-600'
                              }`}
                          />
                          <div>
                            <h4 className={`font-bold text-2xl mb-2 ${day.isFull ? 'text-gray-600' : 'text-gray-900'}`}>
                              {day.dayName}
                            </h4>
                            <p className={`text-base ${day.isFull ? 'text-gray-500' : 'text-gray-700'}`}>
                              May {new Date(day.date).getDate()}, 2026
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-lg">👥</span>
                          </div>
                          <div>
                            <span className={`text-lg font-semibold ${day.isFull ? 'text-red-600' : 'text-blue-600'}`}>
                              {day.registeredCount}/{day.maxSlots}
                            </span>
                            <p className={`text-sm ${day.isFull ? 'text-gray-500' : 'text-gray-600'}`}>
                              Spots Available
                            </p>
                          </div>
                        </div>
                      </div>

                      {day.registeredUsers && day.registeredUsers.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-sm font-semibold text-gray-700">
                              Registered Students ({day.registeredUsers.length})
                            </h5>
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 text-xs">📋</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {day.registeredUsers.slice(0, 3).map((user: User) => (
                              <div key={user.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-gray-800 text-sm font-medium">
                                  {user.firstName} {user.lastName}
                                </p>
                              </div>
                            ))}
                            {day.registeredUsers.length > 3 && (
                              <div className="text-center text-xs text-gray-500 mt-2">
                                +{day.registeredUsers.length - 3} more students
                              </div>
                            )}
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
                  className={`py-6 px-12 rounded-full font-bold text-xl sm:text-2xl transition-all duration-500 transform hover:scale-105 shadow-2xl animate-bounce-in ${isRegistered
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white hover:from-purple-700 hover:via-indigo-700 hover:to-pink-700 hover:shadow-3xl'
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
                  <div className="mt-6 animate-slide-in-up">
                    <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 shadow-lg shadow-green-500/20">
                      <div className="text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold text-green-400 mb-3">
                          Registration Complete!
                        </h3>
                        <p className="text-white text-lg mb-4">
                          You have successfully registered for cleaning duty
                        </p>
                        <div className="bg-black/30 rounded-xl p-4 border border-white/20">
                          <p className="text-cyan-300 font-semibold text-lg">
                            📅 {userRegistrations[0]?.dayName}
                          </p>
                          <p className="text-white text-sm">
                            {userRegistrations[0]?.formattedDate}
                          </p>
                        </div>
                        <p className="text-yellow-300 text-sm mt-4 bg-yellow-600/20 rounded-lg p-3 border border-yellow-400/30">
                          ⚠️ Each student can only register for one cleaning day. Your registration is confirmed!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-auto space-y-4">
            <button
              onClick={() => {
                const urlParams = new URLSearchParams(window.location.search);
                router.push(`/dashboard?${urlParams.toString()}`);
              }}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-3"
            >
              <span className="text-xl">🏠</span>
              <span className="text-lg">Go back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
